"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

type OnboardingFormProps = {
  initialStartDate?: string;
  initialTranslation?: "esv" | "web";
  submitLabel?: string;
};

export function OnboardingForm({
  initialStartDate,
  initialTranslation = "esv",
  submitLabel = "Start reading",
}: OnboardingFormProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState(initialStartDate || todayIsoDate());
  const [translation, setTranslation] = useState<"esv" | "web">(initialTranslation);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, translation }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Could not save your settings.");
      }

      router.push("/");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save your settings.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="startDate">Day 1 starts on</label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="translation">Translation</label>
        <select
          id="translation"
          value={translation}
          onChange={(event) => setTranslation(event.target.value as "esv" | "web")}
        >
          <option value="esv">ESV (English Standard Version)</option>
          <option value="web">WEB (World English Bible, public domain)</option>
        </select>
      </div>

      {error ? <p style={{ color: "#b3372f" }}>{error}</p> : null}

      <button type="submit" className="btn" disabled={busy}>
        {busy ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
