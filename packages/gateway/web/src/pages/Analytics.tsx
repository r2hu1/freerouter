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
import { Area, AreaChart, XAxis, YAxis } from "recharts"
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
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{title}</div>
        <div className="mt-1 text-2xl font-semibold">{value}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
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
            className="h-56 w-full"
          >
            <AreaChart data={points}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="requests"
                type="monotone"
                fill="var(--chart-1)"
                stroke="var(--chart-1)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>By provider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {Object.entries(summary.byProvider).length === 0 && (
              <div className="text-muted-foreground">No data</div>
            )}
            {Object.entries(summary.byProvider).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span>{k}</span>
                <Badge variant="secondary">{v}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>By alias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {Object.entries(summary.byAlias).length === 0 && (
              <div className="text-muted-foreground">No data</div>
            )}
            {Object.entries(summary.byAlias).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span>{k}</span>
                <Badge variant="secondary">{v}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>By model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {Object.entries(summary.byModel).length === 0 && (
              <div className="text-muted-foreground">No data</div>
            )}
            {Object.entries(summary.byModel).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="truncate">{k}</span>
                <Badge variant="secondary">{v}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
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
