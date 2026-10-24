"use client";

import { useScrollStore } from "@/store/useScrollStore";

/**
 * Bottom-left HUD. "↓ SCROLL TO ORBIT" + "cam.θ · depth · core: astrid".
 * θ and depth count live while scrolling via the Zustand store.
 * At station 5, "CORE REACHED" replaces the scroll prompt (DESIGN.md).
 */
export function Hud() {
  const station = useScrollStore((s) => s.station);
  const theta = useScrollStore((s) => s.theta);
  const depth = useScrollStore((s) => s.depth);

  const atCore = station === 5;

  return (
    <div
      className="pointer-events-none fixed bottom-6 left-14 z-40 flex items-center gap-4 max-md:left-5 max-md:bottom-5"
      role="status"
      aria-live="polite"
    >
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
      <span aria-hidden className="font-mono text-mono-data text-ice/75">
        {`cam.θ ${theta.toString().padStart(3, "0")}° · depth ${depth
          .toString()
          .padStart(4, "0")} · core: astrid`}
      </span>
    </div>
  );
}
