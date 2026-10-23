"use client";

import { useEffect } from "react";
import { writeFromProgress } from "@/store/useScrollStore";

/**
 * Single rAF reader that drives the whole app's camera + HUD + orbit rail.
 * Reads `scrollY / (scrollHeight - innerHeight)` once per frame and writes
 * to the Zustand store. Zoom-agnostic by construction — the ratio is
 * independent of CSS pixel density.
 */
export function useScrollProgress() {
  useEffect(() => {
    let raf = 0;
    let last = -1;

    const tick = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;

      // Only write if changed enough to matter — HUD updates integer theta/depth.
      if (Math.abs(progress - last) > 0.0005) {
        writeFromProgress(progress);
        last = progress;
      }

      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, []);
}
