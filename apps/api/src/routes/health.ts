import type { FreeRouter } from "@freerouter/sdk"
import type { Hono } from "hono"

export function registerHealth(app: Hono, freerouter: FreeRouter) {
  app.get("/health", (c) => {
    const health = freerouter.healthFor({})
    return c.json({
      status: "ok",
      providers: health,
    })
  })
}
