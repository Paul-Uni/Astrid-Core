import { GlassPanel } from "./GlassPanel";

/**
 * Placeholder photo frame per DESIGN.md:
 * - GlassPanel with padding 16, gap 16
 * - Inner image area 268x335 (4:5) with indigo fill and cyan scanlines at 0.07
 * - `// IMAGE PENDING` centered
 * - Caption below in Mono/Data
 *
 * Replace the inner div with an <Image /> once Paul provides a photo.
 */
export function PhotoFrame({
  caption = "subject: paul onyeikedi · cs @ rub",
}: { caption?: string }) {
  return (
    <GlassPanel className="flex w-[18.75rem] flex-col gap-4 p-4">
      <div
        role="img"
        className="relative flex h-[20.9375rem] w-[16.75rem] items-center justify-center overflow-hidden bg-indigo"
        aria-label="Photo of Paul — image pending"
      >
        <img
          aria-hidden
          src="/scanlines.svg"
          alt=""
          className="pointer-events-none absolute inset-0 size-full"
        />
        <p aria-hidden className="font-mono text-mono-label uppercase text-vex-cyan">
          {`// IMAGE PENDING`}
        </p>
      </div>
      <p className="font-mono text-mono-data lowercase text-ice">
        {caption}
      </p>
    </GlassPanel>
  );
}
