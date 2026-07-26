export interface GenerateResult {
  content?: { type: string; text?: string }[]
  text?: string
  finishReason?: { unified?: string }
  usage?: {
    inputTokens?: { total?: number }
    outputTokens?: { total?: number }
    totalTokens?: number
  }
  toolCalls?: { toolCallId: string; toolName: string; args: string }[]
}

interface OpenAiChatCompletion {
  id: string
  object: "chat.completion"
  created: number
  model: string
  choices: {
    index: number
    message: {
      role: "assistant"
      content: string | null
      tool_calls?: {
        id: string
        type: "function"
        function: { name: string; arguments: string }
      }[]
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

function generateId(): string {
  return `chatcmpl-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export function toOpenAiResponse(
  result: GenerateResult,
  model: string
): OpenAiChatCompletion {
  const finishReason = result.finishReason?.unified ?? "stop"

  const text =
    result.text ??
    result.content
      ?.filter((c): c is { type: "text"; text: string } => c.type === "text")
      .map((c) => c.text)
      .join("") ??
    null

  const message: OpenAiChatCompletion["choices"][0]["message"] = {
    role: "assistant",
    content: text,
  }

  if (result.toolCalls && result.toolCalls.length > 0) {
    message.tool_calls = result.toolCalls.map((tc) => ({
      id: tc.toolCallId,
      type: "function" as const,
      function: {
        name: tc.toolName,
        arguments: tc.args,
      },
    }))
  }

  return {
    id: generateId(),
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message,
        finish_reason: finishReason,
      },
    ],
    usage: {
      prompt_tokens: result.usage?.inputTokens?.total ?? 0,
      completion_tokens: result.usage?.outputTokens?.total ?? 0,
      total_tokens: result.usage?.totalTokens ?? 0,
    },
  }
}
