import type { FreeRouter } from "@freerouter/sdk"
import type { Context, Hono } from "hono"
import { resolveKeysFromHeaders } from "../auth/resolve-keys"
import { toAiSdkParams } from "../mapping/request"
import type { GenerateResult } from "../mapping/response"
import { toOpenAiResponse } from "../mapping/response"
import { toOpenAiSseChunks } from "../mapping/stream"
import { ChatCompletionRequestSchema } from "../schemas/chat-completions"

function parseAlias(model: string): string {
  const slashIdx = model.indexOf("/")
  return slashIdx > 0 ? model.slice(slashIdx + 1) : model
}

interface AiModel {
  // biome-ignore lint/suspicious/noExplicitAny: bridge SDK LanguageModelV4
  doGenerate(params: object): Promise<any>
  // biome-ignore lint/suspicious/noExplicitAny: bridge SDK LanguageModelV4
  doStream(params: object): Promise<{ stream: any }>
}

export function registerChatCompletions(app: Hono, freerouter: FreeRouter) {
  app.post("/v1/chat/completions", async (c: Context) => {
    const body = ChatCompletionRequestSchema.parse(await c.req.json())
    const { keys } = resolveKeysFromHeaders(c.req.raw.headers)
    const alias = parseAlias(body.model)
    const model = freerouter.languageModel(
      alias as Parameters<typeof freerouter.languageModel>[0],
      keys
    ) as unknown as AiModel
    const aiParams = toAiSdkParams(body)

    if (body.stream) {
      const streamResult = await model.doStream(aiParams)
      const sseStream = toOpenAiSseChunks(
        streamResult.stream,
        body.model,
        (err) => console.error("mid-stream error:", err)
      )
      return c.body(sseStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }

    const result = await model.doGenerate(aiParams)
    return c.json(
      toOpenAiResponse(result as unknown as GenerateResult, body.model)
    )
  })
}
