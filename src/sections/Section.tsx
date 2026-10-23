import type { ReactNode } from "react";
import type { Station } from "@/tokens/stations";

type SectionProps = {
  station: Station;
  children?: ReactNode;
  /** Visual height. Each station defaults to ~150vh to make scrolling feel paced. */
  heightClass?: string;
};

/**
 * Shared station shell. Each station is a full-viewport scroll target.
 * The WebGL canvas sits behind (position: fixed, -z-10) and the panel
 * content scrolls over it. Phase A: empty frame to validate layout + zoom.
 */
export function Section({ station, children, heightClass = "min-h-[150vh]" }: SectionProps) {
  return (
    <section
      id={station.slug}
      aria-labelledby={`${station.slug}-label`}
      data-station={station.id}
      className={`relative w-full ${heightClass}`}
    >
      {/* Section label (sr-only in placeholder; visible panel comes in Phase B/E) */}
      <h2 id={`${station.slug}-label`} className="sr-only">
        {`0${station.id} — ${station.label}`}
      </h2>
      {children}
    </section>
  );
}
