import { describe, expect, spyOn, test } from "bun:test"
import { createApp } from "../app"
import { testEnv } from "./helper"

describe("requestLogger", () => {
  test("logs do not contain raw key material", async () => {
    const logs: string[] = []
    const spy = spyOn(console, "log").mockImplementation((...args) => {
      logs.push(args.join(" "))
    })

    const app = createApp(testEnv)
    await app.request("/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-groq-key": "gsk_SUPERSECRET123",
      },
      body: JSON.stringify({
        model: "free:auto",
        messages: [{ role: "user", content: "hello" }],
      }),
    })

    spy.mockRestore()

    for (const line of logs) {
      expect(line).not.toContain("SUPERSECRET123")
      expect(line).not.toContain("gsk_")
    }
  })
})
