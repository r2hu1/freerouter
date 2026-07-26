import type { z } from "zod"
import type { ChatCompletionRequestSchema } from "../schemas/chat-completions"

type ChatRequest = z.input<typeof ChatCompletionRequestSchema>

type ContentPart =
  | { type: "text"; text: string }
  | { type: "file"; data: { type: "url"; url: string }; mediaType?: string }
  | { type: "tool-call"; toolCallId: string; toolName: string; args: string }

interface AiSdkMessage {
  role: "system" | "user" | "assistant"
  content: string | ContentPart[]
}

interface AiSdkToolMessage {
  role: "tool"
  content: { type: "tool-result"; toolCallId: string; content: string }[]
}

type PromptMessage = AiSdkMessage | AiSdkToolMessage

interface AiSdkParams {
  prompt: PromptMessage[]
  temperature?: number
  maxTokens?: number
  tools?: {
    type: "function"
    name: string
    description?: string
    parameters: unknown
  }[]
  toolChoice?:
    | { type: "auto" | "none" | "required" }
    | { type: "tool"; toolName: string }
}

function toAiSdkContent(
  content: string | Record<string, unknown>[] | null | undefined,
  role: string
): string | ContentPart[] {
  if (role === "system") {
    return content ?? ""
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

export function toAiSdkParams(body: ChatRequest): AiSdkParams {
  const prompt: PromptMessage[] = body.messages.map((m) => {
    if (m.role === "tool") {
      const msg: AiSdkToolMessage = {
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: m.tool_call_id ?? "",
            toolName: "",
            content:
              typeof m.content === "string"
                ? m.content
                : JSON.stringify(m.content),
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
        ...m.tool_calls.map((tc) => ({
          type: "tool-call" as const,
          toolCallId: tc.id,
          toolName: tc.function.name,
          args: tc.function.arguments,
        })),
      ]
    }

    const msg: AiSdkMessage = {
      role: m.role as "system" | "user" | "assistant",
      content,
    }
    return msg
  })

  const params: AiSdkParams = { prompt }

  if (body.temperature !== undefined) params.temperature = body.temperature
  if (body.max_tokens !== undefined) params.maxTokens = body.max_tokens

  if (body.tools) {
    params.tools = body.tools.map((tool) => ({
      type: "function" as const,
      name: tool.function.name,
      description: tool.function.description,
      parameters: tool.function.parameters,
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
