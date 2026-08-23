export interface ProviderRecord {
  id: string
  provider: string
  label: string
  enabled: boolean
  createdAt: number
  lastUsedAt: number | null
  maskedKey: string
}

export interface GatewayKeyRecord {
  id: string
  label: string
  maskedKey: string
  createdAt: number
  lastUsedAt: number | null
}

export interface ProviderCatalog {
  id: string
  name: string
  signup: string
}

export interface Settings {
  port: number
  host: string
  autoOpen: boolean
  corsOrigins: string
  defaultAlias: string
  requestLogging: boolean
  requireGatewayKey: boolean
  providers: ProviderCatalog[]
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
  byProvider: Record<string, number>
  byAlias: Record<string, number>
  byModel: Record<string, number>
}

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

export interface UsageEvent {
  timestamp: number
  gatewayKeyId: string | null
  provider: string | null
  model: string | null
  alias: string
  inputTokens: number
  outputTokens: number
  latencyMs: number
  status: "success" | "error" | "failover"
  errorMessage: string | null
}

let TOKEN = ""

export const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "")

const BASE = API_BASE

export async function bootstrap(): Promise<{
  token: string
  providers: ProviderCatalog[]
}> {
  const res = await fetch(`${BASE}/v1/gateway/bootstrap`)
  if (!res.ok) throw new Error("Failed to bootstrap gateway")
  const data = (await res.json()) as {
    token: string
    providers: ProviderCatalog[]
  }
  TOKEN = data.token
  return data
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      "x-freerouter-session": TOKEN,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text}`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  getProviders: () =>
    request<{ providers: ProviderRecord[] }>("GET", "/v1/providers"),
  addProvider: (provider: string, key: string, label?: string) =>
    request<{ ok: true }>("POST", "/v1/providers", { provider, key, label }),
  deleteProvider: (id: string) =>
    request<{ ok: true }>("DELETE", `/v1/providers/${id}`),

  getKeys: () =>
    request<{ keys: GatewayKeyRecord[] }>("GET", "/v1/gateway/keys"),
  createKey: (label: string) =>
    request<{ id: string; label: string; key: string; createdAt: number }>(
      "POST",
      "/v1/gateway/keys",
      { label }
    ),
  revokeKey: (id: string) =>
    request<{ ok: boolean }>("DELETE", `/v1/gateway/keys/${id}`),

  getSummary: () => request<UsageSummary>("GET", "/v1/analytics/summary"),
  getTimeseries: (bucket: string) =>
    request<{ points: TimeseriesPoint[] }>(
      "GET",
      `/v1/analytics/timeseries?bucket=${bucket}`
    ),
  getEvents: (limit = 100) =>
    request<{ events: UsageEvent[] }>(
      "GET",
      `/v1/analytics/events?limit=${limit}`
    ),

  getSettings: () => request<Settings>("GET", "/v1/gateway/settings"),
  updateSettings: (patch: Partial<Settings>) =>
    request<Settings & { requiresRestart: boolean }>(
      "PUT",
      "/v1/gateway/settings",
      patch,
    ),
  restartGateway: () =>
    request<{ ok: boolean }>("POST", "/v1/gateway/restart"),
  openConfig: () =>
    request<{ ok: boolean; path: string }>("POST", "/v1/gateway/open-config"),
}
