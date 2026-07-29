import Link from "next/link";
import { ArrowRight } from "lucide-react";

const stats = [
  ["13", "Providers"],
  ["87+", "Free models"],
  ["$0", "Cost"],
  ["Open source", "MIT"],
];

export function Hero() {
  return (
    <section className="flex flex-col items-center px-6 pt-24 sm:pt-32 pb-20 text-center">
      <div className="inline-flex items-center gap-1.5 rounded-full border border-fd-border bg-fd-secondary px-3.5 py-1 text-sm text-fd-muted-foreground mb-6">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Like OpenRouter, but for free models
      </div>

      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-4xl">
        Route across free LLMs with a
        <br />
        <span className="text-fd-primary">single API</span>
      </h1>

      <p className="mt-5 text-base sm:text-lg text-fd-muted-foreground max-w-xl">
        FreeRouter is the open-source AI gateway that routes requests across
        free LLM providers through one OpenAI-compatible API.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
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

      <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {stats.map(([value, label]) => (
          <div key={label} className="flex items-baseline gap-1.5">
            <span className="text-lg font-semibold">{value}</span>
            <span className="text-sm text-fd-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
