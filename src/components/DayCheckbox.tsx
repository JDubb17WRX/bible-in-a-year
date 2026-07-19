"use client";

import { useState, useTransition } from "react";

type DayCheckboxProps = {
  day: number;
  initialComplete: boolean;
  label?: string;
};

export function DayCheckbox({ day, initialComplete, label = "Mark read" }: DayCheckboxProps) {
  const [complete, setComplete] = useState(initialComplete);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !complete;
    setComplete(next);

    startTransition(async () => {
      try {
        const response = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ day, complete: next }),
        });

        if (!response.ok) {
          setComplete(!next);
        }
      } catch {
        setComplete(!next);
      }
    });
  }

  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <input type="checkbox" checked={complete} disabled={isPending} onChange={toggle} />
      <span>{label}</span>
    </label>
  );
}
