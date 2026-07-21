// Maps a health status to design-system token classes. Centralised so a status
// colour is defined once and never drifts between the card, badge, and ring.

import type { HealthStatus } from "./care";

interface StatusStyle {
  /** Solid dot / ring colour. */
  dot: string;
  /** Soft chip background + its paired foreground. */
  chip: string;
  /** Ring colour class (border) for the photo. */
  ring: string;
}

export const STATUS_STYLES: Record<HealthStatus, StatusStyle> = {
  happy: {
    dot: "bg-happy",
    chip: "bg-happy-soft text-happy-soft-foreground",
    ring: "ring-happy/40",
  },
  thirsty: {
    dot: "bg-thirsty",
    chip: "bg-thirsty-soft text-thirsty-soft-foreground",
    ring: "ring-thirsty/50",
  },
  overdue: {
    dot: "bg-overdue",
    chip: "bg-overdue-soft text-overdue-soft-foreground",
    ring: "ring-overdue/60",
  },
};
