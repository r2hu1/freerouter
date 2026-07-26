import type {
  Capability,
  ModelInfo,
  ProviderAdapter,
  ProviderId,
} from "./types"

export interface Registry {
  models(): ModelInfo[]
  modelsWithCapability(cap: Capability): ModelInfo[]
  get(provider: ProviderId, modelId: string): ModelInfo | undefined
  adapter(provider: ProviderId): ProviderAdapter
}

export function createRegistry(adapters: ProviderAdapter[]): Registry {
  const adapterMap = new Map<ProviderId, ProviderAdapter>()
  const modelMap = new Map<string, ModelInfo>()

  for (const adapter of adapters) {
    adapterMap.set(adapter.id, adapter)
    for (const model of adapter.listModels()) {
      const key = `${model.provider}:${model.modelId}`
      modelMap.set(key, model)
    }
  }

  return {
    models: () => Array.from(modelMap.values()),
    modelsWithCapability: (cap: Capability) =>
      Array.from(modelMap.values()).filter((m) => m.capabilities.includes(cap)),
    get: (provider, modelId) => modelMap.get(`${provider}:${modelId}`),
    adapter: (provider) => {
      const a = adapterMap.get(provider)
      if (!a) throw new Error(`No adapter for provider: ${provider}`)
      return a
    },
  }
}
