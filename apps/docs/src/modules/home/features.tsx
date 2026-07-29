import { Box, Shield, GitFork, DollarSign } from "lucide-react"
import { cn } from "@/lib/cn"

const features = [
  {
    icon: Box,
    title: "13 providers, 87+ models",
    description: "All completely free ($0 cost). Like OpenRouter, but for free models.",
  },
  {
    icon: Shield,
    title: "BYOK architecture",
    description: "Bring your own API keys. Keys passed per-call, never stored. Health isolated per (provider, key fingerprint).",
  },
  {
    icon: GitFork,
    title: "Auto-failover",
    description: "Aliases resolve to best available model. If one provider fails, FreeRouter tries the next.",
  },
  {
    icon: DollarSign,
    title: "Zero cost",
    description: "Every model in the registry is free-tier. No hidden charges, no trial credits.",
  },
]

export function Features() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto px-6 pb-24">
      {features.map((feature) => (
        <div
          key={feature.title}
          className={cn("rounded-xl border border-fd-border bg-fd-card p-6", "hover:brightness-[0.97] dark:hover:brightness-125 transition-all")}
        >
          <feature.icon className="h-5 w-5 mb-3 text-fd-muted-foreground" />
          <h3 className="font-semibold mb-1">{feature.title}</h3>
          <p className="text-sm text-fd-muted-foreground leading-relaxed">{feature.description}</p>
        </div>
      ))}
    </section>
  )
}
