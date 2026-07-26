import type { HealthKey, HealthState, ProviderId, ProviderKey } from "../types"

export interface ProviderHealth {
  state: HealthState
  retryAfter?: number
  consecutiveFailures: number
}

export interface HealthStore {
  get(key: HealthKey): ProviderHealth
  recordSuccess(key: HealthKey): void
  recordFailure(
    key: HealthKey,
    kind: "rate-limit" | "error",
    retryAfterMs?: number
  ): void
}

export function makeHealthKey(
  provider: ProviderId,
  key: ProviderKey
): HealthKey {
  return { provider, keyFingerprint: key.fingerprint }
}
