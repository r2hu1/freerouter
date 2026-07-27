import { describe, expect, test } from "bun:test"
import { createApp } from "../app"
import { testEnv } from "./helper"

describe("GET /v1/models", () => {
  test("returns 200 with model list", async () => {
    const app = createApp(testEnv)
    const res = await app.request("/v1/models")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.object).toBe("list")
    expect(body.data.length).toBeGreaterThan(0)
    const aliases = body.data.filter((m: { id: string }) =>
      m.id.startsWith("free:")
    )
    expect(aliases.length).toBe(6)
    const concrete = body.data.filter((m: { id: string }) => m.id.includes("/"))
    expect(concrete.length).toBeGreaterThan(20)
  })
})
