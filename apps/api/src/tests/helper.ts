import type { Env } from "../env"

export const testEnv: Env = {
  PORT: 3000,
  HOST: "127.0.0.1",
  NODE_ENV: "test",
  LOG_LEVEL: "error",
  CORS_ORIGINS: "*",
  RATE_LIMIT_MAX: 1000,
  RATE_LIMIT_WINDOW_MS: 60_000,
  DASHBOARD_ENCRYPTION_KEY: undefined,
}
