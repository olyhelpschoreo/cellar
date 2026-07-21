// Core domain model for Cellar (Plants vertical).
// Dates are stored as ISO date strings (YYYY-MM-DD) at day granularity —
// plant care doesn't need sub-day precision and day strings compare cleanly.

export type LightLevel = "low" | "medium" | "bright";

export const LIGHT_LABELS: Record<LightLevel, string> = {
  low: "Low light",
  medium: "Medium light",
  bright: "Bright light",
};

export type CareEventType =
  | "watered"
  | "fertilized"
  | "repotted"
  | "pruned"
  | "photo"
  | "noted";

export const CARE_EVENT_LABELS: Record<CareEventType, string> = {
  watered: "Watered",
  fertilized: "Fertilized",
  repotted: "Repotted",
  pruned: "Pruned",
  photo: "Photo",
  noted: "Note",
};

export interface CareEvent {
  id: string;
  plantId: string;
  type: CareEventType;
  /** ISO date (YYYY-MM-DD) the event happened. */
  date: string;
  note?: string;
  /** For `photo` events (growth timeline): a data/URL string for the image. */
  photoUrl?: string;
}

export interface Plant {
  id: string;
  /** What the owner calls it, e.g. "Fernie". */
  nickname: string;
  /** Common name, e.g. "Boston Fern". */
  species: string;
  /** Latin name, optional, e.g. "Nephrolepis exaltata". */
  scientificName?: string;
  /** Hero photo — data URL in local mode, Storage URL later. */
  photoUrl?: string;
  /** Room / spot in the home. */
  location?: string;
  light: LightLevel;
  /** How often it wants water, in days. */
  waterEveryDays: number;
  /** ISO date the plant joined the collection. */
  acquiredDate?: string;
  notes?: string;
  /** ISO timestamp of creation, used for stable sorting. */
  createdAt: string;
}

/** A plant plus its care history — the shape the UI consumes. */
export interface PlantWithHistory extends Plant {
  events: CareEvent[];
}
