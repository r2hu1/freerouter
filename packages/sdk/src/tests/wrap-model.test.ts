import { describe, expect, test } from "bun:test"
import { fakeProvider } from "../__fixtures__/fake-provider"
import { FreeRouterAllProvidersFailedError } from "../errors"
import { createMemoryHealthStore } from "../health/memory-store"
import { wrapModel } from "../model/wrap-model"
import { createRegistry } from "../registry"
import type { ResolverContext } from "../resolver"
import type { ProviderId, ProviderKey } from "../types"

const TEST_PROMPT = {
  prompt: [
    {
      role: "user" as const,
      content: [{ type: "text" as const, text: "hi" }],
    },
  ],
}

function makeCtx(): ResolverContext {
  const groq = fakeProvider({ id: "groq", failCount: 0 })
  const google = fakeProvider({ id: "google", failCount: 0 })
  const registry = createRegistry([groq, google])
  const health = createMemoryHealthStore()
  const keys: Partial<Record<ProviderId, ProviderKey>> = {
    groq: { raw: "key-groq", fingerprint: "fp-groq" },
    google: { raw: "key-google", fingerprint: "fp-google" },
  }
  return { registry, health, keys }
}

describe("wrapModel doGenerate", () => {
  test("succeeds with first provider", async () => {
    const ctx = makeCtx()
    const model = wrapModel("free:fast", ctx)
    const result = await model.doGenerate(TEST_PROMPT)
    expect(result.content[0]).toBeDefined()
  })

  test("failover: if provider[0] fails, provider[1] serves request", async () => {
    const google = fakeProvider({ id: "google", failCount: 0 })
    const groqFails = fakeProvider({
      id: "groq",
      failCount: 1,
      failWith: "error",
    })
    const registry = createRegistry([groqFails, google])
    const health = createMemoryHealthStore()
    const keys: Partial<Record<ProviderId, ProviderKey>> = {
      groq: { raw: "key-groq", fingerprint: "fp-groq" },
      google: { raw: "key-google", fingerprint: "fp-google" },
    }
    const ctx: ResolverContext = { registry, health, keys }

    const model = wrapModel("free:fast", ctx)
    const result = await model.doGenerate(TEST_PROMPT)
    expect(result.content[0]).toBeDefined()

    const groqHealth = ctx.health.get({
      provider: "groq",
      keyFingerprint: "fp-groq",
    })
    expect(groqHealth.consecutiveFailures).toBeGreaterThan(0)
  })

  test("all providers exhausted throws FreeRouterAllProvidersFailedError", async () => {
    const fail = fakeProvider({ id: "groq", failCount: 99, failWith: "error" })
    const registry = createRegistry([fail])
    const health = createMemoryHealthStore()
    const ctx: ResolverContext = {
      registry,
      health,
      keys: { groq: { raw: "key", fingerprint: "fp" } },
    }

    const model = wrapModel("free:fast", ctx)
    await expect(model.doGenerate(TEST_PROMPT)).rejects.toThrow(
      FreeRouterAllProvidersFailedError
    )
  })
})

describe("wrapModel doStream", () => {
  test("stream succeeds", async () => {
    const ctx = makeCtx()
    const model = wrapModel("free:fast", ctx)
    const result = await model.doStream(TEST_PROMPT)
    const reader = result.stream.getReader()
    const parts: Array<unknown> = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      parts.push(value)
    }
    expect(parts.length).toBeGreaterThan(0)
  })

  test("stream failover on pre-stream error", async () => {
    const google = fakeProvider({ id: "google", failCount: 0 })
    const groqFails = fakeProvider({
      id: "groq",
      failCount: 1,
      failWith: "error",
    })
    const registry = createRegistry([groqFails, google])
    const health = createMemoryHealthStore()
    const ctx: ResolverContext = {
      registry,
      health,
      keys: {
        groq: { raw: "key-groq", fingerprint: "fp-groq" },
        google: { raw: "key-google", fingerprint: "fp-google" },
      },
    }

    const model = wrapModel("free:fast", ctx)
    const result = await model.doStream(TEST_PROMPT)
    const reader = result.stream.getReader()
    const parts: Array<unknown> = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      parts.push(value)
    }
    expect(parts.length).toBeGreaterThan(0)

    const groqHealth = ctx.health.get({
      provider: "groq",
      keyFingerprint: "fp-groq",
    })
    expect(groqHealth.consecutiveFailures).toBeGreaterThan(0)
  })
})
