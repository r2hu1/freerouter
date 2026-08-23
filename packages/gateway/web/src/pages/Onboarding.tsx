import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Network,
  Plug,
  ShieldCheck,
} from "lucide-react";
import { CopyIcon, Logo } from "@/components/icons";
import {
  BarChartIcon,
  KeyIcon,
  PlugIcon,
  SettingsIcon,
} from "@/components/icons";
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
import { useState } from "react";
import { type ProviderCatalog, api } from "../api";

const DOCS_URL = "https://freerouter.vercel.app/docs/gateway";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Private by design",
    body: "Provider keys are encrypted at rest (AES-256-GCM) and stored only on this machine (chmod 600). No account, no telemetry, no cloud.",
  },
  {
    icon: Network,
    title: "One endpoint, many providers",
    body: "Route across Groq, Google Gemini, OpenRouter, Cerebras and more from a single OpenAI-compatible URL.",
  },
  {
    icon: Plug,
    title: "Drop-in OpenAI compatible",
    body: "Point any OpenAI client, SDK, or app at the gateway with your gateway key. Aliases like free:auto pick the best free model.",
  },
  {
    icon: BarChart3,
    title: "Analytics & BYOK",
    body: "Per-key usage analytics, and bring-your-own-key headers for per-request provider keys.",
  },
];

const TOUR = [
  {
    icon: BarChartIcon,
    title: "Analytics",
    body: "Track request volume, token usage, success rate, and latency across all your gateway keys.",
  },
  {
    icon: PlugIcon,
    title: "Providers",
    body: "Add, view, and manage the free-provider keys the gateway routes through.",
  },
  {
    icon: KeyIcon,
    title: "API Keys",
    body: "Create gateway keys for your clients, copy them, and revoke them anytime.",
  },
  {
    icon: SettingsIcon,
    title: "Settings",
    body: "Set the listen port, host, CORS, default model alias, request logging, and auth.",
  },
];

function CopyField({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-1">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <Input readOnly value={value} className="font-mono text-xs" />
        <Button
          variant="secondary"
          onClick={() => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
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
  );
}

export function Onboarding({
  providers,
  onDone,
}: {
  providers: ProviderCatalog[];
  onDone: () => void;
}) {
  const [selected, setSelected] = useState(providers[0]?.id ?? "groq");
  const [key, setKey] = useState("");
  const [added, setAdded] = useState<string[]>([]);
  const [gatewayKey, setGatewayKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function addProvider() {
    if (!key.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await api.addProvider(selected, key.trim());
      setAdded((a) => [...a, selected]);
      setKey("");
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function generateKey() {
    setBusy(true);
    setErr(null);
    try {
      const k = await api.createKey("default");
      setGatewayKey(k.key);
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(false);
    }
  }

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:4141";
  const snippet = `curl ${origin}/v1/chat/completions \\
  -H "Authorization: Bearer ${gatewayKey || "fr-live-..."}" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"free:auto","messages":[{"role":"user","content":"Hello"}]}'`;

  return (
    <div className="mx-auto max-w-4xl space-y-10 flex items-center justify-center flex-col h-[90vh]">
      {/* Hero */}
      <section className="flex flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-foreground">
          <Logo className="size-7 text-background" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          FreeRouter Gateway
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Everyone should have access to free AI without juggling API keys,
          provider dashboards, or a different client for every model. FreeRouter
          Gateway puts every free model behind one private, OpenAI-compatible
          endpoint — running entirely on your machine.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <a href={DOCS_URL} target="_blank" rel="noreferrer">
            <Button>
              Read the docs <BookOpen />
            </Button>
          </a>
          <a
            href="https://github.com/r2hu1/freerouter"
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline">
              View on GitHub <ArrowUpRight />
            </Button>
          </a>
        </div>
      </section>

      {/* Features */}
      <section aria-label="Features" className="grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="rounded-xl border border-sidebar-border bg-card p-4"
            >
              <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="text-sm font-medium">{f.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{f.body}</p>
            </div>
          );
        })}
      </section>

      {err && (
        <div
          role="alert"
          className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {err}
        </div>
      )}
    </div>
  );
}
