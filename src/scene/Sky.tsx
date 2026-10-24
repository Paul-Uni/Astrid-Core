"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh, ShaderMaterial } from "three";
import { createSkyMaterial } from "./materials";
import type { Palette } from "./palette";

/** Full-screen sky drawn first, behind everything (same gradient as the CSS fallback). */
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
  useFrame(({ size }) => {
    if (!mesh.current) return;
    const { uniforms } = mesh.current.material as ShaderMaterial;
    uniforms.uResolution!.value = [size.width, size.height];
    uniforms.uHazeScale!.value = scale;
  });

  return (
    <mesh ref={mesh} material={material} frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
