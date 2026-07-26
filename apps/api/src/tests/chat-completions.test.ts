import { describe, expect, test } from "bun:test"
import { createApp } from "../app"

describe("POST /v1/chat/completions", () => {
  test("returns 400 for invalid body", async () => {
    const app = createApp()
    const res = await app.request("/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.type).toBe("invalid_request_error")
  })

  test("returns 502 when no keys provided (alias)", async () => {
    const app = createApp()
    const res = await app.request("/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "free:auto",
        messages: [{ role: "user", content: "hello" }],
      }),
    })
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.error.type).toBe("freerouter_all_providers_failed")
  })

  test("provider-prefixed alias like freerouter/free:auto treated as alias", async () => {
    const app = createApp()
    const res = await app.request("/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "freerouter/free:auto",
        messages: [{ role: "user", content: "hello" }],
      }),
    })
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.error.type).toBe("freerouter_all_providers_failed")
  })

  test("returns 502 when no key for pinned provider", async () => {
    const app = createApp()
    const res = await app.request("/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "groq/llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "hello" }],
      }),
    })
    expect(res.status).toBe(502)
  })

  test("alias with fake key returns 502 (provider rejects)", async () => {
    const app = createApp()
    const res = await app.request("/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-groq-key": "gsk_test123",
      },
      body: JSON.stringify({
        model: "free:auto",
        messages: [{ role: "user", content: "hello" }],
      }),
    })
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.error.type).toBe("freerouter_all_providers_failed")
  })

  test("pinned model with fake key returns 502", async () => {
    const app = createApp()
    const res = await app.request("/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-groq-key": "gsk_test123",
      },
      body: JSON.stringify({
        model: "groq/llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "hello" }],
      }),
    })
    expect(res.status).toBe(502)
  })

  test("streaming with fake key returns 502", async () => {
    const app = createApp()
    const res = await app.request("/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-groq-key": "gsk_test123",
      },
      body: JSON.stringify({
        model: "free:auto",
        messages: [{ role: "user", content: "hello" }],
        stream: true,
      }),
    })
    expect(res.status).toBe(502)
  })

  test("key values never leak in error responses", async () => {
    const app = createApp()
    const res = await app.request("/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-groq-key": "gsk_SECRETKEYVALUE123",
      },
      body: JSON.stringify({
        model: "free:auto",
        messages: [{ role: "user", content: "hello" }],
      }),
    })
    const bodyStr = await res.text()
    expect(bodyStr).not.toContain("SECRETKEYVALUE123")
  })
})
