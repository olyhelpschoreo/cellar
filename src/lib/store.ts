// Local persistence layer. Everything lives in one localStorage blob for now;
// the function signatures are async so swapping in a Supabase-backed
// implementation later is a drop-in (the UI already awaits).

import type { CareEvent, Plant } from "./types";
import { todayISO } from "./care";

const STORAGE_KEY = "cellar.v1";

interface DB {
  plants: Plant[];
  events: CareEvent[];
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Math.floor(performance.now() * 1000)}_${performance.now()}`;
}

function emptyDB(): DB {
  return { plants: [], events: [] };
}

function read(): DB {
  if (typeof window === "undefined") return emptyDB();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedDB();
      write(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as DB;
    return { plants: parsed.plants ?? [], events: parsed.events ?? [] };
  } catch {
    return emptyDB();
  }
}

function write(db: DB): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// ---- Public API -----------------------------------------------------------

export interface CellarSnapshot {
  plants: Plant[];
  events: CareEvent[];
}

export function loadSnapshot(): CellarSnapshot {
  return read();
}

export type NewPlantInput = Omit<Plant, "id" | "createdAt"> & {
  /** Optional initial "watered" bootstrap so a brand-new plant starts happy. */
  wateredToday?: boolean;
};

export function createPlant(input: NewPlantInput): CellarSnapshot {
  const db = read();
  const now = new Date();
  const { wateredToday, ...rest } = input;
  const plant: Plant = {
    ...rest,
    id: uid(),
    createdAt: now.toISOString(),
  };
  db.plants.push(plant);
  if (wateredToday) {
    db.events.push({
      id: uid(),
      plantId: plant.id,
      type: "watered",
      date: todayISO(now),
    });
  }
  if (plant.photoUrl) {
    db.events.push({
      id: uid(),
      plantId: plant.id,
      type: "photo",
      date: todayISO(now),
      photoUrl: plant.photoUrl,
      note: "Joined the collection",
    });
  }
  write(db);
  return db;
}

export function updatePlant(id: string, patch: Partial<Plant>): CellarSnapshot {
  const db = read();
  db.plants = db.plants.map((p) => (p.id === id ? { ...p, ...patch, id } : p));
  write(db);
  return db;
}

export function deletePlant(id: string): CellarSnapshot {
  const db = read();
  db.plants = db.plants.filter((p) => p.id !== id);
  db.events = db.events.filter((e) => e.plantId !== id);
  write(db);
  return db;
}

export type NewCareEvent = Omit<CareEvent, "id">;

export function addCareEvent(input: NewCareEvent): CellarSnapshot {
  const db = read();
  db.events.push({ ...input, id: uid() });
  write(db);
  return db;
}

// ---- Seed (first-run demo) -------------------------------------------------

function daysAgoISO(n: number): string {
  const dt = new Date();
  dt.setDate(dt.getDate() - n);
  return todayISO(dt);
}

/** A small, opinionated starter collection so the app never opens empty. */
function seedDB(): DB {
  const now = new Date().toISOString();
  const mk = (p: Omit<Plant, "createdAt">): Plant => ({ ...p, createdAt: now });

  const plants: Plant[] = [
    mk({
      id: "seed-monstera",
      nickname: "Monty",
      species: "Monstera Deliciosa",
      scientificName: "Monstera deliciosa",
      location: "Living room",
      light: "bright",
      waterEveryDays: 9,
      acquiredDate: daysAgoISO(220),
      notes: "Loves the corner by the window. New leaf unfurling!",
    }),
    mk({
      id: "seed-fern",
      nickname: "Fernie",
      species: "Boston Fern",
      scientificName: "Nephrolepis exaltata",
      location: "Bathroom",
      light: "medium",
      waterEveryDays: 4,
      acquiredDate: daysAgoISO(60),
      notes: "Thirsty type — likes humidity.",
    }),
    mk({
      id: "seed-snake",
      nickname: "Sly",
      species: "Snake Plant",
      scientificName: "Dracaena trifasciata",
      location: "Bedroom",
      light: "low",
      waterEveryDays: 21,
      acquiredDate: daysAgoISO(400),
      notes: "Nearly unkillable. The starter plant.",
    }),
    mk({
      id: "seed-pothos",
      nickname: "Goldie",
      species: "Golden Pothos",
      scientificName: "Epipremnum aureum",
      location: "Kitchen shelf",
      light: "medium",
      waterEveryDays: 7,
      acquiredDate: daysAgoISO(120),
      notes: "Trailing nicely along the shelf.",
    }),
  ];

  // Watering history that lands each plant in a different health state today.
  const events: CareEvent[] = [
    { id: "ev-1", plantId: "seed-monstera", type: "watered", date: daysAgoISO(3) }, // happy
    { id: "ev-2", plantId: "seed-fern", type: "watered", date: daysAgoISO(4) }, // due today-ish
    { id: "ev-3", plantId: "seed-snake", type: "watered", date: daysAgoISO(28) }, // overdue
    { id: "ev-4", plantId: "seed-pothos", type: "watered", date: daysAgoISO(6) }, // water soon
    { id: "ev-5", plantId: "seed-monstera", type: "fertilized", date: daysAgoISO(20) },
    { id: "ev-6", plantId: "seed-snake", type: "repotted", date: daysAgoISO(90) },
  ];

  return { plants, events };
}
