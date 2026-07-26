import type { FreeRouterKeys, ProviderId } from "@freerouter/sdk"

const HEADER_MAP: Record<ProviderId, string> = {
  groq: "x-groq-key",
  google: "x-google-key",
  openrouter: "x-openrouter-key",
  "github-models": "x-github-key",
  cloudflare: "x-cloudflare-key",
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
