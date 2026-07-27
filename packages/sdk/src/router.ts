import { fingerprintKey } from "./config"
import { createMemoryHealthStore } from "./health/memory-store"
import type { HealthStore } from "./health/store"
import { wrapModel } from "./model/wrap-model"
import { buildAdapters } from "./providers"
import type { Registry } from "./registry"
import { createRegistry } from "./registry"
import type { ResolverContext } from "./resolver"
import type { Alias, ProviderId, ProviderKey } from "./types"

export type FreeRouterKeys = Partial<Record<ProviderId, string>>

export interface FreeRouterConfig {
  healthStore?: HealthStore
}

export interface FreeRouter {
  languageModel(
    alias: Alias,
    keys: FreeRouterKeys
  ): ReturnType<typeof wrapModel>
  models(): ReturnType<ReturnType<typeof createRegistry>["models"]>
  healthFor(
    keys: FreeRouterKeys
  ): Record<string, { state: string; consecutiveFailures: number }>
}

function toProviderKeys(
  keys: FreeRouterKeys
): Partial<Record<ProviderId, ProviderKey>> {
  const result: Partial<Record<ProviderId, ProviderKey>> = {}
  for (const [provider, raw] of Object.entries(keys)) {
    if (raw) {
      result[provider as ProviderId] = {
        raw,
        fingerprint: fingerprintKey(raw),
      }
    }
  }
  return result
}

function buildResolverContext(
  registry: Registry,
  health: HealthStore,
  keys: FreeRouterKeys
): ResolverContext {
  return { registry, health, keys: toProviderKeys(keys) }
}

export function createFreeRouter(config?: FreeRouterConfig): FreeRouter {
  const adapters = buildAdapters()
  const registry = createRegistry(adapters)
  const health = config?.healthStore ?? createMemoryHealthStore()

  return {
    languageModel: (alias: Alias, keys: FreeRouterKeys) => {
      const ctx = buildResolverContext(registry, health, keys)
      return wrapModel(alias, ctx)
    },

    models: () => registry.models(),

    healthFor: (keys: FreeRouterKeys) => {
      const snapshot: Record<
        string,
        { state: string; consecutiveFailures: number }
      > = {}
      for (const [provider, raw] of Object.entries(keys)) {
        if (!raw) continue
        const fp = fingerprintKey(raw)
        const h = health.get({
          provider: provider as ProviderId,
          keyFingerprint: fp,
        })
        snapshot[provider] = {
          state: h.state,
          consecutiveFailures: h.consecutiveFailures,
        }
      }
      return snapshot
    },
  }
}
