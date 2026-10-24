"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, ShaderMaterial } from "three";
import { buildRingGeometry } from "./ringGeometry";
import { createRingMaterial } from "./materials";
import type { Palette } from "./palette";
import { RENDER_ORDER } from "./streamSpec";

/** All level rings of the stream, slowly counter-rotating around the beam. */
export function Rings({ palette, still, stillTime }: { palette: Palette; still: boolean; stillTime: number }) {
  const geometry = useMemo(
    () => buildRingGeometry({ cyan: palette["vex-cyan"], ice: palette.ice, magenta: palette["magenta-core"] }),
    [palette],
  );
  const materials = useMemo(
    () => ({
      blocksBack: createRingMaterial("back", true),
      blocksFront: createRingMaterial("front", true),
      linesBack: createRingMaterial("back", false),
      linesFront: createRingMaterial("front", false),
    }),
    [],
  );
  useEffect(
    () => () => {
      geometry.blocks.dispose();
      geometry.lines.dispose();
      Object.values(materials).forEach((m) => m.dispose());
    },
    [geometry, materials],
  );

  const group = useRef<Group>(null);
  useFrame(({ clock, camera }) => {
    const time = still ? stillTime : clock.elapsedTime;
    group.current?.children.forEach((child) => {
      const { uniforms } = (child as unknown as { material: ShaderMaterial }).material;
      uniforms.uTime!.value = time;
      uniforms.uCamPos!.value.copy(camera.position);
    });
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry.blocks} material={materials.blocksBack} renderOrder={RENDER_ORDER.back} frustumCulled={false} />
      <lineSegments geometry={geometry.lines} material={materials.linesBack} renderOrder={RENDER_ORDER.back} frustumCulled={false} />
      <mesh geometry={geometry.blocks} material={materials.blocksFront} renderOrder={RENDER_ORDER.front} frustumCulled={false} />
      <lineSegments geometry={geometry.lines} material={materials.linesFront} renderOrder={RENDER_ORDER.front} frustumCulled={false} />
    </group>
  );
}
