"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { HealthStatus } from "@/lib/care";
import { STATUS_STYLES } from "@/lib/status-style";
import { cn } from "@/lib/utils";

export type StatusFilter = "all" | HealthStatus;

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "overdue", label: "Overdue" },
  { key: "thirsty", label: "Water soon" },
  { key: "happy", label: "Thriving" },
];

/** Search box + status filter chips for the collection. */
export function CollectionToolbar({
  query,
  onQuery,
  status,
  onStatus,
}: {
  query: string;
  onQuery: (v: string) => void;
  status: StatusFilter;
  onStatus: (s: StatusFilter) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative sm:max-w-xs sm:flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search by name, species or room…"
          aria-label="Search plants"
          className="pl-9 pr-9"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQuery("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const active = status === f.key;
          const dot = f.key !== "all" ? STATUS_STYLES[f.key].dot : null;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => onStatus(f.key)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent",
              )}
            >
              {dot && <span className={cn("size-1.5 rounded-full", dot)} />}
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
