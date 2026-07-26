import { createOpenAICompatible } from "@ai-sdk/openai-compatible"
import type { ModelInfo, ProviderAdapter, ProviderKey } from "../types"

const CLOUDFLARE_AI_BASE_URL = "https://api.cloudflare.com/client/v4/accounts"

/**
 * Cloudflare Workers AI uses an OpenAI-compatible endpoint but with a
 * different auth scheme: CF Account ID in the URL path + API Token as Bearer.
 *
 * The baseURL format is:
 * https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1
 *
 * The account_id is embedded in the key format "account_id:api_token"
 * to avoid requiring separate config fields.
 */
function parseCloudflareKey(raw: string): {
  accountId: string
  apiToken: string
} {
  const colonIdx = raw.indexOf(":")
  if (colonIdx === -1) {
    throw new Error("Cloudflare key must be in format 'account_id:api_token'")
  }
  return {
    accountId: raw.slice(0, colonIdx),
    apiToken: raw.slice(colonIdx + 1),
  }
}

const MODELS: ModelInfo[] = [
  {
    provider: "cloudflare",
    modelId: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    capabilities: ["fast", "tool-use", "long-context"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/meta/llama-3.1-8b-instruct",
    capabilities: ["fast", "tool-use"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/mistral/mistral-7b-instruct-v0.3",
    capabilities: ["fast"],
    contextWindow: 32768,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/mistral/mistral-small-3.1-24b-instruct",
    capabilities: ["fast", "tool-use"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/meta/llama-4-scout-17b-16e-instruct",
    capabilities: ["fast", "tool-use"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/qwen/qwen3-32b",
    capabilities: ["fast", "tool-use"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/deepseek/deepseek-r1-distill-qwen-32b",
    capabilities: ["reasoning"],
    contextWindow: 32768,
    free: true,
  },
]

export function cloudflareAdapter(): ProviderAdapter {
  return {
    id: "cloudflare",
    listModels: () => MODELS,
    languageModel: (modelId, key: ProviderKey) => {
      const { accountId, apiToken } = parseCloudflareKey(key.raw)
      const baseURL = `${CLOUDFLARE_AI_BASE_URL}/${accountId}/ai/v1`
      const client = createOpenAICompatible({
        name: "cloudflare",
        baseURL,
        headers: { Authorization: `Bearer ${apiToken}` },
      })
      return client.chatModel(modelId)
    },
  }
}
