import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import type { ModelInfo, ProviderAdapter, ProviderKey } from "../types"

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"

const MODELS: ModelInfo[] = [
  {
    provider: "nvidia",
    modelId: "deepseek-ai/deepseek-v4-pro",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 1048576,
    free: true,
  },
  {
    provider: "nvidia",
    modelId: "deepseek-ai/deepseek-v4-flash",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 1048576,
    free: true,
  },
  {
    provider: "nvidia",
    modelId: "z-ai/glm-5.2",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 1048576,
    free: true,
  },
  {
    provider: "nvidia",
    modelId: "minimaxai/minimax-m3",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 1048576,
    free: true,
  },
  {
    provider: "nvidia",
    modelId: "moonshotai/kimi-k2.6",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 262144,
    free: true,
  },
  {
    provider: "nvidia",
    modelId: "nvidia/nemotron-4",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 262144,
    free: true,
  },
  {
    provider: "nvidia",
    modelId: "qwen/qwen3.6-27b",
    capabilities: ["fast", "tool-use"],
    contextWindow: 131072,
    free: true,
  },
]

export function nvidiaAdapter(): ProviderAdapter {
  return {
    id: "nvidia",
    listModels: () => MODELS,
    languageModel: (modelId, key: ProviderKey) => {
      const client = createOpenAICompatible({
        name: "nvidia",
        baseURL: NVIDIA_BASE_URL,
        headers: { Authorization: `Bearer ${key.raw}` },
      })
      return client.chatModel(modelId)
    },
  }
}
