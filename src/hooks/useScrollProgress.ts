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
        // Each section's "landing scrollY" is where the browser scrolls to
        // when you click `#slug` — section.offsetTop minus scroll-margin-top
        // from globals.css. Using these as the station boundaries makes the
        // HUD read exactly depth 0 at page load (scrollY = 0 → Entry start)
        // and exactly the station's depth after a rail jump (scrollY lands
        // on that station's landing). Compute scrollMargin at read time so
        // CTRL+zoom (which scales rem) keeps everything aligned.
        const rootFont = parseFloat(
          getComputedStyle(document.documentElement).fontSize,
        );
        const scrollMarginPx = 13 * rootFont; // mirrors `scroll-margin-top: 13rem`
        const landings = sections.map((s) =>
          Math.max(0, s.offsetTop - scrollMarginPx),
        );

        const scrollY = window.scrollY;
        let currentIndex = 0;
        for (let i = landings.length - 1; i >= 0; i--) {
          if (landings[i]! <= scrollY) {
            currentIndex = i;
            break;
          }
        }
        const nextIndex = Math.min(currentIndex + 1, landings.length - 1);
        const span = Math.max(1, landings[nextIndex]! - landings[currentIndex]!);
        const frac = Math.max(
          0,
          Math.min(1, (scrollY - landings[currentIndex]!) / span),
        );

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
