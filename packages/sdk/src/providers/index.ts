import type { ProviderAdapter } from "../types"
import { cerebrasAdapter } from "./cerebras"
import { cloudflareAdapter } from "./cloudflare"
import { cohereAdapter } from "./cohere"
import { deepinfraAdapter } from "./deepinfra"
import { deepseekAdapter } from "./deepseek"
import { fireworksAdapter } from "./fireworks"
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
    mistralAdapter(),
    cloudflareAdapter(),
    cerebrasAdapter(),
    sambanovaAdapter(),
    deepseekAdapter(),
    deepinfraAdapter(),
    cohereAdapter(),
  ]
}
