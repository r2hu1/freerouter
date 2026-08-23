import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import type { ModelInfo, ProviderAdapter, ProviderKey } from "../types"

const SAMBANOVA_BASE_URL = "https://api.sambanova.ai/v1"

const MODELS: ModelInfo[] = [
  {
    provider: "sambanova",
    modelId: "Meta-Llama-3.3-70B-Instruct",
    capabilities: ["fast", "tool-use", "long-context"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "sambanova",
    modelId: "DeepSeek-V3.1",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 128000,
    free: true,
  },
  {
    provider: "sambanova",
    modelId: "gpt-oss-120b",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 128000,
    free: true,
  },
  {
    provider: "sambanova",
    modelId: "MiniMax-M2.7",
    capabilities: ["fast", "tool-use", "long-context"],
    contextWindow: 192000,
    free: true,
  },
  {
    provider: "sambanova",
    modelId: "gemma-4-31B-it",
    capabilities: ["vision", "tool-use", "long-context"],
    contextWindow: 128000,
    free: true,
  },
]

export function sambanovaAdapter(): ProviderAdapter {
  return {
    id: "sambanova",
    listModels: () => MODELS,
    languageModel: (modelId, key: ProviderKey) => {
      const client = createOpenAICompatible({
        name: "sambanova",
        baseURL: SAMBANOVA_BASE_URL,
        headers: { Authorization: `Bearer ${key.raw}` },
      })
      return client.chatModel(modelId)
    },
  }
}
