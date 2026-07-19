// Daily reminders are device-local (no push server exists for this app), so
// the preference and last-shown marker both live in localStorage rather than
// the account's server-side settings.
export const DAILY_REMINDER_ENABLED_KEY = "bible-daily-reminder-enabled";
export const DAILY_REMINDER_LAST_SHOWN_KEY = "bible-daily-reminder-last-shown";
