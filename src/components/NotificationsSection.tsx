"use client";

import { useState, useSyncExternalStore } from "react";
import { THEME_COOKIE_NAME, type ThemePreference } from "@/lib/theme";
import { DAILY_REMINDER_ENABLED_KEY } from "@/lib/notification-prefs";

const PREFS_CHANGED_EVENT = "bible-prefs-changed";

function notifyPrefsChanged() {
  window.dispatchEvent(new Event(PREFS_CHANGED_EVENT));
}

function subscribeToPrefsChanges(callback: () => void) {
  window.addEventListener(PREFS_CHANGED_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(PREFS_CHANGED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function readThemeCookie(): ThemePreference {
  const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE_NAME}=([^;]*)`));
  return match?.[1] === "dark" ? "dark" : "light";
}

function readReminderEnabled(): boolean {
  return localStorage.getItem(DAILY_REMINDER_ENABLED_KEY) === "true";
}

export function NotificationsSection() {
  const darkMode = useSyncExternalStore(
    subscribeToPrefsChanges,
    () => readThemeCookie() === "dark",
    () => false,
  );
  const reminderEnabled = useSyncExternalStore(subscribeToPrefsChanges, readReminderEnabled, () => false);
  const [reminderBlocked, setReminderBlocked] = useState(false);

  function toggleDarkMode() {
    const next: ThemePreference = darkMode ? "light" : "dark";
    document.cookie = `${THEME_COOKIE_NAME}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.dataset.theme = next;
    notifyPrefsChanged();
  }

  async function toggleReminder() {
    if (reminderEnabled) {
      localStorage.setItem(DAILY_REMINDER_ENABLED_KEY, "false");
      notifyPrefsChanged();
      return;
    }

    if (typeof Notification === "undefined") {
      setReminderBlocked(true);
      return;
    }

    const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();

    if (permission !== "granted") {
      setReminderBlocked(true);
      return;
    }

    setReminderBlocked(false);
    localStorage.setItem(DAILY_REMINDER_ENABLED_KEY, "true");
    notifyPrefsChanged();
  }

  return (
    <>
      <p className="settings-section-label">Notifications</p>
      <div className="settings-group">
        <div className="settings-row">
          <span className="settings-row-label">Daily reminder</span>
          <button
            type="button"
            className={`toggle-switch${reminderEnabled ? " on" : ""}`}
            onClick={toggleReminder}
            aria-label="Daily reminder"
            aria-pressed={reminderEnabled}
          >
            <span className="toggle-switch-knob" />
          </button>
        </div>
        <div className="settings-row">
          <span className="settings-row-label">Dark mode</span>
          <button
            type="button"
            className={`toggle-switch${darkMode ? " on" : ""}`}
            onClick={toggleDarkMode}
            aria-label="Dark mode"
            aria-pressed={darkMode}
          >
            <span className="toggle-switch-knob" />
          </button>
        </div>
      </div>
      {reminderBlocked ? (
        <p className="error-text" style={{ marginTop: -10, marginBottom: 18 }}>
          Notifications are blocked in your browser settings.
        </p>
      ) : null}
    </>
  );
}
