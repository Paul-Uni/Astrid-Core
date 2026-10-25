"use client";

import { useEffect, useRef } from "react";

const SVG_NS = "http://www.w3.org/2000/svg";
/** Narrower screens: panels cover the beam, so no tethers. */
const DESKTOP = "(min-width: 768px)";

/** Geometry, CSS px. */
const G = {
  /** Trace leaves the panel this far below its top edge. */
  rise: 34,
  /** Straight run into the beam, at most. */
  lead: 70,
  /** 45° drop, at most. */
  drop: 46,
  /** Panels closer to the beam than this get no tether. */
  minGap: 48,
  /** Diamond node half size. */
  node: 6,
  /** Square terminal half size, on the panel edge. */
  term: 3,
} as const;

type Tether = {
  power: HTMLElement;
  g: SVGGElement;
  trace: SVGPathElement;
  pulse: SVGPathElement;
  node: SVGPathElement;
  term: SVGRectElement;
};

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string>) {
  const e = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

/**
 * Circuit tethers (DESIGN.md "Tethers"): every panel marked `data-tether`
 * is wired to the beam. A trace leaves the panel's inner edge level with
 * its first line, bends 45° down toward the beam and plugs into a diamond
 * node on it. The beam is always at the horizontal center of the viewport.
 *
 * Fixed full-screen SVG behind the panels, above the WebGL stage, updated
 * on scroll and resize (not every frame). A tether switches on with its
 * panel (PanelPowerOn): the trace draws from the beam out to the panel and
 * one light pulse runs along it. Without the power-on (reduced motion),
 * tethers are simply there.
 */
export function Tethers() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const armed = !!document.documentElement.dataset.power;
    const desktop = window.matchMedia(DESKTOP);

    const tethers: Tether[] = [...document.querySelectorAll<HTMLElement>("[data-tether]")].map((panel) => {
      const g = svgEl("g", { class: "tether" });
      if (panel.hasAttribute("data-tether-now")) g.dataset.now = "";
      const trace = svgEl("path", { class: "tether-trace", pathLength: "1" });
      const pulse = svgEl("path", { class: "tether-pulse", pathLength: "1" });
      const node = svgEl("path", { class: "tether-node" });
      const term = svgEl("rect", { class: "tether-term", width: `${G.term * 2}`, height: `${G.term * 2}` });
      g.append(trace, pulse, node, term);
      svg.append(g);
      const power = panel.matches("[data-panel]") ? panel : (panel.querySelector<HTMLElement>("[data-panel]") ?? panel);
      return { power, g, trace, pulse, node, term };
    });

    let frame = 0;
    const update = () => {
      frame = 0;
      if (!desktop.matches) {
        svg.style.display = "none";
        return;
      }
      svg.style.display = "";
      const W = document.documentElement.clientWidth;
      const H = window.innerHeight;
      const bx = W / 2;
      for (const t of tethers) {
        const r = t.power.getBoundingClientRect();
        const left = r.left + r.width / 2 < bx;
        const px = left ? r.right : r.left;
        const gap = left ? bx - px : px - bx;
        const visible = r.bottom > -G.drop && r.top < H + G.drop && gap >= G.minGap;
        t.g.style.display = visible ? "" : "none";
        if (!visible) continue;

        const dir = left ? -1 : 1; // from the beam toward the panel
        const lead = Math.min(G.lead, gap * 0.4);
        const drop = Math.max(0, Math.min(G.drop, gap - lead - 12));
        const cy = r.top + Math.min(G.rise, r.height / 2);
        const ny = cy + drop;
        const ex = bx + dir * lead; // end of the straight run
        const kx = ex + dir * drop; // top of the 45° drop
        // Drawn from the beam out to the panel, so the trace grows that way.
        const d = `M${bx},${ny} L${ex},${ny} L${kx},${cy} L${px},${cy}`;
        t.trace.setAttribute("d", d);
        t.pulse.setAttribute("d", d);
        const n = G.node;
        t.node.setAttribute("d", `M${bx},${ny - n} L${bx + n},${ny} L${bx},${ny + n} L${bx - n},${ny} Z`);
        t.term.setAttribute("x", `${px - G.term}`);
        t.term.setAttribute("y", `${cy - G.term}`);

        // Switch on with the panel's power-on, a beat after it.
        if (!("on" in t.g.dataset) && (!armed || t.power.hasAttribute("data-power-on"))) {
          const delay = parseFloat(t.power.style.getPropertyValue("--power-delay")) || 0;
          t.g.style.setProperty("--tether-delay", `${delay + 120}ms`);
          t.g.dataset.on = "";
        }
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    desktop.addEventListener("change", schedule);
    // Panels power on from IntersectionObserver callbacks, sometimes after scrolling stops.
    const mo = new MutationObserver(schedule);
    for (const t of tethers) mo.observe(t.power, { attributes: true, attributeFilter: ["data-power-on"] });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      desktop.removeEventListener("change", schedule);
      mo.disconnect();
      for (const t of tethers) t.g.remove();
    };
  }, []);

  return <svg ref={svgRef} aria-hidden className="pointer-events-none fixed inset-0 -z-[5] size-full" />;
}
