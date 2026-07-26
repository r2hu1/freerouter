import type {
  LanguageModelV4,
  LanguageModelV4CallOptions,
  LanguageModelV4GenerateResult,
  LanguageModelV4StreamResult,
} from "@ai-sdk/provider"
import { FreeRouterAllProvidersFailedError, FreeRouterError } from "../errors"
import { classifyAndRecordFailure } from "../health/tracker"
import type { ResolverContext } from "../resolver"
import { resolveAlias } from "../resolver"
import type { Alias, ProviderKey } from "../types"

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
        const result = await realModel.doGenerate(options)
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
        const result = await realModel.doStream(options)

        if (result.stream.locked) {
          this.recordHealthSuccess(candidate.provider, providerKey)
          return result
        }

        const [passThrough, failCheck] = result.stream.tee()
        const failReader = failCheck.getReader()
        const first = await failReader.read()
        failReader.releaseLock()

        if (first.done) {
          this.recordHealthSuccess(candidate.provider, providerKey)
          return { stream: passThrough }
        }

        if (first.value.type === "error") {
          const streamErr = first.value.error
          classifyAndRecordFailure(
            this.ctx.health,
            candidate.provider,
            providerKey,
            streamErr
          )
          errors.push(
            new FreeRouterError(
              String(
                streamErr instanceof Error ? streamErr.message : streamErr
              ),
              candidate.provider,
              streamErr
            )
          )
          await passThrough.cancel()
          continue
        }

        this.recordHealthSuccess(candidate.provider, providerKey)

        const merged = new ReadableStream({
          async start(controller) {
            controller.enqueue(first.value!)
            const pipeReader = passThrough.getReader()
            while (true) {
              const { done, value } = await pipeReader.read()
              if (done) {
                controller.close()
                break
              }
              if (value.type === "error") {
                controller.error(value.error)
                break
              }
              controller.enqueue(value)
            }
          },
        })

        return { stream: merged }
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
