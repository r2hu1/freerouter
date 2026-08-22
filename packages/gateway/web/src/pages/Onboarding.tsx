import { CopyIcon } from "@/components/icons"
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
import { useState } from "react"
import { type ProviderCatalog, api } from "../api"

function CopyField({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="space-y-1">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <Input readOnly value={value} className="font-mono text-xs" />
        <Button
          variant="secondary"
          onClick={() => {
            navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
        >
          {copied ? "Copied" : <CopyIcon />}
          <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <output className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </output>
    </div>
  )
}

export function Onboarding({
  providers,
  onDone,
}: {
  providers: ProviderCatalog[]
  onDone: () => void
}) {
  const [selected, setSelected] = useState(providers[0]?.id ?? "groq")
  const [key, setKey] = useState("")
  const [added, setAdded] = useState<string[]>([])
  const [gatewayKey, setGatewayKey] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function addProvider() {
    if (!key.trim()) return
    setBusy(true)
    setErr(null)
    try {
      await api.addProvider(selected, key.trim())
      setAdded((a) => [...a, selected])
      setKey("")
    } catch (e) {
      setErr(String(e))
    } finally {
      setBusy(false)
    }
  }

  async function generateKey() {
    setBusy(true)
    setErr(null)
    try {
      const k = await api.createKey("default")
      setGatewayKey(k.key)
    } catch (e) {
      setErr(String(e))
    } finally {
      setBusy(false)
    }
  }

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:4141"
  const snippet = `curl ${origin}/v1/chat/completions \\
  -H "Authorization: Bearer ${gatewayKey || "fr-live-..."}" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"free:auto","messages":[{"role":"user","content":"Hello"}]}'`

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome to FreeRouter Gateway
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your free provider keys, then point any OpenAI-compatible
          client at this gateway. Your keys stay on this machine.
        </p>
      </div>

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
          <CardTitle>1. Connect free providers</CardTitle>
          <CardDescription>
            Add API keys for the free-tier providers you want to route across.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="space-y-1">
              <Label htmlFor="onboard-provider">Provider</Label>
              <select
                id="onboard-provider"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              placeholder="Paste API key…"
              aria-label="API key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addProvider} disabled={busy}>
              Add
            </Button>
          </div>
          {added.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {added.map((id) => (
                <Badge key={id} variant="secondary">
                  {providers.find((p) => p.id === id)?.name ?? id}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Your gateway key</CardTitle>
          <CardDescription>
            Put this into any OpenAI-compatible client. It is shown only once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!gatewayKey ? (
            <Button onClick={generateKey} disabled={busy}>
              Generate gateway key
            </Button>
          ) : (
            <>
              <CopyField value={gatewayKey} label="Gateway API key" />
              <div className="space-y-1">
                <Label>Test snippet</Label>
                <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">
                  {snippet}
                </pre>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={onDone} disabled={!gatewayKey}>
          Open dashboard →
        </Button>
      </div>
    </div>
  )
}
