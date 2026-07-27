# @freerouter/sdk — Usage Guide

## Install

```bash
bun add @freerouter/sdk
```

Requires `ai` (Vercel AI SDK v7) as a peer dependency — already a dependency of the SDK, no extra install needed.

---

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
  prompt: "Explain quantum computing in one paragraph",
})

console.log(text)
```

Keys are passed **per-call**, not at construction. This is the BYOK model — see [Keys & Security](#keys--security).

---

## createFreeRouter()

```ts
function createFreeRouter(config?: FreeRouterConfig): FreeRouter
```

Creates a single FreeRouter instance that can be shared across concurrent users/requests. Holds no credential state.

### FreeRouterConfig

```ts
interface FreeRouterConfig {
  healthStore?: HealthStore  // default: in-memory Map
}
```

Pass a custom `HealthStore` to persist health state across restarts (e.g. Redis-backed).

### FreeRouter methods

```ts
interface FreeRouter {
  // Returns a LanguageModelV4 for use with `generateText`, `streamText`, etc.
  languageModel(alias: Alias, keys: FreeRouterKeys): LanguageModelV4

  // Full catalog of all known models across all providers
  models(): ModelInfo[]

  // Health snapshot scoped to the caller's keys only
  healthFor(keys: FreeRouterKeys): Record<string, ProviderHealth>
}
```

---

## Aliases

An alias is a `free:${string}` string that maps to a set of models by capability. The resolver filters the full model catalog to matching models, then sorts by provider priority (fastest/cheapest first).

| Alias | Capability filter | Use case |
|---|---|---|
| `free:auto` | none — all models | "Give me anything that works" |
| `free:fast` | `fast` | Chat, simple Q&A, low-latency |
| `free:reasoning` | `reasoning` | Math, logic, complex analysis |
| `free:long-context` | `long-context` | Document analysis, large context |
| `free:vision` | `vision` | Image inputs |
| `free:tool-use` | `tool-use` | Function/tool calling |

The sort order for `free:auto` is:
1. Healthy providers (by priority: Groq → Google → NVIDIA NIM → OpenRouter → Together AI → Fireworks AI → GitHub Models → Mistral → Cloudflare → Cerebras → SambaNova → DeepSeek → DeepInfra → Cohere)
2. Rate-limited providers (after healthy, still usable)
3. Down providers (excluded entirely)

Deprecated models (GitHub Models, retiring Jul 30, 2026) are excluded from alias resolution.

If no model matches the alias + caller's keys + health state, the resolver returns an empty list and the model wrapper throws `FreeRouterAllProvidersFailedError`.

---

## Provider models

### Groq

| modelId | capabilities | context |
|---|---|---|
| `llama-3.3-70b-versatile` | fast, tool-use | 131K |
| `llama-3.1-8b-instant` | fast, tool-use | 131K |
| `llama-4-scout-17b-16e-instruct` ⚠️ preview | fast, tool-use | 131K |
| `llama-4-maverick-17b-128e-instruct` ⚠️ preview | fast, tool-use, vision | 131K |

### Google (Gemini)

| modelId | capabilities | context |
|---|---|---|
| `gemini-2.5-flash` | fast, vision, tool-use, long-context | 1M |
| `gemini-2.5-flash-lite` | fast, tool-use | 1M |
| `gemini-2.5-pro` | reasoning, vision, tool-use, long-context | 1M |
| `gemini-3.6-flash` ⚠️ preview | fast, vision, tool-use, long-context | 1M |
| `gemini-3.5-flash` ⚠️ preview | fast, vision, tool-use, long-context | 1M |

### OpenRouter (free models only — list changes frequently)

| modelId | capabilities | context |
|---|---|---|
| `nvidia/nemotron-3-ultra-550b-a55b:free` | reasoning, tool-use, long-context | 1M |
| `nvidia/nemotron-3-super-120b-a12b:free` | reasoning, tool-use, long-context | 262K |
| `google/gemma-4-31b-it:free` | vision, tool-use | 262K |
| `google/gemma-4-26b-a4b-it:free` | vision, tool-use | 262K |
| `poolside/laguna-m.1:free` | tool-use, long-context | 262K |
| `poolside/laguna-xs-2.1:free` | tool-use | 262K |
| `cohere/north-mini-code:free` | tool-use | 262K |
| `qwen/qwen3-next-80b-a3b-instruct:free` | tool-use, long-context | 262K |
| `nvidia/nemotron-3-nano-30b-a3b:free` | fast, tool-use | 262K |

### GitHub Models (retiring Jul 30, 2026)

| modelId | capabilities | context |
|---|---|---|
| `gpt-4o-mini` | fast, vision, tool-use | 128K |
| `gpt-4o` | vision, tool-use, long-context | 128K |
| `Meta-Llama-3.1-405B-Instruct` | fast, tool-use, long-context | 131K |
| `Meta-Llama-3.3-70B-Instruct` | fast, tool-use, long-context | 131K |
| `DeepSeek-V3` | reasoning, tool-use, long-context | 128K |
| `google/gemma-2-27b-it` | fast | 8K |
| `cohere/command-r-08-2024` | fast, tool-use, long-context | 128K |

### Cloudflare Workers AI

| modelId | capabilities | context |
|---|---|---|
| `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | fast, tool-use, long-context | 24K |
| `@cf/meta/llama-3.1-8b-instruct-fp8` | fast, tool-use | 32K |
| `@cf/meta/llama-4-scout-17b-16e-instruct` | fast, tool-use | 131K |
| `@cf/meta/llama-3.2-11b-vision-instruct` | vision, tool-use | 128K |
| `@cf/meta/llama-3.2-3b-instruct` | fast | 80K |
| `@cf/mistralai/mistral-small-3.1-24b-instruct` | fast, tool-use | 128K |
| `@cf/qwen/qwen2.5-coder-32b-instruct` | fast, tool-use | 33K |
| `@cf/qwen/qwq-32b` | reasoning | 24K |
| `@cf/qwen/qwen3-30b-a3b-fp8` | fast, tool-use | 33K |
| `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` | reasoning | 80K |
| `@cf/google/gemma-4-26b-a4b-it` | tool-use, long-context | 256K |
| `@cf/nvidia/nemotron-3-120b-a12b` | tool-use, long-context | 256K |
| `@cf/openai/gpt-oss-120b` | tool-use, reasoning | 128K |
| `@cf/openai/gpt-oss-20b` | fast, tool-use | 128K |
| `@cf/moonshotai/kimi-k2.7-code` | tool-use, long-context | 262K |
| `@cf/zai-org/glm-5.2` | reasoning, tool-use, long-context | 262K |
| `@cf/aisingapore/gemma-sea-lion-v4-27b-it` | tool-use, long-context | 128K |
| `@cf/ibm-granite/granite-4.0-h-micro` | tool-use | 131K |
| `@cf/meta/llama-guard-3-8b` | tool-use | 131K |

