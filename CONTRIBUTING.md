# Contributing

PRs welcome.

## Project structure

```
freerouter/
├── apps/
│   ├── api/          # HTTP API server (Hono, OpenAI-compatible)
│   └── docs/         # Documentation site (Fumadocs + Next.js)
├── packages/
│   ├── sdk/          # Core SDK (model registry, routing, health)
│   ├── db/           # Database-backed health stores (coming soon)
│   └── types/        # Shared types
├── assets/           # Images (opengraph, diagrams)
├── biome.json        # Linting + formatting config
├── turbo.json        # Turborepo pipeline
└── package.json      # Workspace root
```

## Dev setup

```bash
bun install
```

## Available commands

| Command                | Scope            | Description                  |
| ---------------------- | ---------------- | ---------------------------- |
| `bun run build`        | root             | Build all packages           |
| `bun run dev`          | root             | Dev mode (all apps)          |
| `bun run lint`         | root             | Lint all packages            |
| `bun run format`       | root             | Format all packages          |
| `bun run typecheck`    | root             | TypeScript check all         |
| `bun run lint:biome`   | root             | Biome check only             |
| `bun run format:biome` | root             | Biome format only            |

Per-package commands (run from that directory):

| Package         | Command                    |
| --------------- | -------------------------- |
| `packages/sdk`  | `bun run build`, `bun run test`, `bun run typecheck` |
| `apps/api`      | `bun run dev`, `bun run test`, `bun run typecheck`    |
| `apps/docs`     | `bun run dev`, `bun run build`                        |

## Guidelines

### Rules

- `main` is production. All PRs target `main`.
- Tests must pass before merge (`bun run test` in affected packages).
- No unnecessary abstractions. Favor flat code over deep hierarchies.
- Use Biome for linting + formatting (`bun run lint:biome`). Pre-commit hook not required but CI enforces it.

### Code style

- Use `import type` for type-only imports.
- Avoid default exports. Named exports only.
- Use `const` over `function` for functions unless hoisting is needed.

### Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add support for provider X
fix: handle rate-limit retry correctly
docs: update README with new provider table
chore: bump SDK version to 0.1.3
refactor: extract key resolution logic
test: add failover tests for resolver
```

### Pull requests

- One change per PR. If you have multiple features, split them.
- Include tests for new functionality.
- Update the provider table in README.md if adding a provider.
- Add a changeset if changing the SDK public API (not required yet — will add later).

## Adding a provider

Every provider lives in `packages/sdk/src/providers/`. Create a file `{name}.ts`.

### 1. Define models

```ts
const MODELS: ModelInfo[] = [
  {
    provider: "myprovider",
    modelId: "my-model-name",
    capabilities: ["fast", "tool-use", "vision", "reasoning", "long-context"],
    contextWindow: 128_000,
    free: true,         // false if pay-per-use
    deprecated: false,  // true to exclude from alias routing
  },
]
```

If your provider exposes models dynamically via an API, implement `listModels()` as a fetch call instead of a static array. Keep `free: true` — FreeRouter only tracks free models.

Capabilities map to the following aliases:

| Alias              | Capability       |
| ------------------ | ---------------- |
| `free:auto`        | (none required)  |
| `free:fast`        | `fast`           |
| `free:reasoning`   | `reasoning`      |
| `free:long-context`| `long-context`   |
| `free:vision`      | `vision`         |
| `free:tool-use`    | `tool-use`       |

### 2. Export adapter

```ts
import { createX } from "@ai-sdk/x"

export function myproviderAdapter(): ProviderAdapter {
  return {
    id: "myprovider",
    listModels: () => MODELS,
    languageModel: (modelId, key: ProviderKey) =>
      createX({ apiKey: key.raw })(modelId),
  }
}
```

If your provider is OpenAI-compatible but not supported by an `@ai-sdk/*` package, use `@ai-sdk/openai-compatible`:

```ts
import { createOpenAICompatible } from "@ai-sdk/openai-compatible"

const api = createOpenAICompatible({
  name: "myprovider",
  baseURL: "https://api.myprovider.com/v1",
})

export function myproviderAdapter(): ProviderAdapter {
  return {
    id: "myprovider",
    listModels: () => MODELS,
    languageModel: (modelId, key: ProviderKey) =>
      api.chatModel(modelId, { headers: { Authorization: `Bearer ${key.raw}` } }),
  }
}
```

### 3. Register in index

Add to `packages/sdk/src/providers/index.ts`:

```ts
import { myproviderAdapter } from "./myprovider"
// in the array:
myproviderAdapter(),
```

### 4. Add header mapping

If the provider has a token-based rate limit, add it to `apps/api/src/mapping/errors.ts`:

```ts
myprovider: { header: "x-myprovider-key", ratelimitToken: /rate limit/i },
```

Also add the header to the table in `README.md`.

### 5. Test

```bash
cd packages/sdk && bun run test
cd apps/api && bun run test
```

## Running the API locally

```bash
bun run dev  # starts Hono server on :3000

# test it
curl http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "x-groq-key: gsk_..." \
  -d '{"model":"free:auto","messages":[{"role":"user","content":"hi"}]}'
```

## Running docs locally

```bash
cd apps/docs && bun run dev  # starts Next.js on :3001
```
