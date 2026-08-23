import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/PageHeader";
import {
  type TimeseriesPoint,
  type UsageEvent,
  type UsageSummary,
  api,
} from "../api";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDown,
  ArrowUp,
  CheckCheck,
  Clock,
  FilterIcon,
  ListFilter,
  RadioTower,
  RefreshCcw,
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/toast";

function fmt(n: number): string {
  return n.toLocaleString();
}
function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function Stat({
  title,
  value,
  sub,
  icon,
}: {
  title: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="bg-background!">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title} {icon}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-lg uppercase tracking-wide text-foreground/80">
          {value}
        </div>
        {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function Breakdown({
  title,
  data,
}: {
  title: string;
  data: Record<string, number>;
}) {
  const entries = Object.entries(data);
  return (
    <Card className="bg-background! pb-0">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <ScrollArea className="h-40">
          {entries.length === 0 ? (
            <div className="text-muted-foreground text-xs border border-dashed h-40 flex items-center justify-center rounded-lg">
              No data yet.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {entries.map(([k, v]) => (
                <li
                  key={k}
                  className="flex items-center px-4 justify-between gap-3 py-2 first:pt-0 last:pb-0"
                >
                  <span className="truncate text-foreground/90">{k}</span>
                  <Badge variant="secondary" className="tabular-nums">
                    {v}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function Analytics() {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [points, setPoints] = useState<TimeseriesPoint[]>([]);
  const [events, setEvents] = useState<UsageEvent[]>([]);
  const [bucket, setBucket] = useState("day");
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    toast.add({ title: "Loading analytics…", id: "analytics" });
    try {
      const [s, t, e] = await Promise.all([
        api.getSummary(),
        api.getTimeseries(bucket),
        api.getEvents(100),
      ]);
      setSummary(s);
      setPoints(t.points);
      setEvents(e.events);
      toast.update("analytics", { title: "Analytics loaded successfully" });
    } catch (err2) {
      toast.update("analytics", { title: "Failed to load analytics" });
      setErr(String(err2));
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh is recreated each render; interval reset on bucket change is intended
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [bucket]);

  if (err) {
    return (
      <div role="alert" className="text-sm text-destructive">
        Failed to load analytics: {err}
      </div>
    );
  }
  if (!summary) {
    return (
      <div className="text-sm text-muted-foreground">Loading analytics…</div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Live usage across your gateway."
        actions={
          <>
            <Select>
              <SelectTrigger className="w-full bg-background! capitalize">
                <SelectValue>
                  <FilterIcon className="size-3.5" /> {bucket}
                </SelectValue>
              </SelectTrigger>
              <SelectContent align="center">
                {["day", "week", "month"].map((b) => (
                  <SelectItem
                    key={b}
                    value={b}
                    className="capitalize"
                    aria-pressed={bucket === b}
                    onClick={() => setBucket(b)}
                  >
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="icon" onClick={refresh}>
              <RefreshCcw />
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Stat
          title="Requests"
          value={fmt(summary.totalRequests)}
          icon={<RadioTower className="size-4.5" />}
        />
        <Stat
          title="Tokens in"
          value={fmt(summary.inputTokens)}
          icon={<ArrowDown className="size-4.5" />}
        />
        <Stat
          title="Tokens out"
          value={fmt(summary.outputTokens)}
          icon={<ArrowUp className="size-4.5" />}
        />
        <Stat
          title="Success"
          value={pct(summary.successRate)}
          icon={<CheckCheck className="size-4.5" />}
        />
        <Stat
          title="Avg latency"
          value={`${Math.round(summary.avgLatencyMs)}ms`}
          icon={<Clock className="size-4.5" />}
        />
      </div>

      <Card className="bg-background!">
        <CardHeader>
          <CardTitle>Requests over time</CardTitle>
          <CardDescription>Grouped by {bucket}</CardDescription>
        </CardHeader>
        <CardContent className="border-t pt-5">
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

      <Card className="pb-0">
        <CardHeader>
          <CardTitle>Recent events</CardTitle>
          <CardDescription>Failover and error log.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 border-t">
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
                  <TableCell>{e.provider ?? "auto"}</TableCell>
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
                    {e.errorMessage ?? "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
