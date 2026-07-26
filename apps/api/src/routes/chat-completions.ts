import { FreeRouterError } from "@freerouter/sdk"
import type { Alias, FreeRouter, ProviderId } from "@freerouter/sdk"
import type { Context, Hono } from "hono"
import { resolveKeysFromHeaders } from "../auth/resolve-keys"
import { toAiSdkParams } from "../mapping/request"
import type { GenerateResult } from "../mapping/response"
import { toOpenAiResponse } from "../mapping/response"
import { toOpenAiSseChunks } from "../mapping/stream"
import { ChatCompletionRequestSchema } from "../schemas/chat-completions"

const ALIAS_PREFIX = "free:"

function parseModel(model: string): {
  type: "alias" | "pinned"
  provider?: string
  modelId?: string
} {
  // Client (e.g. opencode) may prefix model with provider name like
  // "freerouter/free:auto". Strip provider prefix and re-check.
  const slashIdx = model.indexOf("/")
  const stripped = slashIdx > 0 ? model.slice(slashIdx + 1) : model

  if (stripped.startsWith(ALIAS_PREFIX)) {
    return { type: "alias", modelId: stripped }
  }

  if (slashIdx > 0) {
    return {
      type: "pinned",
      provider: model.slice(0, slashIdx),
      modelId: stripped,
    }
  }
  return { type: "alias", modelId: model }
}

function wrapPinnedError(
  err: unknown,
  parsed: ReturnType<typeof parseModel>
): unknown {
  if (parsed.type === "pinned" && !(err instanceof FreeRouterError)) {
    return new FreeRouterError(
      err instanceof Error ? err.message : String(err),
      parsed.provider!,
      err
    )
  }
  return err
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
    const parsed = parseModel(body.model)

    const model: AiModel =
      parsed.type === "alias"
        ? (freerouter.languageModel(
            parsed.modelId as Alias,
            keys
          ) as unknown as AiModel)
        : (freerouter.pinnedModel(
            parsed.provider as ProviderId,
            parsed.modelId!,
            keys
          ) as unknown as AiModel)

    const aiParams = toAiSdkParams(body)

    if (body.stream) {
      try {
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
      } catch (err) {
        throw wrapPinnedError(err, parsed)
      }
    }

    try {
      const result = await model.doGenerate(aiParams)
      return c.json(
        toOpenAiResponse(result as unknown as GenerateResult, body.model)
      )
    } catch (err) {
      throw wrapPinnedError(err, parsed)
    }
  })
}
