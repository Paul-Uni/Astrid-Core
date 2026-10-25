import type { HTMLAttributes, ReactNode } from "react";
import { CornerBrackets } from "./CornerBrackets";
import { mobilePlacement, type MobilePlacement } from "./mobilePlacement";

type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  /** Add the 14px cyan corner brackets. Default on, per DESIGN.md. */
  brackets?: boolean;
  /** Blur radius for backdrop. CoreTelemetry uses a lighter 6px blur. */
  blur?: "default" | "light";
  /** Tie this panel to the stream with a circuit tether (chrome/Tethers); `now` tints it dusk-pink. */
  tether?: { now?: boolean } | true;
  /** Placement in the stacked mobile layout (ui/mobilePlacement). */
  m?: MobilePlacement;
};

/**
 * Glass panel per DESIGN.md:
 * - --panel-bg: void at 0.62
 * - --panel-border: 1px vex-cyan at 0.22
 * - --panel-blur: blur(18px) (default) or 6px (light)
 * - 14px cyan corner brackets on all four corners
 * - optionally tethered to the beam (Tethers)
 * - powers on like a CRT the first time it scrolls into view (PanelPowerOn)
 * - optionally placed in the stacked mobile layout (`m`, ui/mobilePlacement)
 */
export function GlassPanel({
  children,
  brackets = true,
  blur = "default",
  tether,
  m,
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
  const mobile = m ? mobilePlacement(m) : undefined;
  return (
    <div
      data-calm
      data-m={mobile?.["data-m"]}
      data-panel
      data-tether={tether ? "" : undefined}
      data-tether-now={tether && tether !== true && tether.now ? "" : undefined}
      {...rest}
      className={className}
      style={{
        position: "relative",
        background: "var(--panel-bg)",
        border: "var(--panel-border)",
        backdropFilter: blur === "default" ? "var(--panel-blur)" : "blur(0.375rem)",
        WebkitBackdropFilter: blur === "default" ? "var(--panel-blur)" : "blur(0.375rem)",
        ...mobile?.style,
        ...style,
      }}
    >
      {brackets && <CornerBrackets />}
      {children}
    </div>
  );
}
