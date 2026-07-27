import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import type { ModelInfo, ProviderAdapter, ProviderKey } from "../types"

const GITHUB_MODELS_BASE_URL = "https://models.github.ai/inference"

const MODELS: ModelInfo[] = [
  {
    provider: "github-models",
    modelId: "openai/gpt-4o-mini",
    capabilities: ["fast", "vision", "tool-use"],
    contextWindow: 128000,
    free: true,
  },
  {
    provider: "github-models",
    modelId: "openai/gpt-4o",
    capabilities: ["vision", "tool-use", "long-context"],
    contextWindow: 128000,
    free: true,
  },
  {
    provider: "github-models",
    modelId: "meta-llama/Llama-3.3-70B-Instruct",
    capabilities: ["fast", "tool-use", "long-context"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "github-models",
    modelId: "meta-llama/Llama-3.1-405B-Instruct",
    capabilities: ["fast", "tool-use", "long-context"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "github-models",
    modelId: "deepseek-ai/DeepSeek-V3",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 128000,
    free: true,
  },
  {
    provider: "github-models",
    modelId: "Mistralai/Mistral-Nemo-Instruct-2407",
    capabilities: ["fast", "tool-use"],
    contextWindow: 128000,
    free: true,
  },
  {
    provider: "github-models",
    modelId: "CohereForAI/c4ai-command-r-08-2024",
    capabilities: ["fast", "tool-use", "long-context"],
    contextWindow: 128000,
    free: true,
  },
  {
    provider: "github-models",
    modelId: "google/gemma-2-27b-it",
    capabilities: ["fast"],
    contextWindow: 8192,
    free: true,
  },
]

export function githubModelsAdapter(): ProviderAdapter {
  return {
    id: "github-models",
    listModels: () => MODELS,
    languageModel: (modelId, key: ProviderKey) => {
      const client = createOpenAICompatible({
        name: "github-models",
        baseURL: GITHUB_MODELS_BASE_URL,
        headers: { Authorization: `Bearer ${key.raw}` },
      })
      return client.chatModel(modelId)
    },
  }
}
