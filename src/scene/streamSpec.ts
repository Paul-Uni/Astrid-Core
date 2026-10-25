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
  /**
   * Top of the beam: no visible source. The beam starts `y` px above the
   * page (off screen) and fades in over `fade` px, so at the top of the
   * page it comes down out of the dark under the nav, as if endless.
   */
  beamTop: { y: -400, fade: 520 },
  /**
   * End of the descent (station 05): calm and dark, the core the only
   * bright thing. Eases in between orbit `from` and `to` deg (endBlend.ts).
   * The camera tilts down to `pitchDeg` so the flat lock reads; the anchor
   * (Core Gate) stays put on screen. The floor grid fades from `floor.r0`
   * px around the well to near-black (`floor.edge` left) at `floor.r1`, and
   * darker still behind panels; `vignette` darkens the frame edges.
   */
  end: {
    from: 255,
    to: 300,
    pitchDeg: 24,
    floor: { r0: 180, r1: 720, edge: 0.1, calm: 0.85 },
    vignette: { offset: 0.25, darkness: 0.75 },
    /** Beam below the sheet: dims to `rest` over `px` down the throat, so Enter Core never sits on a bright line. */
    throat: { px: 200, rest: 0.1 },
  },
  /**
   * Emitter at the bottom (References/"example lock"). y = cy is the level
   * the Core Gate anchor lines up with. The grid sheet lies `well.drop` px
   * lower and plunges into a narrow, very deep throat (`well.depth`) that
   * runs off the bottom of the screen; the core sits at its bottom (see
   * CORE_Y). A glass padlock hovers over the throat's mouth.
   */
  emitter: {
    cy: 4440,
    glowW: 420,
    glowH: 160,
    floor: { radius: 1600, gridCell: 40 },
    /** depth * r0^2 / (r^2 + r0^2): flat sheet, then a sharp drop near r0 = 40px. */
    well: { depth: 900, radius: 40, drop: 70 },
    /**
     * Orbit ring (Figma 49:5916): a dashed dusk-pink circle on the sheet
     * around the well, `r` px, dashes `dash`/`gap` px. The three social
     * nodes (DOM) ride on it at `nodes` angles (deg, 0 = screen right,
     * 90 = straight back, seen from the station 05 camera).
     */
    orbit: {
      r: 330,
      dash: 9,
      gap: 7,
      opacity: 0.75,
      nodes: { discord: 158, github: 52, linkedin: -14 },
    },
    /**
     * Core lock, a flat padlock shape (Figma px) lying over the well's
     * mouth like a lid, hovering `hover` px above the sheet and bobbing
     * ±`bob` px over `bobPeriod` s (still under reduced motion). Its soft
     * shadow ring (`shadow`: radius, width, px) glows on the sheet below.
     * Body: rounded rectangle. Shackle: an arch `bar` px wide standing
     * `leg` px on the body's top edge. The keyhole's round part sits on
     * the beam axis.
     */
    lock: {
      hover: 35,
      bob: 4,
      bobPeriod: 4,
      shadow: { r: 120, width: 26 },
      body: { w: 160, h: 130, radius: 22 },
      shackle: { radius: 50, bar: 20, leg: 24 },
      keyhole: { radius: 17, slot: 40, slotTop: 11, slotBottom: 20 },
    },
  },
} as const;

/** Figma y of the core: the bottom of the emitter's gravity well (off screen), where the beam ends. */
export const CORE_Y = STREAM.emitter.cy + STREAM.emitter.well.drop + STREAM.emitter.well.depth;

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
  // Figma's first cluster (y 37–148) is left out: the top of the beam stays open (see beamTop).
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
