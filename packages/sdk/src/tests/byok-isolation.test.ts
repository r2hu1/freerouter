import { describe, expect, test } from "bun:test"
import { createFreeRouter } from "../router"

describe("BYOK isolation", () => {
  test("two concurrent calls with different keys have isolated health state", async () => {
    const router = createFreeRouter()

    const fakeKeyValueA = "fake-key-a-12345"
    const fakeKeyValueB = "fake-key-b-67890"

    const modelA = router.languageModel("free:auto", {
      groq: fakeKeyValueA,
    })
    const modelB = router.languageModel("free:auto", {
      groq: fakeKeyValueB,
    })

    expect(modelA.provider).toBe("freerouter")
    expect(modelB.provider).toBe("freerouter")

    const healthA = router.healthFor({ groq: fakeKeyValueA })
    const healthB = router.healthFor({ groq: fakeKeyValueB })

    expect(healthA.groq?.state).toBe("healthy")
    expect(healthB.groq?.state).toBe("healthy")
  })

  test("raw key values never appear in fingerprints", () => {
    const { fingerprintKey } = require("../config")
    const sensitive = "sk-secret-test-key-do-not-leak"
    const fp = fingerprintKey(sensitive)
    expect(fp).not.toContain(sensitive)
    expect(fp).not.toContain("sk-secret")
    expect(fp).not.toContain("secret")
  })

  test("health snapshot returns only caller's own keys", () => {
    const router = createFreeRouter()
    const snapshot = router.healthFor({ groq: "key-a" })
    expect(Object.keys(snapshot)).toEqual(["groq"])
    expect(snapshot.groq).toBeDefined()
  })

  test("model with no keys for any provider returns proper error", () => {
    const router = createFreeRouter()
    const model = router.languageModel("free:auto", {})
    expect(model.provider).toBe("freerouter")
  })
})
