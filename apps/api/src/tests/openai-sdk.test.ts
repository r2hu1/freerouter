import { describe, expect, test } from "bun:test"
import OpenAI, { APIError } from "openai"
import { createApp } from "../app"
import { testEnv } from "./helper"

function createSdkClient() {
  const app = createApp(testEnv)
  const client = new OpenAI({
    apiKey: "sk-test",
    baseURL: "http://x.com/v1",
    fetch: async (input, init) => {
      const request =
        input instanceof Request ? input : new Request(input, init)
      return app.fetch(request)
    },
  })
  return client
}

describe("OpenAI SDK compatibility", () => {
  test("non-streaming alias: bad keys throws APIError with status 502", async () => {
    const client = createSdkClient()
    try {
      await client.chat.completions.create({
        model: "free:auto",
        messages: [{ role: "user", content: "hello" }],
      })
      expect.unreachable("should have thrown")
    } catch (err) {
      expect(err).toBeInstanceOf(APIError)
      expect((err as APIError).status).toBe(502)
      expect((err as APIError).message).toContain("All providers failed:")
    }
  })

  test("streaming alias: bad keys throws APIError with status 502", async () => {
    const client = createSdkClient()
    try {
      const stream = await client.chat.completions.create({
        model: "free:auto",
        messages: [{ role: "user", content: "hello" }],
        stream: true,
      })
      for await (const _ of stream) {
        // consume
      }
      expect.unreachable("should have thrown")
    } catch (err) {
      expect(err).toBeInstanceOf(APIError)
      expect((err as APIError).status).toBe(502)
    }
  })

  test("non-streaming pinned model: bad keys throws APIError with status 502", async () => {
    const client = createSdkClient()
    try {
      await client.chat.completions.create({
        model: "groq/llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "hello" }],
      })
      expect.unreachable("should have thrown")
    } catch (err) {
      expect(err).toBeInstanceOf(APIError)
      expect((err as APIError).status).toBe(502)
    }
  })

  test("streaming pinned model: bad keys throws APIError with status 502", async () => {
    const client = createSdkClient()
    try {
      const stream = await client.chat.completions.create({
        model: "groq/llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "hello" }],
        stream: true,
      })
      for await (const _ of stream) {
        // consume
      }
      expect.unreachable("should have thrown")
    } catch (err) {
      expect(err).toBeInstanceOf(APIError)
      expect((err as APIError).status).toBe(502)
    }
  })
})
