"use client";

import { useMemo, useState } from "react";
import { Droplets, Leaf, SearchX, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useCellar } from "@/lib/cellar-provider";
import { careStatus, daysBetween, todayISO } from "@/lib/care";
import { PlantCard } from "@/components/plant-card";
import { AddPlantDialog } from "@/components/add-plant-dialog";
import { CollectionHealth } from "@/components/collection-health";
import {
  CollectionToolbar,
  type StatusFilter,
} from "@/components/collection-toolbar";

export default function CollectionPage() {
  const { ready, plants, events, waterPlants, undoEvents } = useCellar();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { needsWater, order, counts, wateredThisWeek } = useMemo(() => {
    const withStatus = plants.map((p) => ({
      plant: p,
      status: careStatus(
        p,
        events.filter((e) => e.plantId === p.id),
      ),
    }));
    // Sort the whole collection by urgency (most overdue first), then name.
    const order = [...withStatus].sort((a, b) => {
      if (a.status.daysUntilDue !== b.status.daysUntilDue)
        return a.status.daysUntilDue - b.status.daysUntilDue;
      return a.plant.nickname.localeCompare(b.plant.nickname);
    });
    const needsWater = order.filter((x) => x.status.status !== "happy");

    const counts = { happy: 0, thirsty: 0, overdue: 0 };
    for (const { status } of withStatus) counts[status.status]++;

    const today = todayISO();
    const wateredThisWeek = events.filter(
      (e) => e.type === "watered" && daysBetween(today, e.date) <= 6 && daysBetween(today, e.date) >= 0,
    ).length;

    return { needsWater, order, counts, wateredThisWeek };
  }, [plants, events]);

  function onWaterAll() {
    const ids = needsWater.map((x) => x.plant.id);
    if (ids.length === 0) return;
    const eventIds = waterPlants(ids);
    toast.success(`Watered ${ids.length} plant${ids.length === 1 ? "" : "s"}`, {
      description: "Your whole collection is happy now.",
      action: { label: "Undo", onClick: () => undoEvents(eventIds) },
    });
  }

  // Search matches name / species / scientific name / room; filter by status.
  const q = query.trim().toLowerCase();
  const filtering = q !== "" || statusFilter !== "all";
  const results = order.filter(({ plant, status }) => {
    if (statusFilter !== "all" && status.status !== statusFilter) return false;
    if (q) {
      const hay = [plant.nickname, plant.species, plant.scientificName, plant.location]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (!ready) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (plants.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Leaf className="size-8" strokeWidth={1.5} />
        </span>
        <h1 className="mt-6 text-2xl font-semibold">Your cellar is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Add your first plant and Cellar will keep track of when it needs water and
          how it grows over time.
        </p>
        <div className="mt-6">
          <AddPlantDialog />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Summary */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your collection</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {plants.length} plant{plants.length === 1 ? "" : "s"}
            {needsWater.length > 0 && (
              <>
                {" · "}
                <span className="font-medium text-foreground">
                  {needsWater.length} need{needsWater.length === 1 ? "s" : ""} attention
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Health at a glance */}
      <div className="mt-5">
        <CollectionHealth counts={counts} wateredThisWeek={wateredThisWeek} />
      </div>

      {/* Search + filter */}
      <div className="mt-6">
        <CollectionToolbar
          query={query}
          onQuery={setQuery}
          status={statusFilter}
          onStatus={setStatusFilter}
        />
      </div>

      {filtering ? (
        /* Filtered / searched results */
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {results.length} result{results.length === 1 ? "" : "s"}
          </h2>
          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {results.map(({ plant }) => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  events={events.filter((e) => e.plantId === plant.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-14 text-sm text-muted-foreground">
              <SearchX className="size-6" />
              No plants match. Try a different search or filter.
            </div>
          )}
        </section>
      ) : (
        <>
      {/* Needs water today */}
      {needsWater.length > 0 ? (
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Droplets className="size-4 text-primary" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Needs a drink
              </h2>
            </div>
            {needsWater.length > 1 && (
              <button
                onClick={onWaterAll}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Droplets className="size-3.5" /> Water all ({needsWater.length})
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {needsWater.map(({ plant }) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                events={events.filter((e) => e.plantId === plant.id)}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="mt-8 flex items-center gap-2 rounded-xl border border-happy-soft bg-happy-soft/50 px-4 py-3 text-sm text-happy-soft-foreground">
          <Sparkles className="size-4" />
          Everyone&apos;s happy — nothing needs water right now.
        </div>
      )}

      {/* Full collection */}
      <section className="mt-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          All plants
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {order.map(({ plant }) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              events={events.filter((e) => e.plantId === plant.id)}
            />
          ))}
        </div>
      </section>
        </>
      )}

      {/* Mobile add button */}
      <div className="fixed bottom-5 right-5 z-30 sm:hidden">
        <AddPlantDialog
          trigger={
            <button
              className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
              aria-label="Add plant"
            >
              <Leaf className="size-6" />
            </button>
          }
        />
      </div>
    </div>
  );
}
