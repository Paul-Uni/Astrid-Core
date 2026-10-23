"use client";

import { useEffect } from "react";
import { writeFromSections } from "@/store/useScrollStore";

/**
 * Single rAF reader that drives the whole app's camera + HUD + orbit rail.
 *
 * Reads real section bounding rects from the DOM each frame rather than a
 * flat `scrollY / scrollHeight` ratio. That matters because stations have
 * different natural heights (hero and about full-size, 02–05 placeholders
 * shrunk until Phase E): a ratio-based calculation would land on the wrong
 * station after jumping to a specific `#slug`. The section-based read keeps
 * active state in sync with what the user is actually looking at.
 */
export function useScrollProgress() {
  useEffect(() => {
    let raf = 0;
    let lastDepth = -1;

    const tick = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-station]"),
      ).sort((a, b) => a.offsetTop - b.offsetTop);

      if (sections.length > 1) {
        // Anchor: the vertical line one-third down the viewport (feels right
        // for "which section am I reading" vs. true center).
        const anchor = window.scrollY + window.innerHeight * 0.33;

        let currentIndex = 0;
        for (let i = sections.length - 1; i >= 0; i--) {
          if (sections[i]!.offsetTop <= anchor) {
            currentIndex = i;
            break;
          }
        }
        const nextIndex = Math.min(currentIndex + 1, sections.length - 1);
        const currentSec = sections[currentIndex]!;
        const nextSec = sections[nextIndex]!;

        const currentTop = currentSec.offsetTop;
        const nextTop = nextSec.offsetTop;
        const span = Math.max(1, nextTop - currentTop);
        const frac = Math.max(0, Math.min(1, (anchor - currentTop) / span));

        if (Math.abs(frac * 1000 - lastDepth) > 1) {
          writeFromSections(currentIndex, frac);
          lastDepth = frac * 1000;
        }
      }

      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, []);
}
