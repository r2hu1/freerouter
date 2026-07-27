import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import type { ModelInfo, ProviderAdapter, ProviderKey } from "../types"

const TOGETHER_BASE_URL = "https://api.together.xyz/v1"

const MODELS: ModelInfo[] = [
  {
    provider: "together",
    modelId: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    capabilities: ["fast", "tool-use", "long-context"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "together",
    modelId: "meta-llama/Llama-3.1-8B-Instruct-Turbo",
    capabilities: ["fast", "tool-use"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "together",
    modelId: "mistralai/Mixtral-8x22B-Instruct-v0.1",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 65536,
    free: true,
  },
  {
    provider: "together",
    modelId: "deepseek-ai/DeepSeek-R1",
    capabilities: ["reasoning", "tool-use"],
    contextWindow: 16384,
    free: true,
  },
  {
    provider: "together",
    modelId: "Qwen/Qwen3-32B",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 131072,
    free: true,
  },
]

export function togetherAdapter(): ProviderAdapter {
  return {
    id: "together",
    listModels: () => MODELS,
    languageModel: (modelId, key: ProviderKey) => {
      const client = createOpenAICompatible({
        name: "together",
        baseURL: TOGETHER_BASE_URL,
        headers: { Authorization: `Bearer ${key.raw}` },
      })
      return client.chatModel(modelId)
    },
  }
}
