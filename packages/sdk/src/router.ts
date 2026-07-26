import type {
  LanguageModelV4,
  LanguageModelV4CallOptions,
  LanguageModelV4GenerateResult,
  LanguageModelV4StreamResult,
} from "@ai-sdk/provider"
import { fingerprintKey } from "./config"
import { FreeRouterError } from "./errors"
import { createMemoryHealthStore } from "./health/memory-store"
import { makeHealthKey } from "./health/store"
import type { HealthStore } from "./health/store"
import { classifyAndRecordFailure } from "./health/tracker"
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
  pinnedModel(
    provider: ProviderId,
    modelId: string,
    keys: FreeRouterKeys
  ): LanguageModelV4
  models(): ReturnType<ReturnType<typeof createRegistry>["models"]>
  healthFor(
    keys: FreeRouterKeys
  ): Record<string, { state: string; consecutiveFailures: number }>
}

async function pinnedGenerate(
  model: LanguageModelV4,
  provider: ProviderId,
  key: ProviderKey,
  health: HealthStore,
  options: LanguageModelV4CallOptions
): Promise<LanguageModelV4GenerateResult> {
  try {
    const result = await model.doGenerate(options)
    health.recordSuccess(makeHealthKey(provider, key))
    return result
  } catch (err) {
    classifyAndRecordFailure(health, provider, key, err)
    throw new FreeRouterError(
      err instanceof Error ? err.message : String(err),
      provider,
      err
    )
  }
}

async function pinnedStream(
  model: LanguageModelV4,
  provider: ProviderId,
  key: ProviderKey,
  health: HealthStore,
  options: LanguageModelV4CallOptions
): Promise<LanguageModelV4StreamResult> {
  try {
    const result = await model.doStream(options)
    health.recordSuccess(makeHealthKey(provider, key))
    return result
  } catch (err) {
    classifyAndRecordFailure(health, provider, key, err)
    throw new FreeRouterError(
      err instanceof Error ? err.message : String(err),
      provider,
      err
    )
  }
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

    pinnedModel: (
      provider: ProviderId,
      modelId: string,
      keys: FreeRouterKeys
    ): LanguageModelV4 => {
      const adapter = registry.adapter(provider)
      const rawKey = keys[provider]
      if (!rawKey) {
        throw new FreeRouterError(
          `No key provided for provider: ${provider}`,
          provider
        )
      }
      const modelInfo = registry.get(provider, modelId)
      if (!modelInfo) {
        throw new FreeRouterError(
          `Unknown model ${provider}/${modelId}`,
          provider
        )
      }
      const providerKey: ProviderKey = {
        raw: rawKey,
        fingerprint: fingerprintKey(rawKey),
      }
      const realModel = adapter.languageModel(modelId, providerKey)

      return {
        specificationVersion: "v4" as const,
        provider: "freerouter",
        modelId: modelId,
        supportedUrls: {},
        doGenerate: (options: LanguageModelV4CallOptions) =>
          pinnedGenerate(realModel, provider, providerKey, health, options),
        doStream: (options: LanguageModelV4CallOptions) =>
          pinnedStream(realModel, provider, providerKey, health, options),
      }
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
