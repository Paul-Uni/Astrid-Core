"use client";

import { useEffect } from "react";
import { writeFromSections } from "@/store/useScrollStore";

/**
 * Drives the scroll store (camera, HUD, orbit rail) from the page scroll.
 *
 * Station boundaries are each section's "landing scrollY": the position the
 * browser scrolls to on a `#slug` jump (offsetTop minus scroll-margin-top).
 * That way the HUD reads depth 0 at load and exactly a station's depth after
 * a rail jump.
 *
 * Landings are measured only when layout can change (resize, content size
 * change, fonts loaded). Scroll events just do a cheap lookup, batched to
 * one update per frame. Nothing runs while the page is idle.
 */
export function useScrollProgress() {
  useEffect(() => {
    let landings: number[] = [];
    let raf = 0;

    const measure = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-station]"),
      ).sort((a, b) => a.offsetTop - b.offsetTop);
      landings = sections.map((s) => {
        // Read the margin from CSS so the rule lives in one place and
        // follows CTRL+zoom (it's in rem).
        const margin = parseFloat(getComputedStyle(s).scrollMarginTop) || 0;
        return Math.max(0, s.offsetTop - margin);
      });
    };

    const update = () => {
      raf = 0;
      if (landings.length < 2) return;

      const scrollY = window.scrollY;
      let current = 0;
      for (let i = landings.length - 1; i >= 0; i--) {
        if (landings[i]! <= scrollY) {
          current = i;
          break;
        }
      }
      const next = Math.min(current + 1, landings.length - 1);
      const span = Math.max(1, landings[next]! - landings[current]!);
      const frac = Math.max(0, Math.min(1, (scrollY - landings[current]!) / span));
      writeFromSections(current, frac);
    };

    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    const remeasure = () => {
      measure();
      schedule();
    };

    remeasure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    const resizeObserver = new ResizeObserver(remeasure);
    resizeObserver.observe(document.body);
    document.fonts?.ready.then(remeasure);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      resizeObserver.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);
}
