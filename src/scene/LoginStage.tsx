"use client";

import { useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { readPalette } from "./palette";
import { MOBILE_SCALE, PX_PER_UNIT, STREAM } from "./streamSpec";
import { useIsMobile } from "./useIsMobile";
import { Sky } from "./Sky";
import { Dust } from "./Dust";
import { Fragments, type CubeField } from "./Fragments";
import { CalmZones } from "./calmZones";
import { Effects } from "./Effects";

/** Same lens as the main stage, so the cubes read at the same size. */
const CAMERA_FOV = 8;
/** Looking down at the cubes like station 05 does. */
const PITCH = (STREAM.end.pitchDeg * Math.PI) / 180;
const STILL_TIME = 6;
const CUBE_COUNT = { desktop: 70, mobile: 36 } as const;
/** Cubes circle the form, spawning outside its column so they rarely cross the field. */
const CUBE_FIELD: CubeField = { rMin: 3.2, rMax: 8.5, yMin: -1.5, yMax: 2 };

/** Fixed camera: the cubes' axis runs through the middle of the screen. */
function LoginCamera({ scale }: { scale: number }) {
  useFrame(({ camera, size }) => {
    const cam = camera as PerspectiveCamera;
    const halfHeight = size.height / 2 / (PX_PER_UNIT * scale);
    const distance = halfHeight / Math.tan((cam.fov * Math.PI) / 360);
    cam.position.set(0, Math.sin(PITCH) * distance, Math.cos(PITCH) * distance);
    cam.lookAt(0, 0, 0);
  });
  return null;
}

/**
 * WebGL backdrop for /login: the main stage's sky (dark core gradient only,
 * no magenta haze), dust and data cubes, seen from a fixed camera. No beam,
 * rings, lock or floor grid. Cubes fade out around the form and the back link (data-calm). The
 * CSS sky behind it stays the fallback without WebGL.
 */
export default function LoginStage() {
  const still = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const scale = isMobile ? MOBILE_SCALE : 1;
  const palette = useMemo(() => readPalette(), []);
  const [ready, setReady] = useState(false);

  return (
    <div
      aria-hidden
      className={
        "pointer-events-none fixed inset-0 -z-10 transition-opacity duration-[var(--dur-ui)] ease-[var(--ease-out)] " +
        (ready ? "opacity-100" : "opacity-0")
      }
    >
      <Canvas
        flat
        dpr={[1, 1.75]}
        frameloop={still ? "demand" : "always"}
        camera={{ fov: CAMERA_FOV, near: 1, far: 2000, position: [0, 0, 60] }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        fallback={null}
        onCreated={() => setReady(true)}
      >
        <CalmZones />
        <LoginCamera scale={scale} />
        <Sky palette={palette} scale={scale} haze={0} />
        <Dust palette={palette} scale={scale} still={still} mobile={isMobile} />
        <Fragments
          palette={palette}
          count={isMobile ? CUBE_COUNT.mobile : CUBE_COUNT.desktop}
          still={still}
          stillTime={STILL_TIME}
          field={CUBE_FIELD}
          calm={1}
        />
        <Effects />
      </Canvas>
    </div>
  );
}
