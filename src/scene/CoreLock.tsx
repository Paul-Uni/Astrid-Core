"use client";

import { useEffect, useMemo } from "react";
import { EdgesGeometry, Path, Shape, ShapeGeometry } from "three";
import { createLockEdgeMaterial, createLockMaterial } from "./materials";
import { pulseUniforms } from "./corePulse";
import type { Palette } from "./palette";
import { RENDER_ORDER, STREAM, toWorld, toWorldY } from "./streamSpec";
import { STATIONS } from "@/tokens/stations";

type LockSpec = typeof STREAM.emitter.lock;

/** Draws after the floor, before the beam: its depth hides the beam below it, except through the keyhole. */
const LOCK_ORDER = (RENDER_ORDER.back + RENDER_ORDER.beam) / 2;
/**
 * Turn about the beam axis. The floor grid runs at 45° (createFloorMaterial),
 * so the lock snaps to the grid direction closest to the camera's angle at
 * the last station: its edges run along the grid lines, shackle away.
 */
const FACING = ((Math.round((STATIONS[STATIONS.length - 1]!.theta - 45) / 90) * 90 + 45) * Math.PI) / 180;
/** Keyhole sits this share of the body height above the body's center, like a real padlock. */
const KEYHOLE_RAISE = 0.1;
/** Lifts the lock 1px off the sheet so the two never z-fight. */
const LIFT = 1;

/** Keyhole outline: round top centered on the origin, tapered slot below it with a rounded foot. */
function keyholePath({ radius, slot, slotTop, slotBottom }: LockSpec["keyhole"]) {
  const top = slotTop / 2;
  const bottom = slotBottom / 2;
  const meet = Math.sqrt(radius * radius - top * top);
  const path = new Path();
  path.moveTo(-top, -meet);
  path.lineTo(-bottom, -slot + bottom * 0.6);
  path.quadraticCurveTo(0, -slot - bottom * 0.4, bottom, -slot + bottom * 0.6);
  path.lineTo(top, -meet);
  path.absarc(0, 0, radius, Math.atan2(-meet, top), Math.atan2(-meet, -top) + Math.PI * 2, false);
  return path;
}

/**
 * Flat padlock silhouette in Figma px, in the xy plane: body (rounded
 * rectangle with the keyhole cut out) and shackle (an arch standing on the
 * body's top edge). Origin = center of the keyhole's round part.
 */
function lockShapes({ body, shackle, keyhole }: LockSpec) {
  const x0 = -body.w / 2;
  const y0 = -body.h * KEYHOLE_RAISE - body.h / 2;
  const x1 = x0 + body.w;
  const y1 = y0 + body.h;
  const r = body.radius;
  const plate = new Shape();
  plate.moveTo(x0 + r, y0);
  plate.lineTo(x1 - r, y0);
  plate.quadraticCurveTo(x1, y0, x1, y0 + r);
  plate.lineTo(x1, y1 - r);
  plate.quadraticCurveTo(x1, y1, x1 - r, y1);
  plate.lineTo(x0 + r, y1);
  plate.quadraticCurveTo(x0, y1, x0, y1 - r);
  plate.lineTo(x0, y0 + r);
  plate.quadraticCurveTo(x0, y0, x0 + r, y0);
  plate.holes.push(keyholePath(keyhole));

  // Shackle: two straight legs up from the body, joined by a half circle.
  const outer = shackle.radius + shackle.bar / 2;
  const inner = shackle.radius - shackle.bar / 2;
  const top = y1 + shackle.leg;
  const arch = new Shape();
  arch.moveTo(-outer, y1);
  arch.lineTo(-outer, top);
  arch.absarc(0, top, outer, Math.PI, 0, true);
  arch.lineTo(outer, y1);
  arch.lineTo(inner, y1);
  arch.lineTo(inner, top);
  arch.absarc(0, top, inner, 0, Math.PI, false);
  arch.lineTo(-inner, y1);
  arch.closePath();
  return [plate, arch];
}

/**
 * The Core lock (References/"example lock"): one flat padlock of
 * translucent dark glass lying on the spacetime sheet over the gravity well's
 * mouth, turned to match the floor grid, as if covering the hole.
 * The beam falls through its keyhole into the throat. Lit by the core
 * heartbeat (corePulse). Dark glass with a magenta-core edge; Enter Core
 * hover turns the edge vex-cyan (eased by the boost value). No motion of its own.
 */
export function CoreLock({ palette }: { palette: Palette }) {
  const { lock, cy, well } = STREAM.emitter;
  const { fill, edges } = useMemo(() => {
    const fill = new ShapeGeometry(lockShapes(lock), 24);
    return { fill, edges: new EdgesGeometry(fill) };
  }, [lock]);
  const material = useMemo(
    () =>
      createLockMaterial(
        { void: palette.void, locked: palette["magenta-core"], open: palette["vex-cyan"], ice: palette.ice },
        pulseUniforms,
      ),
    [palette],
  );
  const edgeMaterial = useMemo(
    () => createLockEdgeMaterial({ locked: palette["magenta-core"], open: palette["vex-cyan"], light: palette.light }, pulseUniforms),
    [palette],
  );
  useEffect(
    () => () => {
      fill.dispose();
      edges.dispose();
    },
    [fill, edges],
  );
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => () => edgeMaterial.dispose(), [edgeMaterial]);

  return (
    <group
      position={[0, toWorldY(cy + well.drop - LIFT), 0]}
      rotation={[-Math.PI / 2, FACING, 0, "YXZ"]}
      scale={toWorld(1)}
    >
      <mesh renderOrder={LOCK_ORDER} geometry={fill} material={material} />
      <lineSegments renderOrder={LOCK_ORDER} geometry={edges} material={edgeMaterial} />
    </group>
  );
}
