import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Box,
  DollarSign,
  Shield,
  GitFork,
} from "lucide-react";
import { cn } from "@/lib/cn";

const features = [
  {
    icon: Box,
    title: "13 providers, 87+ models",
    description:
      "All completely free ($0 cost). Like OpenRouter, but for free models.",
  },
  {
    icon: Shield,
    title: "BYOK architecture",
    description:
      "Bring your own API keys. Keys passed per-call, never stored. Health isolated per (provider, key fingerprint).",
  },
  {
    icon: GitFork,
    title: "Auto-failover",
    description:
      "Aliases resolve to best available model. If one provider fails, FreeRouter tries the next.",
  },
  {
    icon: DollarSign,
    title: "Zero cost",
    description:
      "Every model in the registry is free-tier. No hidden charges, no trial credits.",
  },
];

export default function HomePage() {
  return (
    <main className="flex-1">
      <section className="flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1 text-sm text-muted-foreground mb-8">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Ships with 13 providers
          <span className="hidden sm:inline">&nbsp;·&nbsp;87+ free models</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl">
          Route across free LLMs with a single API
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
          FreeRouter is the open-source AI gateway that routes requests across
          free LLM providers through one OpenAI-compatible API. Like OpenRouter,
          but for free models.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-xl bg-fd-primary text-fd-primary-foreground px-4 py-2 font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all text-sm cursor-pointer"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="https://github.com/r2hu1/freerouter"
            className="inline-flex items-center gap-2 rounded-xl bg-fd-primary-foreground text-fd-primary px-4 py-2 font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all text-sm cursor-pointer"
          >
            <BookOpen className="h-4 w-4" />
            GitHub
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto px-6 pb-24">
        {features.map((feature) => (
          <div
            key={feature.title}
            className={cn(
              "rounded-xl border p-6",
              "hover:bg-muted/50 transition-colors",
            )}
          >
            <feature.icon className="h-5 w-5 mb-3 text-muted-foreground" />
            <h3 className="font-semibold mb-1">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      <section className="border-t">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Get started in seconds</h2>
          <p className="text-muted-foreground mb-8">
            Install the SDK, pick a free provider, and make your first call.
          </p>

          <div className="rounded-xl border bg-muted/30 p-4 text-left">
            <pre className="text-sm overflow-x-auto">
              <code>{`npm install @freerouter/sdk

import { createFreeRouter } from "@freerouter/sdk"
import { generateText } from "ai"

const router = createFreeRouter()

const { text } = await generateText({
  model: router.languageModel("free:auto", {
    groq: process.env.GROQ_API_KEY,
  }),
  prompt: "Explain quantum computing",
})

console.log(text)`}</code>
            </pre>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/docs/sdk"
              className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-5 py-2.5 text-sm font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer"
            >
              SDK docs <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="https://www.npmjs.com/package/@freerouter/sdk"
              className="inline-flex items-center gap-2 rounded-xl border bg-background px-5 py-2.5 text-sm font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer"
            >
              npm <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
