"use client";

import { useCallback, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { readPalette } from "./palette";
import { MOBILE_SCALE } from "./streamSpec";
import { useIsMobile } from "./useIsMobile";
import { Sky } from "./Sky";
import { Silhouettes } from "./Silhouettes";
import { Dust } from "./Dust";
import { LightSource } from "./LightSource";
import { Beam } from "./Beam";
import { CameraRig } from "./CameraRig";
import { Rings } from "./Rings";
import { Fragments } from "./Fragments";
import { EmitterFloor } from "./EmitterFloor";
import { CoreLock } from "./CoreLock";
import { OrbitRing } from "./OrbitRing";
import { CoreHeartbeat } from "./CoreHeartbeat";
import { AdaptiveEffects } from "./Effects";
import { Warmup } from "./Warmup";
import { CalmZones } from "./calmZones";

/** Time used for the single still frame under reduced motion (particles spread out, not bunched at t = 0). */
const STILL_TIME = 6;
/** Long lens: keeps every ring at the same ellipse ratio from top to bottom, like the flat Figma drawing. */
const CAMERA_FOV = 8;
/** Fewer cubes on phones: smaller screen, weaker GPU. */
const CUBE_COUNT = { desktop: 170, mobile: 90 } as const;
/**
 * The WebGL data stream behind the page. Client only (loaded by StageLoader
 * with ssr: false), so the DOM content paints first and stays readable
 * without it. The CSS sky gradient behind it is the fallback when WebGL is
 * unavailable.
 */
export default function Stage() {
  const still = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const scale = isMobile ? MOBILE_SCALE : 1;
  const palette = useMemo(() => readPalette(), []);
  // Ready once every shader is compiled (Warmup). Until then nothing renders and the canvas stays hidden.
  const [ready, setReady] = useState(false);
  const onWarm = useCallback(() => setReady(true), []);

  return (
    <div
      aria-hidden
      data-stage={ready ? "ready" : "loading"}
      className={
        "pointer-events-none fixed inset-0 -z-10 transition-opacity duration-[var(--dur-ui)] ease-[var(--ease-out)] " +
        (ready ? "opacity-100" : "opacity-0")
      }
    >
      <Canvas
        flat
        dpr={[1, 1.75]}
        frameloop={!ready ? "never" : still ? "demand" : "always"}
        camera={{ fov: CAMERA_FOV, near: 1, far: 600, position: [0, 0, 60] }}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        fallback={null}
      >
        <CoreHeartbeat still={still} />
        <CalmZones />
        <CameraRig scale={scale} still={still} />
        <Sky palette={palette} scale={scale} />
        <Silhouettes palette={palette} scale={scale} still={still} mobile={isMobile} />
        <Dust palette={palette} scale={scale} still={still} mobile={isMobile} />
        <LightSource palette={palette} />
        <EmitterFloor palette={palette} />
        <OrbitRing palette={palette} still={still} mobile={isMobile} />
        <CoreLock palette={palette} still={still} stillTime={STILL_TIME} />
        <Rings palette={palette} still={still} stillTime={STILL_TIME} />
        <Fragments
          palette={palette}
          count={isMobile ? CUBE_COUNT.mobile : CUBE_COUNT.desktop}
          still={still}
          stillTime={STILL_TIME}
        />
        <Beam palette={palette} still={still} stillTime={STILL_TIME} />
        <AdaptiveEffects still={still} />
        <Warmup onDone={onWarm} />
      </Canvas>
    </div>
  );
}
