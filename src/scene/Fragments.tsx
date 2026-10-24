"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BoxGeometry,
  BufferGeometry,
  EdgesGeometry,
  Float32BufferAttribute,
  type Group,
  type ShaderMaterial,
} from "three";
import { createFragmentMaterial } from "./materials";
import type { Palette } from "./palette";
import { range, seededRandom } from "./random";
import { RENDER_ORDER, STREAM, toWorldY } from "./streamSpec";

type Cube = { origin: [number, number, number]; seed: [number, number, number, number]; orbit: number };

/**
 * Small cubes in front of and behind the stream (DESIGN.md "Fragments"):
 * drift up ~4–10 px/s and a little outward, tumble one turn per 20–40 s,
 * orbit the beam counter-clockwise (one turn per 60–120 s), fade near the
 * end of each life and respawn near the beam.
 */
function makeCubes(count: number): Cube[] {
  const rng = seededRandom(4600);
  const bottom = toWorldY(STREAM.emitter.cy);
  return Array.from({ length: count }, () => ({
    origin: [range(rng, 0.7, 4.6), range(rng, 0, Math.PI * 2), range(rng, bottom, 0.5)],
    seed: [
      range(rng, 4, 10),
      (Math.PI * 2) / range(rng, 20, 40),
      rng(),
      range(rng, 9, 17),
    ],
    orbit: (Math.PI * 2) / range(rng, 60, 120),
  }));
}

/** Copies a base cube geometry once per cube, adding the per-cube animation attributes. */
function mergeCubes(base: BufferGeometry, cubes: Cube[]) {
  const basePos = base.getAttribute("position");
  const baseNrm = base.getAttribute("normal");
  const n = basePos.count;
  const pos = new Float32Array(cubes.length * n * 3);
  const nrm = new Float32Array(cubes.length * n * 3);
  const origin = new Float32Array(cubes.length * n * 3);
  const seed = new Float32Array(cubes.length * n * 4);
  const orbit = new Float32Array(cubes.length * n);
  cubes.forEach((cube, c) => {
    for (let v = 0; v < n; v++) {
      const i = c * n + v;
      pos.set([basePos.getX(v), basePos.getY(v), basePos.getZ(v)], i * 3);
      nrm.set(baseNrm ? [baseNrm.getX(v), baseNrm.getY(v), baseNrm.getZ(v)] : [0, 1, 0], i * 3);
      origin.set(cube.origin, i * 3);
      seed.set(cube.seed, i * 4);
      orbit[i] = cube.orbit;
    }
  });
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new Float32BufferAttribute(nrm, 3));
  g.setAttribute("aOrigin", new Float32BufferAttribute(origin, 3));
  g.setAttribute("aSeed", new Float32BufferAttribute(seed, 4));
  g.setAttribute("aOrbit", new Float32BufferAttribute(orbit, 1));
  return g;
}

export function Fragments({ palette, count, still, stillTime }: { palette: Palette; count: number; still: boolean; stillTime: number }) {
  const geometry = useMemo(() => {
    const cubes = makeCubes(count);
    const box = new BoxGeometry(1, 1, 1).toNonIndexed();
    const edges = new EdgesGeometry(new BoxGeometry(1, 1, 1));
    const result = { faces: mergeCubes(box, cubes), edges: mergeCubes(edges, cubes) };
    box.dispose();
    edges.dispose();
    return result;
  }, [count]);

  const materials = useMemo(() => {
    const colors = { top: palette["indigo-raised"], side: palette.indigo, edge: palette["vex-cyan"] };
    return {
      facesBack: createFragmentMaterial("back", "faces", colors),
      edgesBack: createFragmentMaterial("back", "edges", colors),
      facesFront: createFragmentMaterial("front", "faces", colors),
      edgesFront: createFragmentMaterial("front", "edges", colors),
    };
  }, [palette]);

  useEffect(
    () => () => {
      geometry.faces.dispose();
      geometry.edges.dispose();
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
      <mesh geometry={geometry.faces} material={materials.facesBack} renderOrder={RENDER_ORDER.back} frustumCulled={false} />
      <lineSegments geometry={geometry.edges} material={materials.edgesBack} renderOrder={RENDER_ORDER.back} frustumCulled={false} />
      <mesh geometry={geometry.faces} material={materials.facesFront} renderOrder={RENDER_ORDER.front} frustumCulled={false} />
      <lineSegments geometry={geometry.edges} material={materials.edgesFront} renderOrder={RENDER_ORDER.front} frustumCulled={false} />
    </group>
  );
}
