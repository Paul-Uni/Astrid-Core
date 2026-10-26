"use client";

import { useEffect, useRef } from "react";
import { NAV_FADE, NAV_LINKS, STATIONS } from "@/tokens/stations";
import { useScrollStore } from "@/store/useScrollStore";

/**
 * Desktop section links in the nav. Shown at 00 Entry; while scrolling from
 * 00 into 01 they fade out with the scroll (NAV_FADE), and once invisible
 * they are inert (not clickable, not focusable). From then on the orbit rail
 * is the section navigation. Opacity is written straight to the DOM so the
 * nav never re-renders per scroll frame.
 */
export function NavLinks() {
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const apply = (progress: number) => {
      const el = list.current;
      if (!el) return;
      const t = progress * (STATIONS.length - 1); // 0 at 00, 1 at 01
      const fade = Math.min(1, Math.max(0, (t - NAV_FADE.from) / (NAV_FADE.to - NAV_FADE.from)));
      el.style.opacity = String(1 - fade);
      el.inert = fade >= 1;
    };
    apply(useScrollStore.getState().progress);
    return useScrollStore.subscribe((s) => apply(s.progress));
  }, []);

  return (
    <ul ref={list} className="flex items-center gap-6">
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
    </ul>
  );
}
