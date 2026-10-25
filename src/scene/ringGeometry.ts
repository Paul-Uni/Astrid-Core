import { BufferGeometry, Float32BufferAttribute, type Color } from "three";
import { pick, range, seededRandom, type Rng } from "./random";
import { RING_CLUSTERS, toWorld, toWorldY } from "./streamSpec";

/**
 * Builds every ring of the stream into two static geometries:
 * - `blocks`: solid ring blocks (triangles)
 * - `lines`:  hairlines and ticks (line segments)
 *
 * Each vertex carries its ring's spin speed (`aSpin`, rad/s, signed) so the
 * vertex shader rotates rings around the beam axis. One geometry for all
 * rings keeps the whole ring system to a couple of draw calls.
 *
 * Ring types follow DESIGN.md "Rings" (1–5), with turn periods from
 * "Ambient stream motion" (±20% per ring, alternating direction in a cluster).
 */

type RingType = 1 | 2 | 3 | 4 | 5;

/** Seconds per full turn, per ring type. */
const TURN_PERIOD: Record<RingType, number> = { 1: 40, 2: 55, 3: 70, 4: 60, 5: 90 };

type RingColors = { cyan: Color; ice: Color; magenta: Color; steel: Color; indigoRaised: Color };

class Builder {
  pos: number[] = [];
  nrm: number[] = [];
  col: number[] = [];
  alpha: number[] = [];
  spin: number[] = [];

  private push(p: [number, number, number], n: [number, number, number], c: Color, a: number, s: number) {
    this.pos.push(...p);
    this.nrm.push(...n);
    this.col.push(c.r, c.g, c.b);
    this.alpha.push(a);
    this.spin.push(s);
  }

  quad(
    p0: [number, number, number], p1: [number, number, number],
    p2: [number, number, number], p3: [number, number, number],
    n: [number, number, number], c: Color, a: number, s: number,
  ) {
    for (const p of [p0, p1, p2, p0, p2, p3]) this.push(p, n, c, a, s);
  }

  segment(p0: [number, number, number], p1: [number, number, number], c: Color, a: number, s: number) {
    this.push(p0, [0, 1, 0], c, a, s);
    this.push(p1, [0, 1, 0], c, a, s);
  }

  geometry() {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(this.pos, 3));
    g.setAttribute("normal", new Float32BufferAttribute(this.nrm, 3));
    g.setAttribute("aColor", new Float32BufferAttribute(this.col, 3));
    g.setAttribute("aAlpha", new Float32BufferAttribute(this.alpha, 1));
    g.setAttribute("aSpin", new Float32BufferAttribute(this.spin, 1));
    g.computeBoundingSphere();
    return g;
  }
}

const at = (r: number, a: number, y: number): [number, number, number] => [Math.cos(a) * r, y, Math.sin(a) * r];

/** A curved block: annular sector from angle a0 to a1, radius rIn..rOut, centered on y with height h. Bottom face skipped (camera always looks down). */
function block(b: Builder, a0: number, a1: number, rIn: number, rOut: number, y: number, h: number, c: Color, alpha: number, spin: number) {
  const top = y + h / 2;
  const bot = y - h / 2;
  const mid = (a0 + a1) / 2;
  const radial: [number, number, number] = [Math.cos(mid), 0, Math.sin(mid)];
  b.quad(at(rIn, a0, top), at(rIn, a1, top), at(rOut, a1, top), at(rOut, a0, top), [0, 1, 0], c, alpha, spin);
  b.quad(at(rOut, a0, bot), at(rOut, a0, top), at(rOut, a1, top), at(rOut, a1, bot), radial, c, alpha, spin);
  b.quad(at(rIn, a1, bot), at(rIn, a1, top), at(rIn, a0, top), at(rIn, a0, bot), [-radial[0], 0, -radial[2]], c, alpha, spin);
  b.quad(at(rIn, a0, bot), at(rIn, a0, top), at(rOut, a0, top), at(rOut, a0, bot), [Math.sin(a0), 0, -Math.cos(a0)], c, alpha, spin);
  b.quad(at(rOut, a1, bot), at(rOut, a1, top), at(rIn, a1, top), at(rIn, a1, bot), [-Math.sin(a1), 0, Math.cos(a1)], c, alpha, spin);
}

/** A circle (or arc) of line segments. */
function circle(l: Builder, r: number, y: number, c: Color, alpha: number, spin: number, a0 = 0, a1 = Math.PI * 2) {
  const steps = Math.max(24, Math.ceil(((a1 - a0) * r) / 0.04));
  for (let i = 0; i < steps; i++) {
    const t0 = a0 + ((a1 - a0) * i) / steps;
    const t1 = a0 + ((a1 - a0) * (i + 1)) / steps;
    l.segment(at(r, t0, y), at(r, t1, y), c, alpha, spin);
  }
}

/** Long arc made of short contiguous blocks so it curves smoothly. */
function arc(b: Builder, a0: number, a1: number, rIn: number, rOut: number, y: number, h: number, c: Color, alpha: number, spin: number) {
  const steps = Math.max(2, Math.ceil((a1 - a0) / 0.1));
  for (let i = 0; i < steps; i++) {
    block(b, a0 + ((a1 - a0) * i) / steps, a0 + ((a1 - a0) * (i + 1)) / steps, rIn, rOut, y, h, c, alpha, spin);
  }
}

