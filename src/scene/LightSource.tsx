"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Mesh, ShaderMaterial } from "three";
import { useFrame } from "@react-three/fiber";
import { createGlowMaterial } from "./materials";
import type { Palette } from "./palette";
import { CORE_Y, RENDER_ORDER, STREAM, toWorld, toWorldY } from "./streamSpec";
import { Billboard } from "./Billboard";
import { pulseFlare, pulseUniforms } from "./corePulse";

/**
 * Emitter glow at the bottom of the well, where the beam ends in the core.
 * The top of the beam has no source: it comes down from above the page
 * (STREAM.beamTop).
 */
export function LightSource({ palette }: { palette: Palette }) {
  const { emitter } = STREAM;
  // Own color copy: it is tinted per frame and must not touch the palette.
  const material = useMemo(() => createGlowMaterial(palette["vex-cyan"].clone(), 0.35, 2.2), [palette]);
  useEffect(() => () => material.dispose(), [material]);

  // Follows the core beat: flares with each pulse, tints pink on Enter Core hover.
  const mesh = useRef<Mesh>(null);
  useFrame(() => {
    if (!mesh.current) return;
    const { uniforms } = mesh.current.material as ShaderMaterial;
    uniforms.uIntensity!.value = 0.16 + 0.5 * pulseFlare(pulseUniforms.uPulse.value);
    uniforms.uColor!.value.copy(palette["vex-cyan"]).lerp(palette["dusk-pink"], pulseUniforms.uBoost.value);
  });

  return (
    <Billboard>
      <mesh ref={mesh} renderOrder={RENDER_ORDER.beam} position={[0, toWorldY(CORE_Y), 0]} material={material}>
        <planeGeometry args={[toWorld(emitter.glowW), toWorld(emitter.glowH)]} />
      </mesh>
    </Billboard>
  );
}
