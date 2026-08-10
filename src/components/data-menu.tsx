"use client";

import { useRef, useState } from "react";
import { Database, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCellar } from "@/lib/cellar-provider";
import { downloadBackup, parseBackup } from "@/lib/backup";
import type { CellarSnapshot } from "@/lib/store";

function plantWord(n: number): string {
  return `${n} plant${n === 1 ? "" : "s"}`;
}

/** Header menu: export the collection to a file, or restore from one. */
export function DataMenu() {
  const { plants, events, replaceAll } = useCellar();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<CellarSnapshot | null>(null);

  function onExport() {
    downloadBackup({ plants, events });
    toast.success("Backup downloaded", {
      description: `${plantWord(plants.length)} saved to a file.`,
    });
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file later
    if (!file) return;
    try {
      setPending(parseBackup(await file.text()));
    } catch (err) {
      toast.error("Couldn't read that file", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  function confirmImport() {
    if (!pending) return;
    replaceAll(pending);
    toast.success("Backup restored", {
      description: `${plantWord(pending.plants.length)} loaded.`,
    });
    setPending(null);
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onFile}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Backup and restore">
            <Database className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Backup &amp; restore</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onExport} className="gap-2">
            <Download className="size-4" /> Export backup
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              fileRef.current?.click();
            }}
            className="gap-2"
          >
            <Upload className="size-4" /> Restore from backup
          </DropdownMenuItem>
          <p className="px-2 pb-1.5 pt-1 text-xs text-muted-foreground">
            Your collection lives in this browser. Export a copy to keep it safe
            or move to another device.
          </p>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restore this backup?</DialogTitle>
            <DialogDescription>
              {`This replaces your current ${plantWord(plants.length)} with the ${plantWord(
                pending?.plants.length ?? 0,
              )} from the file. It can't be undone — export a backup first if you're unsure.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmImport}>
              Replace my collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
