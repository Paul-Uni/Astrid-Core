type SectionLabelProps = {
  /** Station number, zero-padded in the output (e.g. 0 → "00"). */
  index: number;
  /** Section name, uppercased in the output. */
  name: string;
};

/**
 * `// 00 — ENTRY POINT` style section label.
 * Mono/Label (13px), cyan at 0.9 opacity (DESIGN.md).
 * First line of every section panel.
 */
export function SectionLabel({ index, name }: SectionLabelProps) {
  const padded = index.toString().padStart(2, "0");
  return (
    <p
      className="font-mono text-mono-label uppercase text-vex-cyan/90"
    >
      {`// ${padded} — ${name.toUpperCase()}`}
    </p>
  );
}
