"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import type { PerspectiveCamera } from "three";
import { useScrollStore } from "@/store/useScrollStore";
import { CAMERA_PITCH, PX_PER_UNIT } from "./streamSpec";

const DEG = Math.PI / 180;
/** Smoothing time (s) for the camera following the scroll position. */
const FOLLOW = 0.28;

/**
 * Scroll drives the camera: it descends the stream and orbits it
 * (θ 0° at 00 → 300° at 05). Reads the store with getState() each frame so
 * scrolling never re-renders React.
 *
 * Framing: the camera distance is chosen so 1 world unit = 100 CSS px × scale
 * at the stream axis, which makes the beam exactly 88px wide on desktop. At
 * depth 0 the top of the viewport sits at stream y 0 (the light source).
 */
export function CameraRig({ scale, still }: { scale: number; still: boolean }) {
  const current = useRef({ depth: 0, theta: 0 });

  useFrame(({ camera, size }, delta) => {
    const { depthExact, thetaExact } = useScrollStore.getState();
    // Reduced motion: no camera movement, the stream stays a still.
    const targetDepth = still ? 0 : depthExact;
    const targetTheta = still ? 0 : thetaExact * DEG;

    if (still) {
      current.current.depth = targetDepth;
      current.current.theta = targetTheta;
    } else {
      easing.damp(current.current, "depth", targetDepth, FOLLOW, delta);
      easing.damp(current.current, "theta", targetTheta, FOLLOW, delta);
    }

    const cam = camera as PerspectiveCamera;
    const pxPerUnit = PX_PER_UNIT * scale;
    const halfHeight = size.height / 2 / pxPerUnit;
    const distance = halfHeight / Math.tan((cam.fov * DEG) / 2);
    const centerY = -current.current.depth / PX_PER_UNIT - halfHeight;
    const { theta } = current.current;
    const flat = Math.cos(CAMERA_PITCH) * distance;

    cam.position.set(
      Math.sin(theta) * flat,
      centerY + Math.sin(CAMERA_PITCH) * distance,
      Math.cos(theta) * flat,
    );
    cam.lookAt(0, centerY, 0);
  });

  return null;
}
