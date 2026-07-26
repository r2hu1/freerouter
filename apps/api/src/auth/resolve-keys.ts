import type { FreeRouterKeys, ProviderId } from "@freerouter/sdk"

const HEADER_MAP: Record<ProviderId, string> = {
  groq: "x-groq-key",
  google: "x-google-key",
  openrouter: "x-openrouter-key",
  "github-models": "x-github-key",
  cloudflare: "x-cloudflare-key",
  nvidia: "x-nvidia-key",
  cerebras: "x-cerebras-key",
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

  // Fallback: Authorization: Bearer for clients (e.g. opencode) that
  // send the API key via standard Bearer token. Detect provider by
  // key prefix.
  if (!keys.groq) {
    const auth = headers.get("authorization")
    if (auth?.startsWith("Bearer ")) {
      const token = auth.slice(7)
      if (token.startsWith("gsk_")) keys.groq = token
    }
  }

  return { keys, source: "headers" }
}
