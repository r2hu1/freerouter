import { createApp } from "./app"
import { loadEnv } from "./env"

const env = loadEnv()
const app = createApp()

console.log(`Server starting on port ${env.PORT}`)
Bun.serve({ fetch: app.fetch, port: env.PORT })
