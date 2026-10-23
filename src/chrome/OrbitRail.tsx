"use client";

import { STATIONS } from "@/tokens/stations";
import { useScrollStore } from "@/store/useScrollStore";

/**
 * Right-edge orbit rail. All six diamonds are visible; only the active
 * station's label is shown by default. Hovering (fine pointers) or
 * focusing the rail pops the full label list on a glass backdrop.
 * Scroll store subscription keeps the active diamond in sync with the camera.
 */
export function OrbitRail() {
  const activeStation = useScrollStore((s) => s.station);

  return (
    <aside
      aria-label="Orbit rail — section navigator"
      className="group pointer-events-auto fixed right-14 top-1/2 z-40 -translate-y-1/2 max-md:right-2.5"
    >
      {/* Glass backdrop appears on hover/focus-within (desktop only) */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 scale-x-0 opacity-0 transition-[opacity,transform] duration-[160ms] ease-[var(--ease-out)] group-hover:scale-x-100 group-hover:opacity-100 group-focus-within:scale-x-100 group-focus-within:opacity-100 motion-reduce:transition-none max-md:hidden"
        style={{
          background: "rgb(7 10 31 / 0.72)",
          border: "1px solid rgb(111 242 230 / 0.22)",
          backdropFilter: "blur(1.125rem)",
          WebkitBackdropFilter: "blur(1.125rem)",
          transformOrigin: "right",
        }}
      />

      <ol className="relative flex flex-col items-end gap-5 px-3 py-4">
        {STATIONS.map((station) => {
          const isActive = station.id === activeStation;
          return (
            <li key={station.id} className="flex items-center gap-3">
              {/* Label — visible only when active OR when the rail is hovered/focused */}
              <span
                className={
                  "font-mono text-mono-data uppercase text-ice/90 transition-opacity duration-[160ms] max-md:hidden " +
                  (isActive
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100")
                }
              >
                {`0${station.id} ${station.label}`}
              </span>
              <a
                href={`#${station.slug}`}
                aria-label={`Jump to station 0${station.id} ${station.label.toLowerCase()}`}
                aria-current={isActive ? "location" : undefined}
                className="relative block size-2 rotate-45 transition-colors duration-[var(--dur-hover)]"
                style={{
                  backgroundColor: isActive ? "var(--color-vex-cyan)" : "transparent",
                  border: `1px solid rgb(111 242 230 / ${isActive ? 1 : 0.7})`,
                  boxShadow: isActive ? "var(--glow-cyan)" : "none",
                }}
              />
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
