import type { HealthStore } from "./health/store"
import type { Registry } from "./registry"
import type { Alias, ModelInfo, ProviderId } from "./types"
import type { ProviderKey } from "./types"

export interface ResolverContext {
  registry: Registry
  health: HealthStore
  keys: Partial<Record<ProviderId, ProviderKey>>
}

function aliasToCapability(
  alias: Alias
): import("./types").Capability | undefined {
  if (alias === "free:auto") return undefined
  if (alias === "free:fast") return "fast"
  if (alias === "free:reasoning") return "reasoning"
  if (alias === "free:long-context") return "long-context"
  if (alias === "free:vision") return "vision"
  if (alias === "free:tool-use") return "tool-use"
  return undefined
}

const PRIORITY: Record<string, number> = {
  groq: 0,
  google: 1,
  nvidia: 2,
  openrouter: 3,
  together: 4,
  fireworks: 5,
  "github-models": 6,
  mistral: 7,
  cloudflare: 8,
  cerebras: 9,
  sambanova: 10,
  deepseek: 11,
  deepinfra: 12,
  cohere: 13,
}

function rank(
  model: ModelInfo,
  health: HealthStore,
  keys: Partial<Record<ProviderId, ProviderKey>>
): number {
  const key = keys[model.provider]
  if (!key) return 999

  const h = health.get({
    provider: model.provider,
    keyFingerprint: key.fingerprint,
  })

  if (h.state === "down") return 998
  if (h.state === "rate-limited") {
    if (h.retryAfter && Date.now() < h.retryAfter) return 997
  }

  const basePriority = PRIORITY[model.provider] ?? 99
  return basePriority
}

export function resolveAlias(alias: Alias, ctx: ResolverContext): ModelInfo[] {
  const cap = aliasToCapability(alias)
  const candidates = cap
    ? ctx.registry.modelsWithCapability(cap)
    : ctx.registry.models()

  return candidates
    .filter((m) => !m.deprecated)
    .filter((m) => ctx.keys[m.provider] !== undefined)
    .filter((m) => {
      const key = ctx.keys[m.provider]
      if (!key) return false
      const h = ctx.health.get({
        provider: m.provider,
        keyFingerprint: key.fingerprint,
      })
      if (h.state === "down") {
        if (h.retryAfter && Date.now() < h.retryAfter) return false
        if (!h.retryAfter) return false
      }
      return true
    })
    .sort(
      (a, b) => rank(a, ctx.health, ctx.keys) - rank(b, ctx.health, ctx.keys)
    )
}
