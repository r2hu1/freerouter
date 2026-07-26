import { expect, test } from "bun:test"
import { fingerprintKey } from "../config"

test("fingerprintKey is deterministic", async () => {
  const key = "sk-test-12345"
  const a = await fingerprintKey(key)
  const b = await fingerprintKey(key)
  expect(a).toBe(b)
})

test("fingerprintKey never contains raw input", async () => {
  const key = "sk-test-12345"
  const fp = await fingerprintKey(key)
  expect(fp).not.toContain(key)
  expect(fp).not.toContain("sk-test")
})

test("fingerprintKey produces hex string", async () => {
  const fp = await fingerprintKey("any-key")
  expect(fp).toMatch(/^[0-9a-f]+$/)
})

test("different keys produce different fingerprints", async () => {
  const a = await fingerprintKey("key-a")
  const b = await fingerprintKey("key-b")
  expect(a).not.toBe(b)
})
