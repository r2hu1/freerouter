import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import { PageHeader } from "@/components/PageHeader"
import { type GatewayKeyRecord, api } from "../api"

export function Keys() {
  const [keys, setKeys] = useState<GatewayKeyRecord[]>([])
  const [label, setLabel] = useState("default")
  const [newKey, setNewKey] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function refresh() {
    const k = await api.getKeys()
    setKeys(k.keys)
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    refresh().catch((e) => setErr(String(e)))
  }, [])

  async function create() {
    setBusy(true)
    setErr(null)
    try {
      const k = await api.createKey(label)
      setNewKey(k.key)
      await refresh()
    } catch (e) {
      setErr(String(e))
    } finally {
      setBusy(false)
    }
  }

  async function revoke(id: string) {
    await api.revokeKey(id)
    await refresh()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Keys"
        description="Gateway keys authenticate clients to the proxy. The raw key is shown only once."
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
          <CardTitle>Create a gateway key</CardTitle>
          <CardDescription>
            Label helps you tell keys apart (default, ci, project-x).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <div className="space-y-1">
              <Label htmlFor="key-label">Label</Label>
              <Input
                id="key-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="label"
                className="max-w-xs"
              />
            </div>
            <Button onClick={create} disabled={busy}>
              Create
            </Button>
          </div>
          {newKey && (
            <div className="space-y-1">
              <Label>New key (copy now)</Label>
              <div className="flex gap-2">
                <Input readOnly value={newKey} className="font-mono text-xs" />
                <Button
                  variant="secondary"
                  onClick={() => navigator.clipboard.writeText(newKey)}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gateway keys</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead>State</TableHead>
                <TableHead />
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
                    <Badge variant={k.revoked ? "destructive" : "default"}>
                      {k.revoked ? "revoked" : "active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {!k.revoked && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revoke(k.id)}
                      >
                        Revoke
                      </Button>
                    )}
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
