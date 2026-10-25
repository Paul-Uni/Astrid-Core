"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, Float32BufferAttribute, type Mesh, type ShaderMaterial } from "three";
import { createFloorMaterial } from "./materials";
import { pulseUniforms } from "./corePulse";
import type { Palette } from "./palette";
import { RENDER_ORDER, STREAM, toWorld, toWorldY } from "./streamSpec";

/** Polar sheet resolution: rings packed toward the center so the narrow throat stays smooth. */
const RINGS = 240;
const SEGMENTS = 256;

/**
 * Flat polar sheet in the xy plane (same orientation as a PlaneGeometry).
 * Ring radii grow with (i / RINGS)^2.4: sub-pixel steps at the throat,
 * coarser out on the flat part, where the sheet barely bends.
 */
function polarSheet(radius: number) {
  const pos: number[] = [0, 0, 0];
  for (let i = 1; i <= RINGS; i++) {
    const r = radius * (i / RINGS) ** 2.4;
    for (let j = 0; j < SEGMENTS; j++) {
      const a = (j / SEGMENTS) * Math.PI * 2;
      pos.push(Math.cos(a) * r, Math.sin(a) * r, 0);
    }
  }
  const index: number[] = [];
  const v = (i: number, j: number) => 1 + (i - 1) * SEGMENTS + (j % SEGMENTS);
  for (let j = 0; j < SEGMENTS; j++) index.push(0, v(1, j), v(1, j + 1));
  for (let i = 1; i < RINGS; i++) {
    for (let j = 0; j < SEGMENTS; j++) {
      index.push(v(i, j), v(i + 1, j), v(i + 1, j + 1), v(i, j), v(i + 1, j + 1), v(i, j + 1));
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setIndex(index);
  return g;
}

/**
 * The emitter at the bottom of the stream (References/"example lock"):
 * a spacetime sheet with a narrow, very deep gravity well the beam falls
 * into. The Core lock lies over the well's mouth (CoreLock).
 */
export function EmitterFloor({ palette }: { palette: Palette }) {
  const { floor, well, cy } = STREAM.emitter;
  const floorMaterial = useMemo(
    () => createFloorMaterial({ cyan: palette["vex-cyan"], ice: palette.ice, dusk: palette["dusk-pink"] }, floor, well, pulseUniforms),
    [palette, floor, well],
  );
  const geometry = useMemo(() => polarSheet(toWorld(floor.radius)), [floor.radius]);
  useEffect(() => () => floorMaterial.dispose(), [floorMaterial]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const floorMesh = useRef<Mesh>(null);
  useFrame(({ gl }) => {
    if (!floorMesh.current) return;
    gl.getDrawingBufferSize((floorMesh.current.material as ShaderMaterial).uniforms.uViewport!.value);
  });

  return (
    <mesh
      ref={floorMesh}
      renderOrder={RENDER_ORDER.back}
      position={[0, toWorldY(cy + well.drop), 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      geometry={geometry}
      material={floorMaterial}
    />
  );
}
