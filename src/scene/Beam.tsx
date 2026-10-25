"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh, ShaderMaterial } from "three";
import { createBeamMaterial } from "./materials";
import { pulseUniforms } from "./corePulse";
import type { Palette } from "./palette";
import { CORE_Y, RENDER_ORDER, STREAM, toWorld, toWorldY } from "./streamSpec";
import { Billboard } from "./Billboard";

/** Plane wide enough for the 88px beam plus its outer glow. */
const PLANE_WIDTH_PX = 240;
/** The beam comes down from above the page (STREAM.beamTop). In world px (y up). */
const TOP_PX = -STREAM.beamTop.y;

/** The vertical beam of light running from above the page down into the core at the bottom of the well. */
export function Beam({ palette, still, stillTime }: { palette: Palette; still: boolean; stillTime: number }) {
  const bottomPx = -CORE_Y;
  const material = useMemo(
    () =>
      createBeamMaterial(
        { cyan: palette["vex-cyan"], ice: palette.ice, light: palette.light, dusk: palette["dusk-pink"] },
        PLANE_WIDTH_PX,
        TOP_PX,
        STREAM.beamTop.fade,
        bottomPx,
        pulseUniforms,
        // Sheet level in px, up positive (the beam shader's py).
        { sheetPx: -(STREAM.emitter.cy + STREAM.emitter.well.drop), ...STREAM.end.throat },
      ),
    [palette, bottomPx],
  );
  useEffect(() => () => material.dispose(), [material]);

  const mesh = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    (mesh.current.material as ShaderMaterial).uniforms.uTime!.value = still ? stillTime : clock.elapsedTime;
  });

  const top = toWorld(TOP_PX);
  const bottom = toWorldY(CORE_Y);
  return (
    <Billboard>
      <mesh ref={mesh} renderOrder={RENDER_ORDER.beam} position={[0, (top + bottom) / 2, 0]} material={material}>
        <planeGeometry args={[toWorld(PLANE_WIDTH_PX), top - bottom]} />
      </mesh>
    </Billboard>
  );
}
