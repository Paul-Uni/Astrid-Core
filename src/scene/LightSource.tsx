"use client";

import { useEffect, useMemo } from "react";
import { createGlowMaterial, createShaftMaterial } from "./materials";
import type { Palette } from "./palette";
import { RENDER_ORDER, STREAM, toWorld, toWorldY } from "./streamSpec";
import { Billboard } from "./Billboard";

/** White light source at the top of the stream: core, cyan halo, light shaft. Plus the emitter glow at the bottom. */
export function LightSource({ palette }: { palette: Palette }) {
  const { source, halo, shaft } = STREAM.light;
  const { emitter } = STREAM;

  const materials = useMemo(
    () => ({
      halo: createGlowMaterial(palette["vex-cyan"], 0.38, 2.0),
      source: createGlowMaterial(palette.light, 1.1, 2.6),
      shaft: createShaftMaterial(palette.ice, 0.22),
      emitter: createGlowMaterial(palette["vex-cyan"], 0.35, 2.2),
    }),
    [palette],
  );
  useEffect(
    () => () => Object.values(materials).forEach((m) => m.dispose()),
    [materials],
  );

  return (
    <Billboard>
      <mesh renderOrder={RENDER_ORDER.beam} position={[0, toWorldY(halo.cy), -0.01]} material={materials.halo}>
        <planeGeometry args={[toWorld(halo.w), toWorld(halo.h)]} />
      </mesh>
      <mesh renderOrder={RENDER_ORDER.beam} position={[0, toWorldY(shaft.top + shaft.h / 2), 0]} material={materials.shaft}>
        <planeGeometry args={[toWorld(shaft.w), toWorld(shaft.h)]} />
      </mesh>
      <mesh renderOrder={RENDER_ORDER.beam} position={[0, toWorldY(source.cy), 0.01]} material={materials.source}>
        <planeGeometry args={[toWorld(source.w), toWorld(source.h)]} />
      </mesh>
      <mesh renderOrder={RENDER_ORDER.beam} position={[0, toWorldY(emitter.cy), 0]} material={materials.emitter}>
        <planeGeometry args={[toWorld(emitter.glowW), toWorld(emitter.glowH)]} />
      </mesh>
    </Billboard>
  );
}
