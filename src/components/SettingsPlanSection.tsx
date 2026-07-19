"use client";

import { useState } from "react";
import { OnboardingForm } from "@/components/OnboardingForm";
import { formatShortDate } from "@/lib/day-math";
import type { Translation } from "@/lib/reading-progress";

type SettingsPlanSectionProps = {
  startDate: string;
  translation: Translation;
};

export function SettingsPlanSection({ startDate, translation }: SettingsPlanSectionProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="card">
        <OnboardingForm
          initialStartDate={startDate}
          initialTranslation={translation}
          submitLabel="Save changes"
          onSaved={() => setEditing(false)}
        />
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginTop: 10 }}
          onClick={() => setEditing(false)}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="settings-group">
      <button type="button" className="settings-row settings-row-link" onClick={() => setEditing(true)}>
        <span className="settings-row-label">Start date</span>
        <span className="settings-row-value">{formatShortDate(startDate)} &rsaquo;</span>
      </button>
      <button type="button" className="settings-row settings-row-link" onClick={() => setEditing(true)}>
        <span className="settings-row-label">Translation</span>
        <span className="settings-row-value">{translation === "esv" ? "ESV" : "WEB"} &rsaquo;</span>
      </button>
    </div>
  );
}
