"use client";

import { useEffect, useRef } from "react";

const SVG_NS = "http://www.w3.org/2000/svg";
/** Desktop: side tethers. Narrower screens: panels cover the beam, so links run along it between panels. */
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
  /** Phones: diamond half size on a panel edge, smallest gap that gets a link. */
  linkNode: 5,
  linkMinGap: 16,
} as const;

/** Phones: dashed link on the beam from one stacked panel down to the next. */
type Link = {
  upper: HTMLElement;
  lower: HTMLElement;
  g: SVGGElement;
  line: SVGPathElement;
  top: SVGPathElement;
  bottom: SVGPathElement;
};

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
 *
 * Phones (Figma "02 Mobile"): panels stack over the beam, so instead each
 * station's panels are linked down the beam: a short dashed line in the
 * gap between two panels, with a diamond node on each panel edge. A link
 * switches on with the lower panel.
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

    const diamond = (x: number, y: number, n: number) => `M${x},${y - n} L${x + n},${y} L${x},${y + n} L${x - n},${y} Z`;
    const links: Link[] = [...document.querySelectorAll<HTMLElement>("[data-station]")].flatMap((section) => {
      const panels = [...section.querySelectorAll<HTMLElement>("[data-panel]")];
      return panels.slice(1).map((lower, i) => {
        const g = svgEl("g", { class: "tether" });
        const line = svgEl("path", { class: "tether-link" });
        const top = svgEl("path", { class: "tether-node" });
        const bottom = svgEl("path", { class: "tether-node" });
        g.append(line, top, bottom);
        svg.append(g);
        return { upper: panels[i]!, lower, g, line, top, bottom };
      });
    });

    let frame = 0;
    const update = () => {
      frame = 0;
      const W = document.documentElement.clientWidth;
      const H = window.innerHeight;
      const bx = W / 2;
      if (!desktop.matches) {
        for (const t of tethers) t.g.style.display = "none";
        updateLinks(bx, H);
        return;
      }
      for (const l of links) l.g.style.display = "none";
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
    // Phones: stacked panels are re-sorted by their on-screen position, since flex `order` can differ from the DOM order.
    const updateLinks = (bx: number, H: number) => {
      for (const l of links) {
        const a = l.upper.getBoundingClientRect();
        const b = l.lower.getBoundingClientRect();
        const [up, low, lowEl] = a.top <= b.top ? [a, b, l.lower] : [b, a, l.upper];
        const y1 = up.bottom;
        const y2 = low.top;
        const visible = y2 - y1 >= G.linkMinGap && y2 > -G.linkNode && y1 < H + G.linkNode;
        l.g.style.display = visible ? "" : "none";
        if (!visible) continue;
        l.line.setAttribute("d", `M${bx},${y1 + G.linkNode} L${bx},${y2 - G.linkNode}`);
        l.top.setAttribute("d", diamond(bx, y1, G.linkNode));
        l.bottom.setAttribute("d", diamond(bx, y2, G.linkNode));
        if (!("on" in l.g.dataset) && (!armed || lowEl.hasAttribute("data-power-on"))) {
          const delay = parseFloat(lowEl.style.getPropertyValue("--power-delay")) || 0;
          l.g.style.setProperty("--tether-delay", `${delay + 120}ms`);
          l.g.dataset.on = "";
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
    for (const l of links) mo.observe(l.lower, { attributes: true, attributeFilter: ["data-power-on"] });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      desktop.removeEventListener("change", schedule);
      mo.disconnect();
      for (const t of tethers) t.g.remove();
      for (const l of links) l.g.remove();
    };
  }, []);

  return <svg ref={svgRef} aria-hidden className="pointer-events-none fixed inset-0 -z-[5] size-full" />;
}
