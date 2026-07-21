"use client";

import { useRef, useState, type ReactNode } from "react";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
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
import { useCellar } from "@/lib/cellar-provider";
import { todayISO } from "@/lib/care";
import { fileToDataUrl } from "@/lib/image";
import { cn } from "@/lib/utils";

/** Capture one dated, optionally-captioned growth photo for a plant. */
export function AddPhotoDialog({
  plantId,
  trigger,
}: {
  plantId: string;
  trigger?: ReactNode;
}) {
  const { logCare, undoEvents } = useCellar();
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [reading, setReading] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [caption, setCaption] = useState("");

  function reset() {
    setPhotoUrl(undefined);
    setDate(todayISO());
    setCaption("");
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setReading(true);
    try {
      setPhotoUrl(await fileToDataUrl(file));
    } finally {
      setReading(false);
    }
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!photoUrl) return;
    const id = logCare({
      plantId,
      type: "photo",
      date,
      photoUrl,
      note: caption.trim() || undefined,
    });
    toast.success("Photo added to the timeline", {
      action: { label: "Undo", onClick: () => undoEvents([id]) },
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
          <Button variant="outline" className="gap-1.5">
            <Camera className="size-4" /> Add photo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a growth photo</DialogTitle>
          <DialogDescription>
            Snap it today or backdate an older shot — the timeline sorts itself.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSave} className="flex flex-col gap-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onPick}
          />

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn(
              "relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors hover:bg-accent",
              photoUrl && "border-solid",
            )}
          >
            {reading ? (
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            ) : photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="New growth photo" className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                <ImagePlus className="size-7" />
                Tap to choose a photo
              </span>
            )}
            {photoUrl && !reading && (
              <span
                onClick={(ev) => {
                  ev.stopPropagation();
                  setPhotoUrl(undefined);
                }}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white"
                aria-label="Remove photo"
              >
                <X className="size-4" />
              </span>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="photo-date">Date</Label>
              <Input
                id="photo-date"
                type="date"
                value={date}
                max={todayISO()}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="photo-caption">Caption</Label>
              <Input
                id="photo-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="New leaf!"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!photoUrl}>
              Add to timeline
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
