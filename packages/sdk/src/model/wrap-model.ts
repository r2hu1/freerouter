import type {
  LanguageModelV4,
  LanguageModelV4CallOptions,
  LanguageModelV4GenerateResult,
  LanguageModelV4StreamPart,
  LanguageModelV4StreamResult,
} from "@ai-sdk/provider"
import { FreeRouterAllProvidersFailedError, FreeRouterError } from "../errors"
import { classifyAndRecordFailure } from "../health/tracker"
import type { ResolverContext } from "../resolver"
import { resolveAlias } from "../resolver"
import type { Alias, ProviderKey } from "../types"

const MAX_BUFFER_CHUNKS = 10
const STREAM_READ_TIMEOUT_MS = 15_000
const PROVIDER_CALL_TIMEOUT_MS = 20_000

export function wrapModel(alias: Alias, ctx: ResolverContext): LanguageModelV4 {
  return new FailoverModel(alias, ctx)
}

class FailoverModel implements LanguageModelV4 {
  readonly specificationVersion = "v4" as const
  readonly provider = "freerouter"
  readonly modelId: string
  readonly supportedUrls: Record<string, RegExp[]> = {}

  constructor(
    private alias: Alias,
    private ctx: ResolverContext
  ) {
    this.modelId = alias
  }

  doGenerate(
    options: LanguageModelV4CallOptions
  ): PromiseLike<LanguageModelV4GenerateResult> {
    return this.#tryGenerate(options)
  }

  doStream(
    options: LanguageModelV4CallOptions
  ): PromiseLike<LanguageModelV4StreamResult> {
    return this.#tryStream(options)
  }

  /**
   * Read up to `max` chunks from original stream. Returns buffer + handles
   * the remainder transparently via a new ReadableStream so no chunk is
   * duplicated or dropped. First-chunk read has a timeout to detect
   * unresponsive providers.
   */
  async #bufferAndForward(
    original: ReadableStream<LanguageModelV4StreamPart>,
    max: number
  ): Promise<{
    stream: ReadableStream<LanguageModelV4StreamPart>
    error?: unknown
  }> {
    const reader =
      original.getReader() as unknown as ReadableStreamDefaultReader<LanguageModelV4StreamPart>
    const buffer: LanguageModelV4StreamPart[] = []

    for (let i = 0; i < max; i++) {
      let readPromise = reader.read()
      if (i === 0) {
        readPromise = Promise.race([
          readPromise,
          new Promise<never>((_, reject) =>
            setTimeout(
              () =>
                reject(new Error("Stream timed out — provider unresponsive")),
              STREAM_READ_TIMEOUT_MS
            )
          ),
        ])
      }
      let result: { done: boolean; value: LanguageModelV4StreamPart }
      try {
        result = (await readPromise) as {
          done: boolean
          value: LanguageModelV4StreamPart
        }
      } catch (err) {
        await original.cancel()
        return {
          stream: new ReadableStream({
            start(c) {
              c.close()
            },
          }),
          error: err,
        }
      }
      const { done, value } = result
      if (done) {
        reader.releaseLock()
        return {
          stream: new ReadableStream({
            start(c) {
              for (const b of buffer) c.enqueue(b)
              c.close()
            },
          }),
        }
      }
      buffer.push(value)
      if (value.type === "error") {
        reader.releaseLock()
        return {
          stream: new ReadableStream({
            start(c) {
              for (const b of buffer) c.enqueue(b)
              c.close()
            },
          }),
          error: value.error,
        }
      }
    }

    const merged = new ReadableStream({
      async start(controller) {
        for (const chunk of buffer) {
          if (chunk.type === "error") {
            controller.error(chunk.error)
            return
          }
          controller.enqueue(chunk)
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              controller.close()
              return
            }
            if (value.type === "error") {
              controller.error(value.error)
              return
            }
            controller.enqueue(value)
          }
        } finally {
          reader.releaseLock()
        }
      },
    })

    return { stream: merged }
  }

  async #tryGenerate(
    options: LanguageModelV4CallOptions
  ): Promise<LanguageModelV4GenerateResult> {
    const candidates = resolveAlias(this.alias, this.ctx)
    if (candidates.length === 0) {
      throw new FreeRouterAllProvidersFailedError([])
    }

    const errors: FreeRouterError[] = []

    for (const candidate of candidates) {
      const providerKey = this.ctx.keys[candidate.provider]
      if (!providerKey) continue

      const adapter = this.ctx.registry.adapter(candidate.provider)

      try {
        const realModel = adapter.languageModel(candidate.modelId, providerKey)
        const result = await Promise.race([
          realModel.doGenerate(options),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Provider request timed out")),
              PROVIDER_CALL_TIMEOUT_MS
            )
          ),
        ])
        this.recordHealthSuccess(candidate.provider, providerKey)
        return result
      } catch (err) {
        classifyAndRecordFailure(
          this.ctx.health,
          candidate.provider,
          providerKey,
          err
        )
        errors.push(
          new FreeRouterError(
            String(err instanceof Error ? err.message : err),
            candidate.provider,
            err
          )
        )
      }
    }

    throw new FreeRouterAllProvidersFailedError(errors)
  }

  async #tryStream(
    options: LanguageModelV4CallOptions
  ): Promise<LanguageModelV4StreamResult> {
    const candidates = resolveAlias(this.alias, this.ctx)
    if (candidates.length === 0) {
      throw new FreeRouterAllProvidersFailedError([])
    }

    const errors: FreeRouterError[] = []

    for (const candidate of candidates) {
      const providerKey = this.ctx.keys[candidate.provider]
      if (!providerKey) continue

      const adapter = this.ctx.registry.adapter(candidate.provider)

      try {
        const realModel = adapter.languageModel(candidate.modelId, providerKey)
        const result = await Promise.race([
          realModel.doStream(options),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Provider request timed out")),
              PROVIDER_CALL_TIMEOUT_MS
            )
          ),
        ])
        const { stream, error } = await this.#bufferAndForward(
          result.stream,
          MAX_BUFFER_CHUNKS
        )

        if (error) {
          classifyAndRecordFailure(
            this.ctx.health,
            candidate.provider,
            providerKey,
            error
          )
          errors.push(
            new FreeRouterError(
              String(error instanceof Error ? error.message : error),
              candidate.provider,
              error
            )
          )
          continue
        }

        this.recordHealthSuccess(candidate.provider, providerKey)
        return { stream }
      } catch (err) {
        classifyAndRecordFailure(
          this.ctx.health,
          candidate.provider,
          providerKey,
          err
        )
        errors.push(
          new FreeRouterError(
            String(err instanceof Error ? err.message : err),
            candidate.provider,
            err
          )
        )
      }
    }

    throw new FreeRouterAllProvidersFailedError(errors)
  }

  private recordHealthSuccess(provider: string, key: ProviderKey): void {
    this.ctx.health.recordSuccess({
      provider: provider as Parameters<
        typeof this.ctx.health.recordSuccess
      >[0]["provider"],
      keyFingerprint: key.fingerprint,
    })
  }
}
