"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BoxGeometry,
  BufferGeometry,
  EdgesGeometry,
  Euler,
  Float32BufferAttribute,
  type Group,
  Matrix4,
  Quaternion,
  type ShaderMaterial,
  type Vector2,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { createStructureMaterial } from "./materials";
import type { Palette } from "./palette";
import { range, seededRandom, type Rng } from "./random";
import { RENDER_ORDER, STREAM, toWorld, toWorldY } from "./streamSpec";

const { floor, well, cy, pillars: P } = STREAM.emitter;
const CELL = floor.gridCell;
const FLOOR_Y = cy + well.drop;
const DEG = Math.PI / 180;

/**
 * Box in grid space: center (u, v) in cells on the floor grid (createFloorMaterial's
 * q coordinates), bottom `y` cells above the floor, w × d × h cells.
 * `float` = bob amplitude in cells (0 = grounded), `phase` = bob phase.
 */
type QBox = { u: number; v: number; y: number; w: number; d: number; h: number; float: number; phase: number };
/** Line segment in grid space: [u, v, y] → [u, v, y] (cells), with its bob. */
type QSeg = { a: [number, number, number]; b: [number, number, number]; float: number; phase: number };
type Parts = { solids: QBox[]; frames: QBox[]; lines: QSeg[] };

const emptyParts = (): Parts => ({ solids: [], frames: [], lines: [] });

/** Sheet sag at r px from the axis (same curve as the floor). */
const sag = (r: number) => (well.depth * well.radius ** 2) / (r * r + well.radius ** 2);

/** Grid point (cells) → sheet px (createFloorMaterial: q = (p.x + p.y, p.y − p.x) / √2 / cell). */
function qToP(u: number, v: number) {
  const a = u * CELL * Math.SQRT2;
  const b = v * CELL * Math.SQRT2;
  return { x: (a - b) / 2, y: (a + b) / 2 };
}
/** Grid point + height (cells) → world position. The sheet's local y is world −z. */
function qToWorld(u: number, v: number, yCells: number) {
  const p = qToP(u, v);
  return new Vector3(toWorld(p.x), toWorldY(FLOOR_Y - yCells * CELL), -toWorld(p.y));
}

/** Turns a local offset by k quarter turns (keeps the pillars rotation-symmetric). */
const turn = (k: number, du: number, dv: number): [number, number] => {
  const t = ((k % 4) + 4) % 4;
  return t === 0 ? [du, dv] : t === 1 ? [-dv, du] : t === 2 ? [-du, -dv] : [dv, -du];
};

/**
 * One pillar: stacked tiers narrowing upward (1-cell setbacks, some shifted
 * off-center), a recessed notch, a cantilever, a stair-stepped "pixel" top,
 * scaffold frames 1 cell larger than a tier with corner lines overshooting,
 * and a short chain of floating wire cubes. Every size is whole cells.
 */
