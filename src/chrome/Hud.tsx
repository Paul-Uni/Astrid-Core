"use client";

import { useScrollStore } from "@/store/useScrollStore";

/**
 * Bottom-left HUD, one line each: cam.θ, depth, core, then "↓ SCROLL TO ORBIT".
 * θ and depth count live while scrolling via the Zustand store.
 * At station 5, "CORE REACHED" replaces the scroll prompt (DESIGN.md).
 * Hidden on phones: there the two lines sit in the page at 00 and 05.
 */
export function Hud() {
  const station = useScrollStore((s) => s.station);
  const theta = useScrollStore((s) => s.theta);
  const depth = useScrollStore((s) => s.depth);

  const atCore = station === 5;

  return (
    <div
      className="pointer-events-none fixed bottom-6 left-6 z-40 flex flex-col items-start gap-1.5 max-md:hidden"
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
