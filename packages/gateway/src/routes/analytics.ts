import type { Context, Hono } from "hono"
import { z } from "zod"
import { requireSession } from "../auth"
import {
  type TimeseriesBucket,
  queryEvents,
  querySummary,
  queryTimeseries,
} from "../storage/usage"

const BucketSchema = z.enum(["day", "week", "month"])

export function registerAnalytics(app: Hono) {
  app.get("/v1/analytics/summary", async (c) => {
    if (!requireSession(c)) return c.json({ error: "forbidden" }, 403)
    return c.json(await querySummary())
  })

  app.get("/v1/analytics/timeseries", async (c) => {
    if (!requireSession(c)) return c.json({ error: "forbidden" }, 403)
    const bucket = BucketSchema.parse(
      c.req.query("bucket") ?? "day"
    ) as TimeseriesBucket
    return c.json({ points: await queryTimeseries(bucket) })
  })

  app.get("/v1/analytics/events", async (c) => {
    if (!requireSession(c)) return c.json({ error: "forbidden" }, 403)
    const limit = Number(c.req.query("limit") ?? 100)
    return c.json({
      events: await queryEvents(Number.isFinite(limit) ? limit : 100),
    })
  })
}
