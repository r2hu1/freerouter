import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import type { ModelInfo, ProviderAdapter, ProviderKey } from "../types"

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

const MODELS: ModelInfo[] = [
  {
    provider: "openrouter",
    modelId: "nvidia/nemotron-3-ultra-550b-a55b:free",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 1048576,
    free: true,
  },
  {
    provider: "openrouter",
    modelId: "nvidia/nemotron-3-super-120b-a12b:free",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 262144,
    free: true,
  },
  {
    provider: "openrouter",
    modelId: "openai/gpt-oss-120b:free",
    capabilities: ["reasoning", "tool-use"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "openrouter",
    modelId: "openai/gpt-oss-20b:free",
    capabilities: ["fast", "tool-use"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "openrouter",
    modelId: "google/gemma-4-31b-it:free",
    capabilities: ["vision", "tool-use"],
    contextWindow: 262144,
    free: true,
  },
  {
    provider: "openrouter",
    modelId: "google/gemma-4-26b-a4b-it:free",
    capabilities: ["vision", "tool-use"],
    contextWindow: 262144,
    free: true,
  },
  {
    provider: "openrouter",
    modelId: "poolside/laguna-m.1:free",
    capabilities: ["tool-use", "long-context"],
    contextWindow: 262144,
    free: true,
  },
  {
    provider: "openrouter",
    modelId: "poolside/laguna-xs-2.1:free",
    capabilities: ["tool-use"],
    contextWindow: 262144,
    free: true,
  },
  {
    provider: "openrouter",
    modelId: "cohere/north-mini-code:free",
    capabilities: ["tool-use"],
    contextWindow: 262144,
    free: true,
  },
  {
    provider: "openrouter",
    modelId: "qwen/qwen3-next-80b-a3b-instruct:free",
    capabilities: ["tool-use", "long-context"],
    contextWindow: 262144,
    free: true,
  },
  {
    provider: "openrouter",
    modelId: "nvidia/nemotron-3-nano-30b-a3b:free",
    capabilities: ["fast", "tool-use"],
    contextWindow: 262144,
    free: true,
  },
  {
    provider: "openrouter",
    modelId: "meta-llama/llama-3.3-70b-instruct:free",
    capabilities: ["fast", "tool-use", "long-context"],
    contextWindow: 131072,
    free: true,
    deprecated: true,
  },
  {
    provider: "openrouter",
    modelId: "qwen/qwen3-coder:free",
    capabilities: ["tool-use", "long-context"],
    contextWindow: 1048576,
    free: true,
    deprecated: true,
  },
]

export function openrouterAdapter(): ProviderAdapter {
  return {
    id: "openrouter",
    listModels: () => MODELS,
    languageModel: (modelId, key: ProviderKey) => {
      const client = createOpenAICompatible({
        name: "openrouter",
        baseURL: OPENROUTER_BASE_URL,
        headers: { Authorization: `Bearer ${key.raw}` },
      })
      return client.chatModel(modelId)
    },
  }
}
