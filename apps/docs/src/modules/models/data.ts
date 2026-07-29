export type Capability = "fast" | "reasoning" | "long-context" | "vision" | "tool-use"

export interface ModelInfo {
  provider: string
  modelId: string
  capabilities: Capability[]
  contextWindow: number
  deprecated?: boolean
}

export const MODELS: ModelInfo[] = [
  { provider: "groq", modelId: "llama-3.3-70b-versatile", capabilities: ["fast", "tool-use"], contextWindow: 131072 },
  { provider: "groq", modelId: "llama-3.1-8b-instant", capabilities: ["fast", "tool-use"], contextWindow: 131072 },
  { provider: "groq", modelId: "llama-4-scout-17b-16e-instruct", capabilities: ["fast", "tool-use"], contextWindow: 131072, deprecated: true },
  { provider: "groq", modelId: "llama-4-maverick-17b-128e-instruct", capabilities: ["fast", "tool-use", "vision"], contextWindow: 131072, deprecated: true },
  { provider: "google", modelId: "gemini-2.5-flash", capabilities: ["fast", "vision", "tool-use", "long-context"], contextWindow: 1048576 },
  { provider: "google", modelId: "gemini-2.5-flash-lite", capabilities: ["fast", "tool-use"], contextWindow: 1048576 },
  { provider: "google", modelId: "gemini-2.5-pro", capabilities: ["reasoning", "vision", "tool-use", "long-context"], contextWindow: 1048576 },
  { provider: "google", modelId: "gemini-3.6-flash", capabilities: ["fast", "vision", "tool-use", "long-context"], contextWindow: 1048576, deprecated: true },
  { provider: "google", modelId: "gemini-3.5-flash", capabilities: ["fast", "vision", "tool-use", "long-context"], contextWindow: 1048576, deprecated: true },
  { provider: "cloudflare", modelId: "@cf/meta/llama-3.3-70b-instruct-fp8-fast", capabilities: ["fast", "tool-use", "long-context"], contextWindow: 24000 },
  { provider: "cloudflare", modelId: "@cf/meta/llama-3.1-8b-instruct-fp8", capabilities: ["fast", "tool-use"], contextWindow: 32000 },
  { provider: "cloudflare", modelId: "@cf/meta/llama-4-scout-17b-16e-instruct", capabilities: ["fast", "tool-use"], contextWindow: 131072 },
  { provider: "cloudflare", modelId: "@cf/meta/llama-3.2-11b-vision-instruct", capabilities: ["vision", "tool-use"], contextWindow: 128000 },
  { provider: "cloudflare", modelId: "@cf/meta/llama-3.2-3b-instruct", capabilities: ["fast"], contextWindow: 80000 },
  { provider: "cloudflare", modelId: "@cf/mistralai/mistral-small-3.1-24b-instruct", capabilities: ["fast", "tool-use"], contextWindow: 128000 },
  { provider: "cloudflare", modelId: "@cf/qwen/qwen2.5-coder-32b-instruct", capabilities: ["fast", "tool-use"], contextWindow: 33000 },
  { provider: "cloudflare", modelId: "@cf/qwen/qwq-32b", capabilities: ["reasoning"], contextWindow: 24000 },
  { provider: "cloudflare", modelId: "@cf/qwen/qwen3-30b-a3b-fp8", capabilities: ["fast", "tool-use"], contextWindow: 33000 },
  { provider: "cloudflare", modelId: "@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", capabilities: ["reasoning"], contextWindow: 80000 },
  { provider: "cloudflare", modelId: "@cf/nvidia/nemotron-3-super-120b-a12b", capabilities: ["tool-use", "long-context"], contextWindow: 256000 },
  { provider: "cloudflare", modelId: "@cf/google/gemma-4-26b-a4b-it", capabilities: ["tool-use", "long-context"], contextWindow: 256000 },
  { provider: "cloudflare", modelId: "@cf/openai/gpt-oss-120b", capabilities: ["tool-use", "reasoning"], contextWindow: 128000 },
  { provider: "cloudflare", modelId: "@cf/openai/gpt-oss-20b", capabilities: ["fast", "tool-use"], contextWindow: 128000 },
  { provider: "cloudflare", modelId: "@cf/moonshotai/kimi-k2.7-code", capabilities: ["tool-use", "long-context"], contextWindow: 262144 },
  { provider: "cloudflare", modelId: "@cf/zai-org/glm-5.2", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 262144 },
  { provider: "cloudflare", modelId: "@cf/aisingapore/gemma-sea-lion-v4-27b-it", capabilities: ["tool-use", "long-context"], contextWindow: 128000 },
  { provider: "cloudflare", modelId: "@cf/ibm-granite/granite-4.0-h-micro", capabilities: ["tool-use"], contextWindow: 131072 },
  { provider: "cloudflare", modelId: "@cf/meta/llama-guard-3-8b", capabilities: ["tool-use"], contextWindow: 131072 },
  { provider: "openrouter", modelId: "nvidia/nemotron-3-ultra-550b-a55b:free", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 1048576 },
  { provider: "openrouter", modelId: "nvidia/nemotron-3-super-120b-a12b:free", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 1048576 },
  { provider: "openrouter", modelId: "google/gemma-4-31b-it:free", capabilities: ["vision", "tool-use"], contextWindow: 262144 },
  { provider: "openrouter", modelId: "google/gemma-4-26b-a4b-it:free", capabilities: ["vision", "tool-use"], contextWindow: 262144 },
  { provider: "openrouter", modelId: "poolside/laguna-m.1:free", capabilities: ["tool-use", "reasoning"], contextWindow: 262144 },
  { provider: "openrouter", modelId: "poolside/laguna-xs-2.1:free", capabilities: ["tool-use", "fast"], contextWindow: 262144 },
  { provider: "openrouter", modelId: "cohere/north-mini-code:free", capabilities: ["tool-use"], contextWindow: 262144 },
  { provider: "openrouter", modelId: "nvidia/nemotron-3-nano-30b-a3b:free", capabilities: ["fast", "tool-use"], contextWindow: 262144 },
  { provider: "openrouter", modelId: "qwen/qwen3-next-80b-a3b-instruct:free", capabilities: ["tool-use", "long-context"], contextWindow: 262144 },
  { provider: "nvidia", modelId: "deepseek-ai/deepseek-v4-pro", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 131072 },
  { provider: "nvidia", modelId: "deepseek-ai/deepseek-v4-flash", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 131072 },
  { provider: "nvidia", modelId: "mistralai/mistral-nemotron", capabilities: ["tool-use", "fast"], contextWindow: 131072 },
  { provider: "nvidia", modelId: "nvidia/nemotron-3-super-120b-a12b", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 262144 },
  { provider: "nvidia", modelId: "nvidia/nemotron-3-nano-30b-a3b", capabilities: ["fast", "tool-use"], contextWindow: 262144 },
  { provider: "nvidia", modelId: "z-ai/glm-5.2", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 262144 },
  { provider: "nvidia", modelId: "minimaxai/minimax-m3", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 131072 },
  { provider: "nvidia", modelId: "moonshotai/kimi-k2.6", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 262144 },
  { provider: "nvidia", modelId: "meta/llama-3.3-70b-instruct", capabilities: ["fast", "tool-use", "long-context"], contextWindow: 131072 },
  { provider: "cerebras", modelId: "llama-3.3-70b", capabilities: ["fast", "tool-use"], contextWindow: 131072 },
  { provider: "cerebras", modelId: "llama-3.1-8b", capabilities: ["fast", "tool-use"], contextWindow: 131072 },
  { provider: "cerebras", modelId: "qwen3-32b", capabilities: ["fast", "reasoning", "tool-use"], contextWindow: 131072 },
  { provider: "cerebras", modelId: "qwen3-235b", capabilities: ["reasoning", "tool-use"], contextWindow: 32768 },
  { provider: "cerebras", modelId: "gpt-oss-120b", capabilities: ["fast", "reasoning", "tool-use"], contextWindow: 131072 },
  { provider: "cerebras", modelId: "zai-glm-4.7", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 262144, deprecated: true },
  { provider: "together", modelId: "meta-llama/Llama-3.3-70B-Instruct-Turbo", capabilities: ["fast", "tool-use", "long-context"], contextWindow: 131072 },
  { provider: "together", modelId: "meta-llama/Llama-3.1-8B-Instruct-Turbo", capabilities: ["fast", "tool-use"], contextWindow: 131072 },
  { provider: "together", modelId: "mistralai/Mixtral-8x22B-Instruct-v0.1", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 65536 },
  { provider: "together", modelId: "deepseek-ai/DeepSeek-R1", capabilities: ["reasoning", "tool-use"], contextWindow: 16384 },
  { provider: "together", modelId: "Qwen/Qwen3-32B", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 131072 },
  { provider: "fireworks", modelId: "accounts/fireworks/models/llama-v3p3-70b-instruct", capabilities: ["fast", "tool-use", "long-context"], contextWindow: 131072 },
  { provider: "fireworks", modelId: "accounts/fireworks/models/firefunction-v2", capabilities: ["fast", "tool-use"], contextWindow: 32768 },
  { provider: "fireworks", modelId: "accounts/fireworks/models/qwen3-32b", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 131072 },
  { provider: "fireworks", modelId: "accounts/fireworks/models/deepseek-r1", capabilities: ["reasoning", "tool-use"], contextWindow: 16384 },
  { provider: "mistral", modelId: "mistral-small-latest", capabilities: ["fast", "tool-use"], contextWindow: 32768 },
  { provider: "mistral", modelId: "open-mistral-nemo", capabilities: ["fast", "tool-use"], contextWindow: 128000 },
  { provider: "mistral", modelId: "codestral-latest", capabilities: ["fast", "tool-use"], contextWindow: 256000 },
  { provider: "mistral", modelId: "mistral-large-latest", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 128000 },
  { provider: "sambanova", modelId: "Meta-Llama-3.3-70B-Instruct", capabilities: ["fast", "tool-use", "long-context"], contextWindow: 131072 },
  { provider: "sambanova", modelId: "Meta-Llama-3.1-8B-Instruct", capabilities: ["fast", "tool-use"], contextWindow: 131072 },
  { provider: "sambanova", modelId: "DeepSeek-V3.1-0324", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 131072 },
  { provider: "sambanova", modelId: "Qwen3-32B", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 131072 },
  { provider: "deepseek", modelId: "deepseek-chat", capabilities: ["fast", "tool-use", "long-context"], contextWindow: 131072, deprecated: true },
  { provider: "deepseek", modelId: "deepseek-reasoner", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 131072, deprecated: true },
  { provider: "deepseek", modelId: "deepseek-v4-flash", capabilities: ["fast", "tool-use", "long-context"], contextWindow: 131072 },
  { provider: "deepseek", modelId: "deepseek-v4-pro", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 131072 },
  { provider: "deepinfra", modelId: "meta-llama/Meta-Llama-3.3-70B-Instruct", capabilities: ["fast", "tool-use", "long-context"], contextWindow: 131072 },
  { provider: "deepinfra", modelId: "meta-llama/Meta-Llama-3.1-405B-Instruct", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 131072 },
  { provider: "deepinfra", modelId: "meta-llama/Meta-Llama-3.1-8B-Instruct", capabilities: ["fast", "tool-use"], contextWindow: 131072 },
  { provider: "deepinfra", modelId: "deepseek-ai/DeepSeek-V3", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 131072 },
  { provider: "deepinfra", modelId: "deepseek-ai/DeepSeek-R1", capabilities: ["reasoning", "tool-use"], contextWindow: 131072 },
  { provider: "deepinfra", modelId: "Qwen/Qwen3-32B", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 131072 },
  { provider: "deepinfra", modelId: "Qwen/Qwen2.5-Coder-32B-Instruct", capabilities: ["fast", "tool-use"], contextWindow: 32768 },
  { provider: "deepinfra", modelId: "mistralai/Mistral-Small-3.1-24B-Instruct", capabilities: ["fast", "tool-use"], contextWindow: 32768 },
  { provider: "cohere", modelId: "command-a-plus-05-2026", capabilities: ["tool-use"], contextWindow: 131072 },
  { provider: "cohere", modelId: "command-a-reasoning-08-2025", capabilities: ["reasoning", "tool-use", "long-context"], contextWindow: 262144 },
  { provider: "cohere", modelId: "command-r-plus-08-2024", capabilities: ["tool-use", "long-context"], contextWindow: 131072 },
  { provider: "cohere", modelId: "command-r-08-2024", capabilities: ["fast", "tool-use", "long-context"], contextWindow: 131072 },
  { provider: "cohere", modelId: "command-a-03-2025", capabilities: ["tool-use", "long-context"], contextWindow: 131072 },
]

export const PROVIDERS = Array.from(new Set(MODELS.map((m) => m.provider))).sort()

export const CAP_LABELS: Record<Capability, string> = {
  fast: "Fast",
  reasoning: "Reasoning",
  "long-context": "Long ctx",
  vision: "Vision",
  "tool-use": "Tool use",
}

export const CAP_COLORS: Record<Capability, string> = {
  fast: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  reasoning: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  "long-context": "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  vision: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  "tool-use": "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
}

export const PROVIDER_COLORS: Record<string, string> = {
  groq: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  google: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  cloudflare: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  openrouter: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  nvidia: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  cerebras: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  together: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  fireworks: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  mistral: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  sambanova: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  deepseek: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  deepinfra: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  cohere: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
}

export function formatContextWindow(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}
