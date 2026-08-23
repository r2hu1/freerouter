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
import { PageHeader } from "@/components/PageHeader";
import { type GatewayKeyRecord, api } from "../api";
import { toast } from "@/components/ui/toast";
import { Copy, Key, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/EmptyState";

export function Keys() {
  const [keys, setKeys] = useState<GatewayKeyRecord[]>([]);
  const [label, setLabel] = useState("");
  const [newKey, setNewKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    const k = await api.getKeys();
    setKeys(k.keys);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    refresh().catch((e) => setErr(String(e)));
  }, []);

  async function create() {
    if (!label)
      return toast.add({ title: "Error", description: "Name is required" });
    setBusy(true);
    setErr(null);
    try {
      const k = await api.createKey(label);
      setNewKey(k.key);
      await refresh();
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    await api.revokeKey(id);
    await refresh();
  }
  useEffect(() => {
    if (err) {
      toast.add({ title: "Error", description: err });
    }
  }, [err]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Keys"
        description="Gateway keys authenticate clients to the proxy. The raw key is shown only once."
      />

      <Card>
        <CardHeader>
          <CardTitle>Create a gateway key</CardTitle>
          <CardDescription>
            Label helps you tell keys apart (default, ci, project-x).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 w-full">
          <div className="flex gap-3 items-end">
            <div className="w-full">
              <Input
                required
                id="key-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Some name.."
              />
            </div>
            <Button onClick={create} disabled={busy}>
              Create <Plus />
            </Button>
          </div>
          {newKey && (
            <div className="space-y-2 bg-secondary p-3 rounded-md">
              <Label className="font-normal">
                Save it somewhere safe, it won't be shown again.
              </Label>
              <div className="flex gap-2">
                <Input readOnly value={newKey} className="bg-background" />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(newKey);
                    toast.add({
                      title: "Copied",
                      description: "Key copied to clipboard",
                    });
                  }}
                >
                  Copy <Copy />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="pb-0">
        <CardHeader>
          <CardTitle>Gateway keys</CardTitle>
          <CardDescription>Manage your gateway keys here.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 border-t">
          {keys.length === 0 ? (
            <EmptyState
              icon={<Key />}
              title="No keys yet."
              description="Create a key above to get started."
            />
          ) : (
            <ScrollArea className="h-120">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Last used</TableHead>
                    <TableHead>Revoke</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((k) => (
                    <TableRow key={k.id}>
                      <TableCell className="font-medium">{k.label}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {k.maskedKey}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {k.lastUsedAt
                          ? new Date(k.lastUsedAt).toLocaleString()
                          : "never"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => revoke(k.id)}
                        >
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
