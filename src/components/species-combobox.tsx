"use client";

import { useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LIGHT_LABELS } from "@/lib/types";
import { searchSpecies, type PlantSpecies } from "@/lib/plant-library";
import { cn } from "@/lib/utils";

/**
 * A species text input that suggests plants from the local care library and,
 * on selection, hands the full record back so the caller can autofill care
 * details. Free, offline stand-in for AI plant-ID.
 */
export function SpeciesCombobox({
  id,
  value,
  onValueChange,
  onSelect,
  placeholder,
}: {
  id?: string;
  value: string;
  onValueChange: (v: string) => void;
  onSelect: (species: PlantSpecies) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = searchSpecies(value);
  const showList = open && suggestions.length > 0;

  function choose(s: PlantSpecies) {
    onSelect(s);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!showList) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(suggestions[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <Input
        id={id}
        value={value}
        autoComplete="off"
        placeholder={placeholder}
        onChange={(e) => {
          onValueChange(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={onKeyDown}
      />
      {showList && (
        <ul
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border bg-popover p-1 shadow-md"
          onMouseDown={() => {
            // keep focus long enough for the click to register
            if (blurTimer.current) clearTimeout(blurTimer.current);
          }}
        >
          {suggestions.map((s, i) => (
            <li key={s.scientific}>
              <button
                type="button"
                onClick={() => choose(s)}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left",
                  i === active && "bg-accent",
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{s.common}</span>
                  <span className="block truncate text-xs italic text-muted-foreground">
                    {s.scientific}
                  </span>
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {LIGHT_LABELS[s.light]} · {s.waterEveryDays}d
                </span>
              </button>
            </li>
          ))}
          <li className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-muted-foreground">
            <Sparkles className="size-3" /> Pick one to autofill care details
          </li>
        </ul>
      )}
    </div>
  );
}
