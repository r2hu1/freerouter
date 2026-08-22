import { appendFile, readFile } from "node:fs/promises"
import { homeFile } from "../config"
import type { UsageEvent, UsageStatus } from "./types"

const USAGE_FILE = "usage_events.jsonl"

// Rough equivalent paid-API rate (USD per 1M tokens) used only to show
// "estimated cost saved" — free providers cost the user $0.
const PAID_INPUT_PER_M = 0.15
const PAID_OUTPUT_PER_M = 0.6

export interface UsageInput {
  gatewayKeyId: string | null
  provider: string | null
  model: string | null
  alias: string
  inputTokens: number
  outputTokens: number
  latencyMs: number
  status: UsageStatus
  errorMessage: string | null
}

export async function appendUsage(e: UsageInput): Promise<void> {
  const event: UsageEvent = { timestamp: Date.now(), ...e }
  await appendFile(USAGE_FILE_PATH(), `${JSON.stringify(event)}\n`, "utf8")
}

function USAGE_FILE_PATH() {
  return homeFile(USAGE_FILE)
}

export async function readAllUsage(): Promise<UsageEvent[]> {
  try {
    const raw = await readFile(USAGE_FILE_PATH(), "utf8")
    return raw
      .split("\n")
      .filter((l) => l.trim().length > 0)
      .map((l) => JSON.parse(l) as UsageEvent)
  } catch {
    return []
  }
}

export interface UsageFilter {
  from?: number
  to?: number
  gatewayKeyId?: string
}

function applyFilter(events: UsageEvent[], filter?: UsageFilter): UsageEvent[] {
  return events.filter((e) => {
    if (filter?.from && e.timestamp < filter.from) return false
    if (filter?.to && e.timestamp > filter.to) return false
    if (filter?.gatewayKeyId && e.gatewayKeyId !== filter.gatewayKeyId)
      return false
    return true
  })
}

export interface UsageSummary {
  totalRequests: number
  successRequests: number
  errorRequests: number
  failoverRequests: number
  successRate: number
  inputTokens: number
  outputTokens: number
  totalTokens: number
  avgLatencyMs: number
  estimatedCostSavedUsd: number
  byProvider: Record<string, number>
  byAlias: Record<string, number>
  byModel: Record<string, number>
}

export async function querySummary(
  filter?: UsageFilter
): Promise<UsageSummary> {
  const events = applyFilter(await readAllUsage(), filter)
  const summary: UsageSummary = {
    totalRequests: 0,
    successRequests: 0,
    errorRequests: 0,
    failoverRequests: 0,
    successRate: 0,
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    avgLatencyMs: 0,
    estimatedCostSavedUsd: 0,
    byProvider: {},
    byAlias: {},
    byModel: {},
  }
  let latencySum = 0
  for (const e of events) {
    summary.totalRequests++
    latencySum += e.latencyMs
    summary.inputTokens += e.inputTokens
    summary.outputTokens += e.outputTokens
    summary.totalTokens += e.inputTokens + e.outputTokens
    if (e.status === "success") summary.successRequests++
    else if (e.status === "error") summary.errorRequests++
    else if (e.status === "failover") summary.failoverRequests++
    if (e.provider) {
      summary.byProvider[e.provider] = (summary.byProvider[e.provider] ?? 0) + 1
    }
    summary.byAlias[e.alias] = (summary.byAlias[e.alias] ?? 0) + 1
    if (e.model) {
      summary.byModel[e.model] = (summary.byModel[e.model] ?? 0) + 1
    }
  }
  summary.successRate =
    summary.totalRequests > 0
      ? summary.successRequests / summary.totalRequests
      : 0
  summary.avgLatencyMs =
    summary.totalRequests > 0 ? latencySum / summary.totalRequests : 0
  summary.estimatedCostSavedUsd =
    (summary.inputTokens / 1_000_000) * PAID_INPUT_PER_M +
    (summary.outputTokens / 1_000_000) * PAID_OUTPUT_PER_M
  return summary
}

export type TimeseriesBucket = "day" | "week" | "month"

export interface TimeseriesPoint {
  bucketStart: number
  label: string
  requests: number
  inputTokens: number
  outputTokens: number
  success: number
  failover: number
  error: number
}

function bucketStart(ts: number, bucket: TimeseriesBucket): number {
  const d = new Date(ts)
  if (bucket === "day") {
    d.setUTCHours(0, 0, 0, 0)
    return d.getTime()
  }
  if (bucket === "month") {
    d.setUTCDate(1)
    d.setUTCHours(0, 0, 0, 0)
    return d.getTime()
  }
  // week: Monday-based UTC
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() - (day - 1))
  d.setUTCHours(0, 0, 0, 0)
  return d.getTime()
}

function bucketLabel(ts: number, bucket: TimeseriesBucket): string {
  const d = new Date(ts)
  if (bucket === "day") return d.toISOString().slice(0, 10)
  if (bucket === "month") return d.toISOString().slice(0, 7)
  return d.toISOString().slice(0, 10)
}

export async function queryTimeseries(
  bucket: TimeseriesBucket,
  filter?: UsageFilter
): Promise<TimeseriesPoint[]> {
  const events = applyFilter(await readAllUsage(), filter)
  const map = new Map<number, TimeseriesPoint>()
  for (const e of events) {
    const start = bucketStart(e.timestamp, bucket)
    let point = map.get(start)
    if (!point) {
      point = {
        bucketStart: start,
        label: bucketLabel(start, bucket),
        requests: 0,
        inputTokens: 0,
        outputTokens: 0,
        success: 0,
        failover: 0,
        error: 0,
      }
      map.set(start, point)
    }
    point.requests++
    point.inputTokens += e.inputTokens
    point.outputTokens += e.outputTokens
    if (e.status === "success") point.success++
    else if (e.status === "failover") point.failover++
    else point.error++
  }
  return Array.from(map.values()).sort((a, b) => a.bucketStart - b.bucketStart)
}

export async function queryEvents(
  limit = 100,
  filter?: UsageFilter
): Promise<UsageEvent[]> {
  const events = applyFilter(await readAllUsage(), filter)
  return events.reverse().slice(0, limit)
}
