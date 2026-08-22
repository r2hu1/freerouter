#!/usr/bin/env node
import { spawn } from "node:child_process"
import { rm } from "node:fs/promises"
import { getHomeDir, homeFile, loadConfig, saveConfig } from "./config"
import { createApp } from "./server"
import { createGatewayKey, listGatewayKeys } from "./storage/keys"

interface ServeFlags {
  port?: number
  host?: string
  noOpen: boolean
}

function parseArgs(argv: string[]): { command: string; flags: ServeFlags } {
  const command = argv[0] && !argv[0].startsWith("-") ? argv[0] : "serve"
  const flags: ServeFlags = { noOpen: false }
  for (let i = command === "serve" ? 1 : 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--no-open") flags.noOpen = true
    else if (a === "--port" || a === "-p") flags.port = Number(argv[++i])
    else if (a === "--host" || a === "-h") flags.host = argv[++i]
  }
  return { command, flags }
}

function openBrowser(url: string): void {
  const platform = process.platform
  let cmd: string
  let args: string[]
  if (platform === "darwin") {
    cmd = "open"
    args = [url]
  } else if (platform === "win32") {
    cmd = "cmd"
    args = ["/c", "start", "", url]
  } else {
    cmd = "xdg-open"
    args = [url]
  }
  try {
    spawn(cmd, args, { stdio: "ignore", detached: true }).unref()
  } catch {
    // ignore if no browser available
  }
}

async function ensureFirstGatewayKey(): Promise<void> {
  const keys = await listGatewayKeys()
  if (keys.length === 0) {
    const created = await createGatewayKey("default")
    console.log("")
    console.log("🔑 Generated your first FreeRouter gateway key:")
    console.log(`   ${created.key}`)
    console.log("   Put this into any OpenAI-compatible client as the API key.")
    console.log("")
  }
}

async function serve(flags: ServeFlags): Promise<void> {
  const cfg = await loadConfig()
  const port = flags.port ?? cfg.port
  const host = flags.host ?? cfg.host
  await saveConfig({ port, host })

  const app = await createApp()
  const { serve } = await import("@hono/node-server")
  const server = serve({ fetch: app.fetch, port, hostname: host })
  const addr = server.address()
  const boundPort = typeof addr === "object" && addr ? addr.port : port

  console.log(`\n🛰  FreeRouter Gateway running at http://${host}:${boundPort}`)
  console.log(`   Dashboard: http://localhost:${boundPort}`)
  console.log(
    `   Proxy:    POST http://localhost:${boundPort}/v1/chat/completions`
  )
  console.log(`   Keys stored under: ${getHomeDir()}`)
  console.log("")

  await ensureFirstGatewayKey()

  if (cfg.autoOpen && !flags.noOpen) {
    openBrowser(`http://localhost:${boundPort}`)
  }

  const shutdown = () => {
    console.log("\nShutting down...")
    server.close()
    process.exit(0)
  }
  process.on("SIGTERM", shutdown)
  process.on("SIGINT", shutdown)
}

async function init(): Promise<void> {
  await loadConfig(true)
  console.log(`Initialized FreeRouter Gateway config at ${getHomeDir()}`)
}

async function reset(): Promise<void> {
  const home = getHomeDir()
  for (const f of [
    "gateway.config.json",
    "provider_keys.json",
    "gateway_keys.json",
    "usage_events.jsonl",
  ]) {
    await rm(homeFile(f), { force: true })
  }
  console.log(`Reset local FreeRouter Gateway data at ${home}`)
}

async function main(): Promise<void> {
  const { command, flags } = parseArgs(process.argv.slice(2))
  switch (command) {
    case "serve":
      await serve(flags)
      break
    case "init":
      await init()
      break
    case "reset":
      await reset()
      break
    default:
      console.error(`Unknown command: ${command}`)
      console.error(
        "Usage: freerouter-gateway [serve|init|reset] [--port N] [--no-open] [--host H]"
      )
      process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