### NVIDIA NIM

| modelId | capabilities | context |
|---|---|---|
| `deepseek-ai/deepseek-v4-pro` | reasoning, tool-use, long-context | 1M |
| `deepseek-ai/deepseek-v4-flash` | reasoning, tool-use, long-context | 1M |
| `z-ai/glm-5.2` | reasoning, tool-use, long-context | 1M |
| `minimaxai/minimax-m3` | reasoning, tool-use, long-context | 1M |
| `moonshotai/kimi-k2.6` | reasoning, tool-use, long-context | 262K |
| `nvidia/nemotron-4` | reasoning, tool-use, long-context | 262K |
| `qwen/qwen3.6-27b` | fast, tool-use | 131K |

### Cerebras

| modelId | capabilities | context |
|---|---|---|
| `llama-3.3-70b` | fast, tool-use | 131K |
| `llama-3.1-8b` | fast, tool-use | 131K |
| `qwen3-32b` | reasoning, tool-use, long-context | 131K |
| `qwen3-235b` | reasoning, tool-use, long-context | 131K |

### Together AI

| modelId | capabilities | context |
|---|---|---|
| `meta-llama/Llama-3.3-70B-Instruct-Turbo-Free` | fast, tool-use, long-context | 131K |
| `mistralai/Mixtral-8x22B-Instruct-v0.1` | fast, tool-use, long-context | 65K |
| `deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free` | reasoning, tool-use, long-context | 131K |
| `Qwen/Qwen3-32B` | reasoning, tool-use, long-context | 131K |

### Fireworks AI

| modelId | capabilities | context |
|---|---|---|
| `accounts/fireworks/models/llama-v3p3-70b-instruct` | fast, tool-use, long-context | 131K |
| `accounts/fireworks/models/firefunction-v2` | tool-use | 131K |
| `accounts/fireworks/models/qwen3-32b` | reasoning, tool-use, long-context | 131K |
| `accounts/fireworks/models/deepseek-r1` | reasoning | 131K |

### Mistral AI

| modelId | capabilities | context |
|---|---|---|
| `mistral-small-latest` | fast, tool-use, long-context | 32K |
| `mistral-nemo-latest` | fast, tool-use | 128K |
| `codestral-latest` | tool-use | 256K |
| `mistral-large-latest` | reasoning, tool-use, long-context | 128K |

