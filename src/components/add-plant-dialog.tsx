"use client";

import { useRef, useState, type ReactNode } from "react";
import { Camera, Loader2, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LIGHT_LABELS, type LightLevel, type Plant } from "@/lib/types";
import { todayISO } from "@/lib/care";
import { useCellar } from "@/lib/cellar-provider";
import type { PlantSpecies } from "@/lib/plant-library";
import { fileToDataUrl } from "@/lib/image";
import { PlantPhoto } from "./plant-photo";
import { SpeciesCombobox } from "./species-combobox";
import { cn } from "@/lib/utils";

const LIGHTS: LightLevel[] = ["low", "medium", "bright"];

/**
 * The plant form dialog. Without `plant` it creates a new plant; with `plant`
 * it edits that one (fields prefilled, saved via editPlant).
 */
export function AddPlantDialog({
  trigger,
  plant,
}: {
  trigger?: ReactNode;
  plant?: Plant;
}) {
  const editing = Boolean(plant);
  const { addPlant, editPlant } = useCellar();
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [photoUrl, setPhotoUrl] = useState<string | undefined>(plant?.photoUrl);
  const [reading, setReading] = useState(false);
  const [nickname, setNickname] = useState(plant?.nickname ?? "");
  const [species, setSpecies] = useState(plant?.species ?? "");
  const [scientificName, setScientificName] = useState(plant?.scientificName ?? "");
  const [location, setLocation] = useState(plant?.location ?? "");
  const [light, setLight] = useState<LightLevel>(plant?.light ?? "medium");
  const [waterEveryDays, setWaterEveryDays] = useState(plant?.waterEveryDays ?? 7);
  const [acquiredDate, setAcquiredDate] = useState(plant?.acquiredDate ?? todayISO());
  const [notes, setNotes] = useState(plant?.notes ?? "");

  // On close, discard unsaved changes: reset to the plant's values (edit) or
  // to an empty form (add).
  function reset() {
    setPhotoUrl(plant?.photoUrl);
    setNickname(plant?.nickname ?? "");
    setSpecies(plant?.species ?? "");
    setScientificName(plant?.scientificName ?? "");
    setLocation(plant?.location ?? "");
    setLight(plant?.light ?? "medium");
    setWaterEveryDays(plant?.waterEveryDays ?? 7);
    setAcquiredDate(plant?.acquiredDate ?? todayISO());
    setNotes(plant?.notes ?? "");
  }

  function applySpecies(s: PlantSpecies) {
    setSpecies(s.common);
    setScientificName(s.scientific);
    setWaterEveryDays(s.waterEveryDays);
    setLight(s.light);
  }

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setReading(true);
    try {
      setPhotoUrl(await fileToDataUrl(file));
    } finally {
      setReading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) return;
    const fields = {
      nickname: nickname.trim(),
      species: species.trim(),
      scientificName: scientificName.trim() || undefined,
      photoUrl,
      location: location.trim() || undefined,
      light,
      waterEveryDays: Math.max(1, waterEveryDays || 1),
      acquiredDate,
      notes: notes.trim() || undefined,
    };
    if (editing && plant) {
      editPlant(plant.id, fields);
      toast.success(`Saved changes to ${fields.nickname}`);
    } else {
      // A brand-new plant starts "watered today" so its schedule begins now.
      addPlant({ ...fields, wateredToday: true });
      reset(); // clear the form so the next "Add plant" starts blank
    }
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ??
          (editing ? (
            <Button variant="outline" className="gap-1.5">
              <Pencil className="size-4" /> Edit
            </Button>
          ) : (
            <Button className="gap-1.5">
              <Plus className="size-4" /> Add plant
            </Button>
          ))}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="border-b p-5">
          <DialogTitle>{editing ? "Edit plant" : "Add a plant"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the details — changes save to your collection."
              : "A photo and a nickname is all you need — fill in the rest whenever."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-5 p-5">
          {/* Photo */}
          <div className="flex items-center gap-4">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-xl border">
              <PlantPhoto
                photoUrl={photoUrl}
                name={nickname || "New plant"}
                seed={nickname || "new"}
                glyphClassName="size-8"
              />
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl(undefined)}
                  className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
                  aria-label="Remove photo"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <div className="space-y-1.5">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={onPickPhoto}
              />
              <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                onClick={() => fileRef.current?.click()}
                disabled={reading}
              >
                {reading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4" />
                )}
                {photoUrl ? "Change photo" : "Add photo"}
              </Button>
              <p className="text-xs text-muted-foreground">Optional, but it looks great.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nickname">Nickname *</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Fernie"
                autoFocus
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="species">Species</Label>
              <SpeciesCombobox
                id="species"
                value={species}
                onValueChange={setSpecies}
                onSelect={applySpecies}
                placeholder="Start typing…"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="scientific">Scientific name</Label>
            <Input
              id="scientific"
              value={scientificName}
              onChange={(e) => setScientificName(e.target.value)}
              placeholder="Nephrolepis exaltata"
            />
          </div>

          {/* Light */}
          <div className="space-y-1.5">
            <Label>Light</Label>
            <div className="grid grid-cols-3 gap-2">
              {LIGHTS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLight(l)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm transition-colors",
                    light === l
                      ? "border-primary bg-primary/10 font-medium text-primary"
                      : "hover:bg-accent",
                  )}
                >
                  {LIGHT_LABELS[l]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="water">Water every (days)</Label>
              <Input
                id="water"
                type="number"
                min={1}
                value={waterEveryDays}
                onChange={(e) => setWaterEveryDays(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Living room"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="acquired">Acquired date</Label>
            <Input
              id="acquired"
              type="date"
              value={acquiredDate}
              max={todayISO()}
              onChange={(e) => setAcquiredDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Where it likes to sit, quirks, anything…"
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!nickname.trim()}>
              {editing ? "Save changes" : "Add to collection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
