import type { FreeRouter } from "@freerouter/sdk"
import type { Context, Hono } from "hono"
import { authenticateProxy, parseAlias, parseProvider } from "../auth"
import { toOpenAiError } from "../mapping/errors"
import { toAiSdkParams } from "../mapping/request"
import { type GenerateResult, toOpenAiResponse } from "../mapping/response"
import { ChatCompletionRequestSchema } from "../mapping/schemas"
import { toOpenAiSseChunks } from "../mapping/stream"
import { appendUsage } from "../storage/usage"

function record(
  gatewayKeyId: string | null,
  alias: string,
  model: string,
  latencyMs: number,
  status: "success" | "error" | "failover",
  errorMessage: string | null,
  inputTokens = 0,
  outputTokens = 0
): void {
  appendUsage({
    gatewayKeyId,
    provider: parseProvider(model),
    model: parseProvider(model) ? model : null,
    alias,
    inputTokens,
    outputTokens,
    latencyMs,
    status,
    errorMessage,
  }).catch((e) => console.error("usage record failed", e))
}

interface AiModel {
  doGenerate(params: object): Promise<GenerateResult>
  doStream(params: object): Promise<{ stream: ReadableStream<StreamPart> }>
}

type StreamPart =
  | { type: "text-delta"; delta: string }
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

export function registerChatCompletions(app: Hono, freerouter: FreeRouter) {
  app.post("/v1/chat/completions", async (c: Context) => {
    const auth = await authenticateProxy(c)
    if (auth.error) {
      return c.json(auth.error.body, auth.error.status as 401 | 502)
    }

    let body: ReturnType<typeof ChatCompletionRequestSchema.parse>
    try {
      body = ChatCompletionRequestSchema.parse(await c.req.json())
    } catch (err) {
      const { status, body: b } = toOpenAiError(err)
      return c.json(b, status as 400)
    }

    const alias = parseAlias(body.model) as Parameters<
      typeof freerouter.languageModel
    >[0]
    const model = freerouter.languageModel(
      alias,
      auth.keys
    ) as unknown as AiModel
    const aiParams = toAiSdkParams(body)
    const requestStart = Date.now()
    const isTest = c.req.header("x-freerouter-test") === "1"
    const rec = isTest ? () => {} : record

    if (body.stream) {
      try {
        const streamResult = await model.doStream(aiParams)
        rec(
          auth.gatewayKeyId,
          body.model,
          body.model,
          Date.now() - requestStart,
          "success",
          null
        )
        const sseStream = toOpenAiSseChunks(
          streamResult.stream as unknown as ReadableStream<StreamPart>,
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
      } catch (err) {
        rec(
          auth.gatewayKeyId,
          body.model,
          body.model,
          Date.now() - requestStart,
          "error",
          String(err instanceof Error ? err.message : err)
        )
        const { status, body: b } = toOpenAiError(err)
        return c.json(b, status as 502)
      }
    }

    try {
      const result = await model.doGenerate(aiParams)
      const inputTokens = result.usage?.inputTokens?.total ?? 0
      const outputTokens = result.usage?.outputTokens?.total ?? 0
      rec(
        auth.gatewayKeyId,
        body.model,
        body.model,
        Date.now() - requestStart,
        "success",
        null,
        inputTokens,
        outputTokens
      )
      return c.json(toOpenAiResponse(result, body.model))
    } catch (err) {
      rec(
        auth.gatewayKeyId,
        body.model,
        body.model,
        Date.now() - requestStart,
        "error",
        String(err instanceof Error ? err.message : err)
      )
      const { status, body: b } = toOpenAiError(err)
      return c.json(b, status as 502)
    }
  })
}
