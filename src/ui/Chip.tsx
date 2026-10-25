import type { ReactNode } from "react";

/**
 * Skill / stack tag. Per DESIGN.md:
 * Mono/Data (12px), ice text 0.95, 1px cyan border at 0.35, cyan fill at 0.06,
 * padding 6/10. (Figma renders solid cyan due to paint-opacity quirk — we use
 * the fixed opacity values from DESIGN.md so the chips stay translucent.)
 */
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center border border-vex-cyan/35 bg-vex-cyan/6 px-2.5 py-1.5 font-mono text-mono-data text-ice/95"
    >
      {children}
    </span>
  );
}
