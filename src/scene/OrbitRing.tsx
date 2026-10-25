"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, LineDashedMaterial, Vector3 } from "three";
import type { Palette } from "./palette";
import { RENDER_ORDER, STREAM, toWorld, toWorldY } from "./streamSpec";
import { STATIONS } from "@/tokens/stations";

const { orbit, well, cy } = STREAM.emitter;
const SEGMENTS = 256;
const DEG = Math.PI / 180;
/** Sheet sag at r px from the axis (same curve as the floor), so the ring lies on the sheet. */
const sag = (r: number) => (well.depth * well.radius ** 2) / (r * r + well.radius ** 2);
const RING_Y = toWorldY(cy + well.drop + sag(orbit.r));

/** Point on the ring at `deg` (0 = screen right, 90 = straight back, as seen from the last station's camera). */
function ringPoint(deg: number, out: Vector3) {
  const t = STATIONS[STATIONS.length - 1]!.theta * DEG;
  const a = deg * DEG;
  // Station 05 view in world xz: screen right and "behind the axis".
  const rx = Math.cos(t);
  const rz = -Math.sin(t);
  const bx = -Math.sin(t);
  const bz = -Math.cos(t);
  const r = toWorld(orbit.r);
  return out.set((Math.cos(a) * rx + Math.sin(a) * bx) * r, RING_Y, (Math.cos(a) * rz + Math.sin(a) * bz) * r);
}

type NodeId = keyof typeof orbit.nodes;
const NODE_IDS = Object.keys(orbit.nodes) as NodeId[];

/**
 * Orbit ring (Figma 49:5916): a dashed dusk-pink circle drawn in 3D on the
 * sheet around the well. The social nodes (DOM, `data-orbit-node`) ride on
 * it: each frame their ring points are projected to the screen and the
 * nodes are moved there on a fixed layer (transform only), diamond center
 * on the ring, so they turn smoothly with the camera instead of lagging a
 * frame behind the page scroll. Off screen they are hidden.
 * Under reduced motion the camera stays put, so the nodes keep their
 * Figma positions from the markup.
 */
export function OrbitRing({ palette, still }: { palette: Palette; still: boolean }) {
  const geometry = useMemo(() => {
    const pts = Array.from({ length: SEGMENTS + 1 }, (_, i) => {
      const a = (i / SEGMENTS) * Math.PI * 2;
      return new Vector3(Math.cos(a) * toWorld(orbit.r), RING_Y, Math.sin(a) * toWorld(orbit.r));
    });
    const g = new BufferGeometry().setFromPoints(pts);
    return g;
  }, []);
  const material = useMemo(
    () =>
      new LineDashedMaterial({
        color: palette["dusk-pink"],
        dashSize: toWorld(orbit.dash),
        gapSize: toWorld(orbit.gap),
        transparent: true,
        opacity: orbit.opacity,
        depthWrite: false,
      }),
    [palette],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  const points = useMemo(() => NODE_IDS.map((id) => ringPoint(orbit.nodes[id], new Vector3())), []);
  const screen = useMemo(() => new Vector3(), []);
  useFrame(({ camera, size }) => {
    if (still) return;
    // CameraRig moved the camera this frame; its matrices refresh only at render time.
    camera.updateMatrixWorld();
    NODE_IDS.forEach((id, i) => {
      const el = document.querySelector<HTMLElement>(`[data-orbit-node="${id}"]`);
      if (!el) return;
      // Fixed layer, like the canvas: positioned only from the projection,
      // in the same frame as the ring, so page scrolling can't make it lag.
      el.style.position = "fixed";
      screen.copy(points[i]!).project(camera);
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      // Diamond center (top 32px of the node) on the ring point; the whole node stays on screen.
      const cx = (screen.x * 0.5 + 0.5) * size.width;
      const cy = (0.5 - screen.y * 0.5) * size.height;
      const x = Math.min(size.width - w, Math.max(0, cx - w / 2));
      const y = cy - 32;
      // Hidden (and out of the tab order) while its ring point is off screen.
      el.style.visibility = y + h < 0 || y > size.height ? "hidden" : "visible";
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    });
  });

  return (
    <lineLoop
      geometry={geometry}
      material={material}
      renderOrder={RENDER_ORDER.back}
      onUpdate={(line) => line.computeLineDistances()}
    />
  );
}
