import type {
  LanguageModelV4,
  LanguageModelV4CallOptions,
  LanguageModelV4GenerateResult,
  LanguageModelV4StreamResult,
  SharedV4Warning,
} from "@ai-sdk/provider"
import type {
  ModelInfo,
  ProviderAdapter,
  ProviderId,
  ProviderKey,
} from "../types"

export interface FakeProviderConfig {
  id: ProviderId
  models?: ModelInfo[]
  failCount?: number
  failWith?: "rate-limit" | "error"
}

const DEFAULT_FINISH_REASON = {
  unified: "stop" as const,
  raw: undefined as string | undefined,
}

const EMPTY_USAGE = {
  inputTokens: {
    total: 0 as number | undefined,
    noCache: undefined,
    cacheRead: undefined,
    cacheWrite: undefined,
  },
  outputTokens: {
    total: 0 as number | undefined,
    noCache: undefined,
    text: undefined,
    reasoning: undefined,
  },
  totalTokens: 0,
}

function makeResult(text: string): LanguageModelV4GenerateResult {
  return {
    content: [{ type: "text" as const, text }],
    finishReason: DEFAULT_FINISH_REASON,
    usage: EMPTY_USAGE,
    warnings: [] as Array<SharedV4Warning>,
  }
}

export function fakeProvider(config: FakeProviderConfig): ProviderAdapter {
  let callCount = 0

  const models: ModelInfo[] = config.models ?? [
    {
      provider: config.id,
      modelId: "fake-model-1",
      capabilities: ["fast"],
      contextWindow: 4096,
      free: true,
    },
  ]

  const failCount = config.failCount ?? 0
  const failWith = config.failWith ?? "error"

  return {
    id: config.id,
    listModels: () => models,
    languageModel: (_modelId: string, _key: ProviderKey) =>
      new FakeLanguageModel(config.id, _modelId, () => {
        callCount++
        if (callCount <= failCount) {
          const err = new Error(
            failWith === "rate-limit"
              ? "Rate limit exceeded"
              : `Simulated failure #${callCount}`
          )
          if (failWith === "rate-limit") {
            ;(err as Error & { statusCode: number }).statusCode = 429
          }
          throw err
        }
        return makeResult(`ok from ${config.id}`)
      }),
  }
}

class FakeLanguageModel implements LanguageModelV4 {
  readonly specificationVersion = "v4" as const
  readonly provider: string
  readonly modelId: string
  readonly supportedUrls: Record<string, RegExp[]> = {}

  constructor(
    provider: string,
    modelId: string,
    private generateFn: () => LanguageModelV4GenerateResult
  ) {
    this.provider = provider
    this.modelId = modelId
  }

  doGenerate(
    _options: LanguageModelV4CallOptions
  ): PromiseLike<LanguageModelV4GenerateResult> {
    const result = this.generateFn()
    if (result instanceof Error) throw result
    return Promise.resolve(result)
  }

  doStream(
    _options: LanguageModelV4CallOptions
  ): PromiseLike<LanguageModelV4StreamResult> {
    const result = this.generateFn()
    if (result instanceof Error) throw result

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue({
          type: "text-start" as const,
          id: "0",
          providerMetadata: undefined,
        })
        controller.enqueue({
          type: "text-delta" as const,
          id: "0",
          delta: (result.content[0] as { type: "text"; text: string }).text,
        })
        controller.enqueue({
          type: "text-end" as const,
          id: "0",
        })
        controller.enqueue({
          type: "finish" as const,
          usage: result.usage,
          finishReason: result.finishReason,
        })
        controller.close()
      },
    })

    return Promise.resolve({ stream })
  }
}
