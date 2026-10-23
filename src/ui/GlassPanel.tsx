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
  return (
    <div
      {...rest}
      className={`relative ${className}`}
      style={{
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
