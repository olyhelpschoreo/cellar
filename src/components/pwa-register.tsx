"use client";

import { useEffect } from "react";

/** Registers the service worker at the correct base-path scope (prod only). */
export function PwaRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    navigator.serviceWorker
      .register(`${base}/sw.js`, { scope: `${base}/` })
      .catch(() => {
        /* SW registration is best-effort; the app works without it. */
      });
  }, []);
  return null;
}
