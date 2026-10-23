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
      className="inline-flex items-center font-mono text-mono-data lowercase"
      style={{
        color: "rgb(184 244 255 / 0.95)",
        backgroundColor: "rgb(111 242 230 / 0.06)",
        border: "1px solid rgb(111 242 230 / 0.35)",
        padding: "0.375rem 0.625rem",
      }}
    >
      {children}
    </span>
  );
}
