import type { ProviderAdapter } from "../types"
import { cloudflareAdapter } from "./cloudflare"
import { githubModelsAdapter } from "./github-models"
import { googleAdapter } from "./google"
import { groqAdapter } from "./groq"
import { openrouterAdapter } from "./openrouter"

export function buildAdapters(): ProviderAdapter[] {
  return [
    groqAdapter(),
    googleAdapter(),
    openrouterAdapter(),
    githubModelsAdapter(),
    cloudflareAdapter(),
  ]
}
