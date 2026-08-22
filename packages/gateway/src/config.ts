import { chmod, mkdir, readFile, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { join } from "node:path"
import { generateMasterSecret, generateSalt } from "./crypto"

export function getHomeDir(): string {
  return process.env.FREEROUTER_HOME ?? join(homedir(), ".freerouter")
}

export interface GatewaySettings {
  port: number
  host: string
  autoOpen: boolean
  corsOrigins: string
  defaultAlias: string
  masterSecret: string
  gatewaySalt: string
}

const DEFAULTS: Omit<GatewaySettings, "masterSecret" | "gatewaySalt"> = {
  port: 4141,
  host: "127.0.0.1",
  autoOpen: true,
  corsOrigins: "*",
  defaultAlias: "free:auto",
}

const CONFIG_FILE = "gateway.config.json"

let cached: GatewaySettings | null = null

export function configPath(): string {
  return join(getHomeDir(), CONFIG_FILE)
}

export async function ensureHome(): Promise<void> {
  await mkdir(getHomeDir(), { recursive: true })
}

export async function loadConfig(force = false): Promise<GatewaySettings> {
  if (cached && !force) return cached
  await ensureHome()
  const path = configPath()
  try {
    const raw = await readFile(path, "utf8")
    const parsed = JSON.parse(raw) as Partial<GatewaySettings>
    cached = {
      ...DEFAULTS,
      ...parsed,
      masterSecret: parsed.masterSecret ?? generateMasterSecret(),
      gatewaySalt: parsed.gatewaySalt ?? generateSalt(),
    } as GatewaySettings
    await persist(cached)
  } catch {
    cached = {
      ...DEFAULTS,
      masterSecret: generateMasterSecret(),
      gatewaySalt: generateSalt(),
    }
    await persist(cached)
  }
  return cached
}

export async function saveConfig(
  patch: Partial<GatewaySettings>
): Promise<GatewaySettings> {
  const current = await loadConfig()
  cached = { ...current, ...patch }
  await persist(cached)
  return cached
}

async function persist(cfg: GatewaySettings): Promise<void> {
  const path = configPath()
  await writeFile(path, JSON.stringify(cfg, null, 2), { mode: 0o600 })
  try {
    await chmod(path, 0o600)
  } catch {
    // ignore on platforms without chmod
  }
}

export function homeFile(name: string): string {
  return join(getHomeDir(), name)
}
