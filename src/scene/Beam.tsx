"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh, ShaderMaterial } from "three";
import { createBeamMaterial } from "./materials";
import type { Palette } from "./palette";
import { RENDER_ORDER, STREAM, toWorld, toWorldY } from "./streamSpec";
import { Billboard } from "./Billboard";

/** Plane wide enough for the 88px beam plus its outer glow. */
const PLANE_WIDTH_PX = 240;
const TOP_PX = 30; // just under the light source (Figma y −30)

/** The vertical beam of light running from the light source down to the emitter. */
export function Beam({ palette, still, stillTime }: { palette: Palette; still: boolean; stillTime: number }) {
  const bottomPx = -STREAM.emitter.cy;
  const material = useMemo(
    () =>
      createBeamMaterial(
        { cyan: palette["vex-cyan"], ice: palette.ice, light: palette.light },
        PLANE_WIDTH_PX,
        TOP_PX,
        bottomPx,
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
  const bottom = toWorldY(STREAM.emitter.cy);
  return (
    <Billboard>
      <mesh ref={mesh} renderOrder={RENDER_ORDER.beam} position={[0, (top + bottom) / 2, 0]} material={material}>
        <planeGeometry args={[toWorld(PLANE_WIDTH_PX), top - bottom]} />
      </mesh>
    </Billboard>
  );
}
