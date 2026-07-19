"use client";

import { useState, useTransition } from "react";

type DayCheckboxProps = {
  day: number;
  initialComplete: boolean;
};

export function DayCheckbox({ day, initialComplete }: DayCheckboxProps) {
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
    <button
      type="button"
      className={`mark-read-btn${complete ? " complete" : ""}`}
      onClick={toggle}
      disabled={isPending}
    >
      {complete ? "✓ Read today" : "Mark as read"}
    </button>
  );
}
