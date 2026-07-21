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
  createPlant,
  deletePlant,
  loadSnapshot,
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
  logCare: (input: NewCareEvent) => void;
  waterPlant: (plantId: string) => void;
}

const CellarContext = createContext<CellarContextValue | null>(null);

export function CellarProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [events, setEvents] = useState<CareEvent[]>([]);

  useEffect(() => {
    const snap = loadSnapshot();
    setPlants(snap.plants);
    setEvents(snap.events);
    setReady(true);
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
  const logCare = useCallback((input: NewCareEvent) => sync(addCareEvent(input)), [sync]);
  const waterPlant = useCallback(
    (plantId: string) =>
      sync(addCareEvent({ plantId, type: "watered", date: todayISO() })),
    [sync],
  );

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
    }),
    [ready, plants, events, getPlant, addPlant, editPlant, removePlant, logCare, waterPlant],
  );

  return <CellarContext.Provider value={value}>{children}</CellarContext.Provider>;
}

export function useCellar(): CellarContextValue {
  const ctx = useContext(CellarContext);
  if (!ctx) throw new Error("useCellar must be used within a CellarProvider");
  return ctx;
}
