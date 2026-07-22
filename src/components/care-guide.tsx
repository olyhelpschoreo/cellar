import { BookOpen, PawPrint, Sparkles } from "lucide-react";
import { DIFFICULTY_LABELS, findSpecies } from "@/lib/plant-library";

/**
 * Care-guide card, shown when a plant's species matches the local library.
 * Pure lookup — no stored data, so it stays correct if the library grows.
 */
export function CareGuide({
  species,
  scientificName,
}: {
  species?: string;
  scientificName?: string;
}) {
  const match = findSpecies(species ?? "") ?? findSpecies(scientificName ?? "");
  if (!match) return null;

  return (
    <div className="mt-6 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-1.5 text-sm font-semibold">
        <BookOpen className="size-4 text-primary" />
        Care guide
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{match.tips}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
          <Sparkles className="size-3" /> {DIFFICULTY_LABELS[match.difficulty]}
        </span>
        <span
          className={
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium " +
            (match.petSafe
              ? "bg-happy-soft text-happy-soft-foreground"
              : "bg-overdue-soft text-overdue-soft-foreground")
          }
        >
          <PawPrint className="size-3" />
          {match.petSafe ? "Pet-safe" : "Toxic to pets"}
        </span>
      </div>
    </div>
  );
}
