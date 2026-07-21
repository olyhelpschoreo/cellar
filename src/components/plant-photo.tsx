import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

/** Deterministic botanical gradient from a seed string (nickname/id). */
function gradientFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = 90 + (h % 80); // 90–170: greens through teal
  const hue2 = 60 + ((h >> 3) % 60); // warmer companion
  return `linear-gradient(140deg, oklch(0.82 0.09 ${hue}), oklch(0.6 0.11 ${hue2}))`;
}

interface PlantPhotoProps {
  photoUrl?: string;
  name: string;
  seed: string;
  className?: string;
  /** Icon size for the placeholder glyph. */
  glyphClassName?: string;
}

export function PlantPhoto({
  photoUrl,
  name,
  seed,
  className,
  glyphClassName,
}: PlantPhotoProps) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- data-URL photos, no loader
      <img
        src={photoUrl}
        alt={name}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center",
        className,
      )}
      style={{ backgroundImage: gradientFor(seed) }}
      role="img"
      aria-label={`${name} (no photo yet)`}
    >
      <Leaf
        className={cn("text-white/80 drop-shadow-sm", glyphClassName ?? "size-10")}
        strokeWidth={1.5}
      />
    </div>
  );
}
