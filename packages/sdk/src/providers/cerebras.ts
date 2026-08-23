import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import type { ModelInfo, ProviderAdapter, ProviderKey } from "../types"

const CEREBRAS_BASE_URL = "https://api.cerebras.ai/v1"

const MODELS: ModelInfo[] = [
  {
    provider: "cerebras",
    modelId: "gpt-oss-120b",
    capabilities: ["fast", "reasoning", "tool-use"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "cerebras",
    modelId: "gemma-4-31b",
    capabilities: ["vision", "reasoning", "tool-use", "fast"],
    contextWindow: 131072,
    free: true,
  },
]

export function cerebrasAdapter(): ProviderAdapter {
  return {
    id: "cerebras",
    listModels: () => MODELS,
    languageModel: (modelId, key: ProviderKey) => {
      const client = createOpenAICompatible({
        name: "cerebras",
        baseURL: CEREBRAS_BASE_URL,
        headers: { Authorization: `Bearer ${key.raw}` },
      })
      return client.chatModel(modelId)
    },
  }
}
