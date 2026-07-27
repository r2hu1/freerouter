import type {
  JSONSchema7,
  LanguageModelV4CallOptions,
  LanguageModelV4FunctionTool,
} from "@ai-sdk/provider"
import type { z } from "zod"
import type { ChatCompletionRequestSchema } from "../schemas/chat-completions"

type ChatRequest = z.input<typeof ChatCompletionRequestSchema>

type ContentPart =
  | { type: "text"; text: string }
  | { type: "file"; data: { type: "url"; url: string }; mediaType?: string }
  | {
      type: "tool-call"
      toolCallId: string
      toolName: string
      input: Record<string, unknown>
    }

interface AiSdkMessage {
  role: "system" | "user" | "assistant"
  content: string | ContentPart[]
}

interface AiSdkToolMessage {
  role: "tool"
  content: {
    type: "tool-result"
    toolCallId: string
    toolName: string
    output: { type: "text"; value: string }
  }[]
}

type PromptMessage = AiSdkMessage | AiSdkToolMessage

function toAiSdkContent(
  content: string | Record<string, unknown>[] | null | undefined,
  role: string
): string | ContentPart[] {
  if (role === "system") {
    return typeof content === "string" ? content : ""
  }
  if (typeof content === "string" && content.length > 0) {
    return [{ type: "text", text: content }]
  }
  if (Array.isArray(content) && content.length > 0) {
    return content.map((part) => {
      if (part.type === "text") {
        return { type: "text" as const, text: String(part.text ?? "") }
      }
      if (part.type === "image_url") {
        const url = (part as Record<string, unknown>).image_url as
          | Record<string, unknown>
          | undefined
        return {
          type: "file" as const,
          data: { type: "url" as const, url: String(url?.url ?? "") },
          mediaType: "image/webp" as const,
        }
      }
      return { type: "text" as const, text: JSON.stringify(part) }
    })
  }
  return []
}

function buildToolNameMap(
  messages: ChatRequest["messages"]
): Map<string, string> {
  const map = new Map<string, string>()
  for (const m of messages) {
    if (m.role === "assistant" && m.tool_calls) {
      for (const tc of m.tool_calls) {
        map.set(tc.id, tc.function.name)
      }
    }
  }
  return map
}

export function toAiSdkParams(body: ChatRequest): LanguageModelV4CallOptions {
  const toolNameMap = buildToolNameMap(body.messages)

  const prompt: PromptMessage[] = body.messages.map((m) => {
    if (m.role === "tool") {
      const toolCallId = m.tool_call_id ?? ""
      const msg: AiSdkToolMessage = {
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId,
            toolName: toolNameMap.get(toolCallId) ?? "",
            output: {
              type: "text",
              value:
                typeof m.content === "string"
                  ? m.content
                  : JSON.stringify(m.content),
            },
          },
        ],
      }
      return msg
    }

    const parts = toAiSdkContent(m.content, m.role)
    let content: string | ContentPart[] = parts

    if (m.role === "assistant" && m.tool_calls) {
      const base = Array.isArray(parts)
        ? parts
        : [{ type: "text" as const, text: parts as string }]
      content = [
        ...base,
        ...m.tool_calls.map((tc) => {
          let input: Record<string, unknown>
          try {
            input = JSON.parse(tc.function.arguments) as Record<string, unknown>
          } catch {
            input = {}
          }
          return {
            type: "tool-call" as const,
            toolCallId: tc.id,
            toolName: tc.function.name,
            input,
          }
        }),
      ]
    }

    const msg: AiSdkMessage = {
      role: m.role as "system" | "user" | "assistant",
      content,
    }
    return msg
  })

  const params: LanguageModelV4CallOptions = {
    prompt: prompt as LanguageModelV4CallOptions["prompt"],
  }

  if (body.temperature !== undefined) params.temperature = body.temperature
  if (body.max_tokens !== undefined) params.maxOutputTokens = body.max_tokens

  if (body.tools) {
    params.tools = body.tools.map((tool) => ({
      type: "function" as const,
      name: tool.function.name,
      description: tool.function.description,
      inputSchema: tool.function.parameters as JSONSchema7,
    }))
  }

  if (body.tool_choice) {
    if (typeof body.tool_choice === "string") {
      params.toolChoice = { type: body.tool_choice }
    } else {
      params.toolChoice = {
        type: "tool",
        toolName: body.tool_choice.function.name,
      }
    }
  }

  return params
}
