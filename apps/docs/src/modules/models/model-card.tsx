import { cn } from "@/lib/cn"
import { CAP_LABELS, CAP_COLORS, PROVIDER_COLORS, formatContextWindow, type ModelInfo } from "./data"

export function ModelCard({ model }: { model: ModelInfo }) {
  return (
    <div className="rounded-xl border border-fd-border bg-fd-card p-4 hover:brightness-[0.97] dark:hover:brightness-125 transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className={cn(
            "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0",
            PROVIDER_COLORS[model.provider],
          )}
        >
          {model.provider}
        </span>
        <span className="text-xs text-fd-muted-foreground shrink-0">
          {formatContextWindow(model.contextWindow)}
        </span>
      </div>
      <p className="font-mono text-xs break-all mb-2.5">
        {model.modelId}
        {model.deprecated && (
          <span className="ml-2 rounded bg-fd-secondary px-1.5 py-0.5 text-[10px] text-fd-muted-foreground">
            deprecated
          </span>
        )}
      </p>
      <div className="flex flex-wrap gap-1">
        {model.capabilities.map((cap) => (
          <span
            key={cap}
            className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", CAP_COLORS[cap])}
          >
            {CAP_LABELS[cap]}
          </span>
        ))}
      </div>
    </div>
  )
}
