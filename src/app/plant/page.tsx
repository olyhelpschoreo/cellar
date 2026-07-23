"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Droplet,
  ImageIcon,
  Leaf,
  MapPin,
  Scissors,
  Sprout,
  StickyNote,
  Sun,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useCellar } from "@/lib/cellar-provider";
import {
  careStatus,
  daysBetween,
  duePhrase,
  relativeDay,
  todayISO,
} from "@/lib/care";
import { STATUS_STYLES } from "@/lib/status-style";
import {
  CARE_EVENT_LABELS,
  LIGHT_LABELS,
  type CareEventType,
} from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { PlantPhoto } from "@/components/plant-photo";
import { PhotoTimeline } from "@/components/photo-timeline";
import { AddPhotoDialog } from "@/components/add-photo-dialog";
import { CareGuide } from "@/components/care-guide";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Compact age for the fact card, e.g. "7 months", "12 days", "1.5 years". */
function agePhraseShort(acquired?: string): string | null {
  if (!acquired) return null;
  const days = daysBetween(todayISO(), acquired);
  if (days < 0) return null;
  if (days < 30) return `${days} day${days === 1 ? "" : "s"}`;
  const months = Math.round(days / 30);
  if (months < 18) return `${months} month${months === 1 ? "" : "s"}`;
  const years = (days / 365).toFixed(1).replace(/\.0$/, "");
  return `${years} years`;
}

const CARE_ICONS: Record<CareEventType, LucideIcon> = {
  watered: Droplet,
  fertilized: Sprout,
  pruned: Scissors,
  repotted: Leaf,
  photo: ImageIcon,
  noted: StickyNote,
};

const LOG_ACTIONS: CareEventType[] = ["watered", "fertilized", "pruned", "repotted"];

function PlantDetailInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const router = useRouter();
  const { ready, getPlant, waterPlant, logCare, removePlant, undoEvents } =
    useCellar();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const plant = getPlant(id);

  if (ready && !plant) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-xl font-semibold">Plant not found</h1>
        <p className="mt-2 text-muted-foreground">
          It may have been removed from your collection.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/">Back to collection</Link>
        </Button>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const status = careStatus(plant, plant.events);
  const s = STATUS_STYLES[status.status];

  function onWaterNow() {
    if (!plant) return;
    const id = waterPlant(plant.id);
    toast.success(`Watered ${plant.nickname}`, {
      description: `Next drink in ${plant.waterEveryDays} days.`,
      action: { label: "Undo", onClick: () => undoEvents([id]) },
    });
  }

  function onLogCare(type: CareEventType) {
    if (!plant) return;
    const id = logCare({ plantId: plant.id, type, date: todayISO() });
    toast.success(`${CARE_EVENT_LABELS[type]} logged`, {
      action: { label: "Undo", onClick: () => undoEvents([id]) },
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Collection
      </Link>

      {/* Hero */}
      <div className="mt-4 grid gap-6 sm:grid-cols-[minmax(0,320px)_1fr]">
        <div
          className={cn(
            "relative aspect-square overflow-hidden rounded-3xl ring-4 ring-inset",
            s.ring,
          )}
        >
          <PlantPhoto
            photoUrl={plant.photoUrl}
            name={plant.nickname}
            seed={plant.id + plant.nickname}
            glyphClassName="size-20"
          />
        </div>

        <div className="flex flex-col">
          <StatusBadge status={status.status} className="self-start" />
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {plant.nickname}
          </h1>
          <p className="text-muted-foreground">{plant.species || "Unknown species"}</p>
          {plant.scientificName && (
            <p className="text-sm italic text-muted-foreground">
              {plant.scientificName}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={onWaterNow} className="gap-1.5 active:scale-95">
              <Droplet className="size-4" /> Water now
            </Button>
            <AddPhotoDialog plantId={plant.id} />
          </div>

          {/* Schedule */}
          <div className="mt-4 rounded-xl border bg-card p-4">
            <p className="text-sm font-medium">{duePhrase(status)}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div>
                <span className="block text-xs uppercase tracking-wide">Last watered</span>
                {formatDate(status.lastWatered)}
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wide">Next due</span>
                {formatDate(status.nextWaterDate)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Facts */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Fact icon={Sun} label="Light" value={LIGHT_LABELS[plant.light]} />
        <Fact icon={Droplet} label="Water" value={`Every ${plant.waterEveryDays}d`} />
        <Fact icon={MapPin} label="Location" value={plant.location || "—"} />
        <Fact
          icon={Sprout}
          label="Age"
          value={agePhraseShort(plant.acquiredDate) ?? "—"}
        />
      </div>

      <CareGuide species={plant.species} scientificName={plant.scientificName} />

      {plant.notes && (
        <div className="mt-6 rounded-xl border bg-card p-4">
          <h2 className="text-sm font-semibold">Notes</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
            {plant.notes}
          </p>
        </div>
      )}

      {/* Quick log */}
      <div className="mt-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Log care
        </h2>
        <div className="flex flex-wrap gap-2">
          {LOG_ACTIONS.map((type) => {
            const Icon = CARE_ICONS[type];
            return (
              <button
                key={type}
                onClick={() => onLogCare(type)}
                className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm transition-colors hover:bg-accent active:scale-95"
              >
                <Icon className="size-4" /> {CARE_EVENT_LABELS[type]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Growth timeline */}
      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Growth timeline
        </h2>
        <PhotoTimeline plant={plant} />
      </div>

      {/* Care log */}
      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Care log
        </h2>
        {plant.events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No care logged yet.</p>
        ) : (
          <ul className="space-y-1">
            {plant.events.map((e) => {
              const Icon = CARE_ICONS[e.type];
              return (
                <li
                  key={e.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm odd:bg-muted/40"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                    <Icon className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {CARE_EVENT_LABELS[e.type]}
                    {e.note && (
                      <span className="ml-2 font-normal text-muted-foreground">
                        {e.note}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-muted-foreground" title={formatDate(e.date)}>
                    {relativeDay(e.date)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Danger zone */}
      <div className="mt-10 border-t pt-6">
        {confirmDelete ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Remove {plant.nickname} from your collection?
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                removePlant(plant.id);
                router.push("/");
              }}
            >
              Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" /> Remove plant
          </button>
        )}
      </div>
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Droplet;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}

export default function PlantDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="h-64 animate-pulse rounded-2xl bg-muted" />
        </div>
      }
    >
      <PlantDetailInner />
    </Suspense>
  );
}
