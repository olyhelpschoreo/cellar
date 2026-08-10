"use client";

import { useEffect } from "react";
import { useCellar } from "@/lib/cellar-provider";
import { notifyDue, remindersEnabled } from "@/lib/reminders";

/**
 * Fires the daily watering reminder when the app opens (and when the tab
 * becomes visible again), if reminders are enabled. The once-per-day guard
 * lives in notifyDue, so re-runs on data changes are harmless.
 */
export function ReminderRunner() {
  const { ready, plants, events } = useCellar();

  useEffect(() => {
    if (!ready || !remindersEnabled()) return;
    void notifyDue(plants, events);

    const onVisible = () => {
      if (document.visibilityState === "visible" && remindersEnabled()) {
        void notifyDue(plants, events);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [ready, plants, events]);

  return null;
}