function composePillar(rng: Rng, cu: number, cv: number, k: number, size: number, height: number): Parts {
  const out = emptyParts();
  const box = (du: number, dv: number, y: number, w: number, d: number, h: number, list: QBox[], float = 0, phase = 0) => {
    const [ru, rv] = turn(k, du, dv);
    const [rw, rd] = k % 2 ? [d, w] : [w, d];
    list.push({ u: cu + ru, v: cv + rv, y, w: rw, d: rd, h, float, phase });
  };
  const seg = (a: [number, number, number], b: [number, number, number]) => {
    const [au, av] = turn(k, a[0], a[1]);
    const [bu, bv] = turn(k, b[0], b[1]);
    out.lines.push({ a: [cu + au, cv + av, a[2]], b: [cu + bu, cv + bv, b[2]], float: 0, phase: 0 });
  };
  /** Scaffold frame around a tier (1 cell larger), with corner lines overshooting up and out. */
  const scaffold = (du: number, dv: number, y: number, w: number, d: number, h: number) => {
    box(du, dv, y, w + 1, d + 1, h, out.frames);
    const top = y + h;
    const hu = (w + 1) / 2;
    const hv = (d + 1) / 2;
    const up = 1 + Math.floor(rng() * 3);
    const side = 1 + Math.floor(rng() * 2);
    seg([du + hu, dv + hv, top], [du + hu, dv + hv, top + up]);
    seg([du - hu, dv - hv, top], [du - hu, dv - hv, top + up]);
    seg([du + hu, dv - hv, top], [du + hu + side, dv - hv, top]);
    seg([du - hu, dv + hv, top], [du - hu, dv + hv + side, top]);
  };

  // Tiers: 3–4, narrowing by one cell, some shifted half a cell off-center.
  const tiers = height > 20 ? 4 : 3;
  const weights = Array.from({ length: tiers }, () => range(rng, 0.7, 1.3));
  const sum = weights.reduce((s, x) => s + x, 0);
  let y = 0;
  let w = size;
  let du = 0;
  let dv = 0;
  const steps = 2 + Math.floor(rng() * 2);
  const body = height - steps;
  weights.forEach((wt, i) => {
    const h = i === tiers - 1 ? body - y : Math.max(2, Math.round((wt / sum) * body));
    if (i === 1) {
      // Recessed notch: a 1–2 cell band one cell narrower.
      const n = 1 + Math.floor(rng() * 2);
      box(du, dv, y, w - 1, w - 1, n, out.solids);
      box(du, dv, y + n, w, w, h - n, out.solids);
    } else {
      box(du, dv, y, w, w, h, out.solids);
    }
    if (i === 0 || (i === 2 && rng() < 0.6)) scaffold(du, dv, y, w, w, h);
    if (i === 1) {
      // Cantilever: a 2–3 cell arm out of one side.
      const len = 2 + Math.floor(rng() * 2);
      box(du + w / 2 + len / 2, dv, y + Math.floor(h * 0.6), len, 1, 1 + Math.floor(rng() * 2), out.solids);
    }
    if (i === 1 && height > 14) {
      // Floating wire cubes: a chain of 2–4 frames off the opposite side, bobbing.
      const n = 2 + Math.floor(rng() * 3);
      let off = w / 2 + 1;
      for (let c = 0; c < n; c++) {
        const s = 1 + Math.floor(rng() * 3);
        box(du - off - s / 2, dv + range(rng, -1, 1), y + Math.floor(h / 2) + c % 2, s, s, s, out.frames, P.bob, rng() * Math.PI * 2);
        off += s + Math.floor(rng() * 2);
      }
    }
    y += h;
    if (w > 2) {
      w -= 1;
      const shift = rng() < 0.5 ? 0.5 : -0.5;
      if (rng() < 0.5) du += shift;
      else dv += shift;
    }
  });
  // Stair-stepped pixel top: single-cell steps climbing to one corner.
  for (let s = 0; s < steps; s++) {
    const sw = Math.max(1, w - 1 - s);
    box(du + (w - sw) / 2, dv + (w - sw) / 2, y + s, sw, sw, 1, out.solids);
  }
  return out;
}

/** A floating module: a small block with its scaffold, or a wire-cube pair; bobs in place. */
function floatingModule(rng: Rng, u: number, v: number, level: number): Parts {
  const out = emptyParts();
  const phase = rng() * Math.PI * 2;
  const w = 1 + Math.floor(rng() * 3);
  const d = 1 + Math.floor(rng() * 2);
  const h = 1 + Math.floor(rng() * 2);
  if (rng() < 0.6) {
    out.solids.push({ u, v, y: level, w, d, h, float: P.bob, phase });
    out.frames.push({ u, v, y: level, w: w + 1, d: d + 1, h, float: P.bob, phase });
  } else {
    out.frames.push({ u, v, y: level, w: 2, d: 2, h: 2, float: P.bob, phase });
    out.frames.push({ u: u + 2.5, v, y: level + 1, w: 1, d: 1, h: 1, float: P.bob, phase });
  }
  return out;
}

function layout(): Parts {
  const all = emptyParts();
  const add = (p: Parts) => {
    all.solids.push(...p.solids);
    all.frames.push(...p.frames);
    all.lines.push(...p.lines);
  };
  for (let k = 0; k < 4; k++) {
    // Inner: on the grid axes. Outer: on the diagonals. Same seed per ring, turned by k.
    const ia = P.layoutTurn * DEG + (k * Math.PI) / 2;
    const [iu, iv] = [Math.round(Math.cos(ia) * P.inner.r), Math.round(Math.sin(ia) * P.inner.r)];
    add(composePillar(seededRandom(141), iu, iv, k, P.inner.size, P.inner.height));
    const oa = ia + Math.PI / 4;
    const [ou, ov] = [Math.round(Math.cos(oa) * P.outer.r), Math.round(Math.sin(oa) * P.outer.r)];
    add(composePillar(seededRandom(242), ou, ov, k, P.outer.size, P.outer.height));
  }
  // Floating modules on a ring between the pillars, alternating levels.
  const rng = seededRandom(343);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8 + P.layoutTurn * DEG;
    const u = Math.round(Math.cos(a) * P.floatRing);
    const v = Math.round(Math.sin(a) * P.floatRing);
    P.floatLevels.forEach((level, j) => {
      if ((i + j) % 2) add(floatingModule(rng, u, v, level));
    });
  }
  return all;
}

const GRID_TURN = new Quaternion().setFromEuler(new Euler(0, Math.PI / 4, 0));

