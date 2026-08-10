// Care reminders — backend-free watering notifications.
//
// A static PWA can't wake a closed phone (that needs a push server, a future
// Pro feature). What it CAN do reliably: when the app is opened with reminders
// enabled, fire one OS notification a day listing the plants that need water.
// Notifications are shown through the service worker registration so they work
// on installed mobile PWAs, with a plain Notification() fallback.

import { careStatus, todayISO } from "./care";
import type { CareEvent, Plant } from "./types";

const KEY_ENABLED = "cellar.reminders.enabled";
const KEY_LAST = "cellar.reminders.lastNotified";
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function permission(): NotificationPermission | "unsupported" {
  return notificationsSupported() ? Notification.permission : "unsupported";
}

/** Enabled means the user opted in AND the browser still grants permission. */
export function remindersEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY_ENABLED) === "1" && permission() === "granted";
}

export function setRemindersEnabled(on: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_ENABLED, on ? "1" : "0");
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  return Notification.requestPermission();
}

/** Plants due today or overdue — the actionable "water now" set. */
export function duePlants(plants: Plant[], events: CareEvent[]): Plant[] {
  return plants.filter(
    (p) =>
      careStatus(p, events.filter((e) => e.plantId === p.id)).daysUntilDue <= 0,
  );
}

async function show(title: string, options: NotificationOptions): Promise<void> {
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, options);
      return;
    }
  } catch {
    /* fall through to the plain constructor */
  }
  try {
    new Notification(title, options);
  } catch {
    /* notifications unavailable — nothing more to do */
  }
}

/**
 * Show the watering reminder if it's warranted. Guarded to at most once per
 * day unless `force` (used to confirm right after the user enables it).
 */
export async function notifyDue(
  plants: Plant[],
  events: CareEvent[],
  opts: { force?: boolean } = {},
): Promise<void> {
  if (permission() !== "granted") return;

  const due = duePlants(plants, events);
  const today = todayISO();

  if (!opts.force) {
    if (due.length === 0) return;
    if (localStorage.getItem(KEY_LAST) === today) return;
  }
  localStorage.setItem(KEY_LAST, today);

  const icon = `${BASE}/icon-192.png`;
  const options: NotificationOptions = {
    icon,
    badge: icon,
    tag: "cellar-water",
    data: { url: `${BASE}/` },
  };

  if (due.length === 0) {
    await show("Reminders are on", {
      ...options,
      body: "I'll nudge you here when a plant needs water.",
    });
    return;
  }

  const names = due.slice(0, 3).map((p) => p.nickname);
  const title = `${due.length} plant${due.length === 1 ? "" : "s"} need water`;
  const body =
    due.length <= 3
      ? `${names.join(", ")} ${due.length === 1 ? "is" : "are"} thirsty. Open Cellar to water.`
      : `${names.join(", ")} and ${due.length - 3} more. Open Cellar to water.`;

  await show(title, { ...options, body });
}
