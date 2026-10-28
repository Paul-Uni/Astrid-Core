# Design — Astrid-Core

Source: Figma file `nDASzxVT0RalUB1S45Oq43` (https://www.figma.com/design/nDASzxVT0RalUB1S45Oq43), state of 2026-10-20.
Tokens below are taken from the Figma variables and text styles. If Figma and this file disagree, update this file from Figma (`get_variable_defs`), then fix the code.

## Workflow status

**Impeccable loop paused (Paul, 2026-10-24).** Do not run `/impeccable` commands (critique, polish, audit, document) or treat their findings as blocking until Paul resumes it. The last critique snapshot stays in `.impeccable/critique/` for when the loop resumes. Visual verification with Playwright screenshots continues as usual.

**Deferred until the desktop design is done (Paul, 2026-10-24):** GPU quality tiers (detect-gpu), static WebGL fallback poster. Mobile station layouts are built (2026-10-26).

## Concept

All site copy is in **English**.


The page is a single scroll along **the data stream**: a vertical beam of light, wrapped in level rings of data blocks, with wireframe cube fragments drifting around it. The top of the stream (light source) is the hero. Scrolling moves the camera **down** the stream and **around** it at the same time. The bottom of the stream is the emitter, the Core: that is where "Enter Core" leads into the private area.

Mood: dusk sky in the Vex Network (deep navy at the top, magenta/pink haze in the middle), cyan wireframe light, pixel type for titles.

### Figma reference nodes (page "01 Desktop")

| Node | ID | Use |
| --- | --- | --- |
| 00 Hero — Entry Point | `2:3` | Visual reference for the first viewport (1440×900) |
| 01 About | `45:1950` | Station 01, θ 060°, depth 740 |
| 02 Skills | `46:2933` | Station 02, θ 120°, depth 1480 |
| 03 Projects | `47:3936` | Station 03, θ 180°, depth 2220 |
| 04 Background | `48:4933` | Station 04, θ 240°, depth 2960 |
| 05 Contact | `49:5916` | Station 05, θ 300°, depth 3700 (emitter in view) |
| Stream/Full | `14:21` | The complete stream, 1440×4600, **baked to two PNG halves** (without the beam particles) for Figma performance. Editable vector spec lives on the page "Stream Source (editable vectors)". Spec for the WebGL scene, not an asset to ship |
| Scroll Map — full stream | `14:1945` | Where each station (00–05) sits along the stream |
| Components | `3:13` | Nav/Link, Nav/Box, Orbit Rail/Item, Button/Ghost, Button/Core, Chip, Section Label |
| 00 Foundations (page) | — | Palette and type ramp |

## Color tokens

Core palette (Figma collection "Core Colors"):

| Token | Hex | Role |
| --- | --- | --- |
| `--color-void` | `#070A1F` | Page background, panel base |
| `--color-indigo` | `#141B45` | Surfaces, cube faces |
| `--color-steel` | `#2A3A7A` | Geometry faces, dividers |
| `--color-vex-cyan` | `#6FF2E6` | Edges, glow, accents, focus |
| `--color-ice` | `#B8F4FF` | Text on dark, highlights |
| `--color-magenta-core` | `#E2337F` | Primary CTA, login, the private side |
| `--color-dusk-pink` | `#F28AB8` | Sky haze, horizon glow |
| `--color-beam-violet` | `#B13CFF` | Reserved. Currently unused, keep for hover/private-side accents or remove |

Scene tokens (Figma variables, only for the stream and sky):

| Token | Hex | Role |
| --- | --- | --- |
| `--color-cyan-shade` | `#2C9CA6` | Side faces of ring blocks |
| `--color-indigo-raised` | `#1E2A5A` | Lit cube faces |
| `--color-sky-mid` | `#3A2A6E` | Middle stop of the sky gradient |
| `--color-light` | `#FFFFFF` | Light source and beam core only. Never for text or UI |

Sky gradient (top → bottom): void → indigo (45%) → sky-mid (72%) → void.

Rules:
- Text is `ice` or `vex-cyan`. Magenta is reserved for the way into the core (Enter Core, Login) and rare stream accents.
- Opacity on text: body and labels ≥ 0.75. Below 14px never under 0.75. Check contrast against the actual background behind the text, not against void.

## Typography

| Style | Font | Size / line height / tracking | Use |
| --- | --- | --- | --- |
| Display/XL | Pixelify Sans Bold | 88 / 105% / 0 | Section titles at full size |
| Display/L | Pixelify Sans Bold | 46 / 105% / 0 | Hero H1 |
| Heading/M | Pixelify Sans SemiBold | 30 / 105% / 0 | Sub-headings, project names |
| Body/L | Space Grotesk Regular | 20 / 150% / 0 | Intro text |
| Body/M | Space Grotesk Regular | 16 / 150% / 0 | Running text, descriptions |
| Pixel/Label | Pixelify Sans Medium | 16 / 120% / 8% | All buttons, LOGIN, logo |
| Mono/Label | JetBrains Mono Medium | 13 / 140% / 12%, uppercase | Nav links, section labels (`// 03 PROJECTS`), secondary buttons |
| Mono/Data | JetBrains Mono Regular | 12 / 140% / 4% | HUD values, orbit rail, telemetry |

Running text uses `text-wrap: pretty` (no one-word last lines) and h1–h3 use `text-wrap: balance` (globals.css base layer).

Three families with fixed jobs: Pixelify = titles, buttons, logo; Space Grotesk = reading; JetBrains Mono = nav links, section labels, data. No fourth family.

## Spacing and layout

Spacing scale (px): `4 8 12 16 24 32 40 56 80 120`. Values used in Figma outside the scale (10, 14, 18, 22, 28) snap to the nearest step in code.

Desktop grid (1440 frame):
- **Content gutter: 120px** left and right. Hero text aligns to it. Panels with 32px padding sit at 88px so their text lands on 120.
- **Edge gutter: 56px** for elements pinned to the viewport edge (nav, orbit rail, HUD line, telemetry panel). The nav sits on the edge gutter and spans the full viewport width, so its links stay out toward the screen edges instead of reaching into the middle (Paul, 2026-10-24).
- The stream is centered (x = 720). Content panels sit left/right of it, never on top of the beam.

Radius: `0` everywhere. Hard edges are part of the look.

Organic offsets: content panels inside a section are deliberately **not** on one rigid line. Each panel is nudged 3–16px off the grid (x and y) so the layout feels loose, like nodes drifting around the stream. Limits: left panels stay between x 64 and a right edge ≤ 660, right panels between x 770 and a right edge ≤ 1290 (and ≥ 16px clear of the active rail label), everything between y 112 and 832, at least 8px between panels. Edge-pinned elements (nav, orbit rail, telemetry, HUD) stay exactly on their gutters.

## Effects

| Token | Value | Use |
| --- | --- | --- |
| `--glow-cyan` | `0 0 6px rgb(111 242 230 / 0.45)` | Stream lines, status dot |
| `--glow-magenta` | `0 0 24px rgb(226 51 127 / 0.6)` | Button/Core (hover: 36px) |
| `--cta-fill` | magenta-core 80% + void 20% | Button/Core fill (AA contrast for ice text) |
| `--panel-bg` | void at 0.62 | Glass panels |
| `--panel-border` | 1px vex-cyan at 0.22 | Glass panels |
| `--panel-blur` | `backdrop-filter: blur(18px)` | Glass panels |

Glass panels carry 14px cyan corner brackets (2px stroke) on all four corners.

## Components

| Component | Spec |
| --- | --- |
| Nav | Component `Nav`. Logo (14px rotated-square mark + `ASTRID-CORE` in Pixel/Label) left, links + LOGIN right (Button/Core outline, compact 8/14 padding: same fade-up hover as Enter Core; also in `Nav/Mobile`). The links (About · Skills · Projects · Background · Contact) belong to 00 Entry: scrolling from 00 into 01 fades them out with the scroll (`NAV_FADE`: visible until 10% of the way, gone at 70%), then they are inert; logo and LOGIN stay. From 01 on the orbit rail is the section navigation (Paul, 2026-10-26). Sits on the 56px edge gutter across the full viewport width, always visible. Fade from void (0.9) to transparent behind it, 150px tall |
| Nav/Link | Mono/Label, ice at 0.85, padding 8/4 |
| Nav/Box (Login) | Pixel/Label, dusk-pink text, 1px magenta border at 0.9, magenta fill at 0.12, padding 8/14 |
| Button/Ghost | "View projects". Pixel/Label, vex-cyan text, 1px vex-cyan border (0.8), fill vex-cyan 0.06, padding 16/24 |
| Button/Core | `ENTER CORE →`. Solid: Pixel/Label, ice text, `--cta-fill` (magenta-core mixed 80/20 with void, so ice text passes AA at ≈4.9:1; pure magenta-core gives 3.5:1), `--glow-magenta`, padding 16/24 |
| Status chip | Mono/Data, 8px glowing cyan dot, fill cyan 0.08, border cyan 0.4, padding 8/12–14. Copy: `OPEN TO INTERNSHIPS & WORKING STUDENT ROLES · SOFTWARE, DATA, AI`; may wrap to two lines |
| Glass panel | `--panel-*` tokens, padding 32, corner brackets. Powers on like a CRT the first time it scrolls into view (see Motion → Panel power-on) |
| Orbit Rail | Right edge (56px gutter), items right-aligned, 22px gap. `Orbit Rail/Item` has `State=Active|Inactive`: 8px rotated square (active: filled cyan; inactive: outline at 0.7) + Mono/Data label. **Idle: all squares visible, only the current station's label shown** (e.g. `04 BACKGROUND ◆`), so content has room. 05 Contact is drawn in magenta (label dusk-pink, square magenta-core, filled with `--glow-magenta` when active): it holds the Core Gate, the way into the core. Content panels keep ≥ 16px clear of that active label. Hovering the rail (fine pointers) or focusing it with the keyboard pops all labels in (opacity, 160ms ease-out) on a glass backdrop (void 0.72, cyan border 0.22, blur 18), so they stay readable over content; reference frame `Orbit Rail · hover state (reference)` in Components. Labels: 00 ENTRY · 01 ABOUT · 02 SKILLS · 03 PROJECTS · 04 BACKGROUND · 05 CONTACT. Each square needs an aria-label with its section name |
| Core Telemetry | Glass panel, Mono/Label title, key/value rows (key ice, value ice/cyan), width 210 content |
| Photo frame (01 About) | Glass panel (padding 16) with corner brackets, image 268×335 (4:5). Placeholder: indigo fill, cyan scanlines at 0.07, `// IMAGE PENDING`. Caption in Mono/Data below. Replace the placeholder frame with an image fill |
| Chip | Skill/stack tag. Mono/Data, ice text 0.95, 1px cyan border at 0.35, cyan fill at 0.06, padding 6/10, wraps in rows with 8px gaps |
| Section Label | `// 0n — NAME` in Mono/Label, cyan 0.9. First line of every section panel |
| Cluster / Project / Entry panels | Glass panels (padding 22–28) with a Mono/Data meta line (`// NODE 01 · …`), a Heading/M or Display/L title, Body/M text, optional chips. Tied to the beam by a circuit tether (see Tethers). Supersedes the dashed connectors drawn in Figma |
| Link line | Mono/Data, lowercase, dusk-pink, starts with `↳`: `↳ this site's namesake · source on github ↗` (Astrid), `↳ behind the scenes · source on github ↗` (astridcore.dev). The hero's scroll hint (`scroll, and the camera takes you along`) uses the same style without the arrow, as its own line under the intro |
| Tethers | Code only (`chrome/Tethers.tsx`), desktop only (≥ 768px). Every panel marked `tether` gets a 1px trace from its inner edge, 34px below its top: a straight run, a 45° bend (≤ 46px) and a straight lead (≤ 70px) into a diamond node (12px, void fill, 1.5px stroke) on the beam at the viewport center, plus a 6px square terminal on the panel edge. Trace vex-cyan at 0.6; dusk-pink for the current entry (`tether={{ now: true }}`). Panels closer than 48px to the beam get none. Tethered: 01 profile + photo, 02 clusters, 03 Astrid + astridcore.dev, 04 entries. Headers and 05 stay untethered |
| Core Gate (05) | No text, no explanation. The Core lock (WebGL, see the emitter floor) lies over the spacetime well; the beam drops through its keyhole. Button/Core outline variant `ENTER CORE →` below (anchor + 176px; the same button as the login arrow: magenta frame at 70%, void 55%, dusk-pink text; on hover/focus it fades over 200ms to a full magenta frame, `--cta-fill` at 55% (translucent), a 36px glow and ice text). Hovering or focusing it sets the core to boost: the lock's edge turns from magenta-core to vex-cyan and glows brighter, core light turns dusk pink, the heartbeat speeds up from 7 s to 1.5 s |
| Social Node (05) | Component `Social Node` with `State=Default|Hover`, props `Label` (text) and `Icon` (instance swap). 46px rotated square (void 0.85, 1.5px cyan border 0.55, cyan glow) holding a 24px icon, Mono/Data label below (`GITHUB ↗`, `LINKEDIN ↗`, `DISCORD·COPY`, no spaces so it clears the screen edge on phones). Sits on the contact orbit (ellipse around the lock, rx 330 / ry 118). The nodes ride the ring with the camera while the contact panel scrolls with the page, so a node fades out over 48px as it slides under the panel and is hidden while beneath it (`OrbitRing`). Click: GitHub/LinkedIn open in a new tab, Discord copies `paul_lauer` and the label shows `COPIED ✓` for 1.5s. Needs an aria-label. Motion: fly in along the orbit while scrolling into 05, then rest. Reduced motion: static |
| Icon slots | `Icon/GitHub (slot)`, `Icon/LinkedIn (slot)`, `Icon/Discord (slot)`: 24×24 components. Paste the official logo SVG from each brand's asset kit into the slot (single color, ice); in code use an icon package. Logos are not drawn by hand |
| HUD line | Bottom left (24px from the edges): three Mono/Data readout lines at ice 0.75 (`cam.θ 000°`, `depth 0000`, `core: astrid`) stacked above `↓ SCROLL TO ORBIT` in Mono/Label (ice 0.85). θ and depth count live while scrolling. At 05 the prompt becomes `● CORE REACHED`. Readouts hidden on mobile |
| Login page (`/login`, code only) | Stand-in gate until the private area exists. Backdrop (`scene/LoginStage`, WebGL; CSS sky as fallback): the stage's sky as the plain dark gradient (void → indigo → sky-mid → void, no magenta haze), dust and data cubes, from a fixed camera pitched 24°. No beam, rings, lock or floor grid. Cubes circle the form 320–850px out and fade inside calm zones (the form and Go Back); reduced motion holds one still frame. "← Go Back" top-left (Pixel/Label, ice, cyan on hover) linking home, centered (References/"lock screen exlpl"): a boxed password field, 352px max, with "Enter Password" as the placeholder (cyan 0.6 border, void 0.55 fill, Mono 16px, placeholder ice 0.75, cyan border on focus), and an outline Button/Core holding only "→" beneath it. On hover/focus the button fades up instead of snapping: frame 70% → full magenta, fill to the Enter Core pink --cta-fill at 55% (translucent, the sky shows through), glow 24 → 36px, arrow dusk-pink → ice, over 200ms (`--dur-fade`, plain ease, so the fade is visible); the press scale stays 160ms. Submitting does nothing. Every LOGIN / Enter Core link points here. Not indexed |

Interaction states (drawn as `State` variants on Button/Ghost, Button/Core, Nav/Link):
- Hover (only under `@media (hover: hover) and (pointer: fine)`): Ghost → fill cyan 0.14; Core → glow 36px; Nav/Link → opacity 1 + cyan.
- Active: `transform: scale(0.97)`, `transition: transform 160ms var(--ease-out)`.
- Focus-visible: 2px vex-cyan outline, 2px offset, on every interactive element.

## Sections

Every station frame repeats the shell: sky gradient, glows, the stream instance cropped at the station's depth (never mirrored: Smart Animate would squash it; the orbit happens in code in 3D), a `Beam Flow` layer with the moving particles, nav, orbit rail with the station active, HUD with θ and depth. Content panels sit left (x 88) and right (x 780–800, ending ≤ 1220 so the rail stays free) of the beam, never on it.

| Station | Content |
| --- | --- |
| 00 Entry | Intro panel, status chip, H1 "Hi, I'm Paul." with the role "C#/.NET & AI developer" under it (Pixel, Heading/M, vex-cyan, inside the H1; Heading/S on phones), View projects (Button/Ghost) + Enter Core (Button/Core outline, so the public action leads), Core Telemetry |
| 01 About | Profile panel (text, interests, languages) left, photo frame right |
| 02 Skills | Small header panel; three clusters spread around the stream: Languages & frameworks (top right), AI & agents (lower left), Tools & methods (lower right) |
| 03 Projects | Header + Astrid (featured, Display/L title) left; CAM and astridcore.dev stacked right. Three cards only; the header carries one Mono/Data line for the smaller game projects: `// also built · games in unity/c# shipped as webgl builds, and a 2d game in python/pygame` |
| 04 Background | Header left; five entries alternating sides, sorted by end date (today → 2021). The current one has a dusk-pink date |
| 05 Contact | Contact panel ("Let's talk.", availability, the email row as the one mail action; no separate Email me button) left, static. GitHub, LinkedIn and Discord are Social Nodes (icons) on a dashed dusk-pink orbit around the lock; Core Gate (lock + Enter Core) centered on the emitter; footer `© 2026 PAUL ONYEIKEDI · ASTRIDCORE.DEV` bottom right; HUD reads `● CORE REACHED` |

## The data stream

Built as a WebGL scene from the spec in `Stream/Full` (`14:21`):
- **Beam:** constant-width cylinder (≈ 88px), soft cyan body, white core line, fine dashed vertical data lines, small randomly scattered dashes and bits. No horizontal rows of particles in the beam, no long vertical streaks.
- **Rings:** perfectly level relative to the stream (no individual tilt, no offset), constant overall size along the height. Five types, mixed randomly, 1–3 nested per level:
  1. small, thin, 3–4 long segments
  2. small, thick, many tiny blocks + thin inner line
  3. medium, thin, nearly transparent, many fine elements + hairline ticks
  4. medium, thick blocks with machinery chunks, tick band, occasional magenta segment
  5. large, 1–3 fine lines around the stream (may pass behind panels)
- **Viewing angle:** the stream is tilted toward the camera (reference: `References/reference to beam angle..png`). Rings open up toward the bottom of the screen: ellipse ratio ≈0.15 at the top, ≈0.22 at the center, ≈0.29 at the bottom. Figma's flat 0.138 is superseded. In code this is a 12.7° camera pitch with a long (8°) lens.
- **Spacing:** clusters of 2–3 tightly stacked levels, then a gap.
- **Depth:** brightness fades continuously around each ring, dim at the back and bright at the front (no hard switch at the sides); the beam sits between the back and front halves.
- **Fragments:** small wireframe cubes only (no large bodies), in front of and behind the stream, drifting outward with height.
- **Top (open beam):** no visible source and no hardware. The beam starts 400px above the page (off screen) and fades in over 520px, so at the top of the page it comes down out of the dark under the nav, as if the stream were endless. Figma's first ring cluster (y 37–148) stays left out so the top stays open.
- **Bottom (emitter floor, spacetime well):** the beam falls into a gravity well, drawn like the textbook picture of a massive object bending spacetime (references: `References/example ssm..png`, side view in `References/example lock.png`). A cyan grid sheet (40px cells at 45°) covers the ground out to r 1150, where the skyline stands, fading out from r 800 to that edge (so no grid draws over the buildings) and at the viewport's left, right and bottom edges. It stays flat, then plunges into a narrow, very deep throat (depth 900 · r0²/(r²+r0²), r0 40px) that runs off the bottom of the screen; grid lines brighten down the throat. The core (beam end) sits at the bottom of the throat, off screen. The Core Gate anchor (720/610 in the 05 frame) lines up with Figma y 4440, 70px above the sheet. The **Core lock** lies flat on the sheet over the well's mouth, covering it: one solid padlock silhouette (no circuit traces), not a 3D object. Body 160×130px (corner 22), shackle arch r 50 with a 20px bar on 24px legs, keyhole (r 17 round part, tapered slot) centered on the beam axis so the beam drops through it. Dark glass with a neon edge: a void plate at ~55% opacity (faintly tinted by the edge color), so the grid shows through dimmed and the lock separates from the pink floor; a bright magenta-core outline that blooms carries the color (vex-cyan on boost); ice core glow around the keyhole, flaring on each beat. Turned like the floor grid (45° steps): at 315°, the grid direction closest to the station-05 camera angle (300°), so its edges run along the grid lines. It hides the beam below it except through the keyhole. No motion of its own.
- **Floor pillars** (References/"Background inspo", "bg inspo 2"; code: `FloorPillars.tsx`, spec `STREAM.emitter.pillars`): the backdrop is built on the floor grid, not floating at random. Every size is whole grid cells (40px), footprints turned 45° onto the grid. Eight pillars in a symmetric layout (turned 22.5° so a pair frames the beam at 03): four at r 14 cells (4×4 footprint, 26 cells tall), four at r 24 (5×5, 35 cells tall, reaching the bottom of station 03). Each pillar is a composed megastructure: 3–4 tiers narrowing by one cell (some shifted half a cell), a recessed notch band, a cantilever arm, a stair-stepped pixel top, ice scaffold frames one cell larger than a tier with corner lines overshooting 1–3 cells, and a chain of floating wire cubes. Floating modules (small blocks with scaffold, or wire-cube pairs) hover on a ring at r 20 between the pillars at alternating 7/14/21-cell levels. Floating parts bob ±0.4 cell over 16 s (still under reduced motion). Solids: void sides, indigo-raised tops at 90%; outlines vex-cyan with a glow where they meet the grid; scaffolds ice. Everything dissolves into the sky between 1000 and 1750px above the floor (scaffolds 250px later), and in a screen column 140–340px around the beam, parts more than 120px up behind it and everything between the camera and it fade out, so the stream, lock and Enter Core are never covered.
- **Distant skyline** (code only: `Silhouettes.tsx`, spec `STREAM.silhouettes`; reference `docs/references/vex-landscape`): three layers of blocky skyline far behind the stream, drawn right after the sky, barely darker than it (void/indigo at 0.26 / 0.38 / 0.5). Columns 34 / 50 / 72px wide group into buildings with stepped heights, some towers, some gaps; no windows. Feet thin out into the haze over 240–320px. Roof edges and the side facing the beam catch a 1.5px dusk-pink rim. The skyline climbs into view as you descend (its base line rises with page progress) and pans 6 / 9 / 13 px per degree of orbit, so near layers slide faster. Phones draw it 1.35× darker. 04 → 05: it stands on the floor's far edge (r 1150, the sheet radius) with a dusk haze along it, then sinks into that edge block by block between progress 0.87 and 0.985, each roof flashing ice as it goes; the rest fades with the dark end mood.
- **Dust** (code only: `Dust.tsx`, spec `STREAM.dust`): tiny ice specks in three parallax layers (1.3 / 1.8 / 2.5px, opacity 0.34–0.6), just in front of the sky and skyline, behind every scene object. Each layer moves with scroll and orbit at its own rate and drifts upward 2–7 px/s. 18% of them glint vex-cyan now and then, brighter near the beam. 260 specks on desktop, 120 on phones. Dimmed behind panels and at the dark end. Still under reduced motion.
- Bloom: in Figma faked with a blurred duplicate; in code use a real bloom pass. Quality steps (`AdaptiveEffects` in `src/scene/Effects.tsx`): when the frame rate stays under 80% of the display's refresh rate (capped at 120 Hz, so under 48 fps at 60 Hz and 96 fps at 120 Hz; judged from 3s after mount), the scene steps down for the rest of the visit. Integrated Intel GPUs start at the second step: dpr 1.75 → 1.25, then dpr 1 with no bloom and no panel blur (`html[data-lean]` sets `--panel-blur: none`; the panel fill alone carries the glass). A screen that is already at or below a step's dpr skips it. Not under reduced motion. No multisampling in the composer.

## Motion

### Core heartbeat (code only, WebGL)

One clock (`src/scene/corePulse.ts`) drives three things so they read as a single beat:

| Element | Motion |
|---|---|
| Core flare | Core glow around the Core lock's keyhole and the emitter glow flare on each beat (sharp rise over 3% of the beat, fast decay) |
| Gulp | A bulge wider than the beam (≈84px) leaves the core at the bottom of the throat and rises ≈1700px over 80% of the beat, slowing down and shrinking into the core line instead of fading out |
| Well ripple | One ripple per beat runs out over the spacetime sheet to r 520 over 70% of the beat, fading as it grows |

Beat: 7 s at rest, 1.5 s while Enter Core is hovered or focused (eased, no phase jump). Color eases from ice to dusk pink with the same boost. Under reduced motion the beat holds between pulses (nothing in flight); hover still tints the core.


### Ambient stream motion (code only, WebGL)

The stream is never fully still, but it moves slowly enough to read as atmosphere, never as an effect. Not drawn in Figma (rings are flat there and baked into an image); this is the spec for the 3D scene.

| Element | Motion |
| --- | --- |
| Ring type 1 (small, thin, 3–4 long segments) | Rotates around the beam axis, one turn per ~40s |
| Ring type 2 (small, thick, many tiny blocks) | ~55s per turn |
| Ring type 3 (medium, thin, nearly transparent) | ~70s per turn |
| Ring type 4 (medium, thick, machinery chunks) | ~60s per turn |
| Ring type 5 (large, fine outer rings) | ~90s per turn, the slowest |
| Direction | Each ring gets a random direction; within a cluster, neighbouring rings alternate where possible so they visibly counter-rotate |
| Variation | Each ring's speed is its type's value ±20% (seeded random), so no two rings move in lockstep |
| Fragments (wireframe cubes) | Drift slowly upward (~4–10 px/s, varied) and outward a little, orbit the beam counter-clockwise seen from above (~one turn per 60–120s, so front cubes cross the beam left → right in front of it and back cubes right → left behind it), tumble on all axes (~one turn per 20–40s), fade out near the top/edges and respawn near the beam. Front cubes are opaque |
| Beam particles | Three layers, 24 / 36 / 48 px/s upward (0.32× the Figma prototype's 75 / 112.5 / 150, slowed on request) |
| Easing | All ambient motion is linear and continuous, no easing, no pulsing |
| Performance | Instanced meshes for blocks and cubes, one draw call per ring type where possible; pause the render loop when the tab is hidden or the canvas is off-screen |
| Reduced motion | `prefers-reduced-motion: reduce`: no rotation, no drift, no particle flow. The scene renders one still frame |


- Scroll drives the camera: it descends the stream and orbits it (θ 0° at 00 → ~300° at 05). The orbit rail and HUD reflect position.
- Constant motion (rings rotating slowly, particles rising): linear.
- UI transitions: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`. UI durations ≤ 300ms.
- `prefers-reduced-motion: reduce`: no camera movement, no rotation. Stream is a still, sections stack normally, opacity fades only.

### Panel power-on (code only)

Every glass panel switches on like an old CRT the first time it scrolls into view, once, never off again (`app/PanelPowerOn.tsx`, CSS in `globals.css`). Panels entering together power on top to bottom, left to right, 60ms apart.

| Part | Motion |
| --- | --- |
| Panel | `crt-on`, 180ms: clipped from a dot to a soft horizontal line to full size, opacity 0.35 → 1 |
| Glow | `::after`, 280ms: a soft bright line plus faint scanlines that fade out |
| Content | `crt-content`, 400ms: fades in while stepping through five SVG filters (`ca-1`…`ca-5`, `app/ChromaticFilters.tsx`) that split red from green/blue and shift them apart: a real RGB split, settling to clean |
| Station 00 (boot) | Hero and Core Telemetry (`data-power-style="boot"`) power on at page load once the fonts are loaded (at most 0.8s); they do not wait for the stage, which mounts ~0.7s later (`StageLoader`) so its first frame can't hold the content back and the CSS sky shows meanwhile: `crt-boot` 320ms (opacity + slight scale), content 260ms, one scan band 520ms. No RGB split, so the first paint stays light |

Tethers switch on with their panel, 120ms after it: the trace draws from the beam out to the panel (420ms, ease-out), node and terminal fade in (200ms), one ice pulse runs along the trace (700ms).

Armed by a head script (`html[data-power]`) before first paint, so panels never flash visible first. Reduced motion: not armed, panels and tethers are simply there. If the script never starts, it disarms after 4s.

### Motion specs drawn in Figma (keyframes, readable via `get_motion_context`)

| Where | Motion |
| --- | --- |
| 05 Contact (`49:5916`, 16s timeline, intro plays in the first 2s) | Contact orbit fades in 0 → 0.7s (ease-out). Lock node fades in and scales 0.85 → 1 between 0.1–0.6s (gentle spring). Social nodes fly in **along the orbit** from 110° earlier to their resting spot over 0.9s, staggered 0.15s (Discord 0.35s, GitHub 0.5s, LinkedIn 0.65s), fading in over the first 0.3s, ease-out at the end. Enter Core fades in and rises 8px at 1.2–1.5s |
| Beam particles (every station, 16s loop) | Three desynced layers inside the 88px clipping frame `Beam Flow` centered on the beam: `Beam/Particles/Slow` 75 px/s, `/Mid` 112.5 px/s, `/Fast` 150 px/s (average 112.5 px/s), all moving up, linear. Each is a strip of seamless 600px tiles with its own random pattern and a different start offset, so they never line up. Slow is dimmer, Fast brighter (depth). Loop: 16s = 2/3/4 tiles of travel, seamless. In 05 the flow frame ends at the lock. The baked stream image no longer contains these particles |
| Orbit rail hover (`Orbit Rail · hover state (reference)` in Components) | Backdrop fades in 0 → 0.16s. Labels fade in and slide 8px from the right over 0.16s, staggered 0.03s top to bottom |

In code, 05 plays once when the section enters the viewport, the rail motion on hover/focus. Reduced motion: final state, no translation.

### Prototype (Figma "Camera ride" flow, starts at the hero)

- ↓ / ↑ arrow keys: next / previous station. Click on the HUD line: next station.
- Orbit rail squares, nav links (while visible) and the logo jump to their station. View projects → 03, Contact me (hero, Button/Core outline, `↓`) → 05.
- Transition: Smart Animate, 0.8s ease-in-out. All stream instances are named `Stream`, so the stream tweens between depths (the camera moving down).

## Mobile (390px, Figma page "02 Mobile")

Frames: `m00 Entry` … `m05 Contact` (heights grow with content, 970–1600px), `m · Menu (open)`, plus "Mobile Components" (Nav/Mobile, Menu Button).

In code: below 768px each station is one stacked column. Every panel carries its Figma mobile placement (`m` prop on GlassPanel, `ui/mobilePlacement.ts`: left offset, width, padding, order), applied by the `[data-m]` rule in `globals.css`; widths shrink on phones narrower than 390 so 28px stay free for the rail. Desktop positions are untouched.

| Element | Mobile rule |
| --- | --- |
| Grid | 390 wide, content 20px side gutter. Panels 318–346 wide, nudged 12–34px from the left edge (organic offsets), stacked with 36–40px gaps |
| Type | `Display/M` (Pixelify Bold 34/105%) replaces Display/L; `Heading/S` (Pixelify SemiBold 22/110%) replaces Heading/M. Body/M for all running text |
| Stream | Same `Stream/Full`, scaled to 0.55 and centered (beam at x 195), behind the panels. Depth per station = desktop depth × 0.55. Same three particle layers, scaled, 16s loop |
| Connectors | Short dashed vertical segments on the beam between stacked panels, with diamond nodes at both panel edges (`chrome/Tethers.tsx`, phone mode; switch on with the lower panel) |
| Nav | `Nav/Mobile`: logo, LOGIN, 40×40 menu button. Links live in the fullscreen menu (station list 00–05 with active diamond, LOGIN, contact line); code: `chrome/MobileMenu.tsx`, a base-ui Dialog (focus trap, Escape, scroll lock), 200ms fade. Picking a station closes the menu, then scrolls |
| Orbit rail | Diamonds only at the right edge (10px gutter), active one filled; no labels on mobile |
| 00 Entry | Light and top rings visible above the intro panel; status chip wraps; CTAs stacked full-width; compact telemetry below |
| 01 About | Photo frame first, then profile |
| 05 Contact | Contact panel on top. The stream is offset so the emitter sits under the lock; orbit rx 150 / ry 90 with Discord (left), GitHub (right), LinkedIn (bottom) (`STREAM.emitter.orbit.mobile`); Enter Core below; CORE REACHED + footer centered. On phones the stream lines up with the lock at the end of the page, not at the 05 landing, since 05 is taller than the screen |
| Telemetry / HUD | Telemetry only on 00, HUD reduced to "SCROLL TO ORBIT" (00) and "CORE REACHED" (05). In code the fixed HUD is hidden on phones and both lines sit in the page |
| Touch | All tap targets ≥ 40px; no hover states on touch, rail and nav use tap. Exception: rail diamonds get a ~32px hit area (their 32px spacing caps it); the menu is the main navigation on phones |

## Deliberate deviations from default design rules

These are intentional and part of the identity. Flag them in reviews only if they hurt legibility:
- Dark UI with cyan/neon accents and glow (Vex Network reference).
- Glass panels: used only where text has to sit over the stream.
- Monospace for interface labels and HUD data: it carries the "data core" theme, it is never used for reading text.

## Known gaps in the current Figma (fix before or during build)

- Figma's H1 still reads "Hi, I'm Paul. Welcome to the Core." The code replaced "Welcome to the Core" with the role line (critique 2026-10-26).
- Gradients (sky, nav fade, light shaft) and the whole `Stream/Full` vector spec use raw hex values. Their colors match the tokens; in code they must reference the CSS variables.
- Photo is a placeholder until Paul provides one. Project cards have no screenshots yet.
- No reduced-motion frame.
- Figma quirk: instances of components whose paints are variable-bound sometimes come out at opacity 1. After creating instances, sync paint opacities from the main component.
