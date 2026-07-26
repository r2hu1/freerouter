import type { Context, Next } from "hono"

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()
const LIMIT = 100
const WINDOW_MS = 60_000
const CLEANUP_INTERVAL_MS = 300_000

// periodic cleanup of expired entries
setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key)
  }
}, CLEANUP_INTERVAL_MS).unref()

export async function rateLimit(c: Context, next: Next) {
  const ip =
    c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip") ?? "unknown"
  const now = Date.now()

  let bucket = buckets.get(ip)
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + WINDOW_MS }
    buckets.set(ip, bucket)
  }

  bucket.count++

  if (bucket.count > LIMIT) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
    c.header("Retry-After", String(retryAfter))
    return c.json(
      { error: { message: "Rate limit exceeded", type: "rate_limit_error" } },
      429 as const
    )
  }

  await next()
}
