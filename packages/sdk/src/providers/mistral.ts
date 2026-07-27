import { createMistral } from "@ai-sdk/mistral"
import type { ModelInfo, ProviderAdapter, ProviderKey } from "../types"

const MODELS: ModelInfo[] = [
  {
    provider: "mistral",
    modelId: "mistral-small-latest",
    capabilities: ["fast", "tool-use"],
    contextWindow: 32768,
    free: true,
  },
  {
    provider: "mistral",
    modelId: "open-mistral-nemo",
    capabilities: ["fast", "tool-use"],
    contextWindow: 128000,
    free: true,
  },
  {
    provider: "mistral",
    modelId: "codestral-latest",
    capabilities: ["fast", "tool-use"],
    contextWindow: 256000,
    free: true,
  },
  {
    provider: "mistral",
    modelId: "mistral-large-latest",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 128000,
    free: true,
  },
]

export function mistralAdapter(): ProviderAdapter {
  return {
    id: "mistral",
    listModels: () => MODELS,
    languageModel: (modelId, key: ProviderKey) =>
      createMistral({ apiKey: key.raw })(modelId),
  }
}
