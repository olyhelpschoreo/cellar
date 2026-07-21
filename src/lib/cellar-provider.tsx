"use client";

// Client-side state for the whole collection. Loads once from localStorage,
// keeps an in-memory copy React can render, and writes through on every
// mutation. When we move to Supabase this becomes a thin query/mutation layer.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CareEvent, Plant, PlantWithHistory } from "./types";
import {
  addCareEvent,
  addCareEvents,
  createPlant,
  deletePlant,
  loadSnapshot,
  removeCareEvents,
  updatePlant,
  type NewCareEvent,
  type NewPlantInput,
} from "./store";
import { todayISO } from "./care";

interface CellarContextValue {
  ready: boolean;
  plants: Plant[];
  events: CareEvent[];
  getPlant: (id: string) => PlantWithHistory | undefined;
  addPlant: (input: NewPlantInput) => void;
  editPlant: (id: string, patch: Partial<Plant>) => void;
  removePlant: (id: string) => void;
  /** Returns the new event's id so callers can offer Undo. */
  logCare: (input: NewCareEvent) => string;
  waterPlant: (plantId: string) => string;
  /** Water many plants at once; returns all new event ids for batch Undo. */
  waterPlants: (plantIds: string[]) => string[];
  undoEvents: (ids: string[]) => void;
}

const CellarContext = createContext<CellarContextValue | null>(null);

export function CellarProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [events, setEvents] = useState<CareEvent[]>([]);

  useEffect(() => {
    // localStorage is unavailable during SSR, so we hydrate the store on mount.
    const snap = loadSnapshot();
    /* eslint-disable react-hooks/set-state-in-effect */
    setPlants(snap.plants);
    setEvents(snap.events);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const sync = useCallback((snap: { plants: Plant[]; events: CareEvent[] }) => {
    setPlants(snap.plants);
    setEvents(snap.events);
  }, []);

  const getPlant = useCallback(
    (id: string): PlantWithHistory | undefined => {
      const plant = plants.find((p) => p.id === id);
      if (!plant) return undefined;
      const history = events
        .filter((e) => e.plantId === id)
        .sort((a, b) => (a.date < b.date ? 1 : -1));
      return { ...plant, events: history };
    },
    [plants, events],
  );

  const addPlant = useCallback((input: NewPlantInput) => sync(createPlant(input)), [sync]);
  const editPlant = useCallback(
    (id: string, patch: Partial<Plant>) => sync(updatePlant(id, patch)),
    [sync],
  );
  const removePlant = useCallback((id: string) => sync(deletePlant(id)), [sync]);

  const logCare = useCallback(
    (input: NewCareEvent) => {
      const { snapshot, event } = addCareEvent(input);
      sync(snapshot);
      return event.id;
    },
    [sync],
  );

  const waterPlant = useCallback(
    (plantId: string) => logCare({ plantId, type: "watered", date: todayISO() }),
    [logCare],
  );

  const waterPlants = useCallback(
    (plantIds: string[]) => {
      const today = todayISO();
      const { snapshot, events } = addCareEvents(
        plantIds.map((plantId) => ({ plantId, type: "watered" as const, date: today })),
      );
      sync(snapshot);
      return events.map((e) => e.id);
    },
    [sync],
  );

  const undoEvents = useCallback((ids: string[]) => sync(removeCareEvents(ids)), [sync]);

  const value = useMemo<CellarContextValue>(
    () => ({
      ready,
      plants,
      events,
      getPlant,
      addPlant,
      editPlant,
      removePlant,
      logCare,
      waterPlant,
      waterPlants,
      undoEvents,
    }),
    [
      ready,
      plants,
      events,
      getPlant,
      addPlant,
      editPlant,
      removePlant,
      logCare,
      waterPlant,
      waterPlants,
      undoEvents,
    ],
  );

  return <CellarContext.Provider value={value}>{children}</CellarContext.Provider>;
}

export function useCellar(): CellarContextValue {
  const ctx = useContext(CellarContext);
  if (!ctx) throw new Error("useCellar must be used within a CellarProvider");
  return ctx;
}
