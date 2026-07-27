import type { ProviderAdapter } from "../types"
import { cerebrasAdapter } from "./cerebras"
import { cloudflareAdapter } from "./cloudflare"
import { deepseekAdapter } from "./deepseek"
import { fireworksAdapter } from "./fireworks"
import { githubModelsAdapter } from "./github-models"
import { googleAdapter } from "./google"
import { groqAdapter } from "./groq"
import { mistralAdapter } from "./mistral"
import { nvidiaAdapter } from "./nvidia"
import { openrouterAdapter } from "./openrouter"
import { sambanovaAdapter } from "./sambanova"
import { togetherAdapter } from "./together"

export function buildAdapters(): ProviderAdapter[] {
  return [
    groqAdapter(),
    googleAdapter(),
    nvidiaAdapter(),
    openrouterAdapter(),
    togetherAdapter(),
    fireworksAdapter(),
    githubModelsAdapter(),
    mistralAdapter(),
    cloudflareAdapter(),
    cerebrasAdapter(),
    sambanovaAdapter(),
    deepseekAdapter(),
  ]
}
