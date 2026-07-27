import { z } from "zod"

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  CORS_ORIGINS: z.string().default("*"),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  DASHBOARD_ENCRYPTION_KEY: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

let _env: z.infer<typeof envSchema> | null = null

export function loadEnv(): z.infer<typeof envSchema> {
  if (_env) return _env
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n")
    throw new Error(`Env validation failed:\n${issues}`)
  }
  _env = result.data
  return _env
}

export function resetEnv(): void {
  _env = null
}
