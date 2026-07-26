# FreeRouter

> One API for free AI providers.

Open-source AI gateway that routes requests across free AI providers through a single OpenAI-compatible API. Integrate once, let FreeRouter handle provider selection, failover, rate limits, and API differences.

## Architecture

```
┌──────────────┐     ┌────────────────┐     ┌──────────────────┐
│  OpenAI SDK  │ ──▶ │  apps/api      │ ──▶ │  packages/sdk    │
│  (curl/any)  │     │  Hono + Zod    │     │  AI SDK v7       │
└──────────────┘     └────────────────┘     └──────────────────┘
                           │                        │
                           │ proxy-key (future)     │ BYOK
                           ▼                        ▼
                    ┌──────────────┐     ┌──────────────────┐
                    │  vault db    │     │  Groq / Google   │
                    │  (future)    │     │  OpenRouter /    │
                    └──────────────┘     │  GitHub Models†  │
                                         │  Cloudflare      │
                                         └──────────────────┘
```

† GitHub Models retires July 30, 2026.

## Quick Start

```bash
# Start API server
cd apps/api && bun install && bun run src/index.ts

# Chat completion
curl http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "x-groq-key: gsk_..." \
  -d '{"model":"free:auto","messages":[{"role":"user","content":"hello"}],"stream":false}'

# Streaming
curl http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "x-groq-key: gsk_..." \
  -d '{"model":"free:auto","messages":[{"role":"user","content":"hello"}],"stream":true}'
```

## API

| Endpoint | Description |
|----------|-------------|
| `GET /v1/models` | List all models (aliases + concrete) |
| `POST /v1/chat/completions` | Chat completion (streaming + non-streaming) |
| `GET /health` | Health check |

### Model Selection

**Aliases** (auto-failover across providers):
- `free:auto` — general purpose
- `free:fast` — low latency
- `free:reasoning` — reasoning tasks
- `free:long-context` — large contexts
- `free:vision` — image inputs
- `free:tool-use` — function calling

**Pinned models** (specific provider/model):
- `groq/llama-3.3-70b-versatile`
- `google/gemini-2.5-flash`
- `openrouter/meta-llama/llama-3.3-70b-instruct:free`
- `cloudflare/@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- `cloudflare/@cf/mistral/mistral-small-3.1-24b-instruct`

### Authentication

BYOK (Bring Your Own Key) — pass provider keys via headers:

| Header | Provider |
|--------|----------|
| `x-groq-key` | Groq |
| `x-google-key` | Google Gemini |
| `x-openrouter-key` | OpenRouter |
| `x-github-models-key` | GitHub Models |
| `x-cloudflare-key` | Cloudflare Workers AI |

### Headers

- `CORS_ORIGINS` — comma-separated origins (default: `*`)
- `PORT` — server port (default: `3000`)

## Providers

| Provider | Free Models | Key Required |
|----------|-------------|-------------|
| Groq | `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `llama-4-scout-17b-16e-instruct` †, `llama-4-maverick-17b-128e-instruct` † | ✅ |
| Google Gemini | `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-2.5-pro`, `gemini-3.6-flash` †, `gemini-3.5-flash` † | ✅ |
| OpenRouter | `nvidia/nemotron-3-ultra-550b-a55b:free`, `nvidia/nemotron-3-super-120b-a12b:free`, `openai/gpt-oss-120b:free`, `openai/gpt-oss-20b:free`, `google/gemma-4-31b-it:free`, `google/gemma-4-26b-a4b-it:free`, `poolside/laguna-m.1:free`, `poolside/laguna-xs-2.1:free`, `cohere/north-mini-code:free`, `qwen/qwen3-next-80b-a3b-instruct:free`, `nvidia/nemotron-3-nano-30b-a3b:free` +2 deprecated | ✅ |
| NVIDIA NIM | `deepseek-ai/deepseek-v4-pro`, `deepseek-ai/deepseek-v4-flash`, `z-ai/glm-5.2`, `minimaxai/minimax-m3`, `moonshotai/kimi-k2.6`, `nvidia/nemotron-4`, `qwen/qwen3.6-27b` | ✅ |
| Cerebras | `gpt-oss-120b`, `zai-glm-4.7` † | ✅ |
| GitHub Models‡ | `gpt-4o-mini`, `gpt-4o`, `Meta-Llama-3.1-405B-Instruct`, `Meta-Llama-3.3-70B-Instruct`, `DeepSeek-V3` +3 more | ✅ |
| Cloudflare Workers AI | `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, `@cf/meta/llama-3.1-8b-instruct-fp8`, `@cf/meta/llama-4-scout-17b-16e-instruct`, `@cf/meta/llama-3.2-11b-vision-instruct`, `@cf/mistralai/mistral-small-3.1-24b-instruct`, `@cf/qwen/qwen2.5-coder-32b-instruct`, `@cf/qwen/qwq-32b`, `@cf/qwen/qwen3-30b-a3b-fp8`, `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`, `@cf/google/gemma-4-26b-a4b-it`, `@cf/nvidia/nemotron-3-120b-a12b`, `@cf/openai/gpt-oss-120b`, `@cf/openai/gpt-oss-20b`, `@cf/moonshotai/kimi-k2.7-code`, `@cf/zai-org/glm-5.2` +4 more | ✅ |

† Deprecated or preview — excluded from alias routing but accessible via pinned model.
‡ GitHub Models retiring Jul 30, 2026.

## SDK

```bash
cd packages/sdk && bun install
```

```ts
import { createFreeRouter } from "@freerouter/sdk"

const router = createFreeRouter()
const keys = { groq: { raw: "gsk_...", fingerprint: "..." } }

// Use alias with failover
const model = router.languageModel("free:auto", keys)

// Or pin a specific provider/model
const model = router.pinnedModel("groq", "llama-3.3-70b-versatile", keys)

const result = await model.doGenerate({
  inputFormat: "messages",
  mode: { type: "regular" },
  prompt: [{ role: "user", content: [{ type: "text", text: "hi" }] }],
})
```

See `packages/sdk/DOCS.md` for full SDK docs.

## Status

Working. 34 API tests + 37 SDK tests pass across 7 providers.

## Stack

- **Runtime**: Bun
- **Monorepo**: Turborepo
- **Language**: TypeScript
- **Linting**: Biome
- **Framework**: Hono (API), Vercel AI SDK v7 (routing)
- **Auth**: BYOK via headers

## License

MIT
