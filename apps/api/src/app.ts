import { createFreeRouter } from "@freerouter/sdk"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { loadEnv } from "./env"
import { toOpenAiError } from "./mapping/errors"
import { rateLimit } from "./middleware/rate-limit"
import { requestLogger } from "./middleware/request-logger"
import { registerChatCompletions } from "./routes/chat-completions"
import { registerHealth } from "./routes/health"
import { registerModels } from "./routes/models"

export function createApp(env?: ReturnType<typeof loadEnv>) {
  const freerouter = createFreeRouter()
  const app = new Hono()

  app.use("*", requestLogger)
  app.use("*", rateLimit)

  const e = env ?? loadEnv()
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
      ],
      exposeHeaders: ["Retry-After"],
    })
  )

  app.onError((err, c) => {
    const { status, body } = toOpenAiError(err)
    return c.json(body, status as Parameters<typeof c.json>[1])
  })

  registerHealth(app)
  registerModels(app, freerouter)
  registerChatCompletions(app, freerouter)

  return app
}
