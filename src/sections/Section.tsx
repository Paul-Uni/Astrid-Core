import type { ReactNode } from "react";
import type { Station } from "@/tokens/stations";

type SectionProps = {
  station: Station;
  children?: ReactNode;
  /** Visual height, in rem (zoom-scales with content).
   *  Mixing vh here would break at non-100% zoom: content shrinks with
   *  the font size while vh stays fixed to viewport, opening a void
   *  between sections. Stay in rem so section + content scale together. */
  heightClass?: string;
};

/**
 * Shared station shell. Each station is a scroll target whose height
 * scales with the typographic scale (rem), not the viewport (vh), so
 * CTRL+zoom never opens a gap between sections.
 */
export function Section({ station, children, heightClass = "min-h-[52rem]" }: SectionProps) {
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
