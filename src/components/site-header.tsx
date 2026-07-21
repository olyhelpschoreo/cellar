import Link from "next/link";
import { Sprout } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { AddPlantDialog } from "./add-plant-dialog";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sprout className="size-5" strokeWidth={2} />
          </span>
          <span className="text-lg font-semibold tracking-tight">Cellar</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <div className="hidden sm:block">
            <AddPlantDialog />
          </div>
        </div>
      </div>
    </header>
  );
}