### SambaNova

| modelId | capabilities | context |
|---|---|---|
| `Meta-Llama-3.3-70B-Instruct` | fast, tool-use, long-context | 131K |
| `Meta-Llama-3.1-8B-Instruct` | fast, tool-use | 131K |
| `DeepSeek-V3.1-0324` | reasoning, tool-use, long-context | 131K |
| `Qwen3-32B` | reasoning, tool-use, long-context | 131K |

### DeepSeek

| modelId | capabilities | context |
|---|---|---|
| `deepseek-v4-flash` | fast, tool-use, long-context | 131K |
| `deepseek-v4-pro` | reasoning, tool-use, long-context | 131K |

### DeepInfra

| modelId | capabilities | context |
|---|---|---|
| `meta-llama/Meta-Llama-3.3-70B-Instruct` | fast, tool-use, long-context | 131K |
| `meta-llama/Meta-Llama-3.1-405B-Instruct` | reasoning, tool-use, long-context | 131K |
| `meta-llama/Meta-Llama-3.1-8B-Instruct` | fast, tool-use | 131K |
| `deepseek-ai/DeepSeek-V3` | reasoning, tool-use, long-context | 131K |
| `deepseek-ai/DeepSeek-R1` | reasoning, tool-use | 131K |
| `Qwen/Qwen3-32B` | reasoning, tool-use, long-context | 131K |
| `Qwen/Qwen2.5-Coder-32B-Instruct` | fast, tool-use | 32K |
| `mistralai/Mistral-Small-3.1-24B-Instruct` | fast, tool-use | 32K |

### Cohere

| modelId | capabilities | context |
|---|---|---|
| `command-a-plus-05-2026` | tool-use | 131K |
| `command-a-reasoning-08-2025` | reasoning, tool-use, long-context | 262K |
| `command-r-plus-08-2024` | tool-use, long-context | 131K |
| `command-r-08-2024` | fast, tool-use, long-context | 131K |
| `command-a-03-2025` | tool-use, long-context | 131K |

---

## Keys & Security

FreeRouter is **BYOK-only** — users supply their own provider API keys. The SDK never holds, persists, or logs raw keys.

### Key format per provider

| Provider | Key format |
|---|---|---|
| Groq | `gsk_...` |
| Google | `AIza...` |
| OpenRouter | Standard API key |
| NVIDIA NIM | `nvapi-...` |
| Cerebras | Standard API key |
| GitHub Models | GitHub PAT (`ghp_...`) |
| Cloudflare | `account_id:api_token` (colon-separated) |
| Together AI | Standard API key |
| Fireworks AI | Standard API key |
| Mistral | `api_...` or `Hv...` |
| SambaNova | Standard API key |
| DeepSeek | Standard API key |
| DeepInfra | Standard API key |
| Cohere | Standard API key (trial: 1K calls/month)

### Fingerprinting

Every raw key is hashed with SHA-256 immediately on receipt. The first 16 hex characters of the hash are used as a `fingerprint` — a stable, non-reversible identifier for health tracking.

```ts
import { fingerprintKey } from "@freerouter/sdk"

fingerprintKey("sk-abc123") // => "a1b2c3d4e5f6g7h8" (16 hex chars)
```

- Deterministic: same key always → same fingerprint
- Non-reversible: the raw key cannot be recovered from the fingerprint
- Raw keys never appear in health snapshots, error messages, or debug output

### API

```ts
type FreeRouterKeys = Partial<Record<ProviderId, string>>
```

Pass only the providers the current caller has keys for. Partial setups (e.g. only Groq + Google) work naturally — the resolver simply skips providers with no key.

---

## Health tracking

Health state is tracked per `(provider, keyFingerprint)` pair, not per provider. Two users with different Groq keys have completely independent health entries.

### State machine

```
healthy ──rate-limit──▶ rate-limited ──retry-after──▶ healthy
healthy ──3× error────▶ down ──30s cooldown──▶ healthy (half-open)
```

- **rate-limited**: Set by HTTP 429 responses. Excluded from candidate list until `retryAfter` (from `Retry-After` header or 60s default).
- **down**: After 3 consecutive non-rate-limit errors. Excluded for 30s cooldown, then re-allowed (half-open). On next success, returns to healthy.
- **healthy**: Normal operation. A single success resets the failure counter.

### HealthStore interface

