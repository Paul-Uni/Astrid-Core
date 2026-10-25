import type { HTMLAttributes, ReactNode } from "react";
import { CornerBrackets } from "./CornerBrackets";

type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  /** Add the 14px cyan corner brackets. Default on, per DESIGN.md. */
  brackets?: boolean;
  /** Blur radius for backdrop. CoreTelemetry uses a lighter 6px blur. */
  blur?: "default" | "light";
};

/**
 * Glass panel per DESIGN.md:
 * - --panel-bg: void at 0.62
 * - --panel-border: 1px vex-cyan at 0.22
 * - --panel-blur: blur(18px) (default) or 6px (light)
 * - 14px cyan corner brackets on all four corners
 */
export function GlassPanel({
  children,
  brackets = true,
  blur = "default",
  className = "",
  style,
  ...rest
}: GlassPanelProps) {
  // `position: relative` is set via inline style (not className) so a
  // consumer-provided `style={{ position: 'absolute', … }}` cleanly
  // overrides it. Otherwise Tailwind's `.relative` rule (defined later in
  // the base layer than `.absolute`) would win over any `absolute` class
  // the consumer adds, and the panel would land in flex flow instead of
  // at its intended coordinates.
  return (
    <div
      data-calm
      {...rest}
      className={className}
      style={{
        position: "relative",
        background: "var(--panel-bg)",
        border: "var(--panel-border)",
        backdropFilter: blur === "default" ? "var(--panel-blur)" : "blur(0.375rem)",
        WebkitBackdropFilter: blur === "default" ? "var(--panel-blur)" : "blur(0.375rem)",
        ...style,
      }}
    >
      {brackets && <CornerBrackets />}
      {children}
    </div>
  );
}
