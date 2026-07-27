import { describe, expect, test } from "bun:test"
import { createApp } from "../app"
import { testEnv } from "./helper"

describe("GET /health", () => {
  test("returns 200 with status ok", async () => {
    const app = createApp(testEnv)
    const res = await app.request("/health")
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe("ok")
    expect(body).toHaveProperty("providers")
  })
})