```ts
interface HealthStore {
  get(key: HealthKey): ProviderHealth
  recordSuccess(key: HealthKey): void
  recordFailure(key: HealthKey, kind: "rate-limit" | "error", retryAfterMs?: number): void
}
```

Default in-memory store resets on application restart. Implement the interface to plug in Redis/SQLite/Postgres — see `packages/db` for future DB-backed stores.

### Health introspection

```ts
const health = freerouter.healthFor({ groq: "my-key" })
// => { groq: { state: "healthy", consecutiveFailures: 0 } }
```

Only returns health for the keys you supply — never exposes another user's health state.

---

## Failover behavior

Failover is handled inside `LanguageModelV4.doGenerate` / `doStream`, transparent to the caller.

### Non-streaming (`doGenerate`)

1. Resolve alias → ordered candidate list
2. Try `candidates[0]` with the caller's key for that provider
3. On success: record health success, return result
4. On failure: classify error (rate-limit vs generic), record in health store, try `candidates[1]`
5. If all candidates exhausted: throw `FreeRouterAllProvidersFailedError` with the chain of underlying errors

### Streaming (`doStream`)

**Before first token:** Same as non-streaming — transparent retry on next provider. The caller never sees the failed attempt.

**Mid-stream (after first token):** If the stream errors mid-way, the error is propagated to the caller. FreeRouter does **not** silently restart on a different provider mid-stream — that would duplicate/corrupt output. The partial stream up to the error point is delivered, then an error event surfaces.

```
[text-start] [text-delta "Hel"] [text-delta "lo"] ──error──▶ caller sees error
```

Callers should handle this by retrying the entire generation, possibly with a different alias or fewer providers.

---

## Error types

```ts
class FreeRouterError extends Error {
  readonly provider: string    // which provider failed
  readonly cause?: unknown     // underlying error
}

class FreeRouterAllProvidersFailedError extends FreeRouterError {
  readonly errors: FreeRouterError[]  // failure chain, one per provider tried
}
```

```ts
try {
  const { text } = await generateText({ model, prompt })
} catch (err) {
  if (err instanceof FreeRouterAllProvidersFailedError) {
    console.error("All providers failed:", err.message)
    // err.errors[0].provider, err.errors[0].cause, etc.
  }
}
```

---

## Custom health store

```ts
import { createFreeRouter } from "@freerouter/sdk"
import type { HealthStore, HealthKey, ProviderHealth } from "@freerouter/sdk"

const redisHealthStore: HealthStore = {
  get(key: HealthKey): ProviderHealth {
    // fetch from Redis keyed by `${key.provider}:${key.keyFingerprint}`
  },
  recordSuccess(key: HealthKey): void {
    // set health = healthy in Redis
  },
  recordFailure(key: HealthKey, kind, retryAfterMs): void {
    // set health = rate-limited or down in Redis
  },
}

const freerouter = createFreeRouter({ healthStore: redisHealthStore })
```

---

## Debugging

### List all known models

```ts
const models = freerouter.models()
console.table(models.map(m => ({ provider: m.provider, model: m.modelId, capabilities: m.capabilities.join(",") })))
```

### Check health for a specific key set

```ts
const h = freerouter.healthFor({ groq: "my-groq-key", google: "my-google-key" })
// h.groq.state, h.google.state, h.groq.consecutiveFailures, etc.
```

---



## Examples

### Streaming response

```ts
import { createFreeRouter } from "@freerouter/sdk"
import { streamText } from "ai"

const freerouter = createFreeRouter()
const result = streamText({
  model: freerouter.languageModel("free:fast", {
    groq: process.env.GROQ_API_KEY,
  }),
  prompt: "Write a poem about AI",
})

for await (const delta of result.textStream) {
  process.stdout.write(delta)
}
```

### Multi-user request handler (e.g. Hono)

```ts
import { createFreeRouter } from "@freerouter/sdk"
import { generateText } from "ai"

const freerouter = createFreeRouter()

app.post("/chat", async (c) => {
  const { prompt } = await c.req.json()
  const groqKey = c.req.header("X-Groq-Key")
  const googleKey = c.req.header("X-Google-Key")

  const keys: Record<string, string> = {}
  if (groqKey) keys.groq = groqKey
  if (googleKey) keys.google = googleKey

  const { text } = await generateText({
    model: freerouter.languageModel("free:auto", keys),
    prompt,
  })

  return c.json({ text })
})
```

### Two users, isolated health state

```ts
const router = createFreeRouter()
const userA = router.languageModel("free:auto", { groq: "key-a" })
const userB = router.languageModel("free:auto", { groq: "key-b" })
// userA's Groq key getting rate-limited never affects userB's Groq key
```
