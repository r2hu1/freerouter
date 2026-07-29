import Link from "next/link";
import { Box, Shield, GitFork, Cpu, ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

const features = [
  {
    icon: Cpu,
    title: "One API for any free model",
    description:
      "All 87+ free models across 13 providers through a single OpenAI-compatible interface.",
    link: { text: "Browse all models", href: "/models" },
    accent: "from-orange-500/15 to-orange-500/0 text-orange-500",
  },
  {
    icon: GitFork,
    title: "Auto-failover",
    description:
      "Aliases route to best available model. If one provider fails, FreeRouter tries the next automatically.",
    link: { text: "Learn more", href: "/docs/sdk/guides" },
    accent: "from-sky-500/15 to-sky-500/0 text-sky-500",
  },
  {
    icon: Shield,
    title: "BYOK with health isolation",
    description:
      "Bring your own free-tier keys. Health tracked per key fingerprint — one user's rate-limit never blocks another.",
    link: { text: "View docs", href: "/docs/sdk" },
    accent: "from-emerald-500/15 to-emerald-500/0 text-emerald-500",
  },
  {
    icon: Box,
    title: "SDK + HTTP API",
    description:
      "Use the TypeScript SDK with Vercel AI SDK v7, or the OpenAI-compatible HTTP API. Works with any OpenAI client.",
    link: { text: "View docs", href: "/docs/api" },
    accent: "from-violet-500/15 to-violet-500/0 text-violet-500",
  },
];

export function Features() {
  return (
    <section className="px-6 md:px-12 lg:px-20 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((feature, i) => (
          <div
            key={feature.title}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-fd-border bg-fd-card p-6",
              "flex flex-col justify-between",
              "transition-all duration-300 ease-out",
              " hover:border-fd-foreground/20",
            )}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* corner texture */}
            <svg
              className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 text-fd-foreground/[0.04] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
              viewBox="0 0 100 100"
              fill="none"
            >
              <circle
                cx="50"
                cy="50"
                r="49"
                stroke="currentColor"
                strokeWidth="1"
              />
              <circle
                cx="50"
                cy="50"
                r="34"
                stroke="currentColor"
                strokeWidth="1"
              />
              <circle
                cx="50"
                cy="50"
                r="19"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>

            {/* faint diagonal hairline accent */}
            <span
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                feature.accent,
              )}
            />

            <div className="relative">
              <div
                className={cn(
                  "mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-inset ring-fd-border",
                  feature.accent,
                )}
              >
                <feature.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="font-semibold mb-1.5 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-fd-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>

            <Link
              href={feature.link.href}
              className={cn(
                "relative inline-flex items-center gap-1.5 mt-5 text-sm font-medium w-fit",
                "text-fd-muted-foreground transition-colors",
                "hover:text-fd-foreground",
              )}
            >
              {feature.link.text}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
