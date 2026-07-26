import type { HealthKey } from "../types"
import type { HealthStore, ProviderHealth } from "./store"

const DEFAULT_DOWN_AFTER = 3
const COOLDOWN_MS = 10_000

function keyToString(key: HealthKey): string {
  return `${key.provider}:${key.keyFingerprint}`
}

function defaultHealth(): ProviderHealth {
  return { state: "healthy", consecutiveFailures: 0 }
}

export function createMemoryHealthStore(): HealthStore {
  const state = new Map<string, ProviderHealth>()

  return {
    get: (key: HealthKey) => {
      return state.get(keyToString(key)) ?? defaultHealth()
    },

    recordSuccess: (key: HealthKey) => {
      state.set(keyToString(key), {
        state: "healthy",
        consecutiveFailures: 0,
      })
    },

    recordFailure: (
      key: HealthKey,
      kind: "rate-limit" | "error",
      retryAfterMs?: number
    ) => {
      const k = keyToString(key)
      const current = state.get(k) ?? defaultHealth()

      if (kind === "rate-limit") {
        state.set(k, {
          state: "rate-limited",
          retryAfter: Date.now() + (retryAfterMs ?? 60_000),
          consecutiveFailures: current.consecutiveFailures + 1,
        })
        return
      }

      const failures = current.consecutiveFailures + 1
      if (failures >= DEFAULT_DOWN_AFTER) {
        state.set(k, {
          state: "down",
          retryAfter: Date.now() + COOLDOWN_MS,
          consecutiveFailures: failures,
        })
      } else {
        state.set(k, {
          state: "healthy",
          consecutiveFailures: failures,
        })
      }
    },
  }
}
