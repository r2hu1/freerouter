import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { loadConfig } from "../src/config"
import {
  decrypt,
  encrypt,
  generateGatewayKey,
  generateMasterSecret,
  hashSecret,
  maskSecret,
} from "../src/crypto"
import {
  createGatewayKey,
  getDecryptedProviderKey,
  listGatewayKeys,
  listProviderKeys,
  revokeGatewayKey,
  upsertProviderKey,
  verifyGatewayKey,
} from "../src/storage/keys"
import {
  appendUsage,
  querySummary,
  queryTimeseries,
} from "../src/storage/usage"

const PROVIDER = "groq"

describe("crypto round-trip", () => {
  it("encrypts and decrypts", () => {
    const secret = generateMasterSecret()
    const blob = encrypt("gsk_topsecret", secret)
    expect(decrypt(blob, secret)).toBe("gsk_topsecret")
  })

  it("masks secrets", () => {
    expect(maskSecret("gsk_abcdef1234")).toBe("gsk_…234")
  })

  it("hashes are salted and verifiable", () => {
    const salt = "saltsaltsaltsalt"
    const h1 = hashSecret("key", salt)
    const h2 = hashSecret("key", salt)
    expect(h1).toBe(h2)
    expect(hashSecret("other", salt)).not.toBe(h1)
  })

  it("generates gateway keys with prefix", () => {
    expect(generateGatewayKey().startsWith("fr-live-")).toBe(true)
  })
})

describe("provider keys storage", () => {
  beforeEach(async () => {
    process.env.FREEROUTER_HOME = await mkdtemp(join(tmpdir(), "frg-"))
    await loadConfig(true)
  })
  afterEach(async () => {
    await rm(process.env.FREEROUTER_HOME!, { recursive: true, force: true })
  })

  it("stores encrypted, returns masked", async () => {
    await upsertProviderKey({
      provider: PROVIDER,
      label: "default",
      key: "gsk_abcdefghijklmnopqrstuvwxyz123456",
    })
    const list = await listProviderKeys()
    expect(list).toHaveLength(1)
    expect(list[0]!.maskedKey).toContain("…")
    expect(list[0]!.maskedKey).not.toContain("gsk_x")
    const raw = await getDecryptedProviderKey(PROVIDER)
    expect(raw).toBe("gsk_abcdefghijklmnopqrstuvwxyz123456")
  })
})

describe("gateway keys storage", () => {
  beforeEach(async () => {
    process.env.FREEROUTER_HOME = await mkdtemp(join(tmpdir(), "frg-"))
    await loadConfig(true)
  })
  afterEach(async () => {
    await rm(process.env.FREEROUTER_HOME!, { recursive: true, force: true })
  })

  it("creates, verifies, and revokes", async () => {
    const created = await createGatewayKey("default")
    expect(created.key.startsWith("fr-live-")).toBe(true)
    const verified = await verifyGatewayKey(created.key)
    expect(verified?.label).toBe("default")
    const bad = await verifyGatewayKey("fr-live-wrong")
    expect(bad).toBeNull()
    await revokeGatewayKey(verified!.id)
    const after = await verifyGatewayKey(created.key)
    expect(after).toBeNull()
    const list = await listGatewayKeys()
    expect(list[0]!.revoked).toBe(true)
  })
})

describe("usage aggregation", () => {
  beforeEach(async () => {
    process.env.FREEROUTER_HOME = await mkdtemp(join(tmpdir(), "frg-"))
    await loadConfig(true)
  })
  afterEach(async () => {
    await rm(process.env.FREEROUTER_HOME!, { recursive: true, force: true })
  })

  it("summarizes and buckets", async () => {
    await appendUsage({
      gatewayKeyId: "gk",
      provider: "groq",
      model: "llama",
      alias: "free:auto",
      inputTokens: 10,
      outputTokens: 5,
      latencyMs: 100,
      status: "success",
      errorMessage: null,
    })
    await appendUsage({
      gatewayKeyId: "gk",
      provider: "google",
      model: "gemini",
      alias: "free:auto",
      inputTokens: 20,
      outputTokens: 10,
      latencyMs: 200,
      status: "failover",
      errorMessage: "rate limited",
    })
    const summary = await querySummary()
    expect(summary.totalRequests).toBe(2)
    expect(summary.successRequests).toBe(1)
    expect(summary.failoverRequests).toBe(1)
    expect(summary.inputTokens).toBe(30)
    expect(summary.byProvider.groq).toBe(1)
    expect(summary.byProvider.google).toBe(1)
    const ts = await queryTimeseries("day")
    expect(ts).toHaveLength(1)
    expect(ts[0]!.requests).toBe(2)
  })
})
