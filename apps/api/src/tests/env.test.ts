import { describe, expect, test } from "bun:test"
import { loadEnv, resetEnv } from "../env"

describe("loadEnv", () => {
  test("uses PORT env var", () => {
    resetEnv()
    process.env.PORT = "4000"
    const env = loadEnv()
    expect(env.PORT).toBe(4000)
  })

  test("defaults PORT to 3000", () => {
    resetEnv()
    process.env.PORT = undefined
    const env = loadEnv()
    expect(env.PORT).toBe(3000)
  })

  test("optional vars not required", () => {
    resetEnv()
    const env = loadEnv()
    expect(env.DASHBOARD_ENCRYPTION_KEY).toBeUndefined()
    expect(env.CORS_ORIGINS).toBeUndefined()
  })
})
