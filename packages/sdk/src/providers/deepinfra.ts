import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import type { ModelInfo, ProviderAdapter, ProviderKey } from "../types"

const DEEPINFRA_BASE_URL = "https://api.deepinfra.com/v1/openai"

const MODELS: ModelInfo[] = [
  {
    provider: "deepinfra",
    modelId: "meta-llama/Meta-Llama-3.3-70B-Instruct",
    capabilities: ["fast", "tool-use", "long-context"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "deepinfra",
    modelId: "meta-llama/Meta-Llama-3.1-405B-Instruct",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "deepinfra",
    modelId: "meta-llama/Meta-Llama-3.1-8B-Instruct",
    capabilities: ["fast", "tool-use"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "deepinfra",
    modelId: "deepseek-ai/DeepSeek-V3",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "deepinfra",
    modelId: "deepseek-ai/DeepSeek-R1",
    capabilities: ["reasoning", "tool-use"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "deepinfra",
    modelId: "Qwen/Qwen3-32B",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "deepinfra",
    modelId: "Qwen/Qwen2.5-Coder-32B-Instruct",
    capabilities: ["fast", "tool-use"],
    contextWindow: 32768,
    free: true,
  },
  {
    provider: "deepinfra",
    modelId: "mistralai/Mistral-Small-3.1-24B-Instruct",
    capabilities: ["fast", "tool-use"],
    contextWindow: 32768,
    free: true,
  },
]

export function deepinfraAdapter(): ProviderAdapter {
  return {
    id: "deepinfra",
    listModels: () => MODELS,
    languageModel: (modelId, key: ProviderKey) => {
      const client = createOpenAICompatible({
        name: "deepinfra",
        baseURL: DEEPINFRA_BASE_URL,
        headers: { Authorization: `Bearer ${key.raw}` },
      })
      return client.chatModel(modelId)
    },
  }
}
