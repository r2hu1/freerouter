import type { FreeRouter } from "@freerouter/sdk"
import type { Hono } from "hono"

const ALIASES = [
  "free:auto",
  "free:fast",
  "free:reasoning",
  "free:long-context",
  "free:vision",
  "free:tool-use",
]

export function registerModels(app: Hono, freerouter: FreeRouter) {
  app.get("/v1/models", (c) => {
    const models = freerouter.models()
    return c.json({
      object: "list",
      data: [
        ...ALIASES.map((id) => ({
          id,
          object: "model",
          owned_by: "freerouter",
        })),
        ...models.map((m) => ({
          id: `${m.provider}/${m.modelId}`,
          object: "model",
          owned_by: m.provider,
        })),
      ],
    })
  })
}
