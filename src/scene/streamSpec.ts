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
    /** Sheet radius px; the skyline stands on this edge (Silhouettes), so the grid fades out exactly there. */
    floor: { radius: 1150, gridCell: 40 },
    /** depth * r0^2 / (r^2 + r0^2): flat sheet, then a sharp drop near r0 = 40px. */
    well: { depth: 900, radius: 40, drop: 70 },
    /**
     * Orbit ring (Figma 49:5916): a dashed dusk-pink circle on the sheet
     * around the well, `r` px, dashes `dash`/`gap` px. The three social
     * nodes (DOM) ride on it at `nodes` angles (deg, 0 = screen right,
     * 90 = straight back, seen from the station 05 camera). Phones use
     * `mobile` (Figma m05): a ring 150px wide on screen at MOBILE_SCALE,
     * Discord left, GitHub right, LinkedIn in front under the lock.
     */
    orbit: {
      r: 330,
      dash: 9,
      gap: 7,
      opacity: 0.75,
      nodes: { discord: 158, github: 52, linkedin: -14 },
      mobile: { r: 273, nodes: { discord: 180, github: 0, linkedin: -90 } },
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
  /**
   * Dust and data specks: tiny points drifting in three depth layers
   * (`layers`: share of the `count`, size px, opacity, page-scroll
   * parallax `speed`, orbit pan `pan` px/deg, upward `drift` px/s), drawn
   * just in front of the sky, behind every scene object. Layers with
   * `behind: 1` (the farthest, star-like ones) sit behind the skyline, so
   * buildings hide them; the rest float in front of it.
   * Ice colored; a `glint.share` of them flash vex-cyan now and then
   * (`glint.rate` rad/s, `glint.sharp` = how brief the flash), brighter
   * within `glint.near` px of the beam. Calm zones dim them by `calm`; at
   * the dark end they keep `end` of their opacity. Phones get
   * `count.mobile`. Under reduced motion they hold still.
   */
  dust: {
    count: { desktop: 260, mobile: 120 },
    layers: [
      { share: 0.5, size: 1.3, alpha: 0.34, speed: 0.12, pan: 1.5, drift: 2, behind: 1 },
      { share: 0.32, size: 1.8, alpha: 0.48, speed: 0.28, pan: 3.5, drift: 4, behind: 0 },
      { share: 0.18, size: 2.5, alpha: 0.6, speed: 0.5, pan: 6, drift: 7, behind: 0 },
    ],
    glint: { share: 0.18, rate: 0.7, sharp: 14, near: 220, boost: 2.2 },
    calm: 0.7,
    end: 0.45,
  },
  /**
   * Distant silhouettes (docs/references/vex-landscape): three layers of
   * blocky skyline far behind the stream, barely darker than the sky, drawn
   * right after it in screen space (Silhouettes.tsx). Each layer is a row of
   * columns `col` px wide; columns group into buildings of `group` columns
   * with a height between `minH` and `maxH` px (in `step` px steps, edge
   * columns sometimes one step lower, a `tower` share standing `towerH`
   * taller, a `gap` share sunk low). The row wraps once around the orbit and
   * pans `pan` px per degree as the camera circles, so near layers slide
   * faster. Its base line sits at `horizon[0]` (share of the screen height
   * from the top) at station 00 and rises to `horizon[1]` at 05, so the
   * skyline climbs into view as you descend.
   *
   * Color: void/indigo at `dark` opacity over the sky, thinning to `base` ×
   * that `fade` px below the roofline, so feet dissolve into the haze. The
   * layers are solid against each other: a nearer building hides the ones
   * behind it, and only the sky shows through (haze, not glass). Roof
   * edges catch a dusk-pink backlight (`rim` strength, `rimPx` px), and so
   * does a building's side facing the beam where its neighbor toward the
   * center is lower (fading over `sideFade` px down). Calm zones thin them
   * by `calm`. Phones tint `mobileBoost` × darker, since the
   * shapes are smaller there.
   *
   * 04 → 05 (the floor rises into view): the skyline stands on the floor's
   * far edge (`emitter.floor.radius` px from the axis, projected to screen), nothing is
   * drawn below it, and a dusk haze glows along it (`ground.haze`, `hazePx`
   * px). From page progress `sink.from` to `sink.to` every building sinks
   * into that edge one block at a time, each column delayed by up to
   * `sink.spread` of the run, its roof flashing ice while it goes. At 05
   * the rest fades by `endFade` with the dark end mood.
   *
   * Roofs (References/tilt.png): the camera looks down on the stream, so it
   * looks down on the city too. Each building shows its roof as a band
   * above the front edge, `roof.depth` × its width deep, foreshortened by
   * the camera's live pitch (steeper at 05, so roofs open up there). The
   * roof is tinted `roof.lift` toward dusk-pink; the backlight rim sits on
   * its back edge, a fainter one (`roof.edge` × rim) on the front edge.
   */
  silhouettes: {
    layers: [
      { col: 34, group: 3, step: 14, minH: 70, maxH: 260, tower: 0.16, towerH: 140, gap: 0.12, pan: 6, horizon: [1.12, 0.7], dark: 0.26, fade: 320 },
      { col: 50, group: 3, step: 20, minH: 50, maxH: 320, tower: 0.14, towerH: 180, gap: 0.15, pan: 9, horizon: [1.3, 0.86], dark: 0.38, fade: 280 },
      { col: 72, group: 2, step: 28, minH: 30, maxH: 380, tower: 0.12, towerH: 220, gap: 0.2, pan: 13, horizon: [1.55, 1.02], dark: 0.5, fade: 240 },
    ],
    base: 0.45,
    rim: 0.16,
    rimPx: 1.5,
    sideFade: 90,
    calm: 0.6,
    mobileBoost: 1.35,
    ground: { fade: 4, haze: 0.32, hazePx: 30 },
    sink: { from: 0.87, to: 0.985, spread: 0.55 },
    endFade: 0.35,
    roof: { depth: 0.7, lift: 0.09, edge: 0.6 },
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
