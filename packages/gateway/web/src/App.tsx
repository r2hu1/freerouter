import { FolderOpen } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  BarChartIcon,
  KeyIcon,
  Logo,
  PlugIcon,
  SettingsIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { type ProviderCatalog, api, bootstrap } from "./api";
import { Keys } from "./pages/Keys";
import { Onboarding } from "./pages/Onboarding";
import { Providers } from "./pages/Providers";
import { Settings } from "./pages/Settings";
import { toast, Toaster } from "@/components/ui/toast";
import { GitFork, ScrollText } from "lucide-react";

const Analytics = lazy(() =>
  import("./pages/Analytics").then((m) => ({ default: m.Analytics })),
);

type View = "onboarding" | "providers" | "keys" | "analytics" | "settings";

const NAV: { id: View; label: string; icon: typeof BarChartIcon }[] = [
  { id: "analytics", label: "Analytics", icon: BarChartIcon },
  { id: "providers", label: "Providers", icon: PlugIcon },
  { id: "keys", label: "API Keys", icon: KeyIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

function viewFromPath(pathname: string): View {
  const p = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  if (
    p === "analytics" ||
    p === "providers" ||
    p === "keys" ||
    p === "settings" ||
    p === "onboarding"
  ) {
    return p;
  }
  return "analytics";
}

function pathForView(v: View): string {
  return v === "analytics" ? "/" : `/${v}`;
}

export function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>(() =>
    viewFromPath(window.location.pathname),
  );
  const [providers, setProviders] = useState<ProviderCatalog[]>([]);
  const mainRef = useRef<HTMLElement>(null);
  const firstRun = useRef(true);

  function navigate(v: View, replace = false) {
    const url = pathForView(v);
    if (replace) window.history.replaceState({}, "", url);
    else window.history.pushState({}, "", url);
    setView(v);
  }

  useEffect(() => {
    const onPop = () => setView(viewFromPath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    bootstrap()
      .then(async (b) => {
        setProviders(b.providers);
        const [p, k] = await Promise.all([api.getProviders(), api.getKeys()]);
        if (p.providers.length === 0 && k.keys.length === 0) {
          navigate("onboarding", true);
        }
        setReady(true);
      })
      .catch((e) => setError(String(e)));
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: run on nav change; view is the trigger, not a read
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [view]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <Card className="max-w-md" role="alert">
          <CardContent className="p-6">
            <h1 className="text-lg font-semibold">Gateway connection failed</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Make sure the gateway is running on this machine (npx
              @freerouter/gateway serve) and you opened this page from
              http://localhost.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!ready) {
    return (
      <output
        aria-live="polite"
        className="flex min-h-screen items-center justify-center text-muted-foreground"
      >
        Loading FreeRouter Gateway…
      </output>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>

      <aside className="flex w-72 shrink-0 flex-col border-r border-sidebar-border bg-background">
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-6">
          <div className="size-8 bg-foreground rounded-lg flex items-center justify-center">
            <Logo className="size-3.5 text-background" />
          </div>
          <span className="text-[16px] font-medium tracking-tight">
            FreeRouter Gateway
          </span>
        </div>

        <nav aria-label="Primary" className="flex flex-col gap-1 p-4">
          {NAV.map((n) => {
            const active = view === n.id;
            const Icon = n.icon;
            return (
              <Button
                key={n.id}
                variant="ghost"
                size="lg"
                className={[
                  "relative h-10 justify-start gap-3 rounded-lg py-2.5 text-[15px]",
                  active
                    ? "bg-secondary font-medium text-foreground before:absolute before:left-0 before:top-1/2 before:h-6 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-primary"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
                onClick={() => navigate(n.id)}
              >
                <Icon className="size-5" />
                {n.label}
              </Button>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-t border-sidebar-border px-4 py-3">
          <span className="text-xs text-muted-foreground">
            No servers in-between. Keys stay on this machine.
          </span>
          <div className="flex items-center gap-1 justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                render={
                  <a
                    href="https://github.com/r2hu1/freerouter"
                    target="_blank"
                  />
                }
              >
                Github <GitFork />
              </Button>
              <Button
                variant="outline"
                render={
                  <a
                    href="https://freerouter.vercel.app/docs/gateway"
                    target="_blank"
                  />
                }
              >
                Docs <ScrollText />
              </Button>
            </div>

            <ThemeToggle />
          </div>
        </div>
      </aside>

      <main
        id="main"
        ref={mainRef}
        tabIndex={-1}
        className="flex-1 overflow-auto bg-sidebar p-6 outline-none md:p-8"
      >
        {view === "onboarding" && (
          <Onboarding
            providers={providers}
            onDone={() => setView("analytics")}
          />
        )}
        {view === "providers" && <Providers />}
        {view === "keys" && <Keys />}
        {view === "analytics" && (
          <Suspense
            fallback={
              <output
                aria-live="polite"
                className="text-sm text-muted-foreground"
              >
                Loading analytics…
              </output>
            }
          >
            <Analytics />
          </Suspense>
        )}
        {view === "settings" && <Settings />}
      </main>
      <Toaster />
    </div>
  );
}
