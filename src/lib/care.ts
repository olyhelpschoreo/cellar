// The "alive" engine: pure functions that turn a plant + its care history
// into a health status and a watering schedule. No I/O, no React — easy to test
// and identical whether data comes from localStorage or Postgres.

import type { CareEvent, Plant } from "./types";

export type HealthStatus = "happy" | "thirsty" | "overdue";

export const STATUS_LABELS: Record<HealthStatus, string> = {
  happy: "Happy",
  thirsty: "Water soon",
  overdue: "Needs water",
};

/** Today as an ISO date string (YYYY-MM-DD), local time. */
export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse a YYYY-MM-DD string into a UTC-midnight epoch-day integer. */
function toEpochDay(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}

/** Whole-day difference `a - b` (positive when a is later). */
export function daysBetween(a: string, b: string): number {
  return toEpochDay(a) - toEpochDay(b);
}

/** Add `n` days to an ISO date, returning a new ISO date. */
export function addDays(iso: string, n: number): string {
  const ms = toEpochDay(iso) * 86_400_000 + n * 86_400_000;
  const dt = new Date(ms);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** The most recent watering date, falling back to acquired/created date. */
export function lastWateredDate(plant: Plant, events: CareEvent[]): string {
  const waterings = events
    .filter((e) => e.type === "watered")
    .map((e) => e.date)
    .sort();
  if (waterings.length) return waterings[waterings.length - 1];
  return plant.acquiredDate ?? plant.createdAt.slice(0, 10);
}

export function nextWaterDate(plant: Plant, events: CareEvent[]): string {
  return addDays(lastWateredDate(plant, events), plant.waterEveryDays);
}

export interface CareStatus {
  status: HealthStatus;
  /** Positive = days until due; negative = days overdue; 0 = due today. */
  daysUntilDue: number;
  nextWaterDate: string;
  lastWatered: string;
}

/** How wide the "water soon" amber band is, scaled to the watering interval. */
function thirstyWindow(waterEveryDays: number): number {
  return Math.max(1, Math.round(waterEveryDays * 0.2));
}

export function careStatus(
  plant: Plant,
  events: CareEvent[],
  today: string = todayISO(),
): CareStatus {
  const lastWatered = lastWateredDate(plant, events);
  const due = addDays(lastWatered, plant.waterEveryDays);
  const daysUntilDue = daysBetween(due, today);

  let status: HealthStatus;
  if (daysUntilDue < 0) status = "overdue";
  else if (daysUntilDue <= thirstyWindow(plant.waterEveryDays)) status = "thirsty";
  else status = "happy";

  return { status, daysUntilDue, nextWaterDate: due, lastWatered };
}

/** Human phrase for a schedule, e.g. "Overdue by 2 days", "Water in 3 days". */
export function duePhrase(s: CareStatus): string {
  if (s.daysUntilDue < 0) {
    const n = Math.abs(s.daysUntilDue);
    return `Overdue by ${n} day${n === 1 ? "" : "s"}`;
  }
  if (s.daysUntilDue === 0) return "Water today";
  if (s.daysUntilDue === 1) return "Water tomorrow";
  return `Water in ${s.daysUntilDue} days`;
}

/** Compact schedule phrase for tight card footers, e.g. "7d overdue". */
export function duePhraseShort(s: CareStatus): string {
  if (s.daysUntilDue < 0) return `${Math.abs(s.daysUntilDue)}d overdue`;
  if (s.daysUntilDue === 0) return "Due today";
  if (s.daysUntilDue === 1) return "Due tomorrow";
  return `Due in ${s.daysUntilDue}d`;
}

/** Relative phrasing for a past date: "Today", "Yesterday", "5 days ago". */
export function relativeDay(iso: string, today: string = todayISO()): string {
  const diff = daysBetween(today, iso);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 30) return `${diff} days ago`;
  if (diff < 365) {
    const m = Math.round(diff / 30);
    return `${m} month${m === 1 ? "" : "s"} ago`;
  }
  const y = (diff / 365).toFixed(1).replace(/\.0$/, "");
  return `${y} year${y === "1" ? "" : "s"} ago`;
}
