"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { type Mesh, type ShaderMaterial, Vector2, Vector3 } from "three";
import { createSkyMaterial } from "./materials";
import type { Palette } from "./palette";
import { STREAM, toWorldY } from "./streamSpec";

const WELL = new Vector3(0, toWorldY(STREAM.emitter.cy + STREAM.emitter.well.drop), 0);
const projected = new Vector3();

/** Full-screen sky drawn first, behind everything (same gradient as the CSS fallback). Goes dark at the end of the descent, lit from the well. */
export function Sky({ palette, scale }: { palette: Palette; scale: number }) {
  const material = useMemo(
    () =>
      createSkyMaterial({
        void: palette.void,
        indigo: palette.indigo,
        skyMid: palette["sky-mid"],
        duskPink: palette["dusk-pink"],
        magenta: palette["magenta-core"],
      }),
    [palette],
  );
  useEffect(() => () => material.dispose(), [material]);

  const mesh = useRef<Mesh>(null);
  useFrame(({ size, camera }) => {
    if (!mesh.current) return;
    const { uniforms } = mesh.current.material as ShaderMaterial;
    uniforms.uResolution!.value = [size.width, size.height];
    uniforms.uHazeScale!.value = scale;
    // Well mouth on screen (uv), for the end-of-descent glow.
    projected.copy(WELL).project(camera);
    (uniforms.uWell!.value as Vector2).set(projected.x * 0.5 + 0.5, projected.y * 0.5 + 0.5);
  });

  return (
    <mesh ref={mesh} material={material} frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
