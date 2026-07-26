import { createGroq } from "@ai-sdk/groq"
import type { ModelInfo, ProviderAdapter, ProviderKey } from "../types"

const MODELS: ModelInfo[] = [
  {
    provider: "groq",
    modelId: "llama-3.3-70b-versatile",
    capabilities: ["fast", "tool-use"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "groq",
    modelId: "llama-3.1-8b-instant",
    capabilities: ["fast", "tool-use"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "groq",
    modelId: "mixtral-8x7b-32768",
    capabilities: ["fast", "tool-use"],
    contextWindow: 32768,
    free: true,
  },
  {
    provider: "groq",
    modelId: "gemma2-9b-it",
    capabilities: ["fast", "tool-use"],
    contextWindow: 8192,
    free: true,
  },
  {
    provider: "groq",
    modelId: "llama-4-scout-17b-16e-instruct",
    capabilities: ["fast", "tool-use"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "groq",
    modelId: "llama-4-maverick-17b-128e-instruct",
    capabilities: ["fast", "tool-use", "vision"],
    contextWindow: 131072,
    free: true,
  },
]

export function groqAdapter(): ProviderAdapter {
  return {
    id: "groq",
    listModels: () => MODELS,
    languageModel: (modelId, key: ProviderKey) =>
      createGroq({ apiKey: key.raw })(modelId),
  }
}
