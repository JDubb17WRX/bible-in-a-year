"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Installability/offline caching is a nice-to-have, not required for
        // the app to function, so a failed registration is silently ignored.
      });
    }
  }, []);

  return null;
}
