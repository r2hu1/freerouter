import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import type { ModelInfo, ProviderAdapter, ProviderKey } from "../types"

const DEEPSEEK_BASE_URL = "https://api.deepseek.com"

const MODELS: ModelInfo[] = [
  {
    provider: "deepseek",
    modelId: "deepseek-chat",
    capabilities: ["fast", "tool-use", "long-context"],
    contextWindow: 131072,
    free: true,
    deprecated: true,
  },
  {
    provider: "deepseek",
    modelId: "deepseek-reasoner",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 131072,
    free: true,
    deprecated: true,
  },
  {
    provider: "deepseek",
    modelId: "deepseek-v4-flash",
    capabilities: ["fast", "tool-use", "long-context"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "deepseek",
    modelId: "deepseek-v4-pro",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 131072,
    free: true,
  },
]

export function deepseekAdapter(): ProviderAdapter {
  return {
    id: "deepseek",
    listModels: () => MODELS,
    languageModel: (modelId, key: ProviderKey) => {
      const client = createOpenAICompatible({
        name: "deepseek",
        baseURL: DEEPSEEK_BASE_URL,
        headers: { Authorization: `Bearer ${key.raw}` },
      })
      return client.chatModel(modelId)
    },
  }
}
