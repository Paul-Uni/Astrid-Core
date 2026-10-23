/**
 * 14px cyan L-shaped corner brackets, 2px stroke, placed at each panel corner.
 * DESIGN.md "Glass panels carry 14px cyan corner brackets (2px stroke) on all four corners".
 *
 * Rendered as absolutely-positioned SVGs around a relative parent. Width in rem
 * so the brackets scale with CTRL+zoom together with the panel.
 */
export function CornerBrackets() {
  return (
    <>
      <Bracket className="left-0 top-0" />
      <Bracket className="right-0 top-0 rotate-90" />
      <Bracket className="right-0 bottom-0 rotate-180" />
      <Bracket className="left-0 bottom-0 -rotate-90" />
    </>
  );
}

function Bracket({ className }: { className: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 14 14"
      className={`absolute size-3.5 pointer-events-none ${className}`}
      style={{ color: "var(--color-vex-cyan)" }}
    >
      {/* Top-left L: top edge (left→right) + left edge (top→bottom) */}
      <path
        d="M 0 1 L 14 1 M 1 0 L 1 14"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
