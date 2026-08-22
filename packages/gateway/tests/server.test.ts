import { afterEach, beforeEach, describe, expect, it } from "bun:test"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { SESSION_TOKEN } from "../src/auth"
import { loadConfig } from "../src/config"
import { createApp } from "../src/server"
import { createGatewayKey } from "../src/storage/keys"

const BASE = "http://localhost"

describe("gateway server integration", () => {
  beforeEach(async () => {
    process.env.FREEROUTER_HOME = await mkdtemp(join(tmpdir(), "frg-"))
    await loadConfig(true)
  })
  afterEach(async () => {
    await rm(process.env.FREEROUTER_HOME!, { recursive: true, force: true })
  })

  it("serves bootstrap + models without gateway key", async () => {
    const app = await createApp()
    const boot = await app.request(`${BASE}/v1/gateway/bootstrap`, {
      headers: { host: "localhost" },
    })
    expect(boot.status).toBe(200)
    const bootJson = (await boot.json()) as {
      token: string
      providers: unknown[]
    }
    expect(bootJson.token).toBe(SESSION_TOKEN)
    expect(Array.isArray(bootJson.providers)).toBe(true)

    const models = await app.request(`${BASE}/v1/models`)
    expect(models.status).toBe(200)
    const m = (await models.json()) as { data: { id: string }[] }
    expect(m.data.some((x) => x.id === "free:auto")).toBe(true)
  })

  it("rejects proxy without auth", async () => {
    const app = await createApp()
    const res = await app.request(`${BASE}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "free:auto", messages: [] }),
    })
    expect(res.status).toBe(401)
  })

  it("returns 502 when authed but no provider keys (no network)", async () => {
    const app = await createApp()
    const gk = await createGatewayKey("default")
    const res = await app.request(`${BASE}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${gk.key}`,
      },
      body: JSON.stringify({
        model: "free:auto",
        messages: [{ role: "user", content: "hi" }],
      }),
    })
    // No provider keys configured -> SDK has zero candidates -> all providers failed
    expect(res.status).toBe(502)
  })

  it("manages provider keys via session", async () => {
    const app = await createApp()
    const sessHeaders = {
      "content-type": "application/json",
      "x-freerouter-session": SESSION_TOKEN,
    }
    const add = await app.request(`${BASE}/v1/providers`, {
      method: "POST",
      headers: sessHeaders,
      body: JSON.stringify({ provider: "groq", key: "gsk_test123" }),
    })
    expect(add.status).toBe(201)

    const list = await app.request(`${BASE}/v1/providers`, {
      headers: sessHeaders,
    })
    const j = (await list.json()) as {
      providers: { id: string; provider: string; maskedKey: string }[]
    }
    expect(j.providers).toHaveLength(1)
    expect(j.providers[0]!.provider).toBe("groq")
    expect(j.providers[0]!.maskedKey).toContain("…")
    expect(j.providers[0]!.maskedKey).not.toContain("test123")

    const del = await app.request(
      `${BASE}/v1/providers/${j.providers[0]!.id}`,
      {
        method: "DELETE",
        headers: sessHeaders,
      }
    )
    expect(del.status).toBe(200)
  })

  it("creates and lists gateway keys", async () => {
    const app = await createApp()
    const sessHeaders = {
      "content-type": "application/json",
      "x-freerouter-session": SESSION_TOKEN,
    }
    const created = await app.request(`${BASE}/v1/gateway/keys`, {
      method: "POST",
      headers: sessHeaders,
      body: JSON.stringify({ label: "ci" }),
    })
    const c = (await created.json()) as { key: string }
    expect(c.key.startsWith("fr-live-")).toBe(true)

    const list = await app.request(`${BASE}/v1/gateway/keys`, {
      headers: sessHeaders,
    })
    const j = (await list.json()) as { keys: { label: string }[] }
    expect(j.keys.some((k) => k.label === "ci")).toBe(true)
  })

  it("returns analytics summary", async () => {
    const app = await createApp()
    const res = await app.request(`${BASE}/v1/analytics/summary`, {
      headers: { "x-freerouter-session": SESSION_TOKEN },
    })
    expect(res.status).toBe(200)
    const j = (await res.json()) as { totalRequests: number }
    expect(j.totalRequests).toBe(0)
  })
})
