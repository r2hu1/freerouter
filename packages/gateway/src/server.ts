import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { serveStatic } from "@hono/node-server/serve-static"
import { Hono } from "hono"
import { loadConfig } from "./config"
import { getRouter } from "./freerouter"
import { toOpenAiError } from "./mapping/errors"
import { registerAnalytics } from "./routes/analytics"
import { registerChatCompletions } from "./routes/chat"
import { registerGateway } from "./routes/gateway"
import { registerKeys } from "./routes/keys"
import { registerModels } from "./routes/models"
import { registerProviders } from "./routes/providers"

const here = dirname(fileURLToPath(import.meta.url))
const distWeb = join(here, "web")
const srcWeb = join(here, "..", "web")
const WEB_DIR = existsSync(distWeb) ? distWeb : srcWeb

const PROXY_HEADERS = [
  "Content-Type",
  "Authorization",
  "X-Groq-Key",
  "X-Google-Key",
  "X-OpenRouter-Key",
  "X-Cloudflare-Key",
  "X-Nvidia-Key",
  "X-Cerebras-Key",
  "X-Together-Key",
  "X-Fireworks-Key",
  "X-Mistral-Key",
  "X-SambaNova-Key",
  "X-DeepSeek-Key",
  "X-DeepInfra-Key",
  "X-Cohere-Key",
]

export async function createApp() {
  const freerouter = getRouter()
  const app = new Hono()
  const cfg = await loadConfig()
  const corsOrigins = cfg.corsOrigins ?? "*"

  const allowHeaders = [
    ...PROXY_HEADERS,
    "x-freerouter-session",
    "x-freerouter-test",
  ]
  const origins = splitOrigins(corsOrigins)
  app.use("/*", async (c, next) => {
    const setOrigin =
      origins === "*"
        ? "*"
        : Array.isArray(origins) &&
            c.req.header("origin") &&
            origins.includes(c.req.header("origin")!)
          ? c.req.header("origin")!
          : ""
    if (setOrigin) c.header("Access-Control-Allow-Origin", setOrigin)
    c.header("Access-Control-Allow-Headers", allowHeaders.join(", "))
    c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    c.header("Access-Control-Expose-Headers", "Retry-After")
    if (c.req.method === "OPTIONS") {
      return c.body(null, 204)
    }
    await next()
  })

  app.onError((err, c) => {
    const { status, body } = toOpenAiError(err)
    return c.json(body, status as 400 | 401 | 500 | 502)
  })

  registerGateway(app)
  registerProviders(app)
  registerKeys(app)
  registerAnalytics(app)
  registerModels(app, freerouter)
  registerChatCompletions(app, freerouter)

  app.use("/assets/*", serveStatic({ root: WEB_DIR }))
  app.get("*", (c) => {
    if (c.req.method !== "GET") return c.json({ error: "not found" }, 404)
    const indexFile = join(WEB_DIR, "index.html")
    if (!existsSync(indexFile)) {
      return c.text(
        "FreeRouter Gateway is running. Dashboard assets not found — run `bun run build:web`.",
        200
      )
    }
    return c.html(readFileSync(indexFile, "utf8"))
  })

  return app
}

function splitOrigins(origins: string): string[] | string {
  if (!origins || origins === "*") return "*"
  return origins.split(",").map((o) => o.trim())
}
