import { createApp } from "./app"
import { loadEnv } from "./env"

const env = loadEnv()
const app = createApp(env)

const server = Bun.serve({
  fetch: app.fetch,
  port: env.PORT,
  hostname: env.HOST,
})

server.unref()

process.on("SIGTERM", () => {
  console.log("Shutting down...")
  server.stop()
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("Shutting down...")
  server.stop()
  process.exit(0)
})

console.log(`freerouter api listening on http://${env.HOST}:${server.port}`)
