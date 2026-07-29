import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function ModelsCta() {
  return (
    <section className="border-t">
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Browse all models</h2>
        <p className="text-muted-foreground mb-8">
          Search, filter by provider, and explore every free model in the registry.
        </p>
        <Link
          href="/models"
          className="inline-flex items-center gap-2 rounded-xl bg-fd-primary text-fd-primary-foreground px-6 py-3 font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer"
        >
          View all models
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}
