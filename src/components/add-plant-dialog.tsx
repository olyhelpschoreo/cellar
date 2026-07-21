"use client";

import { useRef, useState, type ReactNode } from "react";
import { Camera, Loader2, Plus, X } from "lucide-react";
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
import { LIGHT_LABELS, type LightLevel } from "@/lib/types";
import { todayISO } from "@/lib/care";
import { useCellar } from "@/lib/cellar-provider";
import { PlantPhoto } from "./plant-photo";
import { cn } from "@/lib/utils";

const LIGHTS: LightLevel[] = ["low", "medium", "bright"];

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AddPlantDialog({ trigger }: { trigger?: ReactNode }) {
  const { addPlant } = useCellar();
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [reading, setReading] = useState(false);
  const [nickname, setNickname] = useState("");
  const [species, setSpecies] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [location, setLocation] = useState("");
  const [light, setLight] = useState<LightLevel>("medium");
  const [waterEveryDays, setWaterEveryDays] = useState(7);
  const [acquiredDate, setAcquiredDate] = useState(todayISO());
  const [notes, setNotes] = useState("");

  function reset() {
    setPhotoUrl(undefined);
    setNickname("");
    setSpecies("");
    setScientificName("");
    setLocation("");
    setLight("medium");
    setWaterEveryDays(7);
    setAcquiredDate(todayISO());
    setNotes("");
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
    addPlant({
      nickname: nickname.trim(),
      species: species.trim(),
      scientificName: scientificName.trim() || undefined,
      photoUrl,
      location: location.trim() || undefined,
      light,
      waterEveryDays: Math.max(1, waterEveryDays || 1),
      acquiredDate,
      notes: notes.trim() || undefined,
      wateredToday: true,
    });
    reset();
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
        {trigger ?? (
          <Button className="gap-1.5">
            <Plus className="size-4" /> Add plant
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="border-b p-5">
          <DialogTitle>Add a plant</DialogTitle>
          <DialogDescription>
            A photo and a nickname is all you need — fill in the rest whenever.
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
              <Input
                id="species"
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                placeholder="Boston Fern"
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
              Add to collection
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
