<img src="assets/opengraph.svg" alt="FreeRouter" width="100%">

<p align="center">
  <a href="https://www.npmjs.com/package/@freerouter/sdk"><img src="https://img.shields.io/npm/v/@freerouter/sdk?style=flat-square" alt="npm"></a>
  <a href="https://github.com/r2hu1/freerouter/blob/main/LICENSE"><img src="https://img.shields.io/github/license/r2hu1/freerouter?style=flat-square" alt="MIT"></a>
  <img src="https://img.shields.io/badge/cost-%240-brightgreen?style=flat-square" alt="$0 cost">
</p>

<h3 align="center">FreeRouter - One API for all free AI providers</h3>
<p align="center">
    Open-source AI gateway that routes requests across free AI providers through a single OpenAI-compatible API. Integrate once, let FreeRouter handle provider selection, failover, rate limits, and API differences.
</p>

<p align="center">
  <a href="https://freerouter.vercel.app">📖 Docs</a>
  &nbsp;·&nbsp;
  <a href="https://www.npmjs.com/package/@freerouter/sdk">📦 @freerouter/sdk</a>
</p>

## Quick Start

### Gateway (self-hosted, recommended)

https://github.com/user-attachments/assets/3b1b0d6b-27e4-46f2-865a-c1fa69dec3ac

The gateway wraps the SDK in a deployable server with a dashboard, encrypted provider-key storage, gateway-key auth, and analytics — runnable with a single command.

```bash
# Start the gateway (API + dashboard on one port, keys stored encrypted)
npx @freerouter/gateway serve
# → prints a fr-live-... gateway key and opens http://localhost:4141

# Chat via the gateway key (provider keys stay server-side)
curl http://localhost:4141/v1/chat/completions \
  -H "Authorization: Bearer fr-live-..." \
  -H "Content-Type: application/json" \
  -d '{"model":"free:auto","messages":[{"role":"user","content":"hello"}]}'
```

