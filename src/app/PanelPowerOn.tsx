"use client";

import { useEffect } from "react";

/** Gap between panels that come into view together (ms). */
const STAGGER = 60;
/** Boot panels (station 00) wait for the fonts, at most this long (ms). */
const BOOT_WAIT = 800;

/**
 * Resolves once the fonts are loaded, or after BOOT_WAIT. It does not wait for the
 * WebGL stage: the stage mounts after the boot (StageLoader), so its first frame
 * never holds the content back.
 */
function bootReady() {
  return Promise.race([document.fonts.ready, new Promise<void>((r) => setTimeout(r, BOOT_WAIT))]);
}

/**
 * Switches each glass panel ([data-panel]) on the first time it scrolls into
 * view by setting `data-power-on`; the CRT animation itself is CSS
 * (globals.css, "Panel power-on"). Panels entering together turn on top to
 * bottom, left to right, STAGGER ms apart. Station 00 panels (boot style)
 * wait for the fonts first (bootReady). Does nothing unless the head
 * script armed it (<html data-power>), so reduced motion skips it entirely.
 */
export function PanelPowerOn() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.dataset.power) return;
    root.dataset.powerReady = "1";
    let cancelled = false;
    const boot = bootReady();

    const observer = new IntersectionObserver(
      (entries) => {
        const entering = entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => {
            const ra = a.getBoundingClientRect();
            const rb = b.getBoundingClientRect();
            return ra.top - rb.top || ra.left - rb.left;
          });
        entering.forEach((el, i) => {
          observer.unobserve(el);
          el.style.setProperty("--power-delay", `${i * STAGGER}ms`);
          if (el.dataset.powerStyle === "boot") {
            void boot.then(() => {
              if (!cancelled) el.dataset.powerOn = "";
            });
          } else {
            el.dataset.powerOn = "";
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-panel]").forEach((el) => observer.observe(el));
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  return null;
}
