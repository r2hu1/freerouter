import { readFile, writeFile } from "node:fs/promises"
import { homeFile } from "../config"
import { loadConfig } from "../config"
import type { EncryptedBlob } from "../crypto"
import {
  decrypt,
  encrypt,
  generateGatewayKey,
  generateId,
  hashSecret,
  maskSecret,
} from "../crypto"
import type { GatewayKeyRecord, ProviderKeyRecord } from "./types"

const PROVIDER_FILE = "provider_keys.json"
const GATEWAY_FILE = "gateway_keys.json"

async function readJson<T>(name: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(homeFile(name), "utf8")
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

async function writeJson(name: string, value: unknown): Promise<void> {
  await writeFile(homeFile(name), JSON.stringify(value, null, 2), "utf8")
}

// ---- Provider keys ----

export interface ProviderKeyInput {
  provider: string
  label: string
  key: string
  enabled?: boolean
}

export async function listProviderKeys(): Promise<
  Array<Omit<ProviderKeyRecord, "enc"> & { maskedKey: string }>
> {
  const cfg = await loadConfig()
  const keys = await readJson<ProviderKeyRecord[]>(PROVIDER_FILE, [])
  return keys.map((k) => ({
    id: k.id,
    provider: k.provider,
    label: k.label,
    enabled: k.enabled,
    createdAt: k.createdAt,
    lastUsedAt: k.lastUsedAt,
    maskedKey: maskSecret(decrypt(k.enc, cfg.masterSecret)),
  }))
}

export async function getProviderKeyRecord(
  id: string
): Promise<ProviderKeyRecord | undefined> {
  const keys = await readJson<ProviderKeyRecord[]>(PROVIDER_FILE, [])
  return keys.find((k) => k.id === id)
}

export async function getDecryptedProviderKey(
  provider: string
): Promise<string | null> {
  const cfg = await loadConfig()
  const keys = await readJson<ProviderKeyRecord[]>(PROVIDER_FILE, [])
  const match = keys
    .filter((k) => k.provider === provider && k.enabled)
    .sort((a, b) => (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0))[0]
  if (!match) return null
  return decrypt(match.enc, cfg.masterSecret)
}

export async function upsertProviderKey(
  input: ProviderKeyInput
): Promise<void> {
  const cfg = await loadConfig()
  const keys = await readJson<ProviderKeyRecord[]>(PROVIDER_FILE, [])
  const enc: EncryptedBlob = encrypt(input.key, cfg.masterSecret)
  const existing = keys.find(
    (k) => k.provider === input.provider && k.label === input.label
  )
  if (existing) {
    existing.enc = enc
    existing.enabled = input.enabled ?? existing.enabled
  } else {
    keys.push({
      id: generateId("pk"),
      provider: input.provider,
      label: input.label,
      enc,
      enabled: input.enabled ?? true,
      createdAt: Date.now(),
      lastUsedAt: null,
    })
  }
  await writeJson(PROVIDER_FILE, keys)
}

export async function deleteProviderKey(id: string): Promise<void> {
  const keys = await readJson<ProviderKeyRecord[]>(PROVIDER_FILE, [])
  await writeJson(
    PROVIDER_FILE,
    keys.filter((k) => k.id !== id)
  )
}

export async function touchProviderKey(provider: string): Promise<void> {
  const keys = await readJson<ProviderKeyRecord[]>(PROVIDER_FILE, [])
  let changed = false
  for (const k of keys) {
    if (k.provider === provider) {
      k.lastUsedAt = Date.now()
      changed = true
    }
  }
  if (changed) await writeJson(PROVIDER_FILE, keys)
}

// ---- Gateway keys ----

export interface CreatedGatewayKey {
  id: string
  label: string
  key: string
  createdAt: number
}

export async function createGatewayKey(
  label: string
): Promise<CreatedGatewayKey> {
  const cfg = await loadConfig()
  const keys = await readJson<GatewayKeyRecord[]>(GATEWAY_FILE, [])
  const raw = generateGatewayKey()
  const record: GatewayKeyRecord = {
    id: generateId("gk"),
    label,
    hashedKey: hashSecret(raw, cfg.gatewaySalt),
    createdAt: Date.now(),
    lastUsedAt: null,
    revoked: false,
  }
  keys.push(record)
  await writeJson(GATEWAY_FILE, keys)
  return { id: record.id, label, key: raw, createdAt: record.createdAt }
}

export async function listGatewayKeys(): Promise<
  Array<GatewayKeyRecord & { maskedKey: string }>
> {
  const _cfg = await loadConfig()
  const keys = await readJson<GatewayKeyRecord[]>(GATEWAY_FILE, [])
  return keys.map((k) => ({
    ...k,
    maskedKey: maskSecret(k.hashedKey, 6),
  }))
}

export async function revokeGatewayKey(id: string): Promise<boolean> {
  const keys = await readJson<GatewayKeyRecord[]>(GATEWAY_FILE, [])
  const target = keys.find((k) => k.id === id)
  if (!target) return false
  target.revoked = true
  await writeJson(GATEWAY_FILE, keys)
  return true
}

export async function verifyGatewayKey(
  raw: string
): Promise<GatewayKeyRecord | null> {
  const cfg = await loadConfig()
  const keys = await readJson<GatewayKeyRecord[]>(GATEWAY_FILE, [])
  const hashed = hashSecret(raw, cfg.gatewaySalt)
  const match = keys.find((k) => k.hashedKey === hashed && !k.revoked)
  if (!match) return null
  match.lastUsedAt = Date.now()
  await writeJson(GATEWAY_FILE, keys)
  return match
}
