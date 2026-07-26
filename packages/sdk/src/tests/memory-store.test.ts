import { describe, expect, test } from "bun:test"
import { createMemoryHealthStore } from "../health/memory-store"
import type { ProviderId } from "../types"

const GROQ = "groq" as ProviderId
const GOOGLE = "google" as ProviderId

function key(provider: ProviderId, fingerprint: string) {
  return { provider, keyFingerprint: fingerprint }
}

describe("MemoryHealthStore", () => {
  test("new key starts healthy", () => {
    const store = createMemoryHealthStore()
    const h = store.get(key(GROQ, "abc"))
    expect(h.state).toBe("healthy")
    expect(h.consecutiveFailures).toBe(0)
  })

  test("rate-limit transitions to rate-limited", () => {
    const store = createMemoryHealthStore()
    const k = key(GROQ, "abc")
    store.recordFailure(k, "rate-limit")
    const h = store.get(k)
    expect(h.state).toBe("rate-limited")
    expect(h.retryAfter).toBeGreaterThan(Date.now())
  })

  test("consecutive errors transition to down", () => {
    const store = createMemoryHealthStore()
    const k = key(GROQ, "abc")
    store.recordFailure(k, "error")
    store.recordFailure(k, "error")
    store.recordFailure(k, "error")
    const h = store.get(k)
    expect(h.state).toBe("down")
  })

  test("success resets to healthy", () => {
    const store = createMemoryHealthStore()
    const k = key(GROQ, "abc")
    store.recordFailure(k, "error")
    store.recordFailure(k, "error")
    store.recordSuccess(k)
    const h = store.get(k)
    expect(h.state).toBe("healthy")
    expect(h.consecutiveFailures).toBe(0)
  })

  test("different key fingerprints are isolated", () => {
    const store = createMemoryHealthStore()
    const keyA = key(GROQ, "abc")
    const keyB = key(GROQ, "xyz")

    store.recordFailure(keyA, "rate-limit")

    const hA = store.get(keyA)
    expect(hA.state).toBe("rate-limited")

    const hB = store.get(keyB)
    expect(hB.state).toBe("healthy")
  })

  test("different providers with same fingerprint are isolated", () => {
    const store = createMemoryHealthStore()
    const groqKey = key(GROQ, "abc")
    const googleKey = key(GOOGLE, "abc")

    store.recordFailure(groqKey, "rate-limit")

    const hG = store.get(googleKey)
    expect(hG.state).toBe("healthy")
  })
})
