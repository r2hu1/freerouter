import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import type { ModelInfo, ProviderAdapter, ProviderKey } from "../types"

const FIREWORKS_BASE_URL = "https://api.fireworks.ai/inference/v1"

const MODELS: ModelInfo[] = [
  {
    provider: "fireworks",
    modelId: "accounts/fireworks/models/llama-v3p3-70b-instruct",
    capabilities: ["fast", "tool-use", "long-context"],
    contextWindow: 131072,
    free: false,
  },
  {
    provider: "fireworks",
    modelId: "accounts/fireworks/models/firefunction-v2",
    capabilities: ["fast", "tool-use"],
    contextWindow: 32768,
    free: false,
  },
  {
    provider: "fireworks",
    modelId: "accounts/fireworks/models/qwen3-32b",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 131072,
    free: false,
  },
  {
    provider: "fireworks",
    modelId: "accounts/fireworks/models/deepseek-r1",
    capabilities: ["reasoning", "tool-use"],
    contextWindow: 16384,
    free: false,
  },
]

export function fireworksAdapter(): ProviderAdapter {
  return {
    id: "fireworks",
    listModels: () => MODELS,
    languageModel: (modelId, key: ProviderKey) => {
      const client = createOpenAICompatible({
        name: "fireworks",
        baseURL: FIREWORKS_BASE_URL,
        headers: { Authorization: `Bearer ${key.raw}` },
      })
      return client.chatModel(modelId)
    },
  }
}
