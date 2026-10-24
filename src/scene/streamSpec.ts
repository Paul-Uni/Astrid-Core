/**
 * Geometry spec for the data stream, measured from Figma
 * "Stream/Full · vector source" (page "Stream Source (editable vectors)").
 *
 * All values are Figma px on the 1440 × 4600 frame (beam centered at x 720,
 * y grows downward). The scene converts with `toWorld`: 100 px = 1 unit,
 * y flipped so the stream runs from y 0 (light) down to y −44.4 (emitter).
 */

export const PX_PER_UNIT = 100;

/** Figma px (y down) → world units (y up). */
export const toWorld = (px: number) => px / PX_PER_UNIT;
export const toWorldY = (figmaY: number) => -figmaY / PX_PER_UNIT;

/** Stream scale on phones (DESIGN.md mobile: stream scaled to 0.55). */
export const MOBILE_SCALE = 0.55;
export const MOBILE_BREAKPOINT = 768;

export const STREAM = {
  height: 4600,
  beamWidth: 88,
  /**
   * Ring ellipse ratio (height/width) at the screen center. Figma draws 0.138;
   * References/"reference to beam angle" tilts the stream toward the camera,
   * so rings open from ≈0.15 at the top of the screen to ≈0.29 at the bottom.
   */
  ringAspect: 0.22,
  light: {
    source: { cy: -30, w: 220, h: 160 },
    halo: { cy: -40, w: 560, h: 320 },
    shaft: { top: -40, w: 110, h: 700 },
  },
  emitter: { cy: 4440, glowW: 420, glowH: 160 },
} as const;

/** Draw order: sky (−1) → back half of rings/cubes → beam and light → front half. */
export const RENDER_ORDER = { back: 1, beam: 2, front: 3 } as const;

/**
 * Camera pitch (radians) that reproduces the ring ellipses. With the long
 * lens, looking down this steeply reads the same as tilting the stream
 * toward the camera. Vertical distances on screen shrink by cos(pitch).
 */
export const CAMERA_PITCH = Math.asin(STREAM.ringAspect);

/**
 * Ring clusters: [top y, bottom y, ring diameters seen in that cluster].
 * Clusters of 2–3 tightly stacked levels, then a gap (DESIGN.md "Spacing").
 */
export const RING_CLUSTERS: ReadonlyArray<readonly [number, number, readonly number[]]> = [
  [37, 148, [165, 198, 270, 314, 338, 886]],
  [318, 470, [142, 178, 211, 330, 364, 396, 419, 848]],
  [657, 797, [132, 172, 292, 330, 362, 393, 715]],
  [934, 1076, [184, 217, 301, 359, 548, 606]],
  [1230, 1339, [151, 182, 214, 276, 334, 369, 722]],
  [1496, 1568, [132, 153, 185]],
  [1728, 1856, [137, 179, 301, 354, 392, 879]],
  [2021, 2113, [186, 279, 334, 364, 410, 435]],
  [2241, 2289, [150, 167]],
  [2480, 2565, [135, 167, 188, 220, 288, 343]],
  [2791, 2842, [135, 161, 193]],
  [2994, 3116, [144, 189, 222, 305, 714]],
  [3266, 3412, [144, 188, 217, 284, 338, 354, 728, 889]],
  [3499, 3621, [140, 172, 286, 340, 379, 599]],
  [3751, 3861, [138, 151, 170, 792]],
  [3965, 4109, [144, 176, 282, 344, 367, 796, 931]],
  [4246, 4291, [162, 179]],
];
