import type { Context, Hono } from "hono"
import { z } from "zod"
import { SESSION_TOKEN, isLocalhost, requireSession } from "../auth"
import { loadConfig, saveConfig } from "../config"

export const PROVIDER_CATALOG = [
  { id: "groq", name: "Groq", signup: "https://console.groq.com/keys" },
  {
    id: "google",
    name: "Google Gemini",
    signup: "https://aistudio.google.com/apikey",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    signup: "https://openrouter.ai/keys",
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    signup: "https://dash.cloudflare.com/profile/api-tokens",
  },
  {
    id: "nvidia",
    name: "NVIDIA NIM",
    signup: "https://build.nvidia.com/microservices",
  },
  { id: "cerebras", name: "Cerebras", signup: "https://cloud.cerebras.ai/" },
  {
    id: "together",
    name: "Together",
    signup: "https://api.together.xyz/settings/api-keys",
  },
  {
    id: "fireworks",
    name: "Fireworks",
    signup: "https://fireworks.ai/api-keys",
  },
  {
    id: "mistral",
    name: "Mistral",
    signup: "https://console.mistral.ai/api-keys/",
  },
  { id: "sambanova", name: "SambaNova", signup: "https://cloud.sambanova.ai/" },
  {
    id: "deepseek",
    name: "DeepSeek",
    signup: "https://platform.deepseek.com/api_keys",
  },
  {
    id: "deepinfra",
    name: "DeepInfra",
    signup: "https://deepinfra.com/dash/api_keys",
  },
  {
    id: "cohere",
    name: "Cohere",
    signup: "https://dashboard.cohere.com/api-keys",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    signup: "https://huggingface.co/settings/tokens",
  },
]

const SettingsSchema = z.object({
  port: z.number().int().min(1).max(65535).optional(),
  host: z.string().optional(),
  autoOpen: z.boolean().optional(),
  corsOrigins: z.string().optional(),
  defaultAlias: z.string().optional(),
})

export function registerGateway(app: Hono) {
  app.get("/v1/gateway/bootstrap", (c) => {
    if (!isLocalhost(c)) return c.json({ error: "forbidden" }, 403)
    return c.json({
      token: SESSION_TOKEN,
      providers: PROVIDER_CATALOG,
    })
  })

  app.get("/v1/gateway/settings", async (c) => {
    if (!requireSession(c)) return c.json({ error: "forbidden" }, 403)
    const cfg = await loadConfig()
    return c.json({
      port: cfg.port,
      host: cfg.host,
      autoOpen: cfg.autoOpen,
      corsOrigins: cfg.corsOrigins,
      defaultAlias: cfg.defaultAlias,
      providers: PROVIDER_CATALOG,
    })
  })

  app.put("/v1/gateway/settings", async (c) => {
    if (!requireSession(c)) return c.json({ error: "forbidden" }, 403)
    const parsed = SettingsSchema.safeParse(
      await c.req.json().catch(() => null)
    )
    if (!parsed.success) {
      return c.json({ error: parsed.error.message }, 400)
    }
    const saved = await saveConfig(parsed.data)
    return c.json({
      port: saved.port,
      host: saved.host,
      autoOpen: saved.autoOpen,
      corsOrigins: saved.corsOrigins,
      defaultAlias: saved.defaultAlias,
    })
  })
}
