"use client";

import { useFrame } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";
import { useScrollStore } from "@/store/useScrollStore";
import { CAMERA_PITCH, PX_PER_UNIT, STREAM, toWorldY } from "./streamSpec";
import { endBlend, endUniforms } from "./endBlend";

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
 *
 * End of the descent (endBlend): the camera tilts down to STREAM.end.pitchDeg
 * so the flat lock reads. The look-at point shifts so the Core Gate anchor
 * (STREAM.emitter.cy) stays at the same spot on screen.
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
    const end = endBlend(still ? 0 : thetaExact);
    endUniforms.uEnd.value = end;
    const pitch = CAMERA_PITCH + (STREAM.end.pitchDeg * DEG - CAMERA_PITCH) * end;
    // Vertical offsets on screen scale with cos(pitch): keep the anchor's offset from the center.
    const anchorY = toWorldY(STREAM.emitter.cy);
    const centerY = anchorY - (anchorY - (-depthPx / PX_PER_UNIT - halfHeight)) * (Math.cos(CAMERA_PITCH) / Math.cos(pitch));
    const flat = Math.cos(pitch) * distance;

    cam.position.set(
      Math.sin(theta) * flat,
      centerY + Math.sin(pitch) * distance,
      Math.cos(theta) * flat,
    );
    cam.lookAt(0, centerY, 0);
    // Others project world points with this camera in their own useFrame (Sky's well glow, Silhouettes).
    // three only refreshes the view matrix at render time; without this they'd use last frame's
    // camera, and on a slow frame during fast scrolling the glow trails behind the lock.
    cam.updateMatrixWorld();
    // Negative priority: runs before every other useFrame, without taking over rendering.
  }, -1);

  return null;
}
