"use client";

import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

/**
 * Turns its children around the stream axis (Y) to face the camera.
 * Used for the flat glow sprites and the beam, which should look the same
 * from every orbit angle.
 */
export function Billboard({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null);
  useFrame(({ camera }) => {
    if (ref.current) ref.current.rotation.y = Math.atan2(camera.position.x, camera.position.z);
  });
  return <group ref={ref}>{children}</group>;
}
