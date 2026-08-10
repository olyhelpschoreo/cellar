"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCellar } from "@/lib/cellar-provider";
import {
  notificationsSupported,
  notifyDue,
  permission,
  remindersEnabled,
  requestPermission,
  setRemindersEnabled,
} from "@/lib/reminders";

/** Header bell to enable/disable watering reminders. */
export function ReminderToggle() {
  const { plants, events } = useCellar();
  const [supported, setSupported] = useState(true);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setSupported(notificationsSupported());
    setEnabled(remindersEnabled());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  if (!supported) return null;

  async function toggle() {
    if (enabled) {
      setRemindersEnabled(false);
      setEnabled(false);
      toast("Reminders off");
      return;
    }
    const perm =
      permission() === "granted" ? "granted" : await requestPermission();
    if (perm === "granted") {
      setRemindersEnabled(true);
      setEnabled(true);
      await notifyDue(plants, events, { force: true });
      toast.success("Reminders on", {
        description:
          "I'll nudge you when plants need water and you open Cellar.",
      });
    } else {
      toast.error("Notifications are blocked", {
        description: "Allow notifications for Cellar in your browser settings.",
      });
    }
  }

  const Icon = enabled ? BellRing : Bell;
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={enabled ? "Turn off watering reminders" : "Turn on watering reminders"}
      aria-pressed={enabled}
      onClick={toggle}
    >
      <Icon className={enabled ? "size-5 text-primary" : "size-5"} />
    </Button>
  );
}
