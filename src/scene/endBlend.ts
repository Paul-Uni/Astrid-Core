import { STREAM } from "./streamSpec";

/**
 * End of the descent: 0 until the camera passes `STREAM.end.from` (orbit
 * deg), 1 at station 05. Station 05's calmer, darker mood (steeper camera,
 * dark floor edges, vignette, no voxel field) eases in with it. Written once
 * per frame by CameraRig; shared by reference with every material that uses
 * it, like the core pulse.
 */
export const endUniforms = {
  uEnd: { value: 0 },
};

/** End blend for an orbit angle (deg): smoothstep from `STREAM.end.from` to `STREAM.end.to`. */
export function endBlend(theta: number) {
  const t = Math.min(1, Math.max(0, (theta - STREAM.end.from) / (STREAM.end.to - STREAM.end.from)));
  return t * t * (3 - 2 * t);
}
