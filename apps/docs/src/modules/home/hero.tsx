import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"

export function Hero() {
  return (
    <section className="flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-fd-border bg-fd-secondary px-4 py-1 text-sm text-fd-muted-foreground mb-8">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        Ships with 13 providers
        <span className="hidden sm:inline">&nbsp;·&nbsp;87+ free models</span>
      </div>

      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl">
        Route across free LLMs with a single API
      </h1>

      <p className="mt-6 text-lg text-fd-muted-foreground max-w-2xl">
        FreeRouter is the open-source AI gateway that routes requests across free LLM providers through one
        OpenAI-compatible API. Like OpenRouter, but for free models.
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
  )
}
