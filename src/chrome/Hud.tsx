"use client";

import { useEffect, useRef, useState } from "react";
import { useScrollStore } from "@/store/useScrollStore";

/** Extra room around the HUD when checking for panels, CSS px: it fades just before a panel touches it. */
const CLEARANCE = 8;

/**
 * Bottom-left HUD, one line each: cam.θ, depth, core, then "↓ SCROLL TO ORBIT".
 * θ and depth count live while scrolling via the Zustand store.
 * At station 5, "CORE REACHED" replaces the scroll prompt (DESIGN.md).
 * Fades back (--hud-covered) while a panel scrolls through it, so the two texts never overlap.
 * Hidden on phones: there the two lines sit in the page at 00 and 05.
 */
export function Hud() {
  const station = useScrollStore((s) => s.station);
  const theta = useScrollStore((s) => s.theta);
  const depth = useScrollStore((s) => s.depth);
  const ref = useRef<HTMLDivElement>(null);
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    let raf = 0;
    const check = () => {
      raf = 0;
      const hud = ref.current?.getBoundingClientRect();
      if (!hud || hud.width === 0) return;
      let hit = false;
      for (const el of document.querySelectorAll("[data-panel]")) {
        const r = el.getBoundingClientRect();
        if (
          r.left < hud.right + CLEARANCE &&
          r.right > hud.left - CLEARANCE &&
          r.top < hud.bottom + CLEARANCE &&
          r.bottom > hud.top - CLEARANCE
        ) {
          hit = true;
          break;
        }
      }
      setCovered(hit);
    };
    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const atCore = station === 5;

  return (
    <div
      ref={ref}
      className={
        "pointer-events-none fixed bottom-6 left-6 z-40 flex flex-col items-start gap-1.5 transition-opacity duration-[var(--dur-ui)] ease-[var(--ease-out)] motion-reduce:transition-none max-md:hidden " +
        (covered ? "opacity-[var(--hud-covered)]" : "opacity-100")
      }
      role="status"
      aria-live="polite"
    >
      <span aria-hidden className="flex flex-col gap-0.5 font-mono text-mono-data text-ice/75 max-md:hidden">
        <span>{`cam.θ ${theta.toString().padStart(3, "0")}°`}</span>
        <span>{`depth ${depth.toString().padStart(4, "0")}`}</span>
        <span>core: astrid</span>
      </span>
      <span className="font-mono text-mono-label uppercase text-ice/85">
        {atCore ? (
          <>
            <span
              aria-hidden
              className="mr-1.5 inline-block size-1.5 rounded-full align-middle"
              style={{ backgroundColor: "var(--color-vex-cyan)", boxShadow: "var(--glow-cyan)" }}
            />
            CORE REACHED
          </>
        ) : (
          "↓ SCROLL TO ORBIT"
        )}
      </span>
    </div>
  );
}
