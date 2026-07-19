"use client";

import { useState } from "react";

export function SignOutButton() {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      const payload = (await response.json().catch(() => null)) as { redirectTo?: string } | null;
      window.location.href = payload?.redirectTo || "/";
    } catch {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="sign-out" onClick={handleClick} disabled={busy}>
      {busy ? "Signing out..." : "Sign out"}
    </button>
  );
}
