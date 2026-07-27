import { describe, expect, test } from "bun:test"
import { resolveKeysFromHeaders } from "../auth/resolve-keys"

describe("resolveKeysFromHeaders", () => {
  test("returns empty keys for empty headers", () => {
    const headers = new Headers()
    const { keys, source } = resolveKeysFromHeaders(headers)
    expect(keys).toEqual({})
    expect(source).toBe("headers")
  })

  test("extracts two provider keys", () => {
    const headers = new Headers({
      "x-groq-key": "gsk_test123",
      "x-google-key": "AIza_test456",
    })
    const { keys } = resolveKeysFromHeaders(headers)
    expect(keys.groq).toBe("gsk_test123")
    expect(keys.google).toBe("AIza_test456")
  })

  test("skips missing headers", () => {
    const headers = new Headers({
      "x-groq-key": "gsk_test123",
    })
    const { keys } = resolveKeysFromHeaders(headers)
    expect(keys.groq).toBe("gsk_test123")
    expect(keys.google).toBeUndefined()
    expect(keys.openrouter).toBeUndefined()
  })
})
