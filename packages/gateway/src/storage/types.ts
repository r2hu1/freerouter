import type { EncryptedBlob } from "../crypto"

export interface ProviderKeyRecord {
  id: string
  provider: string
  label: string
  enc: EncryptedBlob
  enabled: boolean
  createdAt: number
  lastUsedAt: number | null
}

export interface GatewayKeyRecord {
  id: string
  label: string
  hashedKey: string
  createdAt: number
  lastUsedAt: number | null
  revoked: boolean
}

export type UsageStatus = "success" | "error" | "failover"

export interface UsageEvent {
  timestamp: number
  gatewayKeyId: string | null
  provider: string | null
  model: string | null
  alias: string
  inputTokens: number
  outputTokens: number
  latencyMs: number
  status: UsageStatus
  errorMessage: string | null
}
