import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { MODELS, PROVIDERS } from "@/modules/models/data";
import { ModelsList } from "@/modules/models/models-list";

export const metadata: Metadata = {
  title: "Models",
  description: `Browse all ${MODELS.length} free models across ${PROVIDERS.length} providers in the FreeRouter registry.`,
};

export default function ModelsPage() {
  return (
    <main className="flex-1 px-6 py-12 md:px-12 lg:px-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">
            Providers & Models
          </h1>
          <p className="text-fd-muted-foreground mt-1 md:text-lg">
            {MODELS.length} free models across {PROVIDERS.length} providers
          </p>
        </div>
        <Link
          href="https://github.com/r2hu1/freerouter/blob/main/CONTRIBUTING.md"
          className="inline-flex items-center gap-2 w-fit rounded-xl border border-fd-border bg-fd-primary text-fd-primary-foreground px-4 py-2 text-sm font-medium hover:-translate-y-0.5 active:scale-[0.97] transition-transform duration-150 ease-out cursor-pointer"
        >
          Add More
          <Plus className="h-4 w-4" />
        </Link>
      </div>

      <ModelsList />
    </main>
  );
}
