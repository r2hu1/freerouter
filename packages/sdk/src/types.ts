import type { LanguageModelV4 } from "@ai-sdk/provider"

export type Capability =
  | "fast"
  | "reasoning"
  | "long-context"
  | "vision"
  | "tool-use"

export interface ModelInfo {
  provider: ProviderId
  modelId: string
  capabilities: Capability[]
  contextWindow: number
  free: boolean
  deprecated?: boolean
}

export type ProviderId =
  | "groq"
  | "google"
  | "cloudflare"
  | "openrouter"
  | "nvidia"
  | "cerebras"
  | "together"
  | "fireworks"
  | "mistral"
  | "sambanova"
  | "deepseek"
  | "deepinfra"
  | "cohere"

export interface ProviderAdapter {
  id: ProviderId
  listModels(): ModelInfo[]
  languageModel(modelId: string, key: ProviderKey): LanguageModelV4
}

export interface ProviderKey {
  raw: string
  fingerprint: string
}

export type Alias = `free:${string}`

export type HealthState = "healthy" | "rate-limited" | "down"

export interface ProviderHealth {
  state: HealthState
  retryAfter?: number
  consecutiveFailures: number
}

export interface HealthKey {
  provider: ProviderId
  keyFingerprint: string
}
