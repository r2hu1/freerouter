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
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { type Settings as GatewaySettings, api } from "../api";
import { Checkbox } from "@/components/ui/checkbox";
import { Save } from "lucide-react";

export function Settings() {
  const [settings, setSettings] = useState<GatewaySettings | null>(null);
  const [form, setForm] = useState({
    port: 4141,
    host: "127.0.0.1",
    corsOrigins: "*",
    defaultAlias: "free:auto",
    autoOpen: true,
  });
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api
      .getSettings()
      .then((s) => {
        setSettings(s);
        setForm({
          port: s.port,
          host: s.host,
          corsOrigins: s.corsOrigins,
          defaultAlias: s.defaultAlias,
          autoOpen: s.autoOpen,
        });
      })
      .catch((e) => setErr(String(e)));
  }, []);

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  }

  async function save() {
    setErr(null);
    try {
      await api.updateSettings(form);
      setSaved(true);
    } catch (e) {
      setErr(String(e));
    }
  }

  if (!settings) {
    return (
      <div className="text-sm text-muted-foreground">Loading settings…</div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Gateway runtime configuration."
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
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Port</Label>
              <Input
                type="number"
                value={form.port}
                onChange={(e) => update("port", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <Label>Host</Label>
              <Input
                value={form.host}
                onChange={(e) => update("host", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>CORS origins</Label>
            <Input
              value={form.corsOrigins}
              onChange={(e) => update("corsOrigins", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Default alias</Label>
            <Input
              value={form.defaultAlias}
              onChange={(e) => update("defaultAlias", e.target.value)}
            />
          </div>
          <Label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.autoOpen}
              onCheckedChange={(e) => update("autoOpen", e)}
            />
            Open dashboard in browser on start
          </Label>
          <div>
            <Button onClick={save}>
              Save settings <Save />
            </Button>
            {saved && (
              <output
                aria-live="polite"
                className="ml-3 text-sm text-muted-foreground"
              >
                Saved.
              </output>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Changing port/host takes effect after restarting the gateway.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>Reset local data or rotate secrets.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            To wipe all provider keys, gateway keys and usage history, run:
          </p>
          <pre className="rounded-md bg-muted p-3 text-xs">
            npx @freerouter/gateway reset
          </pre>
          <p className="text-muted-foreground">
            Master secret lives in ~/.freerouter/gateway.config.json (chmod
            600).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
