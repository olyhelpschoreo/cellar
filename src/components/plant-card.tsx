"use client";

import Link from "next/link";
import { Droplet } from "lucide-react";
import type { CareEvent, Plant } from "@/lib/types";
import { careStatus, duePhrase } from "@/lib/care";
import { STATUS_STYLES } from "@/lib/status-style";
import { StatusBadge } from "./status-badge";
import { PlantPhoto } from "./plant-photo";
import { useCellar } from "@/lib/cellar-provider";
import { cn } from "@/lib/utils";

export function PlantCard({ plant, events }: { plant: Plant; events: CareEvent[] }) {
  const { waterPlant } = useCellar();
  const status = careStatus(plant, events);
  const s = STATUS_STYLES[status.status];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/plants/${plant.id}`} className="block">
        <div
          className={cn(
            "relative aspect-[4/3] w-full overflow-hidden ring-4 ring-inset",
            s.ring,
          )}
        >
          <PlantPhoto
            photoUrl={plant.photoUrl}
            name={plant.nickname}
            seed={plant.id + plant.nickname}
            className="transition-transform duration-500 group-hover:scale-105"
            glyphClassName="size-12"
          />
          <div className="absolute left-3 top-3">
            <StatusBadge status={status.status} className="backdrop-blur-sm" />
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <Link href={`/plants/${plant.id}`} className="min-w-0">
          <h3 className="truncate text-base font-semibold leading-tight">
            {plant.nickname}
          </h3>
          <p className="truncate text-sm text-muted-foreground">{plant.species}</p>
        </Link>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{duePhrase(status)}</span>
          <button
            type="button"
            onClick={() => waterPlant(plant.id)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Droplet className="size-3.5" />
            Water
          </button>
        </div>
      </div>
    </div>
  );
}
