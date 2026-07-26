import { describe, expect, test } from "bun:test"
import { fakeProvider } from "../__fixtures__/fake-provider"
import { createMemoryHealthStore } from "../health/memory-store"
import type { HealthStore } from "../health/store"
import { createRegistry } from "../registry"
import type { Registry } from "../registry"
import { resolveAlias } from "../resolver"
import type { ModelInfo, ProviderId, ProviderKey } from "../types"

interface TestCtx {
  registry: Registry
  health: HealthStore
  keys: Partial<Record<ProviderId, ProviderKey>>
}

function makeCtx(providers: ProviderId[]): TestCtx {
  const adapters = providers.map((id) =>
    fakeProvider({
      id,
      models: [
        {
          provider: id,
          modelId: `${id}-model`,
          capabilities: ["fast"],
          contextWindow: 4096,
          free: true,
        } as ModelInfo,
        {
          provider: id,
          modelId: `${id}-reason`,
          capabilities: ["reasoning"],
          contextWindow: 4096,
          free: true,
        } as ModelInfo,
      ],
    })
  )
  const registry = createRegistry(adapters)
  const health = createMemoryHealthStore()
  const keys: Partial<Record<ProviderId, ProviderKey>> = {}
  for (const id of providers) {
    keys[id] = { raw: `key-${id}`, fingerprint: `fp-${id}` }
  }
  return { registry, health, keys }
}

describe("resolveAlias", () => {
  test("free:auto returns all healthy models sorted by priority", () => {
    const ctx = makeCtx(["groq", "google"])
    const result = resolveAlias("free:auto", ctx)
    expect(result.length).toBe(4)
    expect(result[0]!.provider).toBe("groq")
    expect(result[1]!.provider).toBe("groq")
    expect(result[2]!.provider).toBe("google")
    expect(result[3]!.provider).toBe("google")
  })

  test("free:fast filters to fast-capable models only", () => {
    const ctx = makeCtx(["groq", "google"])
    const result = resolveAlias("free:fast", ctx)
    expect(result.length).toBe(2)
    for (const m of result) {
      expect(m.capabilities).toContain("fast")
    }
  })

  test("free:reasoning filters to reasoning-capable models only", () => {
    const ctx = makeCtx(["groq", "google"])
    const result = resolveAlias("free:reasoning", ctx)
    expect(result.length).toBe(2)
    for (const m of result) {
      expect(m.capabilities).toContain("reasoning")
    }
  })

  test("rate-limited provider is deprioritized but still included", () => {
    const ctx = makeCtx(["groq", "google"])
    const groqKey = { provider: "groq" as const, keyFingerprint: "fp-groq" }
    ctx.health.recordFailure(groqKey, "rate-limit")

    const result = resolveAlias("free:fast", ctx)
    expect(result.length).toBe(2)
    expect(result[0]!.provider).toBe("google")
    expect(result[1]!.provider).toBe("groq")
  })

  test("down provider is excluded", () => {
    const ctx = makeCtx(["groq", "google"])
    for (let i = 0; i < 3; i++) {
      ctx.health.recordFailure(
        { provider: "groq" as const, keyFingerprint: "fp-groq" },
        "error"
      )
    }

    const result = resolveAlias("free:fast", ctx)
    expect(result.length).toBe(1)
    expect(result[0]!.provider).toBe("google")
  })

  test("partial keys: only returns providers caller has keys for", () => {
    const ctx = makeCtx(["groq", "google", "openrouter"])
    ctx.keys.openrouter = undefined

    const result = resolveAlias("free:fast", ctx)
    expect(result.length).toBe(2)
    expect(result.find((m) => m.provider === "openrouter")).toBeUndefined()
  })

  test("all providers down returns empty list", () => {
    const ctx = makeCtx(["groq", "google"])
    for (const p of ["groq", "google"]) {
      for (let i = 0; i < 3; i++) {
        ctx.health.recordFailure(
          { provider: p as ProviderId, keyFingerprint: `fp-${p}` },
          "error"
        )
      }
    }
    const result = resolveAlias("free:auto", ctx)
    expect(result.length).toBe(0)
  })
})
