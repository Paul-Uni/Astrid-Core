"use client";

import { useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { STATIONS } from "@/tokens/stations";
import { useScrollStore } from "@/store/useScrollStore";

const EMAIL = "ponyeikedi@gmail.com";
const GITHUB = "https://github.com/Paul-Uni";
const LINKEDIN = "https://www.linkedin.com/in/paul-onyeikedi-2b4b44265/";

/**
 * Fullscreen mobile menu (Figma "m · Menu (open)", 107:832), phones only.
 * base-ui Dialog handles the focus trap, Escape, scroll lock and focus
 * return to the menu button. Station list 00–05 with the current station
 * in cyan and a filled diamond, LOGIN at the bottom, contact line below.
 * Picking a station closes the menu first, then scrolls there, because the
 * page can't scroll while the dialog holds the scroll lock.
 * Opens with a 200ms fade (reduced motion: instant, globals.css).
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const target = useRef<string | null>(null);
  const current = useScrollStore((s) => s.station);

  const go = (slug: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    target.current = slug;
    setOpen(false);
  };

  const afterChange = (isOpen: boolean) => {
    if (isOpen || !target.current) return;
    const el = document.getElementById(target.current);
    target.current = null;
    el?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen} onOpenChangeComplete={afterChange}>
      <Dialog.Trigger
        aria-label="Open menu"
        className="hidden size-10 items-center justify-center border border-vex-cyan bg-void max-md:flex"
      >
        <span aria-hidden className="flex flex-col gap-1">
          <span className="block h-px w-4.5 bg-ice" />
          <span className="block h-px w-4.5 bg-ice" />
          <span className="block h-px w-4.5 bg-ice" />
        </span>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Popup
          className="fixed inset-0 z-[60] flex flex-col bg-void px-5 pt-4 pb-10 transition-opacity duration-200 ease-[var(--ease-out)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
          style={{ paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))" }}
        >
          <Dialog.Title className="sr-only">Menu</Dialog.Title>

          <div className="flex h-11 items-center justify-between">
            <span className="flex items-center gap-2 font-pixel text-pixel-label text-ice">
              <span
                aria-hidden
                className="block h-3.5 w-3.5 rotate-45 border-[1.5px] border-vex-cyan"
                style={{ boxShadow: "var(--glow-cyan)" }}
              />
              ASTRID-CORE
            </span>
            <Dialog.Close
              aria-label="Close menu"
              className="flex size-10 items-center justify-center border border-vex-cyan bg-void"
            >
              <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" className="text-vex-cyan">
                <path d="M2 2 14 14M14 2 2 14" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </Dialog.Close>
          </div>

          <nav aria-label="Stations" className="mt-15">
            <ul>
              {STATIONS.map((s) => {
                const active = s.id === current;
                return (
                  <li key={s.slug} className="border-b border-vex-cyan/22">
                    <a
                      href={`#${s.slug}`}
                      onClick={go(s.slug)}
                      aria-current={active ? "location" : undefined}
                      className={`flex items-center gap-4 py-4 ${active ? "text-vex-cyan" : "text-ice"}`}
                    >
                      <span className="font-mono text-mono-label">{`0${s.id}`}</span>
                      <span className="flex-1 font-pixel text-heading-s">{s.label}</span>
                      <span
                        aria-hidden
                        className={`mr-0.5 block size-2 rotate-45 border border-vex-cyan ${active ? "bg-vex-cyan" : "opacity-70"}`}
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto flex flex-col gap-4">
            <a
              href="#login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center border border-magenta-core/90 bg-magenta-core/12 p-3.5 font-pixel text-pixel-label text-dusk-pink"
            >
              LOGIN
            </a>
            <p className="font-mono text-mono-data text-ice">
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              {" · "}
              <a href={GITHUB} target="_blank" rel="noreferrer noopener">github</a>
              {" · "}
              <a href={LINKEDIN} target="_blank" rel="noreferrer noopener">linkedin</a>
            </p>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
