import { describe, expect, test } from "bun:test"
import type { z } from "zod"
import { toAiSdkParams } from "../mapping/request"
import type { ChatCompletionRequestSchema } from "../schemas/chat-completions"

type Req = z.input<typeof ChatCompletionRequestSchema>

describe("toAiSdkParams", () => {
  test("maps basic messages", () => {
    const params = toAiSdkParams({
      model: "free:auto",
      messages: [
        { role: "system", content: "You are helpful" },
        { role: "user", content: "Hello" },
      ],
    } as Req)
    expect(params.prompt).toHaveLength(2)
    expect(params.prompt[0].role).toBe("system")
    expect(params.prompt[0].content).toBe("You are helpful")
    expect(params.prompt[1].role).toBe("user")
    expect(params.prompt[1].content).toEqual([{ type: "text", text: "Hello" }])
  })

  test("passes temperature and maxTokens", () => {
    const params = toAiSdkParams({
      model: "free:auto",
      messages: [{ role: "user", content: "Hi" }],
      temperature: 0.5,
      max_tokens: 100,
    } as Req)
    expect(params.temperature).toBe(0.5)
    expect(params.maxOutputTokens).toBe(100)
  })

  test("maps tools to record format", () => {
    const params = toAiSdkParams({
      model: "free:auto",
      messages: [{ role: "user", content: "Weather?" }],
      tools: [
        {
          type: "function",
          function: {
            name: "get_weather",
            description: "Get weather",
            parameters: {
              type: "object",
              properties: { location: { type: "string" } },
            },
          },
        },
      ],
      tool_choice: "auto",
    } as Req)
    expect(params.tools).toHaveLength(1)
    expect(params.tools![0].name).toBe("get_weather")
    expect((params.tools![0] as Record<string, unknown>).description).toBe(
      "Get weather"
    )
    expect((params.tools![0] as Record<string, unknown>).inputSchema).toEqual({
      type: "object",
      properties: { location: { type: "string" } },
    })
    expect(params.toolChoice).toEqual({ type: "auto" })
  })

  test("maps assistant tool_calls", () => {
    const params = toAiSdkParams({
      model: "free:auto",
      messages: [
        {
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: "call_123",
              type: "function",
              function: { name: "get_weather", arguments: '{"loc":"SF"}' },
            },
          ],
        },
      ],
    } as Req)
    const content = params.prompt[0].content
    expect(Array.isArray(content)).toBe(true)
    const parts = content as {
      type: string
      toolCallId?: string
      toolName?: string
      input?: string
    }[]
    expect(parts).toHaveLength(1)
    expect(parts[0].type).toBe("tool-call")
    expect(parts[0].toolCallId).toBe("call_123")
    expect(parts[0].toolName).toBe("get_weather")
    expect((parts[0] as Record<string, unknown>).input).toEqual({ loc: "SF" })
  })
})
