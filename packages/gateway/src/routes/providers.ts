import type { Context, Hono } from "hono"
import { z } from "zod"
import { requireSession } from "../auth"
import { PROVIDER_IDS } from "../mapping/resolve-keys"
import {
  deleteProviderKey,
  listProviderKeys,
  upsertProviderKey,
} from "../storage/keys"

const CreateSchema = z.object({
  provider: z.enum(PROVIDER_IDS as [string, ...string[]]),
  key: z.string().min(1),
  label: z.string().optional(),
  enabled: z.boolean().optional().default(true),
})

export function registerProviders(app: Hono) {
  app.get("/v1/providers", async (c) => {
    if (!requireSession(c)) return c.json({ error: "forbidden" }, 403)
    const keys = await listProviderKeys()
    return c.json({ providers: keys })
  })

  app.post("/v1/providers", async (c) => {
    if (!requireSession(c)) return c.json({ error: "forbidden" }, 403)
    const parsed = CreateSchema.safeParse(await c.req.json().catch(() => null))
    if (!parsed.success) {
      return c.json({ error: parsed.error.message }, 400)
    }
    const { provider, key, label, enabled } = parsed.data
    await upsertProviderKey({
      provider,
      label: label ?? provider,
      key,
      enabled,
    })
    return c.json({ ok: true }, 201)
  })

  app.delete("/v1/providers/:id", async (c) => {
    if (!requireSession(c)) return c.json({ error: "forbidden" }, 403)
    await deleteProviderKey(c.req.param("id"))
    return c.json({ ok: true })
  })
}
