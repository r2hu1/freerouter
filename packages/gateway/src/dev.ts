import { spawn } from "node:child_process"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { serve } from "@hono/node-server"
import { createServer } from "vite"
import { loadConfig } from "./config"
import { createApp } from "./server"

const viteConfigFile = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "vite.config.ts"
)

function openBrowser(url: string): void {
  const platform = process.platform
  const [cmd, args] =
    platform === "darwin"
      ? ["open", [url]]
      : platform === "win32"
        ? ["cmd", ["/c", "start", "", url]]
        : ["xdg-open", [url]]
  try {
    spawn(cmd, args, { stdio: "ignore", detached: true }).unref()
  } catch {
    // ignore
  }
}

async function main(): Promise<void> {
  const cfg = await loadConfig()

  const app = await createApp()
  // Bind the configured port so the Settings page can actually move the
  // listener; the dev server restarts on save to apply port/host changes.
  const apiServer = serve({
    fetch: app.fetch,
    port: cfg.port,
    hostname: cfg.host,
  })
  const apiPort = (apiServer.address() as { port: number }).port
  const apiHost = "127.0.0.1"
  process.env.VITE_API_BASE = `http://${apiHost}:${apiPort}`

  const vite = await createServer({
    configFile: viteConfigFile,
    root: "web",
    server: {
      port: 5173,
      strictPort: false,
      // Proxy /v1 to the API so the dashboard port (:5173) can also serve
      // the API directly (handy for manual testing, e.g. :5173/v1/models).
      proxy: {
        "/v1": {
          target: `http://${apiHost}:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
  })
  await vite.listen()
  const viteUrl =
    vite.resolvedUrls?.local?.[0] ??
    `http://localhost:${vite.config.server.port}/`

  console.log(`\n🛰  API server:  http://localhost:${apiPort}`)
  console.log(`🖥  Dashboard (dev): ${viteUrl}`)
  console.log(
    `   (Dashboard calls API directly at ${process.env.VITE_API_BASE}. ` +
      `You can also hit the API via the Vite proxy, e.g. ${viteUrl}v1/models. Edit web/src with hot reload.)\n`
  )

  if (cfg.autoOpen) openBrowser(viteUrl)

  const shutdown = async () => {
    console.log("\nShutting down…")
    await vite.close()
    apiServer.close()
    process.exit(0)
  }
  process.on("SIGINT", shutdown)
  process.on("SIGTERM", shutdown)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
