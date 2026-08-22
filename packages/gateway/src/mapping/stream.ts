interface SseChunk {
  id: string
  created: number
  model: string
  delta: Record<string, unknown>
  finish_reason: string | null
}

type StreamPart =
  | { type: "text-delta"; id?: string; delta: string }
  | { type: "error"; error: unknown }
  | { type: "finish"; finishReason?: { unified?: string } }
  | { type: "tool-call"; toolCallId: string; toolName: string; args: string }
  | {
      type: "tool-call-delta"
      toolCallId: string
      toolName: string
      argsTextDelta: string
      toolCallIndex: number
    }

function generateId(): string {
  return `chatcmpl-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

function sse(chunk: SseChunk): Uint8Array {
  const json = JSON.stringify({
    id: chunk.id,
    object: "chat.completion.chunk" as const,
    created: chunk.created,
    model: chunk.model,
    choices: [
      {
        index: 0,
        delta: chunk.delta,
        finish_reason: chunk.finish_reason,
      },
    ],
  })
  return new TextEncoder().encode(`data: ${json}\n\n`)
}

export function toOpenAiSseChunks(
  stream: ReadableStream<StreamPart>,
  model: string,
  onError?: (err: unknown) => void
): ReadableStream<Uint8Array> {
  const id = generateId()
  const created = Math.floor(Date.now() / 1000)
  let roleSent = false

  return new ReadableStream({
    async start(controller) {
      const reader = stream.getReader()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          if (value.type === "text-delta") {
            if (!roleSent) {
              controller.enqueue(
                sse({
                  id,
                  created,
                  model,
                  delta: { role: "assistant" },
                  finish_reason: null,
                })
              )
              roleSent = true
            }
            controller.enqueue(
              sse({
                id,
                created,
                model,
                delta: { content: value.delta },
                finish_reason: null,
              })
            )
          }

          if (value.type === "tool-call") {
            controller.enqueue(
              sse({
                id,
                created,
                model,
                delta: {
                  tool_calls: [
                    {
                      id: value.toolCallId,
                      type: "function",
                      function: { name: value.toolName, arguments: value.args },
                    },
                  ],
                },
                finish_reason: null,
              })
            )
          }

          if (value.type === "tool-call-delta") {
            controller.enqueue(
              sse({
                id,
                created,
                model,
                delta: {
                  tool_calls: [
                    {
                      index: value.toolCallIndex,
                      id: value.toolCallId,
                      type: "function",
                      function: {
                        name: value.toolName,
                        arguments: value.argsTextDelta,
                      },
                    },
                  ],
                },
                finish_reason: null,
              })
            )
          }

          if (value.type === "finish") {
            controller.enqueue(
              sse({
                id,
                created,
                model,
                delta: {},
                finish_reason: value.finishReason?.unified ?? "stop",
              })
            )
          }

          if (value.type === "error") {
            onError?.(value.error)
            controller.enqueue(
              sse({ id, created, model, delta: {}, finish_reason: "error" })
            )
          }
        }
      } catch (err) {
        onError?.(err)
        controller.enqueue(
          sse({ id, created, model, delta: {}, finish_reason: "error" })
        )
      } finally {
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"))
        controller.close()
        reader.releaseLock()
      }
    },
  })
}
