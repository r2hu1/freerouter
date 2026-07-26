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
    modelId: "llama-4-scout-17b-16e-instruct",
    capabilities: ["fast", "tool-use"],
    contextWindow: 131072,
    free: true,
    deprecated: true,
  },
  {
    provider: "groq",
    modelId: "llama-4-maverick-17b-128e-instruct",
    capabilities: ["fast", "tool-use", "vision"],
    contextWindow: 131072,
    free: true,
    deprecated: true,
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
