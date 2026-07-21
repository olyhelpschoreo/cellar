import { Droplet } from "lucide-react";
import { STATUS_STYLES } from "@/lib/status-style";
import { cn } from "@/lib/utils";

interface Counts {
  happy: number;
  thirsty: number;
  overdue: number;
}

/** A calm at-a-glance strip: how the whole collection is doing today. */
export function CollectionHealth({
  counts,
  wateredThisWeek,
}: {
  counts: Counts;
  wateredThisWeek: number;
}) {
  const total = counts.happy + counts.thirsty + counts.overdue;
  const happyPct = total === 0 ? 0 : Math.round((counts.happy / total) * 100);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat
        label="Thriving"
        value={`${happyPct}%`}
        hint={`${counts.happy} of ${total}`}
        tone="happy"
      />
      <Stat
        label="Water soon"
        value={counts.thirsty}
        tone="thirsty"
        muted={counts.thirsty === 0}
      />
      <Stat
        label="Overdue"
        value={counts.overdue}
        tone="overdue"
        muted={counts.overdue === 0}
      />
      <Stat
        label="Watered this week"
        value={wateredThisWeek}
        icon
      />
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
  muted,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "happy" | "thirsty" | "overdue";
  muted?: boolean;
  icon?: boolean;
}) {
  const dot = tone ? STATUS_STYLES[tone].dot : null;
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-1.5">
        {dot && (
          <span className={cn("size-2 rounded-full", muted ? "bg-muted-foreground/30" : dot)} />
        )}
        {icon && <Droplet className="size-3.5 text-primary" />}
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span
          className={cn(
            "text-2xl font-semibold tabular-nums",
            muted && "text-muted-foreground",
          )}
        >
          {value}
        </span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}
