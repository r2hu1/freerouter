import { z } from "zod"

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DASHBOARD_ENCRYPTION_KEY: z.string().optional(),
  CORS_ORIGINS: z.string().optional(),
})

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
