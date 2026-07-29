import Link from "next/link";
import { ArrowRight } from "lucide-react";

const stats = [
  ["13", "Providers"],
  ["87+", "Free models"],
  ["$0", "Cost"],
  ["MIT", "License"],
];

const logs = [
  { provider: "gpt-4o-mini", ms: 214, delay: "0s" },
  { provider: "gemini-2.0-flash", ms: 189, delay: "0.9s" },
  { provider: "llama-3.3-70b", ms: 267, delay: "1.8s" },
  { provider: "mistral-small", ms: 152, delay: "2.7s" },
  { provider: "qwen-2.5-coder", ms: 231, delay: "3.6s" },
  { provider: "deepseek-v3", ms: 198, delay: "4.5s" },
];

function CornerBracket({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`absolute h-4 w-4 text-fd-foreground/25 ${className}`}
      fill="none"
    >
      <path d="M1 1H19M1 1V19" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function RouterConsole() {
  return (
    <div className="relative">
      <CornerBracket className="-top-2 -left-2" />
      <CornerBracket className="-top-2 -right-2 rotate-90" />
      <CornerBracket className="-bottom-2 -left-2 -rotate-90" />
      <CornerBracket className="-bottom-2 -right-2 rotate-180" />

      <div className="relative overflow-hidden rounded-lg border border-fd-border bg-fd-card">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--color-fd-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-fd-border) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
            maskImage: "linear-gradient(to bottom, black, transparent 90%)",
          }}
        />

        <div className="rc-scan pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-emerald-500/0 via-emerald-500/[0.06] to-emerald-500/0" />

        <div className="relative flex items-center justify-between border-b border-fd-border px-4 py-2.5">
          <span className="font-mono text-xs text-fd-muted-foreground">
            @freerouter<span className="text-fd-foreground/40">/</span>sdk
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-500">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            streaming
          </span>
        </div>

        <div className="relative space-y-0 px-4 py-3 font-mono text-[12px] leading-loose">
          {logs.map((log) => (
            <div
              key={log.provider}
              className="rc-row flex items-center gap-2 whitespace-nowrap opacity-0"
              style={{ animationDelay: log.delay }}
            >
              <span className="text-fd-muted-foreground/60">→</span>
              <span className="text-fd-foreground">{log.provider}</span>
              <span className="flex-1 border-b border-dotted border-fd-border/70 translate-y-[-3px]" />
              <span className="text-fd-muted-foreground">{log.ms}ms</span>
              <span className="text-emerald-500">200</span>
            </div>
          ))}
          <span className="rc-cursor inline-block h-3.5 w-1.5 translate-y-1 bg-fd-foreground/70" />
        </div>
      </div>

      <style>{`
        @keyframes rc-scan-move {
          0% { transform: translateY(-6rem); }
          100% { transform: translateY(16rem); }
        }
        .rc-scan { animation: rc-scan-move 4s ease-in-out infinite; }

        @keyframes rc-row-in {
          0% { opacity: 0; transform: translateX(-4px); }
          8%, 90% { opacity: 1; transform: translateX(0); }
          100% { opacity: 1; }
        }
        .rc-row { animation: rc-row-in 5.4s ease-out infinite; }

        @keyframes rc-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .rc-cursor { animation: rc-blink 1s step-end infinite; }
      `}</style>
    </div>
  );
}

export function Hero() {
  return (
    <section className="px-6 pt-18 pb-20 md:px-12 lg:px-20">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-16 items-center">
        <div>
          <div className="inline-flex items-center w-fit gap-1.5 rounded-full border border-fd-border bg-fd-secondary px-3.5 py-1 text-sm text-fd-muted-foreground mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Like OpenRouter, but for free models
          </div>

          <h1 className="text-4xl sm:text-5xl max-w-xl leading-[1.08] font-medium tracking-tight">
            Route across free LLMs with a{" "}
            <span className="relative inline-block text-fd-primary">
              single API
              <svg
                className="absolute -bottom-1.5 left-0 w-full text-fd-primary/40"
                viewBox="0 0 200 8"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M1 5.5C40 1.5 160 1.5 199 5.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </h1>

          <p className="mt-6 text-base sm:text-lg text-fd-muted-foreground max-w-xl">
            FreeRouter is the open-source AI gateway that routes requests across
            free LLM providers through one OpenAI-compatible API.
          </p>

          <div className="mt-8 flex sm:items-center gap-3">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-xl bg-fd-primary text-fd-primary-foreground px-5 py-2.5 font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] transition-transform duration-150 ease-out text-sm cursor-pointer"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="https://github.com/r2hu1/freerouter"
              className="inline-flex items-center gap-2 rounded-xl bg-fd-secondary text-fd-secondary-foreground px-5 py-2.5 font-medium hover:brightness-90 active:scale-[0.97] transition-transform duration-150 ease-out text-sm cursor-pointer"
            >
              Github
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-5 sm:flex sm:flex-wrap sm:gap-0">
            {stats.map(([value, label], i) => (
              <div
                key={label}
                className={`flex flex-col gap-0.5 sm:pr-8 ${
                  i > 0 ? "sm:pl-8 sm:border-l sm:border-fd-border" : ""
                }`}
              >
                <span className="font-mono text-lg font-semibold">{value}</span>
                <span className="text-xs uppercase tracking-wide text-fd-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <RouterConsole />
      </div>
    </section>
  );
}
