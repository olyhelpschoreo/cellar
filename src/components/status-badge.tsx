import { STATUS_LABELS, type HealthStatus } from "@/lib/care";
import { STATUS_STYLES } from "@/lib/status-style";
import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: HealthStatus;
  label?: string;
  className?: string;
}) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        s.chip,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {label ?? STATUS_LABELS[status]}
    </span>
  );
}
