import Link from "next/link";
import { NAV_LINKS } from "@/tokens/stations";

export function Nav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      {/* Fade from void(0.9) to transparent, 150px (~9.375rem) tall per DESIGN.md */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-38 bg-linear-to-b from-void/90 to-void/0"
      />
      <nav
        aria-label="Primary"
        className="pointer-events-auto relative flex items-center justify-between px-14 pt-8 max-md:px-5 max-md:pt-5"
      >
        <Link
          href="/"
          className="group flex items-center gap-2 font-pixel text-pixel-label text-ice"
          aria-label="Astrid-Core home"
        >
          <span
            aria-hidden
            className="block h-3.5 w-3.5 rotate-45 border-[1.5px] border-vex-cyan"
            style={{ boxShadow: "var(--glow-cyan)" }}
          />
          ASTRID-CORE
        </Link>

        <ul className="flex items-center gap-6 max-md:hidden">
          {NAV_LINKS.map((link) => (
            <li key={link.slug}>
              <a
                href={`#${link.slug}`}
                className="font-mono text-mono-label uppercase text-ice/85 transition-opacity duration-[var(--dur-hover)] hover:text-vex-cyan hover:opacity-100"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#login"
              className="font-pixel text-pixel-label text-dusk-pink px-3.5 py-2 border border-magenta-core/90 bg-magenta-core/12 transition-colors duration-[var(--dur-hover)]"
            >
              LOGIN
            </a>
          </li>
        </ul>

        {/* Mobile menu button placeholder — fleshed out in Phase F */}
        <button
          type="button"
          aria-label="Open menu"
          className="hidden size-10 items-center justify-center border border-vex-cyan/40 bg-void/40 max-md:flex"
        >
          <span aria-hidden className="flex flex-col gap-1">
            <span className="block h-px w-4 bg-ice" />
            <span className="block h-px w-4 bg-ice" />
            <span className="block h-px w-4 bg-ice" />
          </span>
        </button>
      </nav>
    </header>
  );
}
