
import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import type { ModelInfo, ProviderAdapter, ProviderKey } from "../types"

const ZAI_BASE_URL = "https://api.z.ai/api/paas/v4"

const MODELS: ModelInfo[] = [
  {
    provider: "zai",
    modelId: "glm-4.7-flash",
    capabilities: ["fast", "reasoning", "tool-use"],
    contextWindow: 200000,
    free: true,
  },
  {
    provider: "zai",
    modelId: "glm-4.5-flash",
    capabilities: ["fast", "reasoning", "tool-use"],
    contextWindow: 128000,
    free: true,
  },
  {
    provider: "zai",
    modelId: "glm-4.6v-flash",
    capabilities: ["fast", "vision"],
    contextWindow: 128000,
    free: true,
  },
]

export function zaiAdapter(): ProviderAdapter {
  return {
    id: "zai",
    listModels: () => MODELS,
    languageModel: (modelId, key: ProviderKey) => {
      const client = createOpenAICompatible({
        name: "zai",
        baseURL: ZAI_BASE_URL,
        headers: {
          Authorization: `Bearer ${key.raw}`,
        },
      })

      return client.chatModel(modelId)
    },
  }
}
