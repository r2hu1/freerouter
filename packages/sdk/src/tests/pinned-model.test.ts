import { describe, expect, test } from "bun:test"
import { createFreeRouter } from "../router"
import type { FreeRouter } from "../router"

describe("pinnedModel", () => {
  const freerouter: FreeRouter = createFreeRouter()

  test("returns LanguageModelV4 with correct metadata", () => {
    const model = freerouter.pinnedModel("groq", "llama-3.3-70b-versatile", {
      groq: "gsk_test",
    })
    expect(model.specificationVersion).toBe("v4")
    expect(model.provider).toBe("freerouter")
    expect(model.modelId).toBe("llama-3.3-70b-versatile")
  })

  test("throws when no key for provider", () => {
    expect(() =>
      freerouter.pinnedModel("groq", "llama-3.3-70b-versatile", {})
    ).toThrow("No key provided for provider: groq")
  })

  test("throws for unknown model", () => {
    expect(() =>
      freerouter.pinnedModel("groq", "nonexistent-model", {
        groq: "gsk_test",
      })
    ).toThrow("Unknown model groq/nonexistent-model")
  })

  test("health is tracked after doGenerate failure", async () => {
    const router = createFreeRouter()
    const model = router.pinnedModel("groq", "llama-3.3-70b-versatile", {
      groq: "gsk_badkey",
    })
    const hBefore = router.healthFor({ groq: "gsk_badkey" })
    expect(hBefore.groq?.state).toBe("healthy")
    expect(hBefore.groq?.consecutiveFailures).toBe(0)

    try {
      await model.doGenerate({
        prompt: [{ role: "user", content: "hello" }] as never,
      })
    } catch {
      // expected — fake key
    }

    const hAfter = router.healthFor({ groq: "gsk_badkey" })
    expect(hAfter.groq?.consecutiveFailures).toBe(1)
  })

  test("pinnedModel health store is shared with languageModel health", async () => {
    const router = createFreeRouter()
    const pinned = router.pinnedModel("groq", "llama-3.3-70b-versatile", {
      groq: "gsk_shared",
    })

    try {
      await pinned.doGenerate({
        prompt: [{ role: "user", content: "hello" }] as never,
      })
    } catch {
      // expected
    }

    const h = router.healthFor({ groq: "gsk_shared" })
    expect(h.groq?.consecutiveFailures).toBe(1)
  })
})
