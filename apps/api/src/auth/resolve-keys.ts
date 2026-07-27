import type { FreeRouterKeys, ProviderId } from "@freerouter/sdk"

const HEADER_MAP: Record<ProviderId, string> = {
  groq: "x-groq-key",
  google: "x-google-key",
  openrouter: "x-openrouter-key",
  cloudflare: "x-cloudflare-key",
  nvidia: "x-nvidia-key",
  cerebras: "x-cerebras-key",
  together: "x-together-key",
  fireworks: "x-fireworks-key",
  mistral: "x-mistral-key",
  sambanova: "x-sambanova-key",
  deepseek: "x-deepseek-key",
  deepinfra: "x-deepinfra-key",
  cohere: "x-cohere-key",
}

export function resolveKeysFromHeaders(headers: Headers): {
  keys: FreeRouterKeys
  source: "headers"
} {
  const keys: FreeRouterKeys = {}
  for (const [provider, headerName] of Object.entries(HEADER_MAP)) {
    const value = headers.get(headerName)
    if (value) keys[provider as ProviderId] = value
  }
  return { keys, source: "headers" }
}
