import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function ModelsCta() {
  return (
    <section className="border-t border-fd-border">
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold mb-3">Get started in seconds</h2>
        <p className="text-fd-muted-foreground mb-8">
          Install, pick a free provider key, and make your first call.
        </p>

        <div className="rounded-xl border border-fd-border bg-fd-card p-5 text-left">
          <pre className="text-sm overflow-x-auto">
            <code>{`npm install @freerouter/sdk

import { createFreeRouter } from "@freerouter/sdk"
import { generateText } from "ai"

const router = createFreeRouter()

const { text } = await generateText({
  model: router.languageModel("free:auto", {
    groq: process.env.GROQ_API_KEY,
  }),
  prompt: "Explain quantum computing in one paragraph",
})

console.log(text)`}</code>
          </pre>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/docs/sdk"
            className="inline-flex items-center gap-2 rounded-xl bg-fd-primary text-fd-primary-foreground px-5 py-2.5 text-sm font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] transition-transform duration-150 ease-out cursor-pointer"
          >
            SDK docs
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="https://www.npmjs.com/package/@freerouter/sdk"
            className="inline-flex items-center gap-2 rounded-xl border border-fd-border bg-fd-background px-5 py-2.5 text-sm font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] transition-transform duration-150 ease-out cursor-pointer"
          >
            npm
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/models"
            className="inline-flex items-center gap-2 rounded-xl border border-fd-border bg-fd-background px-5 py-2.5 text-sm font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] transition-transform duration-150 ease-out cursor-pointer"
          >
            Browse all models
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
