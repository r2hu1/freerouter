import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import type { ModelInfo, ProviderAdapter, ProviderKey } from "../types"

const COHERE_BASE_URL = "https://api.cohere.ai/compatibility/v1"

const MODELS: ModelInfo[] = [
  {
    provider: "cohere",
    modelId: "command-a-plus-05-2026",
    capabilities: ["vision", "tool-use"],
    contextWindow: 128000,
    free: true,
  },
  {
    provider: "cohere",
    modelId: "command-a-reasoning-08-2025",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 288000,
    free: true,
  },
  {
    provider: "cohere",
    modelId: "command-r-plus-08-2024",
    capabilities: ["tool-use", "long-context"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "cohere",
    modelId: "command-r-08-2024",
    capabilities: ["fast", "tool-use", "long-context"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "cohere",
    modelId: "command-a-03-2025",
    capabilities: ["tool-use", "long-context"],
    contextWindow: 256000,
    free: true,
  },
  {
    provider: "cohere",
    modelId: "command-r7b-12-2024",
    capabilities: ["fast", "tool-use"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "cohere",
    modelId: "command-a-vision",
    capabilities: ["vision", "tool-use"],
    contextWindow: 131072,
    free: true,
  },
]

export function cohereAdapter(): ProviderAdapter {
  return {
    id: "cohere",
    listModels: () => MODELS,
    languageModel: (modelId, key: ProviderKey) => {
      const client = createOpenAICompatible({
        name: "cohere",
        baseURL: COHERE_BASE_URL,
        headers: { Authorization: `Bearer ${key.raw}` },
      })
      return client.chatModel(modelId)
    },
  }
}
