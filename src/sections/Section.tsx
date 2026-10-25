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
 * Shared station shell. Each station is one Figma frame: 1440 × 900
 * (56.25rem tall), so a rail jump lands with the viewport showing exactly
 * that frame. Panel positions inside already carry the nav clearance.
 * Height is rem, not vh, so CTRL+zoom never opens a gap between sections.
 */
export function Section({ station, children, heightClass = "min-h-[56.25rem]" }: SectionProps) {
  return (
    <section
      id={station.slug}
      aria-label={`0${station.id} — ${station.label}`}
      data-station={station.id}
      className={`relative w-full ${heightClass}`}
    >
      {children}
    </section>
  );
}
