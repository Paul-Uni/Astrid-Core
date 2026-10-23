import { ButtonCore } from "./ButtonCore";

/**
 * Core Gate per DESIGN.md:
 * - 70px rotated square node (void 0.9 bg, 2px magenta border, magenta glow)
 * - dashed 88px outer ring (magenta dashed)
 * - 36×42 pixel lock centered (from /lock-pixel.svg)
 * - Button/Core "ENTER CORE →" below (12px gap)
 */
export function CoreGate({ href = "#login" }: { href?: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative size-[6.5rem]">
        {/* Outer dashed ring */}
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
        >
          <span
            className="block size-[5.5rem] rotate-45"
            style={{ border: "1px dashed var(--color-magenta-core)" }}
          />
        </span>
        {/* Inner node */}
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
        >
          <span
            className="block size-[4.375rem] rotate-45"
            style={{
              backgroundColor: "rgb(7 10 31 / 0.9)",
              border: "2px solid var(--color-magenta-core)",
              boxShadow: "0 0 1.75rem rgb(226 51 127 / 0.55)",
            }}
          />
        </span>
        {/* Pixel lock */}
        <img
          aria-hidden
          src="/lock-pixel.svg"
          alt=""
          className="pointer-events-none absolute left-1/2 top-1/2 h-[2.625rem] w-[2.25rem] -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <ButtonCore href={href}>
        Enter Core
        <span aria-hidden>→</span>
      </ButtonCore>
    </div>
  );
}