const px = toWorld;

function buildRing(type: RingType, r: number, y: number, spin: number, rng: Rng, colors: RingColors, b: Builder, l: Builder) {
  const TAU = Math.PI * 2;
  switch (type) {
    case 1: {
      // Small, thin, 3–4 long segments.
      const n = rng() < 0.5 ? 3 : 4;
      const offset = rng() * TAU;
      for (let i = 0; i < n; i++) {
        const a0 = offset + (TAU * i) / n;
        arc(b, a0, a0 + (TAU / n) * range(rng, 0.55, 0.8), r - px(2), r + px(2), y, px(3), colors.cyan, 0.95, spin);
      }
      break;
    }
    case 2: {
      // Small, thick, many tiny blocks + thin inner line.
      const n = Math.round(range(rng, 48, 72));
      for (let i = 0; i < n; i++) {
        const a0 = (TAU * i) / n;
        block(b, a0, a0 + (TAU / n) * 0.62, r - px(5), r + px(5), y, px(7), colors.cyan, 0.95, spin);
      }
      circle(l, r - px(10), y, colors.cyan, 0.7, spin);
      break;
    }
    case 3: {
      // Medium, thin, nearly transparent: many fine elements + hairline ticks.
      const n = Math.round(range(rng, 80, 120));
      for (let i = 0; i < n; i++) {
        if (rng() < 0.25) continue;
        const a0 = (TAU * i) / n;
        block(b, a0, a0 + (TAU / n) * range(rng, 0.3, 0.8), r - px(1.5), r + px(1.5), y, px(2), colors.ice, 0.35, spin);
      }
      circle(l, r + px(6), y, colors.cyan, 0.3, spin);
      for (let i = 0; i < 72; i++) {
        const a = (TAU * i) / 72;
        l.segment(at(r + px(6), a, y), at(r + px(11), a, y), colors.cyan, 0.35, spin);
      }
      break;
    }
    case 4: {
      // Medium, thick blocks with machinery chunks, tick band, occasional magenta segment.
      const n = Math.round(range(rng, 34, 48));
      const magentaAt = rng() < 0.6 ? Math.floor(rng() * n) : -1;
      for (let i = 0; i < n; i++) {
        if (rng() < 0.12) continue;
        const a0 = (TAU * i) / n;
        const chunk = rng() < 0.18;
        const color = i === magentaAt ? colors.magenta : colors.cyan;
        block(b, a0, a0 + (TAU / n) * (chunk ? 0.9 : 0.7), r - px(chunk ? 10 : 7), r + px(7), y, px(chunk ? 14 : 9), color, 0.95, spin);
      }
      circle(l, r - px(14), y + px(3), colors.cyan, 0.45, spin);
      for (let i = 0; i < 120; i++) {
        const a = (TAU * i) / 120;
        l.segment(at(r - px(14), a, y + px(3)), at(r - px(18), a, y + px(3)), colors.cyan, 0.4, spin);
      }
      break;
    }
    case 5: {
      // Large, 1–3 fine lines around the stream.
      const lines = 1 + Math.floor(rng() * 3);
      for (let i = 0; i < lines; i++) circle(l, r + px(7 * i), y, colors.cyan, 0.45 - i * 0.1, spin);
      break;
    }
  }
}

function typeForDiameter(d: number, rng: Rng): RingType {
  if (d > 500) return 5;
  if (d > 230) return pick(rng, [3, 4] as const);
  return pick(rng, [1, 2] as const);
}

export function buildRingGeometry(colors: RingColors, seed = 20261024) {
  const rng = seededRandom(seed);
  const blocks = new Builder();
  const lines = new Builder();

  for (const [top, bottom, diameters] of RING_CLUSTERS) {
    const levelCount = bottom - top > 110 ? 3 : 2;
    const levels = Array.from({ length: levelCount }, (_, i) =>
      top + ((bottom - top) * i) / (levelCount - 1),
    );
    const clusterDir = rng() < 0.5 ? 1 : -1;

    // Spread the cluster's rings over its levels, every level gets at least one.
    const sorted = [...diameters];
    for (let i = sorted.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [sorted[i], sorted[j]] = [sorted[j]!, sorted[i]!];
    }
    sorted.forEach((d, i) => {
      const levelIndex = i < levelCount ? i : Math.floor(rng() * levelCount);
      const type = typeForDiameter(d, rng);
      const period = TURN_PERIOD[type] * range(rng, 0.8, 1.2);
      // Neighbouring levels counter-rotate.
      const dir = clusterDir * (levelIndex % 2 === 0 ? 1 : -1);
      const spin = (dir * Math.PI * 2) / period;
      buildRing(type, toWorld(d / 2), toWorldY(levels[levelIndex]!), spin, rng, colors, blocks, lines);
    });
  }

  return { blocks: blocks.geometry(), lines: lines.geometry() };
}
