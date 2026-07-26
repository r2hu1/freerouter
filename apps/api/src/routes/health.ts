import type { Hono } from "hono"

export function registerHealth(app: Hono) {
  app.get("/health", (c) => {
    return c.json({ status: "ok" })
  })
}
