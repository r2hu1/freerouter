import { createFreeRouter } from "@freerouter/sdk"
import { Hono } from "hono"
import { cors } from "hono/cors"
import type { loadEnv } from "./env"
import { toOpenAiError } from "./mapping/errors"
import { configureRateLimit, rateLimit } from "./middleware/rate-limit"
import { requestLogger } from "./middleware/request-logger"
import { registerChatCompletions } from "./routes/chat-completions"
import { registerHealth } from "./routes/health"
import { registerModels } from "./routes/models"

export function createApp(env: ReturnType<typeof loadEnv>) {
  const freerouter = createFreeRouter()
  const app = new Hono()

  configureRateLimit(env.RATE_LIMIT_MAX, env.RATE_LIMIT_WINDOW_MS)
  app.use("*", requestLogger)
  app.use("*", rateLimit)

  const e = env
  const origins = e.CORS_ORIGINS?.split(",") ?? "*"
  app.use(
    "/v1/*",
    cors({
      origin: origins,
      allowHeaders: [
        "Content-Type",
        "Authorization",
        "X-Groq-Key",
        "X-Google-Key",
        "X-OpenRouter-Key",
        "X-GitHub-Key",
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
      ],
      exposeHeaders: ["Retry-After"],
    })
  )

  app.onError((err, c) => {
    const { status, body } = toOpenAiError(err)
    return c.json(body, status as Parameters<typeof c.json>[1])
  })

  registerHealth(app, freerouter)
  registerModels(app, freerouter)
  registerChatCompletions(app, freerouter)

  return app
}
