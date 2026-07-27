import { describe, expect, test } from "bun:test"
import { FreeRouterAllProvidersFailedError } from "@freerouter/sdk"
import { FreeRouterError } from "@freerouter/sdk"
import { ZodError } from "zod"
import { toOpenAiError } from "../mapping/errors"

describe("toOpenAiError", () => {
  test("FreeRouterAllProvidersFailedError → 502", () => {
    const err = new FreeRouterAllProvidersFailedError([])
    const { status, body } = toOpenAiError(err)
    expect(status).toBe(502)
    expect(body).toEqual({
      error: {
        message: "All providers failed: ",
        type: "freerouter_all_providers_failed",
        code: "all_providers_failed",
      },
    })
  })

  test("ZodError → 400", () => {
    const err = new ZodError([
      {
        code: "invalid_type",
        expected: "string",
        received: "number",
        path: ["model"],
        message: "Expected string",
      },
    ])
    const { status, body } = toOpenAiError(err)
    expect(status).toBe(400)
    expect(body).toHaveProperty("error")
    expect((body as { error: { type: string } }).error.type).toBe(
      "invalid_request_error"
    )
  })

  test("FreeRouterError → 502", () => {
    const err = new FreeRouterError("Provider error", "groq")
    const { status, body } = toOpenAiError(err)
    expect(status).toBe(502)
    expect(body).toHaveProperty("error")
  })

  test("unknown error → 500", () => {
    const err = new Error("something broke")
    const { status, body } = toOpenAiError(err)
    expect(status).toBe(500)
    expect(body).toEqual({
      error: { message: "Internal error", type: "server_error" },
    })
  })

  test("sanitizes key material from error message", () => {
    const inner = new Error("Invalid API key: sk-abc123def456")
    const err = new FreeRouterAllProvidersFailedError([
      new FreeRouterError(inner.message, "groq", inner),
    ])
    const { body } = toOpenAiError(err)
    const bodyStr = JSON.stringify(body)
    expect(bodyStr).not.toContain("sk-abc123def456")
    expect(bodyStr).not.toContain("abc123def456")
  })
})
