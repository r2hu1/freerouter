import Link from "next/link"
import { Box, Shield, GitFork, Cpu, ArrowRight } from "lucide-react"
import { cn } from "@/lib/cn"

const features = [
  {
    icon: Cpu,
    title: "One API for any free model",
    description: "All 87+ free models across 13 providers through a single OpenAI-compatible interface.",
    link: { text: "Browse all models", href: "/models" },
  },
  {
    icon: GitFork,
    title: "Auto-failover",
    description: "Aliases route to best available model. If one provider fails, FreeRouter tries the next automatically.",
    link: { text: "Learn more", href: "/docs/sdk/guides" },
  },
  {
    icon: Shield,
    title: "BYOK with health isolation",
    description: "Bring your own free-tier keys. Health tracked per key fingerprint — one user's rate-limit never blocks another.",
    link: { text: "View docs", href: "/docs/sdk" },
  },
  {
    icon: Box,
    title: "SDK + HTTP API",
    description: "Use the TypeScript SDK with Vercel AI SDK v7, or the OpenAI-compatible HTTP API. Works with any OpenAI client.",
    link: { text: "View docs", href: "/docs/api" },
  },
]

export function Features() {
  return (
    <section className="max-w-5xl mx-auto px-6 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-fd-border bg-fd-card p-6 flex flex-col justify-between"
          >
            <div>
              <feature.icon className="h-5 w-5 mb-3 text-fd-muted-foreground" />
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-fd-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
            <Link
              href={feature.link.href}
              className={cn(
                "inline-flex items-center gap-1.5 mt-4 text-sm font-medium",
                "text-fd-muted-foreground hover:text-fd-foreground transition-colors",
              )}
            >
              {feature.link.text}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
