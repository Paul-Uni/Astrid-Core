"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe reader of (prefers-reduced-motion: reduce).
 * Starts as `false` on the server so content renders consistently;
 * flips to the real value on mount.
 */
export function usePrefersReducedMotion() {
  const [prefers, setPrefers] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefers(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefers(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return prefers;
}
