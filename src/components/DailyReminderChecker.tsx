"use client";

import { useEffect } from "react";
import { DAILY_REMINDER_ENABLED_KEY, DAILY_REMINDER_LAST_SHOWN_KEY } from "@/lib/notification-prefs";

// Foreground-only nudge: this app has no push server, so a reminder can only
// fire while the tab is actually open. Shows at most once per calendar day.
export function DailyReminderChecker({ complete }: { complete: boolean }) {
  useEffect(() => {
    if (complete) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    if (localStorage.getItem(DAILY_REMINDER_ENABLED_KEY) !== "true") return;

    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(DAILY_REMINDER_LAST_SHOWN_KEY) === today) return;

    new Notification("Bible in a Year", {
      body: "You haven't marked today's reading as read yet.",
    });
    localStorage.setItem(DAILY_REMINDER_LAST_SHOWN_KEY, today);
  }, [complete]);

  return null;
}
