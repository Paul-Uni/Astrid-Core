"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { type Mesh, type ShaderMaterial, type Vector2, Vector3, type Vector4 } from "three";
import { createSilhouetteMaterial } from "./materials";
import type { Palette } from "./palette";
import { STREAM, toWorld, toWorldY } from "./streamSpec";
import { useScrollStore } from "@/store/useScrollStore";

const S = STREAM.silhouettes;
const DEG = Math.PI / 180;
const FLOOR_Y = toWorldY(STREAM.emitter.cy + STREAM.emitter.well.drop);
const R = toWorld(STREAM.emitter.floor.radius);
const center = new Vector3();
const far = new Vector3();
const side = new Vector3();
const look = new Vector3();

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Distant blocky skyline behind the stream (STREAM.silhouettes): rises as
 * you descend, pans with the camera orbit, and on the way to 05 stands on
 * the floor's far edge and sinks into it. Under reduced motion it holds the
 * station 00 view, like the camera.
 */
export function Silhouettes({ palette, scale, still, mobile }: { palette: Palette; scale: number; still: boolean; mobile: boolean }) {
  const material = useMemo(
    () =>
      createSilhouetteMaterial({
        void: palette.void,
        indigo: palette.indigo,
        duskPink: palette["dusk-pink"],
        ice: palette.ice,
      }),
    [palette],
  );
  useEffect(() => () => material.dispose(), [material]);

  const mesh = useRef<Mesh>(null);
  useFrame(({ size, gl, camera }) => {
    if (!mesh.current) return;
    const { uniforms } = mesh.current.material as ShaderMaterial;
    const { thetaExact, progress } = useScrollStore.getState();
    const theta = still ? 0 : thetaExact;
    (uniforms.uResolution!.value as Vector2).set(size.width, size.height);
    uniforms.uDpr!.value = gl.getPixelRatio();
    uniforms.uScale!.value = scale;
    uniforms.uBoost!.value = mobile ? S.mobileBoost : 1;
    uniforms.uTheta!.value = theta;
    uniforms.uProgress!.value = still ? 0 : progress;
    uniforms.uSink!.value = still ? 0 : smoothstep(S.sink.from, S.sink.to, progress);
    // Roof depth on screen: sin(pitch) of the camera looking down, same as the rings.
    uniforms.uRoof!.value = S.roof.depth * Math.max(0, -camera.getWorldDirection(look).y);

    // Floor's far edge on screen: an ellipse through the far point, as wide as the side points.
    const a = theta * DEG;
    const toPx = (v: Vector3) => v.project(camera).set((v.x + 1) * 0.5 * size.width, (1 - v.y) * 0.5 * size.height, v.z);
    toPx(center.set(0, FLOOR_Y, 0));
    toPx(far.set(-Math.sin(a) * R, FLOOR_Y, -Math.cos(a) * R));
    toPx(side.set(Math.cos(a) * R, FLOOR_Y, -Math.sin(a) * R));
    const rim = uniforms.uRim!.value as Vector4;
    if (still || far.z > 1) rim.set(0, 1e5, 1, 0);
    else rim.set(center.x, center.y, Math.max(1, Math.abs(side.x - center.x)), center.y - far.y);
  });

  return (
    <mesh ref={mesh} material={material} frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
