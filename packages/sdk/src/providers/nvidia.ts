import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import type { ModelInfo, ProviderAdapter, ProviderKey } from "../types"

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"

const MODELS: ModelInfo[] = [
  {
    provider: "nvidia",
    modelId: "mistralai/mistral-nemotron",
    capabilities: ["tool-use", "fast"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "nvidia",
    modelId: "nvidia/nemotron-3-super-120b-a12b",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 262144,
    free: true,
  },
  {
    provider: "nvidia",
    modelId: "nvidia/nemotron-3-nano-30b-a3b",
    capabilities: ["fast", "tool-use"],
    contextWindow: 262144,
    free: true,
  },
  {
    provider: "nvidia",
    modelId: "nvidia/nemotron-3-ultra-550b-a55b",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 1000000,
    free: true,
  },
  {
    provider: "nvidia",
    modelId: "nvidia/nemotron-3.5-lightning-30b-a3b",
    capabilities: ["reasoning", "tool-use", "fast", "long-context"],
    contextWindow: 1000000,
    free: true,
  },
  {
    provider: "nvidia",
    modelId: "nvidia/nvidia-nemotron-nano-9b-v2",
    capabilities: ["tool-use", "fast"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "nvidia",
    modelId: "deepseek-ai/deepseek-v4-flash-0731",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "nvidia",
    modelId: "minimaxai/minimax-m3",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 131072,
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
    modelId: "meta/llama-3.3-70b-instruct",
    capabilities: ["fast", "tool-use", "long-context"],
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
