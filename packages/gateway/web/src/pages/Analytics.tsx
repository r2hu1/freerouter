import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { PageHeader } from "@/components/PageHeader"
import {
  type TimeseriesPoint,
  type UsageEvent,
  type UsageSummary,
  api,
} from "../api"

function fmt(n: number): string {
  return n.toLocaleString()
}
function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

function Stat({
  title,
  value,
  sub,
}: { title: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </div>
        <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
          {value}
        </div>
        {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  )
}

function Breakdown({
  title,
  data,
}: {
  title: string
  data: Record<string, number>
}) {
  const entries = Object.entries(data)
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        {entries.length === 0 ? (
          <div className="text-muted-foreground">No data yet</div>
        ) : (
          <ul className="divide-y divide-border">
            {entries.map(([k, v]) => (
              <li
                key={k}
                className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
              >
                <span className="truncate text-foreground/90">{k}</span>
                <Badge variant="secondary" className="tabular-nums">
                  {v}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export function Analytics() {
  const [summary, setSummary] = useState<UsageSummary | null>(null)
  const [points, setPoints] = useState<TimeseriesPoint[]>([])
  const [events, setEvents] = useState<UsageEvent[]>([])
  const [bucket, setBucket] = useState("day")
  const [err, setErr] = useState<string | null>(null)

  async function refresh() {
    try {
      const [s, t, e] = await Promise.all([
        api.getSummary(),
        api.getTimeseries(bucket),
        api.getEvents(100),
      ])
      setSummary(s)
      setPoints(t.points)
      setEvents(e.events)
    } catch (err2) {
      setErr(String(err2))
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh is recreated each render; interval reset on bucket change is intended
  useEffect(() => {
    refresh()
    const id = setInterval(refresh, 5000)
    return () => clearInterval(id)
  }, [bucket])

  if (err) {
    return (
      <div role="alert" className="text-sm text-destructive">
        Failed to load analytics: {err}
      </div>
    )
  }
  if (!summary) {
    return (
      <div className="text-sm text-muted-foreground">Loading analytics…</div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Live usage across your gateway."
        actions={
          <fieldset className="flex gap-1" aria-label="Time range">
            {["day", "week", "month"].map((b) => (
              <Button
                key={b}
                size="sm"
                variant={bucket === b ? "default" : "outline"}
                aria-pressed={bucket === b}
                onClick={() => setBucket(b)}
              >
                {b}
              </Button>
            ))}
          </fieldset>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Stat title="Requests" value={fmt(summary.totalRequests)} />
        <Stat title="Tokens in" value={fmt(summary.inputTokens)} />
        <Stat title="Tokens out" value={fmt(summary.outputTokens)} />
        <Stat title="Success" value={pct(summary.successRate)} />
        <Stat
          title="Avg latency"
          value={`${Math.round(summary.avgLatencyMs)}ms`}
        />
        <Stat
          title="Est. saved"
          value={`$${summary.estimatedCostSavedUsd.toFixed(2)}`}
          sub="vs paid APIs"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requests over time</CardTitle>
          <CardDescription>Grouped by {bucket}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ requests: { label: "Requests" } }}
            className="h-72 w-full"
          >
            <AreaChart
              data={points}
              margin={{ top: 8, left: 4, right: 8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={36}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="requests"
                type="monotone"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#fillRequests)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Breakdown title="By provider" data={summary.byProvider} />
        <Breakdown title="By alias" data={summary.byAlias} />
        <Breakdown title="By model" data={summary.byModel} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent events</CardTitle>
          <CardDescription>Failover and error log.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Alias</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    No events yet.
                  </TableCell>
                </TableRow>
              )}
              {events.map((e, i) => (
                <TableRow key={`${e.timestamp}-${i}`}>
                  <TableCell className="text-xs">
                    {new Date(e.timestamp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>{e.alias}</TableCell>
                  <TableCell>{e.provider ?? "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        e.status === "success"
                          ? "default"
                          : e.status === "failover"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {e.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{e.latencyMs}ms</TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                    {e.errorMessage ?? ""}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
