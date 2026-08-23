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
    contextWindow: 24000,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/meta/llama-3.1-8b-instruct-fp8",
    capabilities: ["fast", "tool-use"],
    contextWindow: 32000,
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
    modelId: "@cf/meta/llama-3.2-11b-vision-instruct",
    capabilities: ["vision", "tool-use"],
    contextWindow: 128000,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/meta/llama-3.2-3b-instruct",
    capabilities: ["fast"],
    contextWindow: 80000,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/mistralai/mistral-small-3.1-24b-instruct",
    capabilities: ["fast", "tool-use"],
    contextWindow: 128000,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/qwen/qwen2.5-coder-32b-instruct",
    capabilities: ["fast", "tool-use"],
    contextWindow: 33000,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/qwen/qwq-32b",
    capabilities: ["reasoning"],
    contextWindow: 24000,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/qwen/qwen3-30b-a3b-fp8",
    capabilities: ["fast", "tool-use"],
    contextWindow: 33000,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b",
    capabilities: ["reasoning"],
    contextWindow: 80000,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/nvidia/nemotron-3-super-120b-a12b",
    capabilities: ["tool-use", "long-context"],
    contextWindow: 256000,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/google/gemma-4-26b-a4b-it",
    capabilities: ["tool-use", "long-context"],
    contextWindow: 256000,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/openai/gpt-oss-120b",
    capabilities: ["tool-use", "reasoning"],
    contextWindow: 128000,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/openai/gpt-oss-20b",
    capabilities: ["fast", "tool-use"],
    contextWindow: 128000,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/moonshotai/kimi-k2.7-code",
    capabilities: ["tool-use", "long-context"],
    contextWindow: 262144,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/zai-org/glm-5.2",
    capabilities: ["reasoning", "tool-use", "long-context"],
    contextWindow: 262144,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/aisingapore/gemma-sea-lion-v4-27b-it",
    capabilities: ["tool-use", "long-context"],
    contextWindow: 128000,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/ibm-granite/granite-4.0-h-micro",
    capabilities: ["tool-use"],
    contextWindow: 131072,
    free: true,
  },
  {
    provider: "cloudflare",
    modelId: "@cf/meta/llama-guard-3-8b",
    capabilities: ["tool-use"],
    contextWindow: 131072,
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
