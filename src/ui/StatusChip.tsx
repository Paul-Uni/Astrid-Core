import type { ReactNode } from "react";

type StatusChipProps = {
  children: ReactNode;
};

/**
 * Status chip per DESIGN.md:
 * - Mono/Data (12px, cyan text)
 * - 8px glowing cyan dot
 * - fill cyan 0.08, border cyan 0.4
 * - padding 8/12-14, gap 10
 *
 * NOTE: DESIGN.md's 0.08/0.4 opacity values are the "fixed" render (Figma
 * instance paint quirk makes the raw export look fully opaque). We follow
 * DESIGN.md so the chip stays readable over the sky gradient and stream.
 */
export function StatusChip({ children }: StatusChipProps) {
  return (
    <span
      className="inline-flex items-center gap-2.5 py-2 pl-3 pr-3.5 font-mono text-mono-data uppercase"
      style={{
        color: "var(--color-vex-cyan)",
        backgroundColor: "rgb(111 242 230 / 0.08)",
        border: "1px solid rgb(111 242 230 / 0.4)",
      }}
    >
      <span
        aria-hidden
        className="block size-2 rounded-full"
        style={{
          backgroundColor: "var(--color-vex-cyan)",
          boxShadow: "var(--glow-cyan)",
        }}
      />
      {children}
    </span>
  );
}
