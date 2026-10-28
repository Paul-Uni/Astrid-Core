"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry, type Mesh, type ShaderMaterial } from "three";
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
  // Typed arrays sized up front: ~60k vertices, built on the main thread while the stage mounts.
  const pos = new Float32Array((1 + RINGS * SEGMENTS) * 3);
  let p = 3;
  for (let i = 1; i <= RINGS; i++) {
    const r = radius * (i / RINGS) ** 2.4;
    for (let j = 0; j < SEGMENTS; j++) {
      const a = (j / SEGMENTS) * Math.PI * 2;
      pos[p++] = Math.cos(a) * r;
      pos[p++] = Math.sin(a) * r;
      p++;
    }
  }
  const index = new Uint32Array(SEGMENTS * 3 + (RINGS - 1) * SEGMENTS * 6);
  let k = 0;
  const v = (i: number, j: number) => 1 + (i - 1) * SEGMENTS + (j % SEGMENTS);
  for (let j = 0; j < SEGMENTS; j++) {
    index[k++] = 0;
    index[k++] = v(1, j);
    index[k++] = v(1, j + 1);
  }
  for (let i = 1; i < RINGS; i++) {
    for (let j = 0; j < SEGMENTS; j++) {
      index[k++] = v(i, j);
      index[k++] = v(i + 1, j);
      index[k++] = v(i + 1, j + 1);
      index[k++] = v(i, j);
      index[k++] = v(i + 1, j + 1);
      index[k++] = v(i, j + 1);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(pos, 3));
  g.setIndex(new BufferAttribute(index, 1));
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
    () => createFloorMaterial({ cyan: palette["vex-cyan"], ice: palette.ice, dusk: palette["dusk-pink"] }, floor, well, pulseUniforms, STREAM.end.floor),
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
