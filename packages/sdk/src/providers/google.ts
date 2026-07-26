import { createGoogleGenerativeAI } from "@ai-sdk/google"
import type { ModelInfo, ProviderAdapter, ProviderKey } from "../types"

const MODELS: ModelInfo[] = [
  {
    provider: "google",
    modelId: "gemini-2.5-flash",
    capabilities: ["fast", "vision", "tool-use", "long-context"],
    contextWindow: 1048576,
    free: true,
  },
  {
    provider: "google",
    modelId: "gemini-2.5-flash-lite",
    capabilities: ["fast", "tool-use"],
    contextWindow: 1048576,
    free: true,
  },
  {
    provider: "google",
    modelId: "gemini-2.5-pro",
    capabilities: ["reasoning", "vision", "tool-use", "long-context"],
    contextWindow: 1048576,
    free: true,
  },
]

export function googleAdapter(): ProviderAdapter {
  return {
    id: "google",
    listModels: () => MODELS,
    languageModel: (modelId, key: ProviderKey) =>
      createGoogleGenerativeAI({ apiKey: key.raw })(modelId),
  }
}
