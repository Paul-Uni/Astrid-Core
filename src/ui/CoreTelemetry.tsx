import { GlassPanel } from "./GlassPanel";

type Row = {
  key: string;
  value: string;
  /** Accent color for the value — defaults to ice. */
  tone?: "ice" | "cyan" | "dusk";
};

const ROWS: readonly Row[] = [
  { key: "core",   value: "astrid" },
  { key: "status", value: "● online",       tone: "cyan" },
  { key: "nodes",  value: "04 connected" },
  { key: "stream", value: "↑ 2.4 GB/s" },
  { key: "uplink", value: "bochum / ge",    tone: "dusk" },
];

const TONE_COLOR = {
  ice:  "var(--color-ice)",
  cyan: "var(--color-vex-cyan)",
  dusk: "var(--color-dusk-pink)",
} as const;

/**
 * Core Telemetry glass panel (DESIGN.md: Components).
 * - Mono/Label title: `// CORE TELEMETRY` in cyan
 * - 5 key/value rows, width 210 content
 * - padding 18/16, light blur (6px)
 * - key in ice, value in ice/cyan/dusk per row
 * Decorative world-building; wired to real device status later.
 */
export function CoreTelemetry() {
  return (
    <GlassPanel
      blur="light"
      className="flex flex-col gap-2.5 px-4.5 py-4"
      aria-label="Core telemetry (decorative)"
      data-power-style="boot"
    >
      <p
        className="font-mono text-mono-label uppercase"
        style={{ color: "var(--color-vex-cyan)" }}
      >
        {`// CORE TELEMETRY`}
      </p>
      <dl className="grid grid-cols-[auto_auto] items-start gap-x-6 gap-y-2.5 min-w-[13.125rem]">
        {ROWS.map((row) => (
          <div key={row.key} className="contents">
            <dt
              className="font-mono text-mono-data lowercase"
              style={{ color: "var(--color-ice)" }}
            >
              {row.key}
            </dt>
            <dd
              className="font-mono text-mono-data lowercase justify-self-end"
              style={{ color: TONE_COLOR[row.tone ?? "ice"] }}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </GlassPanel>
  );
}
