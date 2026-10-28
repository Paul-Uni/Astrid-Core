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
/** px a social node fades over as it slides out from under the contact panel. */
const FADE = 48;

/** Sheet sag at r px from the axis (same curve as the floor), so the ring lies on the sheet. */
const sag = (r: number) => (well.depth * well.radius ** 2) / (r * r + well.radius ** 2);
const ringY = (r: number) => toWorldY(cy + well.drop + sag(r));

/** Point on a ring of radius `radius` px at `deg` (0 = screen right, 90 = straight back, as seen from the last station's camera). */
function ringPoint(deg: number, radius: number, out: Vector3) {
  const t = STATIONS[STATIONS.length - 1]!.theta * DEG;
  const a = deg * DEG;
  // Station 05 view in world xz: screen right and "behind the axis".
  const rx = Math.cos(t);
  const rz = -Math.sin(t);
  const bx = -Math.sin(t);
  const bz = -Math.cos(t);
  const r = toWorld(radius);
  return out.set((Math.cos(a) * rx + Math.sin(a) * bx) * r, ringY(radius), (Math.cos(a) * rz + Math.sin(a) * bz) * r);
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
 * Figma positions from the markup. Phones use the smaller `orbit.mobile`.
 */
export function OrbitRing({ palette, still, mobile }: { palette: Palette; still: boolean; mobile: boolean }) {
  const radius = mobile ? orbit.mobile.r : orbit.r;
  const angles = mobile ? orbit.mobile.nodes : orbit.nodes;
  const geometry = useMemo(() => {
    const y = ringY(radius);
    const pts = Array.from({ length: SEGMENTS + 1 }, (_, i) => {
      const a = (i / SEGMENTS) * Math.PI * 2;
      return new Vector3(Math.cos(a) * toWorld(radius), y, Math.sin(a) * toWorld(radius));
    });
    return new BufferGeometry().setFromPoints(pts);
  }, [radius]);
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

  const points = useMemo(() => NODE_IDS.map((id) => ringPoint(angles[id], radius, new Vector3())), [angles, radius]);
  const screen = useMemo(() => new Vector3(), []);
  // Closest a node gets to the screen edge (--gutter-mobile), so a wide label like DISCORD·COPY
  // never touches it. Read once: it's in rem, so it follows the root font size at mount.
  const edge = useMemo(() => {
    const root = getComputedStyle(document.documentElement);
    return parseFloat(root.getPropertyValue("--gutter-mobile")) * parseFloat(root.fontSize) || 0;
  }, []);
  useFrame(({ camera, size }) => {
    if (still) return;
    // CameraRig moved the camera this frame; its matrices refresh only at render time.
    camera.updateMatrixWorld();
    // The contact panel scrolls with the page while the nodes ride the ring with
    // the camera, so mid-scroll they can meet (mostly on phones).
    const panel = document.querySelector<HTMLElement>("#contact [data-panel]")?.getBoundingClientRect();
    NODE_IDS.forEach((id, i) => {
      const el = document.querySelector<HTMLElement>(`[data-orbit-node="${id}"]`);
      if (!el) return;
      // Fixed layer, like the canvas: positioned only from the projection,
      // in the same frame as the ring, so page scrolling can't make it lag.
      el.style.position = "fixed";
      screen.copy(points[i]!).project(camera);
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      // Diamond center (top 32px of the node) on the ring point; the whole node stays `edge` px inside the screen.
      const cx = (screen.x * 0.5 + 0.5) * size.width;
      const cy = (0.5 - screen.y * 0.5) * size.height;
      const x = Math.min(size.width - w - edge, Math.max(edge, cx - w / 2));
      const y = cy - 32;
      // A node under the panel fades out over its last FADE px of overlap.
      let fade = 1;
      if (panel && x < panel.right && x + w > panel.left) {
        fade = Math.min(1, Math.max(0, (y - panel.bottom) / FADE + 1));
      }
      el.style.opacity = fade.toFixed(2);
      // Hidden (and out of the tab order) while its ring point is off screen or it sits under the panel.
      el.style.visibility = y + h < 0 || y > size.height || fade === 0 ? "hidden" : "visible";
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
