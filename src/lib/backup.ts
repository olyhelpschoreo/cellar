// Backup / restore. The whole collection (plants + events, photos included as
// data URLs) serializes to a single JSON file the user can save and re-import —
// real insurance for a local-first app, and a way to move to a new device.

import { todayISO } from "./care";
import type { CellarSnapshot } from "./store";
import {
  CARE_EVENT_LABELS,
  type CareEvent,
  type CareEventType,
  type LightLevel,
  type Plant,
} from "./types";

const APP = "cellar";
const VERSION = 1;

const LIGHTS: LightLevel[] = ["low", "medium", "bright"];

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v : undefined;
}

/** Coerce a raw record into a valid Plant, or null if it's too broken to keep. */
function sanitizePlant(raw: unknown): Plant | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  const id = str(p.id);
  const nickname = str(p.nickname);
  if (!id || !nickname) return null; // no identity — can't safely keep it
  const water = Number(p.waterEveryDays);
  return {
    id,
    nickname,
    species: typeof p.species === "string" ? p.species : "",
    scientificName: str(p.scientificName),
    photoUrl: str(p.photoUrl),
    location: str(p.location),
    light: LIGHTS.includes(p.light as LightLevel) ? (p.light as LightLevel) : "medium",
    waterEveryDays: Number.isFinite(water) && water > 0 ? water : 7,
    acquiredDate: str(p.acquiredDate),
    notes: str(p.notes),
    createdAt: str(p.createdAt) ?? new Date().toISOString(),
  };
}

function sanitizeEvent(raw: unknown): CareEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const e = raw as Record<string, unknown>;
  const id = str(e.id);
  const plantId = str(e.plantId);
  const type = e.type as CareEventType;
  const date = str(e.date);
  if (!id || !plantId || !date || !(type in CARE_EVENT_LABELS)) return null;
  return { id, plantId, type, date, note: str(e.note), photoUrl: str(e.photoUrl) };
}

interface BackupFile {
  app: typeof APP;
  version: number;
  exportedAt: string;
  data: CellarSnapshot;
}

export function buildBackup(snapshot: CellarSnapshot): BackupFile {
  return {
    app: APP,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    data: { plants: snapshot.plants, events: snapshot.events },
  };
}

export function backupFilename(): string {
  return `cellar-backup-${todayISO()}.json`;
}

/** Serialize + trigger a download of the whole collection. */
export function downloadBackup(snapshot: CellarSnapshot): void {
  const blob = new Blob([JSON.stringify(buildBackup(snapshot), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = backupFilename();
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Parse a backup file's text into a snapshot. Accepts both the wrapped export
 * shape ({app, version, data}) and a bare {plants, events}. Throws a friendly
 * message on anything that isn't a Cellar backup.
 */
export function parseBackup(text: string): CellarSnapshot {
  let obj: unknown;
  try {
    obj = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  const record = obj as { data?: unknown; plants?: unknown; events?: unknown };
  const data = (record?.data ?? record) as { plants?: unknown; events?: unknown };
  if (!data || !Array.isArray(data.plants) || !Array.isArray(data.events)) {
    throw new Error("This doesn't look like a Cellar backup.");
  }
  // Sanitize each record so a hand-edited or partly-corrupt file can't poison
  // the collection (e.g. a missing waterEveryDays → NaN schedules). Broken
  // records are dropped, and events pointing at dropped plants are removed too.
  const plants = (data.plants as unknown[])
    .map(sanitizePlant)
    .filter((p): p is Plant => p !== null);
  const plantIds = new Set(plants.map((p) => p.id));
  const events = (data.events as unknown[])
    .map(sanitizeEvent)
    .filter((e): e is CareEvent => e !== null && plantIds.has(e.plantId));
  return { plants, events };
}
