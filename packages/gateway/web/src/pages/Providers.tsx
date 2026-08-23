import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { InboxIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import {
  API_BASE,
  type ProviderCatalog,
  type ProviderRecord,
  api,
} from "../api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Play, Plus, Trash } from "lucide-react";

export function Providers() {
  const [catalog, setCatalog] = useState<ProviderCatalog[]>([]);
  const [connected, setConnected] = useState<ProviderRecord[]>([]);
  const [selected, setSelected] = useState("groq");
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [test, setTest] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    const [p, s] = await Promise.all([api.getProviders(), api.getSettings()]);
    setConnected(p.providers);
    setCatalog(s.providers);
    setSelected(s.providers[0]?.id ?? "groq");
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    refresh().catch((e) => setErr(String(e)));
  }, []);

  async function add() {
    if (!key.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await api.addProvider(selected, key.trim());
      setKey("");
      await refresh();
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    await api.deleteProvider(id);
    await refresh();
  }

  async function testConnection(provider: string) {
    setTest((t) => ({ ...t, [provider]: "testing…" }));
    let keyId: string | undefined;
    try {
      // createKey returns the FULL key (getKeys only returns masked ones,
      // which can't be used to authenticate). Revoke it afterwards.
      const created = await api.createKey("test");
      keyId = created.id;
      const start = Date.now();
      const res = await fetch(`${API_BASE}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${created.key}`,
          "x-freerouter-test": "1",
        },
        body: JSON.stringify({
          model: "free:auto",
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 5,
        }),
      });
      const ms = Date.now() - start;
      if (res.ok) setTest((t) => ({ ...t, [provider]: `ok (${ms}ms)` }));
      else setTest((t) => ({ ...t, [provider]: `failed ${res.status}` }));
    } catch (e) {
      setTest((t) => ({ ...t, [provider]: `error ${String(e).slice(0, 40)}` }));
    } finally {
      if (keyId) await api.revokeKey(keyId).catch(() => {});
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Providers"
        description="Connected free-tier providers. Keys are encrypted at rest on this machine."
      />

      {err && (
        <div
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {err}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Connect a provider</CardTitle>
          <CardDescription>
            Add an API key for one of the supported providers.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-2">
          <div>
            <Select id="provider-select" value={selected}>
              <SelectTrigger>{selected}</SelectTrigger>
              <SelectContent>
                {catalog.map((p) => (
                  <SelectItem
                    key={p.id}
                    value={p.id}
                    onClick={(e) => setSelected(p.id)}
                  >
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            placeholder="Paste API key…"
            aria-label="API key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="flex-1"
          />
          <Button onClick={add} disabled={busy}>
            Connect <Plus />
          </Button>
        </CardContent>
      </Card>

      <Card className="pb-0">
        <CardHeader>
          <CardTitle>Connected providers</CardTitle>
          <CardDescription>
            Manage your connected providers here.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 border-t">
          {connected.length === 0 ? (
            <EmptyState
              icon={<InboxIcon />}
              title="No providers connected yet"
              description="Connect your first free-tier provider above to start routing requests."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {connected.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.provider}</TableCell>
                    <TableCell>{c.label}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {c.maskedKey}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.enabled ? "default" : "secondary"}>
                        {c.enabled ? "enabled" : "disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <output
                        className="mr-2 text-xs text-muted-foreground"
                        aria-live="polite"
                      >
                        {test[c.provider] ?? ""}
                      </output>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testConnection(c.provider)}
                      >
                        Test <Play />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => remove(c.id)}
                      >
                        Remove <Trash />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
