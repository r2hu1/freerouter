import type { Context, Next } from "hono"

const KEY_PATTERN = /[A-Za-z0-9_-]{8,}/g

function sanitize(val: string): string {
  return val.replace(KEY_PATTERN, "[REDACTED]")
}

export async function requestLogger(c: Context, next: Next) {
  const start = Date.now()
  const method = c.req.method
  const path = c.req.path

  await next()

  const elapsed = Date.now() - start
  const status = c.res.status

  const line = `${method} ${path} ${status} ${elapsed}ms`
  console.log(sanitize(line))
}
