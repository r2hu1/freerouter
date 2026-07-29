"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { MODELS, PROVIDERS } from "./data";
import { ModelCard } from "./model-card";

export function ModelsList() {
  const [search, setSearch] = useState("");
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(
    new Set(),
  );

  const filtered = useMemo(() => {
    let list = MODELS;
    if (selectedProviders.size > 0) {
      list = list.filter((m) => selectedProviders.has(m.provider));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.modelId.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q),
      );
    }
    return list;
  }, [search, selectedProviders]);

  function toggleProvider(p: string) {
    setSelectedProviders((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  return (
    <>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fd-muted-foreground" />
        <input
          type="text"
          placeholder="Search models..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-fd-border bg-fd-background pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-fd-ring transition-shadow"
        />
      </div>

      <div className="flex gap-1.5 mb-8 overflow-x-auto">
        {PROVIDERS.map((p) => (
          <button
            key={p}
            onClick={() => toggleProvider(p)}
            className={cn(
              "rounded-full px-3.5 border py-1.5 text-sm font-medium transition-all cursor-pointer",
              selectedProviders.has(p)
                ? "bg-fd-primary text-fd-primary-foreground shadow-sm"
                : "bg-transparent text-fd-secondary-foreground hover:brightness-90",
            )}
          >
            {p}
          </button>
        ))}
        {selectedProviders.size > 0 && (
          <button
            onClick={() => setSelectedProviders(new Set())}
            className="rounded-full px-3.5 py-1.5 text-sm font-medium text-fd-muted-foreground hover:text-fd-foreground transition-colors cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-fd-muted-foreground py-12">
          No models match your filters.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((model) => (
            <ModelCard
              key={`${model.provider}:${model.modelId}`}
              model={model}
            />
          ))}
        </div>
      )}
    </>
  );
}
