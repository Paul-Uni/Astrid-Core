"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { readPalette } from "./palette";
import { MOBILE_BREAKPOINT, MOBILE_SCALE } from "./streamSpec";
import { Sky } from "./Sky";
import { LightSource } from "./LightSource";
import { Beam } from "./Beam";
import { CameraRig } from "./CameraRig";
import { Rings } from "./Rings";
import { Fragments } from "./Fragments";
import { EmitterFloor } from "./EmitterFloor";
import { FloorPillars } from "./FloorPillars";
import { CoreLock } from "./CoreLock";
import { CoreHeartbeat } from "./CoreHeartbeat";
import { Effects } from "./Effects";

/** Time used for the single still frame under reduced motion (particles spread out, not bunched at t = 0). */
const STILL_TIME = 6;
/** Long lens: keeps every ring at the same ellipse ratio from top to bottom, like the flat Figma drawing. */
const CAMERA_FOV = 8;
/** Fewer cubes on phones: smaller screen, weaker GPU. */
const CUBE_COUNT = { desktop: 170, mobile: 90 } as const;
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function subscribeMobile(onChange: () => void) {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * The WebGL data stream behind the page. Client only (loaded by StageLoader
 * with ssr: false), so the DOM content paints first and stays readable
 * without it. The CSS sky gradient behind it is the fallback when WebGL is
 * unavailable.
 */
export default function Stage() {
  const still = usePrefersReducedMotion();
  const isMobile = useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
  const scale = isMobile ? MOBILE_SCALE : 1;
  const palette = useMemo(() => readPalette(), []);
  const [ready, setReady] = useState(false);

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
        frameloop={still ? "demand" : "always"}
        camera={{ fov: CAMERA_FOV, near: 1, far: 600, position: [0, 0, 60] }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        fallback={null}
        onCreated={() => setReady(true)}
      >
        <CoreHeartbeat still={still} />
        <CameraRig scale={scale} still={still} />
        <Sky palette={palette} scale={scale} />
        <LightSource palette={palette} />
        <EmitterFloor palette={palette} />
        <FloorPillars palette={palette} scale={scale} still={still} stillTime={STILL_TIME} />
        <CoreLock palette={palette} />
        <Rings palette={palette} still={still} stillTime={STILL_TIME} />
        <Fragments
          palette={palette}
          count={isMobile ? CUBE_COUNT.mobile : CUBE_COUNT.desktop}
          still={still}
          stillTime={STILL_TIME}
        />
        <Beam palette={palette} still={still} stillTime={STILL_TIME} />
        <Effects />
      </Canvas>
    </div>
  );
}
