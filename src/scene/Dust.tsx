"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, Float32BufferAttribute, type Points, type ShaderMaterial, type Vector2 } from "three";
import { createDustMaterial } from "./materials";
import type { Palette } from "./palette";
import { seededRandom } from "./random";
import { STREAM } from "./streamSpec";
import { useScrollStore } from "@/store/useScrollStore";

const D = STREAM.dust;

/**
 * Dust and data specks drifting in the space around the stream
 * (STREAM.dust). Under reduced motion they hold still.
 */
export function Dust({ palette, scale, still, mobile }: { palette: Palette; scale: number; still: boolean; mobile: boolean }) {
  const count = mobile ? D.count.mobile : D.count.desktop;
  const geometry = useMemo(() => {
    const rng = seededRandom(4242);
    const seed: number[] = [];
    const layer: number[] = [];
    for (let i = 0; i < count; i++) {
      const r = rng();
      const l = r < D.layers[0].share ? 0 : r < D.layers[0].share + D.layers[1].share ? 1 : 2;
      seed.push(rng(), rng(), rng(), rng() < D.glint.share ? 1 : 0);
      layer.push(l);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aSeed", new Float32BufferAttribute(seed, 4));
    g.setAttribute("aLayer", new Float32BufferAttribute(layer, 1));
    return g;
  }, [count]);
  const material = useMemo(() => createDustMaterial({ ice: palette.ice, cyan: palette["vex-cyan"] }), [palette]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  const points = useRef<Points>(null);
  useFrame(({ size, gl, clock }) => {
    if (!points.current) return;
    const { uniforms } = points.current.material as ShaderMaterial;
    (uniforms.uResolution!.value as Vector2).set(size.width, size.height);
    uniforms.uDpr!.value = gl.getPixelRatio();
    uniforms.uScale!.value = scale;
    uniforms.uScroll!.value = still ? 0 : window.scrollY;
    uniforms.uTheta!.value = still ? 0 : useScrollStore.getState().thetaExact;
    uniforms.uTime!.value = still ? 0 : clock.elapsedTime;
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} renderOrder={0} />;
}
