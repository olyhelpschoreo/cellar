"use client";

import { useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCellar } from "@/lib/cellar-provider";
import { daysBetween } from "@/lib/care";
import type { CareEvent, PlantWithHistory } from "@/lib/types";
import { AddPhotoDialog } from "./add-photo-dialog";

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** A friendly span between two dates, e.g. "3 months", "5 weeks", "9 days". */
function spanPhrase(fromISO: string, toISO: string): string {
  const days = Math.abs(daysBetween(toISO, fromISO));
  if (days < 1) return "the same day";
  if (days < 14) return `${days} day${days === 1 ? "" : "s"}`;
  if (days < 60) return `${Math.round(days / 7)} weeks`;
  if (days < 730) return `${Math.round(days / 30)} months`;
  return `${(days / 365).toFixed(1).replace(/\.0$/, "")} years`;
}

export function PhotoTimeline({ plant }: { plant: PlantWithHistory }) {
  const { editPlant, undoEvents, logCare } = useCellar();
  // Oldest → newest, so the strip reads left-to-right as the plant grows.
  const photos = plant.events
    .filter((e): e is CareEvent & { photoUrl: string } => e.type === "photo" && !!e.photoUrl)
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const active = openIndex !== null ? photos[openIndex] : null;

  function setCover(photoUrl: string) {
    editPlant(plant.id, { photoUrl });
    toast.success(`Set as ${plant.nickname}'s cover photo`);
  }

  function deletePhoto(ev: CareEvent) {
    undoEvents([ev.id]);
    setOpenIndex(null);
    toast.success("Photo removed", {
      action: {
        // Re-add the same photo (a new id is fine for a timeline entry).
        label: "Undo",
        onClick: () =>
          logCare({
            plantId: plant.id,
            type: "photo",
            date: ev.date,
            photoUrl: ev.photoUrl,
            note: ev.note,
          }),
      },
    });
  }

  if (photos.length === 0) {
    return (
      <AddPhotoDialog
        plantId={plant.id}
        trigger={
          <button className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed py-10 text-sm text-muted-foreground transition-colors hover:bg-accent">
            <ImageIcon className="size-6" />
            Add a photo to start tracking how {plant.nickname} grows.
          </button>
        }
      />
    );
  }

  const first = photos[0];
  const latest = photos[photos.length - 1];
  const showComparison = photos.length >= 2;

  return (
    <div className="space-y-4">
      {/* Before → now */}
      {showComparison && (
        <div className="rounded-2xl border bg-card p-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <Snapshot label="First" photo={first} onClick={() => setOpenIndex(0)} />
            <ArrowRight className="size-5 shrink-0 text-muted-foreground" />
            <Snapshot
              label="Now"
              photo={latest}
              onClick={() => setOpenIndex(photos.length - 1)}
            />
          </div>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            {plant.nickname} has grown with you over{" "}
            <span className="font-medium text-foreground">
              {spanPhrase(first.date, latest.date)}
            </span>
            .
          </p>
        </div>
      )}

      {/* Filmstrip */}
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2">
        {photos.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setOpenIndex(i)}
            className="w-28 shrink-0 text-left"
          >
            <div className="aspect-square overflow-hidden rounded-xl border transition-transform hover:scale-[1.03]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.photoUrl}
                alt={`${plant.nickname} on ${p.date}`}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {formatDate(p.date)}
            </p>
          </button>
        ))}
        <div className="flex w-28 shrink-0 items-center justify-center">
          <AddPhotoDialog
            plantId={plant.id}
            trigger={
              <button className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-xs text-muted-foreground transition-colors hover:bg-accent">
                <ImageIcon className="size-5" />
                Add
              </button>
            }
          />
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={openIndex !== null} onOpenChange={(o) => !o && setOpenIndex(null)}>
        <DialogContent className="max-w-lg gap-3 p-4" showCloseButton>
          {active && (
            <>
              <DialogTitle className="sr-only">
                {plant.nickname} on {formatDate(active.date)}
              </DialogTitle>
              <div className="relative overflow-hidden rounded-xl bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={active.photoUrl}
                  alt={`${plant.nickname} on ${active.date}`}
                  className="max-h-[60vh] w-full object-contain"
                />
                {openIndex! > 0 && (
                  <NavButton side="left" onClick={() => setOpenIndex(openIndex! - 1)} />
                )}
                {openIndex! < photos.length - 1 && (
                  <NavButton side="right" onClick={() => setOpenIndex(openIndex! + 1)} />
                )}
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{formatDate(active.date)}</p>
                  {active.note && (
                    <p className="text-sm text-muted-foreground">{active.note}</p>
                  )}
                  {plant.acquiredDate && (
                    <p className="text-xs text-muted-foreground">
                      {spanPhrase(plant.acquiredDate, active.date)} into your care
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {openIndex! + 1} / {photos.length}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setCover(active.photoUrl)}
                  disabled={plant.photoUrl === active.photoUrl}
                >
                  <Star className="size-4" />
                  {plant.photoUrl === active.photoUrl ? "Cover photo" : "Set as cover"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-destructive"
                  onClick={() => deletePhoto(active)}
                >
                  <Trash2 className="size-4" /> Delete
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Snapshot({
  label,
  photo,
  onClick,
}: {
  label: string;
  photo: CareEvent & { photoUrl: string };
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="text-left">
      <div className="aspect-square overflow-hidden rounded-xl border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.photoUrl} alt={label} className="h-full w-full object-cover" />
      </div>
      <p className="mt-1.5 text-xs font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{formatDate(photo.date)}</p>
    </button>
  );
}

function NavButton({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={`absolute top-1/2 -translate-y-1/2 ${side === "left" ? "left-2" : "right-2"} flex size-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70`}
    >
      <Icon className="size-5" />
    </button>
  );
}