Connect provider keys and manage everything from the dashboard at [http://localhost:4141](http://localhost:4141). Full guide: [Gateway Docs](https://freerouter.vercel.app/docs/gateway).

### API Server

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

### SDK (Node.js / Bun)

```bash
npm install @freerouter/sdk
```

```ts
import { createFreeRouter } from "@freerouter/sdk";
import { generateText } from "ai";

const freerouter = createFreeRouter();

const { text } = await generateText({
  model: freerouter.languageModel("free:auto", {
    groq: process.env.GROQ_API_KEY,
    google: process.env.GOOGLE_API_KEY,
  }),
  prompt: "Explain quantum computing in one paragraph",
});

console.log(text);
```

## API

| Endpoint                    | Description                                 |
| --------------------------- | ------------------------------------------- |
| `GET /v1/models`            | List all models (aliases + concrete)        |
| `POST /v1/chat/completions` | Chat completion (streaming + non-streaming) |
| `GET /health`               | Health check                                |

### Model Selection

**Aliases** (auto-failover across providers):

- `free:auto` — general purpose
- `free:fast` — low latency
- `free:reasoning` — reasoning tasks
- `free:long-context` — large contexts
- `free:vision` — image inputs
- `free:tool-use` — function calling

### Authentication

BYOK (Bring Your Own Key) — pass provider keys via headers:

| Header             | Provider              |
| ------------------ | --------------------- |
| `x-groq-key`       | Groq                  |
| `x-google-key`     | Google Gemini         |
| `x-openrouter-key` | OpenRouter            |
| `x-cloudflare-key` | Cloudflare Workers AI |
| `x-nvidia-key`     | NVIDIA NIM            |
| `x-cerebras-key`   | Cerebras              |
| `x-together-key`   | Together AI           |
| `x-fireworks-key`  | Fireworks AI          |
| `x-mistral-key`    | Mistral AI            |
| `x-sambanova-key`  | SambaNova             |
| `x-deepseek-key`   | DeepSeek              |
| `x-deepinfra-key`  | DeepInfra             |
| `x-cohere-key`     | Cohere                |

### Headers

- `CORS_ORIGINS` — comma-separated origins (default: `*`)
- `PORT` — server port (default: `3000`)

## Providers

| Provider              | Free Models                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Key Required |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Groq                  | `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `llama-4-scout-17b-16e-instruct` †, `llama-4-maverick-17b-128e-instruct` †                                                                                                                                                                                                                                                                                                                                                                                                                           | ✅           |
| Google Gemini         | `gemini-2.5-flash`, `gemini-2.5-flash-lite`, `gemini-2.5-pro`, `gemini-3.6-flash` †, `gemini-3.5-flash` †                                                                                                                                                                                                                                                                                                                                                                                                                                               | ✅           |
| OpenRouter            | `nvidia/nemotron-3-ultra-550b-a55b:free`, `nvidia/nemotron-3-super-120b-a12b:free`, `openai/gpt-oss-20b:free`, `google/gemma-4-31b-it:free`, `google/gemma-4-26b-a4b-it:free`, `poolside/laguna-m.1:free`, `poolside/laguna-xs-2.1:free`, `cohere/north-mini-code:free`, `qwen/qwen3-next-80b-a3b-instruct:free`, `nvidia/nemotron-3-nano-30b-a3b:free` +1 deprecated                                                                                                                                                                                   | ✅           |
| NVIDIA NIM            | `deepseek-ai/deepseek-v4-pro`, `deepseek-ai/deepseek-v4-flash`, `z-ai/glm-5.2`, `minimaxai/minimax-m3`, `moonshotai/kimi-k2.6`, `nvidia/nemotron-4`, `qwen/qwen3.6-27b`                                                                                                                                                                                                                                                                                                                                                                                 | ✅           |
| Cerebras              | `llama-3.3-70b`, `llama-3.1-8b`, `qwen3-32b`, `qwen3-235b`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | ✅           |
| Cloudflare Workers AI | `@cf/meta/llama-3.3-70b-instruct-fp8-fast`, `@cf/meta/llama-3.1-8b-instruct-fp8`, `@cf/meta/llama-4-scout-17b-16e-instruct`, `@cf/meta/llama-3.2-11b-vision-instruct`, `@cf/mistralai/mistral-small-3.1-24b-instruct`, `@cf/qwen/qwen2.5-coder-32b-instruct`, `@cf/qwen/qwq-32b`, `@cf/qwen/qwen3-30b-a3b-fp8`, `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b`, `@cf/google/gemma-4-26b-a4b-it`, `@cf/nvidia/nemotron-3-120b-a12b`, `@cf/openai/gpt-oss-120b`, `@cf/openai/gpt-oss-20b`, `@cf/moonshotai/kimi-k2.7-code`, `@cf/zai-org/glm-5.2` +4 more | ✅           |
| Together AI           | `meta-llama/Llama-3.3-70B-Instruct-Turbo-Free`, `mistralai/Mixtral-8x22B-Instruct-v0.1`, `deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free`, `Qwen/Qwen3-32B`                                                                                                                                                                                                                                                                                                                                                                                             | ✅           |
| Fireworks AI          | `accounts/fireworks/models/llama-v3p3-70b-instruct`, `accounts/fireworks/models/firefunction-v2`, `accounts/fireworks/models/qwen3-32b`, `accounts/fireworks/models/deepseek-r1`                                                                                                                                                                                                                                                                                                                                                                        | ✅           |
| Mistral AI§           | `mistral-small-latest`, `mistral-nemo-latest`, `codestral-latest`, `mistral-large-latest`                                                                                                                                                                                                                                                                                                                                                                                                                                                               | ✅           |
| SambaNova             | `Meta-Llama-3.3-70B-Instruct`, `Meta-Llama-3.1-8B-Instruct`, `DeepSeek-V3.1-0324`, `Qwen3-32B`                                                                                                                                                                                                                                                                                                                                                                                                                                                          | ✅           |
| DeepSeek¶             | `deepseek-v4-flash`, `deepseek-v4-pro`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | ✅           |
| DeepInfra§            | `meta-llama/Meta-Llama-3.3-70B-Instruct`, `deepseek-ai/DeepSeek-V3`, `deepseek-ai/DeepSeek-R1`, `Qwen/Qwen3-32B`, `mistralai/Mistral-Small-3.1-24B-Instruct` +3 more                                                                                                                                                                                                                                                                                                                                                                                    | ✅           |
| Cohere§               | `command-a-plus-05-2026`, `command-a-reasoning-08-2025`, `command-r-plus-08-2024`, `command-r-08-2024`, `command-a-03-2025`                                                                                                                                                                                                                                                                                                                                                                                                                             | ✅           |

† Deprecated or preview — excluded from alias routing.
§ Uses `@ai-sdk/mistral` or `@ai-sdk/openai-compatible` dependency.
¶ DeepSeek uses trial credits (free signup, 5M tokens, then pay-as-you-go).

## SDK

```bash
cd packages/sdk && bun install
```

```ts
import { createFreeRouter } from "@freerouter/sdk";

const router = createFreeRouter();
const keys = { groq: { raw: "gsk_...", fingerprint: "..." } };

// Use alias with failover
const model = router.languageModel("free:auto", keys);

const result = await model.doGenerate({
  inputFormat: "messages",
  mode: { type: "regular" },
  prompt: [{ role: "user", content: [{ type: "text", text: "hi" }] }],
});
```

See `packages/sdk/DOCS.md` for full SDK docs.

## Status

Working. 30 API tests + 32 SDK tests pass across 14 providers.

## Stack

- **Runtime**: Bun
- **Monorepo**: Turborepo
- **Language**: TypeScript
- **Linting**: Biome
- **Framework**: Hono (API), Vercel AI SDK v4 (routing)
- **Auth**: BYOK via headers; gateway keys (`fr-live-...`) for the self-hosted gateway

## License

MIT
