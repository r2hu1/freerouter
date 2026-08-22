import type { FreeRouterKeys, ProviderId } from "@freerouter/sdk"
import { getDecryptedProviderKey } from "../storage/keys"

export const PROVIDER_IDS: ProviderId[] = [
  "groq",
  "google",
  "cloudflare",
  "openrouter",
  "nvidia",
  "cerebras",
  "together",
  "fireworks",
  "mistral",
  "sambanova",
  "deepseek",
  "deepinfra",
  "cohere",
  "huggingface",
]

export const HEADER_MAP: Record<string, string> = {
  groq: "x-groq-key",
  google: "x-google-key",
  openrouter: "x-openrouter-key",
  cloudflare: "x-cloudflare-key",
  nvidia: "x-nvidia-key",
  cerebras: "x-cerebras-key",
  together: "x-together-key",
  fireworks: "x-fireworks-key",
  mistral: "x-mistral-key",
  sambanova: "x-sambaNova-key",
  deepseek: "x-deepseek-key",
  deepinfra: "x-deepinfra-key",
  cohere: "x-cohere-key",
  huggingface: "x-huggingface-key",
}

export function resolveKeysFromHeaders(headers: Headers): FreeRouterKeys {
  const keys: FreeRouterKeys = {}
  for (const [provider, headerName] of Object.entries(HEADER_MAP)) {
    const value = headers.get(headerName)
    if (value) keys[provider as ProviderId] = value
  }
  return keys
}

export async function resolveKeysFromStore(): Promise<FreeRouterKeys> {
  const keys: FreeRouterKeys = {}
  for (const provider of PROVIDER_IDS) {
    const raw = await getDecryptedProviderKey(provider)
    if (raw) keys[provider] = raw
  }
  return keys
}
