"use client";

import { useFrame } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";
import { useScrollStore } from "@/store/useScrollStore";
import { CAMERA_PITCH, PX_PER_UNIT } from "./streamSpec";

const DEG = Math.PI / 180;

/**
 * Scroll drives the camera: it descends the stream and orbits it
 * (θ 0° at 00 → 300° at 05).
 *
 * Depth reads window.scrollY directly every frame (× the measured stream
 * scale), with no easing, so the stream moves in lockstep with the page
 * content and the emitter meets the Core Gate at the end. The browser's own
 * smooth scrolling already softens anchor jumps.
 *
 * Framing: the camera distance makes 1 world unit = 100 CSS px × scale at
 * the stream axis (beam exactly 88px wide on desktop). The top of the
 * viewport sits at stream depth `depthPx`.
 */
export function CameraRig({ scale, still }: { scale: number; still: boolean }) {
  useFrame(({ camera, size }) => {
    const { thetaExact, streamScale } = useScrollStore.getState();
    // Reduced motion: no camera movement, the stream stays a still.
    const depthPx = still ? 0 : window.scrollY * streamScale;
    const theta = still ? 0 : thetaExact * DEG;

    const cam = camera as PerspectiveCamera;
    const pxPerUnit = PX_PER_UNIT * scale;
    const halfHeight = size.height / 2 / pxPerUnit;
    const distance = halfHeight / Math.tan((cam.fov * DEG) / 2);
    const centerY = -depthPx / PX_PER_UNIT - halfHeight;
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
