# @freerouter/sdk

BYOK (bring-your-own-key) multi-provider AI router built on [Vercel AI SDK](https://ai-sdk.dev).

## Install

```bash
bun add @freerouter/sdk
```

## Quickstart

```ts
import { createFreeRouter } from "@freerouter/sdk"
import { generateText } from "ai"

const freerouter = createFreeRouter()

const { text } = await generateText({
  model: freerouter.languageModel("free:auto", {
    groq: process.env.GROQ_API_KEY,
    google: process.env.GOOGLE_API_KEY,
  }),
  prompt: "Hello",
})
```

## Aliases

| Alias | Behavior |
|-------|----------|
| `free:auto` | Any available model, prioritized by speed/cost |
| `free:fast` | Fast-response models only |
| `free:reasoning` | Strong reasoning models only |
| `free:long-context` | High context-window models only |
| `free:vision` | Vision-capable models only |
| `free:tool-use` | Tool-use-capable models only |

## Supported providers

- Groq (`@ai-sdk/groq`)
- Google Gemini (`@ai-sdk/google`)
- OpenRouter (OpenAI-compatible, free models only)
- Cloudflare Workers AI (OpenAI-compatible)

## Keys

FreeRouter is **BYOK-only** — users supply their own provider API keys per call. Keys are never persisted, never logged.

- Keys are accepted per-call via `languageModel(alias, { provider: key })`
- A short SHA-256 fingerprint is derived from each key for health tracking
- Raw keys never appear in health snapshots, errors, or log output

## Failover

When a provider call fails, FreeRouter automatically tries the next best candidate from the alias's candidate list:

- **Non-streaming:** transparent retry on the next provider
- **Streaming:** pre-first-token errors retry transparently; mid-stream errors surface to the caller (no silent provider switch to avoid corrupted output)

## API

```ts
createFreeRouter(config?: FreeRouterConfig): FreeRouter
```

```ts
interface FreeRouter {
  languageModel(alias: Alias, keys: FreeRouterKeys): LanguageModelV4
  models(): ModelInfo[]
  healthFor(keys: FreeRouterKeys): Record<string, ProviderHealth>
}
```
