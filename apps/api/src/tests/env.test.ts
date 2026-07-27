import { beforeEach, describe, expect, test } from "bun:test"
import { loadEnv, resetEnv } from "../env"

describe("loadEnv", () => {
  beforeEach(() => {
    resetEnv()
    process.env.PORT = undefined
    process.env.HOST = undefined
    process.env.NODE_ENV = undefined
    process.env.LOG_LEVEL = undefined
    process.env.CORS_ORIGINS = undefined
    process.env.RATE_LIMIT_MAX = undefined
    process.env.RATE_LIMIT_WINDOW_MS = undefined
    process.env.DASHBOARD_ENCRYPTION_KEY = undefined
  })

  test("uses PORT env var", () => {
    process.env.PORT = "4000"
    const env = loadEnv()
    expect(env.PORT).toBe(4000)
  })

  test("defaults PORT to 3000", () => {
    const env = loadEnv()
    expect(env.PORT).toBe(3000)
  })

  test("optional vars not required", () => {
    const env = loadEnv()
    expect(env.DASHBOARD_ENCRYPTION_KEY).toBeUndefined()
    expect(env.CORS_ORIGINS).toBe("*")
  })
})
