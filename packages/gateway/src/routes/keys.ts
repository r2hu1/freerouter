import type { Context, Hono } from "hono"
import { z } from "zod"
import { requireSession } from "../auth"
import {
  createGatewayKey,
  listGatewayKeys,
  revokeGatewayKey,
} from "../storage/keys"

const CreateSchema = z.object({
  label: z.string().min(1).default("default"),
})

export function registerKeys(app: Hono) {
  app.get("/v1/gateway/keys", async (c) => {
    if (!requireSession(c)) return c.json({ error: "forbidden" }, 403)
    const keys = await listGatewayKeys()
    return c.json({
      keys: keys.map(({ hashedKey, ...k }) => ({ ...k })),
    })
  })

  app.post("/v1/gateway/keys", async (c) => {
    if (!requireSession(c)) return c.json({ error: "forbidden" }, 403)
    const parsed = CreateSchema.safeParse(await c.req.json().catch(() => ({})))
    if (!parsed.success) {
      return c.json({ error: parsed.error.message }, 400)
    }
    const created = await createGatewayKey(parsed.data.label)
    return c.json(
      {
        id: created.id,
        label: created.label,
        key: created.key,
        createdAt: created.createdAt,
      },
      201
    )
  })

  app.delete("/v1/gateway/keys/:id", async (c) => {
    if (!requireSession(c)) return c.json({ error: "forbidden" }, 403)
    const ok = await revokeGatewayKey(c.req.param("id"))
    return c.json({ ok })
  })
}
