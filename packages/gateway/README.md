# @freerouter/gateway

Run your own **private FreeRouter gateway** — an OpenAI-compatible proxy that routes
your requests across 14 free-tier LLM providers with automatic failover, plus a
local web dashboard to manage keys and view analytics.

Your real provider API keys never leave your machine. The gateway stores them
encrypted at rest and serves them to the routing engine locally.

## Quick start

```bash
npx @freerouter/gateway serve
```

- Starts a local Hono server (default port **4141**).
- Opens `http://localhost:4141` in your browser (skip with `--no-open`).
- On first run it generates your first `fr-live-…` gateway key and prints it.

Point any OpenAI-compatible client at the gateway:

```bash
curl http://localhost:4141/v1/chat/completions \
  -H "Authorization: Bearer $YOUR_GATEWAY_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"free:auto","messages":[{"role":"user","content":"Hello"}]}'
```

## CLI

```bash
npx @freerouter/gateway serve      # start server + open dashboard (default)
npx @freerouter/gateway serve --port 8080 --no-open
npx @freerouter/gateway init       # create config dir, no server
npx @freerouter/gateway reset      # wipe local DB (keys + usage)
```

Flags: `--port <n>`, `--host <host>`, `--no-open`.

Environment: `FREEROUTER_HOME` (data dir override, default `~/.freerouter`).

## How it works

1. You add your free-provider keys (Groq, Google Gemini, OpenRouter, Cloudflare,
   NVIDIA NIM, Cerebras, Together, Fireworks, Mistral, SambaNova, DeepSeek,
   DeepInfra, Cohere, Hugging Face) through the dashboard.
2. The gateway encrypts them with AES-256-GCM using a machine-derived master
   secret stored in `~/.freerouter/gateway.config.json` (chmod 600).
3. Any client request authenticated with your `fr-live-…` gateway key is routed by
   `@freerouter/sdk` across your configured providers, with failover.
4. BYOK headers (`x-groq-key`, etc.) still work as an override, matching `apps/api`.

## Storage

File-based, zero native dependencies (safe for `npx` on any Node ≥ 20):

- `~/.freerouter/gateway.config.json` — master secret + settings
- `~/.freerouter/provider_keys.json` — encrypted provider keys
- `~/.freerouter/gateway_keys.json` — hashed gateway keys
- `~/.freerouter/usage_events.jsonl` — append-only analytics events

Provider keys are encrypted; the UI only ever shows a masked suffix.

## Configuration

Settings live in `~/.freerouter/gateway.config.json` and are editable from the
**Settings** page (or by editing the file directly). Saving port, host, CORS
origins, default alias, request logging, or auth **restarts the gateway
automatically** to apply the change.

| Setting | Default | Notes |
| --- | --- | --- |
| `port` | `4141` | Listen port. Applied on save (gateway restarts). |
| `host` | `127.0.0.1` | Bind address. Use `0.0.0.0` to expose on the network. |
| `corsOrigins` | `*` | Comma-separated origins allowed for the proxy. |
| `defaultAlias` | `free:auto` | Model alias used for the default model. |
| `requestLogging` | `true` | Log each request (method, path, status, latency) to the console. |
| `requireGatewayKey` | `true` | Require a `fr-live-…` gateway key for `/v1/chat/completions`. Disable to allow anonymous access using stored provider keys. |
| `autoOpen` | `true` | Open the dashboard in your browser on start. |

## Security

- Provider keys are encrypted at rest (AES-256-GCM).
- Management endpoints (`/v1/providers`, `/v1/gateway/keys`, `/v1/analytics/*`)
  require a session token (issued by `/v1/gateway/bootstrap`, localhost-only) or a
  localhost origin. The proxy endpoint (`/v1/chat/completions`) requires a gateway
  key or BYOK headers.
- The server binds `127.0.0.1` by default; use `--host 0.0.0.0` to expose it (then
  restrict via CORS settings).

## API

| Method | Path | Auth |
| --- | --- | --- |
| POST | `/v1/chat/completions` | gateway key or BYOK |
| GET | `/v1/models` | none |
| GET/POST/DELETE | `/v1/providers[/:id]` | session (localhost) |
| GET/POST/DELETE | `/v1/gateway/keys[/:id]` | session (localhost) |
| GET | `/v1/analytics/summary` `/v1/analytics/timeseries` `/v1/analytics/events` | session (localhost) |
| GET | `/v1/gateway/bootstrap` `/v1/gateway/settings` | bootstrap: localhost; settings: session |

## Dashboard

Built with React + Tailwind (shadcn-style components), bundled with Vite into
`dist/web` at publish time and served as static files from the same port as the
API — no separate dev server at runtime.

Pages: **Onboarding** (mission, feature tour, and setup), **Providers**, **API
Keys**, **Analytics** (summary cards, request time-series, breakdowns by
provider/alias/model, per-request log), and **Settings**. The sidebar collapses
to icons, and a header button opens `gateway.config.json` in your editor.

## Development

```bash
bun install
bun run build         # bundle the Node CLI + build dashboard -> dist/
bun test              # storage + server integration tests
bun run typecheck
bun run dev           # live dev server (Vite HMR on :5173, API on the configured port)
```

> Note: `packages/db` is currently an empty scaffold; this package implements its
> own file-based storage under `src/storage/*` to stay Node- and `npx`-safe.
