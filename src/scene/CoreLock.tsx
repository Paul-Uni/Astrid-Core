"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { EdgesGeometry, type Group, type Mesh, Path, RingGeometry, type ShaderMaterial, Shape, ShapeGeometry } from "three";
import { createLockEdgeMaterial, createLockMaterial, createLockShadowMaterial } from "./materials";
import { pulseUniforms } from "./corePulse";
import type { Palette } from "./palette";
import { RENDER_ORDER, STREAM, toWorld, toWorldY } from "./streamSpec";
import { STATIONS } from "@/tokens/stations";

type LockSpec = typeof STREAM.emitter.lock;

/** Draws after the floor, before the beam: its depth hides the beam below it, except through the keyhole. */
const LOCK_ORDER = (RENDER_ORDER.back + RENDER_ORDER.beam) / 2;
/** Keyhole sits this share of the body height above the body's center, like a real padlock. */
const KEYHOLE_RAISE = 0.1;
/** Lifts the lock 1px off the sheet so the two never z-fight. */
const LIFT = 1;
/**
 * Turn about the beam axis. The floor grid runs at 45° (createFloorMaterial),
 * so the lock snaps to the grid direction closest to the camera's angle at
 * the last station: its edges run along the grid lines, shackle away.
 */
const FACING = ((Math.round((STATIONS[STATIONS.length - 1]!.theta - 45) / 90) * 90 + 45) * Math.PI) / 180;

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
 * translucent dark glass lying over the gravity well's mouth like a lid,
 * hovering `lock.hover` px above the sheet with a slow bob, turned to match
 * the floor grid. The beam drops through its keyhole into the throat. A soft
 * glow ring on the sheet below is its shadow. Lit by the core heartbeat
 * (corePulse). Ice / vex-cyan glass and edge; Enter Core hover turns the
 * edge magenta (eased by the boost value).
 */
export function CoreLock({ palette, still, stillTime }: { palette: Palette; still: boolean; stillTime: number }) {
  const { lock, cy, well } = STREAM.emitter;
  const { fill, edges, shadow } = useMemo(() => {
    const fill = new ShapeGeometry(lockShapes(lock), 24);
    const reach = lock.shadow.r + lock.shadow.width * 2;
    return { fill, edges: new EdgesGeometry(fill), shadow: new RingGeometry(0, reach, 96, 1) };
  }, [lock]);
  const material = useMemo(
    () =>
      createLockMaterial(
        { void: palette.void, rest: palette["vex-cyan"], hover: palette["magenta-core"], ice: palette.ice },
        pulseUniforms,
      ),
    [palette],
  );
  const edgeMaterial = useMemo(
    () => createLockEdgeMaterial({ rest: palette["vex-cyan"], hover: palette["magenta-core"], light: palette.light }, pulseUniforms),
    [palette],
  );
  const shadowMaterial = useMemo(
    () => createLockShadowMaterial({ rest: palette["vex-cyan"], hover: palette["magenta-core"] }, lock.shadow, pulseUniforms),
    [palette, lock],
  );
  useEffect(
    () => () => {
      fill.dispose();
      edges.dispose();
      shadow.dispose();
    },
    [fill, edges, shadow],
  );
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => () => edgeMaterial.dispose(), [edgeMaterial]);
  useEffect(() => () => shadowMaterial.dispose(), [shadowMaterial]);

  // Bob: ±lock.bob px around the hover height; the shadow ring follows (brighter, tighter when lower).
  const sheetY = toWorldY(cy + well.drop - LIFT);
  const body = useRef<Group>(null);
  const shadowMesh = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    const t = still ? stillTime : clock.elapsedTime;
    const s = still ? 0 : Math.sin((t * Math.PI * 2) / lock.bobPeriod);
    if (body.current) body.current.position.y = sheetY + toWorld(lock.hover + lock.bob * s);
    if (shadowMesh.current) (shadowMesh.current.material as ShaderMaterial).uniforms.uLift!.value = 0.5 + 0.5 * s;
  });

  return (
    <group rotation={[0, FACING, 0]}>
      <group ref={body} position={[0, sheetY + toWorld(lock.hover), 0]} rotation={[-Math.PI / 2, 0, 0]} scale={toWorld(1)}>
        <mesh renderOrder={LOCK_ORDER} geometry={fill} material={material} />
        <lineSegments renderOrder={LOCK_ORDER} geometry={edges} material={edgeMaterial} />
      </group>
      <mesh ref={shadowMesh} position={[0, sheetY, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={toWorld(1)} renderOrder={RENDER_ORDER.back} geometry={shadow} material={shadowMaterial} />
    </group>
  );
}
