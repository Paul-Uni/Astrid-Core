import { ButtonCore } from "@/ui/ButtonCore";
import Link from "next/link";
import { NAV_LINKS } from "@/tokens/stations";
import { MobileMenu } from "./MobileMenu";

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
        className="pointer-events-auto relative flex items-center justify-between px-14 pt-8 max-md:px-5 max-md:pt-4"
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
            <ButtonCore href="/login" variant="outline" compact>
              Login
            </ButtonCore>
          </li>
        </ul>

        {/* Phones (Figma Nav/Mobile): LOGIN + menu button; the links live in the menu */}
        <div className="hidden items-center gap-2.5 max-md:flex">
          <ButtonCore href="/login" variant="outline" compact>
            Login
          </ButtonCore>
          <MobileMenu />
        </div>
      </nav>
    </header>
  );
}
