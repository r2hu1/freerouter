import type { ProviderId, ProviderKey } from "../types"
import type { HealthStore } from "./store"

export function classifyAndRecordFailure(
  health: HealthStore,
  provider: ProviderId,
  key: ProviderKey,
  error: unknown
): void {
  const hk = { provider, keyFingerprint: key.fingerprint }

  const isRateLimit =
    isHttpStatus(error, 429) ||
    isAISDKRateLimitError(error) ||
    isProviderRateLimitError(error)

  if (isRateLimit) {
    const retryAfter = extractRetryAfter(error)
    health.recordFailure(hk, "rate-limit", retryAfter)
  } else {
    health.recordFailure(hk, "error")
  }
}

function isHttpStatus(err: unknown, status: number): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "statusCode" in err &&
    (err as { statusCode: number }).statusCode === status
  )
}

function isAISDKRateLimitError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false
  const e = err as Record<string, unknown>
  return typeof e.name === "string" && e.name.includes("RateLimit")
}

function isProviderRateLimitError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false
  const msg = String((err as Record<string, unknown>).message ?? "")
  const lower = msg.toLowerCase()
  return lower.includes("rate limit") || lower.includes("rate_limit")
}

function extractRetryAfter(err: unknown): number | undefined {
  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>
    const headers = e.headers as Record<string, string> | undefined
    if (headers?.["retry-after"]) {
      const seconds = Number(headers["retry-after"])
      if (!Number.isNaN(seconds)) return seconds * 1000
    }
  }
  return undefined
}
