# FreeRouter API

OpenAI-compatible HTTP API over `@freerouter/sdk`. Routes chat completions through multiple free-tier LLM providers with automatic failover.

## Quickstart

```bash
bun install
bun run dev
```

Server starts on `http://localhost:3000` (configurable via `PORT` env var).

## Auth

Two paths — both resolve to `FreeRouterKeys` before hitting the SDK:

### Path B — Direct headers (stateless, no account needed)

Pass provider keys as custom headers:

```bash
curl http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "X-Groq-Key: gsk_..." \
  -H "X-Google-Key: AIza..." \
  -d '{
    "model": "free:auto",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

| Header | Provider |
|---|---|
| `X-Groq-Key` | Groq |
| `X-Google-Key` | Google Gemini |
| `X-OpenRouter-Key` | OpenRouter |
| `X-GitHub-Key` | GitHub Models |
| `X-Cloudflare-Key` | Cloudflare Workers AI |

### Path A — Proxy key (coming with `packages/db` vault)

`Authorization: Bearer fr_xxxxx` — looks up encrypted provider keys server-side.

## Endpoints

### `POST /v1/chat/completions`

OpenAI-compatible chat completions. Supports both streaming and non-streaming.

**Request body:**

```json
{
  "model": "free:auto",
  "messages": [
    {"role": "system", "content": "You are helpful."},
    {"role": "user", "content": "Hi"}
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 1024,
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get weather for a location",
        "parameters": { "type": "object", "properties": { "location": { "type": "string" } } }
      }
    }
  ],
  "tool_choice": "auto"
}
```

**`model` field** accepts:
- **Aliases**: `free:auto`, `free:fast`, `free:reasoning`, `free:long-context`, `free:vision`, `free:tool-use`
- **Pinned models**: `groq/llama-3.3-70b-versatile`, `google/gemini-2.5-flash`, `cloudflare/@cf/meta/llama-3.3-70b-instruct-fp8-fast`, etc.

**Non-streaming response** — OpenAI `chat.completion` format:

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1700000000,
  "model": "free:auto",
  "choices": [{
    "index": 0,
    "message": { "role": "assistant", "content": "Hello!" },
    "finish_reason": "stop"
  }],
  "usage": { "prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30 }
}
```

**Streaming response** — SSE `chat.completion.chunk` events, ending with `data: [DONE]`:

```
data: {"id":"...","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"role":"assistant"},"finish_reason":null}]}

data: {"id":"...","object":"chat.completion.chunk","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"...","object":"chat.completion.chunk","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

**Mid-stream errors**: A non-standard final chunk with `finish_reason: "error"` is emitted before `[DONE]`. The connection is not silently killed — the client always gets a clean termination.

### `GET /v1/models`

Returns all available models (aliases + concrete provider/model pairs). No auth required.

### `GET /health`

Health check. Returns `{"status":"ok"}`.

## Env vars

| Var | Default | Required |
|---|---|---|
| `PORT` | `3000` | No |
| `DASHBOARD_ENCRYPTION_KEY` | — | No (required for proxy-key auth) |
| `CORS_ORIGINS` | `*` | No |

Fails fast at startup if env validation fails — never silently misconfigures.

## Supported OpenAI fields

| Field | Supported |
|---|---|
| `model` | Yes — aliases + pinned `provider/modelId` |
| `messages` | Yes — system, user, assistant, tool |
| `stream` | Yes |
| `temperature` | Yes |
| `max_tokens` | Yes |
| `tools` | Yes |
| `tool_choice` | Yes |
| `stop` | No |
| `frequency_penalty` | No |
| `presence_penalty` | No |
| `logit_bias` | No |
| `user` | No |
| `n` / `best_of` | No (always 1) |
| `seed` | No |

## Rate limiting

API-level rate limiting protects the server — distinct from provider health tracking. Default: 100 requests per minute per IP. Rejected requests get HTTP 429 with `Retry-After` header.

## Failover behavior

- **Before first token**: transparent failover across providers. If the first provider fails, the resolver tries the next in priority order.
- **After first token (streaming)**: error propagates to the client. No silent mid-stream provider switch — restart the request to retry.

## Security

- Raw API keys never appear in logs (redacted via regex pattern matching)
- Keys are never persisted or logged by the API layer
- Provider error messages are sanitized before returning to the client
- Error responses always use generic messages, never leak key material

## Development

```bash
bun run dev        # start with hot reload
bun test           # run tests
bun tsc --noEmit   # typecheck
bun run lint       # biome lint
```

## File structure

```
src/
├── app.ts                    # Hono app factory
├── index.ts                  # Entry point + Bun.serve
├── env.ts                    # Env validation
├── auth/
│   └── resolve-keys.ts       # Header → FreeRouterKeys
├── routes/
│   ├── chat-completions.ts   # POST /v1/chat/completions
│   ├── models.ts             # GET /v1/models
│   └── health.ts             # GET /health
├── mapping/
│   ├── request.ts            # OpenAI → AI SDK params
│   ├── response.ts           # AI SDK → OpenAI response
│   ├── stream.ts             # AI SDK stream → SSE chunks
│   └── errors.ts             # Error → OpenAI error envelope
├── middleware/
│   ├── request-logger.ts     # Logging with key redaction
│   └── rate-limit.ts         # Token bucket rate limiter
├── schemas/
│   └── chat-completions.ts   # Zod request schema
└── tests/
    ├── health.test.ts
    ├── models.test.ts
    ├── auth.test.ts
    ├── errors.test.ts
    ├── chat-completions.test.ts
    ├── mapping.test.ts
    ├── env.test.ts
    ├── logger.test.ts
    └── openai-sdk.test.ts
```