/** Adds the bob attribute (amplitude in world units, phase) to every vertex of a part. */
function withFloat(g: BufferGeometry, float: number, phase: number) {
  const n = g.getAttribute("position").count;
  const f = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) f.set([toWorld(float * CELL), phase], i * 2);
  g.setAttribute("aFloat", new Float32BufferAttribute(f, 2));
  return g;
}

/** Boxes → one merged geometry (faces or outlines), turned onto the grid, grounded ones sunk into the sheet. */
function boxGeometry(boxes: QBox[], edges: boolean): BufferGeometry {
  const unit = new BoxGeometry(1, 1, 1);
  const base = edges ? new EdgesGeometry(unit) : unit.toNonIndexed();
  if (!edges) base.deleteAttribute("uv");
  const m = new Matrix4();
  const parts = boxes.map(({ u, v, y, w, d, h, float, phase }) => {
    const p = qToP(u, v);
    const r = Math.hypot(p.x, p.y);
    const top = FLOOR_Y - (y + h) * CELL;
    // Grounded parts reach down to where the sheet sags under their footprint.
    const bottom = y === 0 ? FLOOR_Y + sag(Math.max(r - Math.max(w, d) * CELL * 0.75, well.radius)) + 10 : FLOOR_Y - y * CELL;
    const pos = new Vector3(toWorld(p.x), toWorldY((top + bottom) / 2), -toWorld(p.y));
    const scale = new Vector3(toWorld(w * CELL), toWorld(bottom - top), toWorld(d * CELL));
    return withFloat(base.clone().applyMatrix4(m.compose(pos, GRID_TURN, scale)), float, phase);
  });
  const merged = mergeGeometries(parts)!;
  [unit, base, ...parts].forEach((g) => g.dispose());
  return merged;
}

function segmentGeometry(segs: QSeg[]): BufferGeometry {
  const pos = new Float32Array(segs.length * 6);
  const f = new Float32Array(segs.length * 4);
  segs.forEach(({ a, b, float, phase }, i) => {
    pos.set([...qToWorld(...a).toArray(), ...qToWorld(...b).toArray()], i * 6);
    f.set([toWorld(float * CELL), phase, toWorld(float * CELL), phase], i * 4);
  });
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("aFloat", new Float32BufferAttribute(f, 2));
  return g;
}

/**
 * Floor pillars (DESIGN.md "Floor pillars"): eight composed megastructures
 * standing symmetrically on the floor grid around the well, plus floating
 * modules between them. Pillars between the camera and
 * the beam fade out in the beam column (material), so the stream stays clear.
 * Three draw calls: solid faces, solid outlines, scaffold lines.
 */
export function FloorPillars({ palette, scale, still, stillTime }: { palette: Palette; scale: number; still: boolean; stillTime: number }) {
  const geometry = useMemo(() => {
    const parts = layout();
    const frames = boxGeometry(parts.frames, true);
    const lines = segmentGeometry(parts.lines);
    const scaffold = mergeGeometries([frames, lines])!;
    frames.dispose();
    lines.dispose();
    return { faces: boxGeometry(parts.solids, false), edges: boxGeometry(parts.solids, true), scaffold };
  }, []);
  const materials = useMemo(() => {
    const colors = { void: palette.void, top: palette["indigo-raised"], edge: palette["vex-cyan"], scaffold: palette.ice };
    const spec = { floorY: toWorldY(FLOOR_Y), hazeStart: P.haze.start, hazeEnd: P.haze.end, column: P.column, bobPeriod: P.bobPeriod };
    return {
      faces: createStructureMaterial("faces", colors, spec),
      edges: createStructureMaterial("edges", colors, spec),
      scaffold: createStructureMaterial("scaffold", colors, { ...spec, hazeEnd: P.haze.end + P.haze.scaffoldExtra }),
    };
  }, [palette]);
  useEffect(() => () => Object.values(geometry).forEach((g) => g.dispose()), [geometry]);
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);

  const group = useRef<Group>(null);
  useFrame(({ gl, clock, camera }) => {
    group.current?.children.forEach((child) => {
      const { uniforms } = (child as unknown as { material: ShaderMaterial }).material;
      gl.getDrawingBufferSize(uniforms.uViewport!.value as Vector2);
      uniforms.uDpr!.value = gl.getPixelRatio();
      uniforms.uScale!.value = scale;
      uniforms.uTime!.value = still ? stillTime : clock.elapsedTime;
      (uniforms.uCamPos!.value as Vector3).copy(camera.position);
    });
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry.faces} material={materials.faces} renderOrder={RENDER_ORDER.back} frustumCulled={false} />
      <lineSegments geometry={geometry.edges} material={materials.edges} renderOrder={RENDER_ORDER.back} frustumCulled={false} />
      <lineSegments geometry={geometry.scaffold} material={materials.scaffold} renderOrder={RENDER_ORDER.back} frustumCulled={false} />
    </group>
  );
}
