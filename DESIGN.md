# Design — Astrid-Core

Source: Figma file `nDASzxVT0RalUB1S45Oq43` (https://www.figma.com/design/nDASzxVT0RalUB1S45Oq43), state of 2026-10-20.
Tokens below are taken from the Figma variables and text styles. If Figma and this file disagree, update this file from Figma (`get_variable_defs`), then fix the code.

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

Three families with fixed jobs: Pixelify = titles, buttons, logo; Space Grotesk = reading; JetBrains Mono = nav links, section labels, data. No fourth family.

## Spacing and layout

Spacing scale (px): `4 8 12 16 24 32 40 56 80 120`. Values used in Figma outside the scale (10, 14, 18, 22, 28) snap to the nearest step in code.

Desktop grid (1440 frame):
- **Content gutter: 120px** left and right. Nav, hero text, HUD line align to it. Panels with 32px padding sit at 88px so their text lands on 120.
- **Edge gutter: 56px** for elements pinned to the viewport edge (orbit rail, telemetry panel).
- The stream is centered (x = 720). Content panels sit left/right of it, never on top of the beam.

Radius: `0` everywhere. Hard edges are part of the look.

Organic offsets: content panels inside a section are deliberately **not** on one rigid line. Each panel is nudged 3–16px off the grid (x and y) so the layout feels loose, like nodes drifting around the stream. Limits: left panels stay between x 64 and a right edge ≤ 660, right panels between x 770 and a right edge ≤ 1290 (and ≥ 16px clear of the active rail label), everything between y 112 and 832, at least 8px between panels. Edge-pinned elements (nav, orbit rail, telemetry, HUD) stay exactly on their gutters.

## Effects

| Token | Value | Use |
| --- | --- | --- |
| `--glow-cyan` | `0 0 6px rgb(111 242 230 / 0.45)` | Stream lines, status dot |
| `--glow-magenta` | `0 0 24px rgb(226 51 127 / 0.6)` | Button/Core (hover: 36px) |
| `--panel-bg` | void at 0.62 | Glass panels |
| `--panel-border` | 1px vex-cyan at 0.22 | Glass panels |
| `--panel-blur` | `backdrop-filter: blur(18px)` | Glass panels |

Glass panels carry 14px cyan corner brackets (2px stroke) on all four corners.

## Components

| Component | Spec |
| --- | --- |
| Nav | Component `Nav`. Logo (14px rotated-square mark + `ASTRID-CORE` in Pixel/Label) left, links + LOGIN right, 32px gap, always visible. Fade from void (0.9) to transparent behind it, 150px tall |
| Nav/Link | Mono/Label, ice at 0.85, padding 8/4 |
| Nav/Box (Login) | Pixel/Label, dusk-pink text, 1px magenta border at 0.9, magenta fill at 0.12, padding 8/14 |
| Button/Ghost | "View projects". Pixel/Label, vex-cyan text, 1px vex-cyan border (0.8), fill vex-cyan 0.06, padding 16/24 |
| Button/Core | `ENTER CORE →`. Solid: Pixel/Label, ice text, magenta-core fill, `--glow-magenta`, padding 16/24 |
| Status chip | Mono/Data, 8px glowing cyan dot, fill cyan 0.08, border cyan 0.4, padding 8/12–14 |
| Glass panel | `--panel-*` tokens, padding 32, corner brackets |
| Orbit Rail | Right edge (56px gutter), items right-aligned, 22px gap. `Orbit Rail/Item` has `State=Active|Inactive`: 8px rotated square (active: filled cyan; inactive: outline at 0.7) + Mono/Data label. **Idle: all squares visible, only the current station's label shown** (e.g. `04 BACKGROUND ◆`), so content has room. Content panels keep ≥ 16px clear of that active label. Hovering the rail (fine pointers) or focusing it with the keyboard pops all labels in (opacity, 160ms ease-out) on a glass backdrop (void 0.72, cyan border 0.22, blur 18), so they stay readable over content; reference frame `Orbit Rail · hover state (reference)` in Components. Labels: 00 ENTRY · 01 ABOUT · 02 SKILLS · 03 PROJECTS · 04 BACKGROUND · 05 CONTACT. Each square needs an aria-label with its section name |
| Core Telemetry | Glass panel, Mono/Label title, key/value rows (key ice, value ice/cyan), width 210 content |
| Photo frame (01 About) | Glass panel (padding 16) with corner brackets, image 268×335 (4:5). Placeholder: indigo fill, cyan scanlines at 0.07, `// IMAGE PENDING`. Caption in Mono/Data below. Replace the placeholder frame with an image fill |
| Chip | Skill/stack tag. Mono/Data, ice text 0.95, 1px cyan border at 0.35, cyan fill at 0.06, padding 6/10, wraps in rows with 8px gaps |
| Section Label | `// 0n — NAME` in Mono/Label, cyan 0.9. First line of every section panel |
| Cluster / Project / Entry panels | Glass panels (padding 22–28) with a Mono/Data meta line (`// NODE 01 · …`), a Heading/M or Display/L title, Body/M text, optional chips. Each is tied to the beam by a dashed 1px cyan connector ending in a rotated square node at the beam edge (x 676 / 764) |
| Core Gate (05) | No text, no explanation. A pixel lock (dusk-pink, 12×14 grid, 36×42px) inside a 70px rotated square node (void fill 0.9, 2px magenta border, magenta glow, dashed 88px outer ring) sitting on the emitter at the bottom of the stream, Button/Core `ENTER CORE →` centered below it |
| Social Node (05) | Component `Social Node` with `State=Default|Hover`, props `Label` (text) and `Icon` (instance swap). 46px rotated square (void 0.85, 1.5px cyan border 0.55, cyan glow) holding a 24px icon, Mono/Data label below (`GITHUB ↗`, `LINKEDIN ↗`, `DISCORD · COPY`). Sits on the contact orbit (ellipse around the lock, rx 330 / ry 118). Click: GitHub/LinkedIn open in a new tab, Discord copies `paul_lauer` and the label shows `COPIED ✓` for 1.5s. Needs an aria-label. Motion: fly in along the orbit while scrolling into 05, then rest. Reduced motion: static |
| Icon slots | `Icon/GitHub (slot)`, `Icon/LinkedIn (slot)`, `Icon/Discord (slot)`: 24×24 components. Paste the official logo SVG from each brand's asset kit into the slot (single color, ice); in code use an icon package. Logos are not drawn by hand |
| HUD line | Bottom left: `↓ SCROLL TO ORBIT` + `cam.θ 000° · depth 0000 · core: astrid`. θ and depth count live while scrolling |

Interaction states (drawn as `State` variants on Button/Ghost, Button/Core, Nav/Link):
- Hover (only under `@media (hover: hover) and (pointer: fine)`): Ghost → fill cyan 0.14; Core → glow 36px; Nav/Link → opacity 1 + cyan.
- Active: `transform: scale(0.97)`, `transition: transform 160ms var(--ease-out)`.
- Focus-visible: 2px vex-cyan outline, 2px offset, on every interactive element.

## Sections

Every station frame repeats the shell: sky gradient, glows, the stream instance cropped at the station's depth (never mirrored: Smart Animate would squash it; the orbit happens in code in 3D), a `Beam Flow` layer with the moving particles, nav, orbit rail with the station active, HUD with θ and depth. Content panels sit left (x 88) and right (x 780–800, ending ≤ 1220 so the rail stays free) of the beam, never on it.

| Station | Content |
| --- | --- |
| 00 Entry | Intro panel, status chip, View projects + Enter Core, Core Telemetry |
| 01 About | Profile panel (text, interests, languages) left, photo frame right |
| 02 Skills | Small header panel; three clusters spread around the stream: Languages & frameworks (top right), AI & agents (lower left), Tools & methods (lower right) |
| 03 Projects | Header + Astrid (featured, Display/L title) left; CAM and astridcore.dev stacked right |
| 04 Background | Header left; five entries alternating sides, sorted by end date (today → 2021). The current one has a dusk-pink date |
| 05 Contact | Contact panel ("Let's talk.", availability, email + Email me) left, static. GitHub, LinkedIn and Discord are Social Nodes (icons) on a dashed dusk-pink orbit around the lock; Core Gate (lock + Enter Core) centered on the emitter; footer `© 2026 PAUL ONYEIKEDI · ASTRIDCORE.DEV` bottom right; HUD reads `● CORE REACHED` |

## The data stream

Built as a WebGL scene from the spec in `Stream/Full` (`14:21`):
- **Beam:** constant-width cylinder (≈ 88px), soft cyan body, white core line, fine dashed vertical data lines, small randomly scattered dashes and bits. No horizontal rows of particles in the beam, no long vertical streaks.
- **Rings:** perfectly level (no tilt, no offset), constant overall size along the height. Five types, mixed randomly, 1–3 nested per level:
  1. small, thin, 3–4 long segments
  2. small, thick, many tiny blocks + thin inner line
  3. medium, thin, nearly transparent, many fine elements + hairline ticks
  4. medium, thick blocks with machinery chunks, tick band, occasional magenta segment
  5. large, 1–3 fine lines around the stream (may pass behind panels)
- **Spacing:** clusters of 2–3 tightly stacked levels, then a gap.
- **Depth:** the back half of each ring is dimmed, the front half bright; the beam sits between them.
- **Fragments:** small wireframe cubes only (no large bodies), in front of and behind the stream, drifting outward with height.
- **Top:** white light source with cyan halo and light shaft. **Bottom:** emitter disc with ripples and radial spokes on a cyan iso floor grid.
- Bloom: in Figma faked with a blurred duplicate; in code use a real bloom pass.

## Motion

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
| Fragments (wireframe cubes) | Drift slowly upward (~4–10 px/s, varied) and outward a little, tumble on all axes (~one turn per 20–40s), fade out near the top/edges and respawn near the beam. Cubes in front of the stream move slightly faster than those behind (parallax) |
| Beam particles | As in the Figma prototype: three layers, 75 / 112.5 / 150 px/s upward |
| Easing | All ambient motion is linear and continuous, no easing, no pulsing |
| Performance | Instanced meshes for blocks and cubes, one draw call per ring type where possible; pause the render loop when the tab is hidden or the canvas is off-screen |
| Reduced motion | `prefers-reduced-motion: reduce`: no rotation, no drift, no particle flow. The scene renders one still frame |


- Scroll drives the camera: it descends the stream and orbits it (θ 0° at 00 → ~300° at 05). The orbit rail and HUD reflect position.
- Constant motion (rings rotating slowly, particles rising): linear.
- UI transitions: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`. UI durations ≤ 300ms.
- `prefers-reduced-motion: reduce`: no camera movement, no rotation. Stream is a still, sections stack normally, opacity fades only.

### Motion specs drawn in Figma (keyframes, readable via `get_motion_context`)

| Where | Motion |
| --- | --- |
| 05 Contact (`49:5916`, 16s timeline, intro plays in the first 2s) | Contact orbit fades in 0 → 0.7s (ease-out). Lock node fades in and scales 0.85 → 1 between 0.1–0.6s (gentle spring). Social nodes fly in **along the orbit** from 110° earlier to their resting spot over 0.9s, staggered 0.15s (Discord 0.35s, GitHub 0.5s, LinkedIn 0.65s), fading in over the first 0.3s, ease-out at the end. Enter Core fades in and rises 8px at 1.2–1.5s |
| Beam particles (every station, 16s loop) | Three desynced layers inside the 88px clipping frame `Beam Flow` centered on the beam: `Beam/Particles/Slow` 75 px/s, `/Mid` 112.5 px/s, `/Fast` 150 px/s (average 112.5 px/s), all moving up, linear. Each is a strip of seamless 600px tiles with its own random pattern and a different start offset, so they never line up. Slow is dimmer, Fast brighter (depth). Loop: 16s = 2/3/4 tiles of travel, seamless. In 05 the flow frame ends at the lock. The baked stream image no longer contains these particles |
| Orbit rail hover (`Orbit Rail · hover state (reference)` in Components) | Backdrop fades in 0 → 0.16s. Labels fade in and slide 8px from the right over 0.16s, staggered 0.03s top to bottom |

In code, 05 plays once when the section enters the viewport, the rail motion on hover/focus. Reduced motion: final state, no translation.

### Prototype (Figma "Camera ride" flow, starts at the hero)

- ↓ / ↑ arrow keys: next / previous station. Click on the HUD line: next station.
- Orbit rail squares, nav links and the logo jump to their station. View projects → 03, Enter Core (hero) → 05.
- Transition: Smart Animate, 0.8s ease-in-out. All stream instances are named `Stream`, so the stream tweens between depths (the camera moving down).

## Mobile (390px, Figma page "02 Mobile")

Frames: `m00 Entry` … `m05 Contact` (heights grow with content, 970–1600px), `m · Menu (open)`, plus "Mobile Components" (Nav/Mobile, Menu Button).

| Element | Mobile rule |
| --- | --- |
| Grid | 390 wide, content 20px side gutter. Panels 318–346 wide, nudged 12–34px from the left edge (organic offsets), stacked with 36–40px gaps |
| Type | `Display/M` (Pixelify Bold 34/105%) replaces Display/L; `Heading/S` (Pixelify SemiBold 22/110%) replaces Heading/M. Body/M for all running text |
| Stream | Same `Stream/Full`, scaled to 0.55 and centered (beam at x 195), behind the panels. Depth per station = desktop depth × 0.55. Same three particle layers, scaled, 16s loop |
| Connectors | Short dashed vertical segments on the beam between stacked panels, with diamond nodes at both panel edges |
| Nav | `Nav/Mobile`: logo, LOGIN, 40×40 menu button. Links live in the fullscreen menu (station list 00–05 with active diamond, LOGIN, contact line) |
| Orbit rail | Diamonds only at the right edge (10px gutter), active one filled; no labels on mobile |
| 00 Entry | Light and top rings visible above the intro panel; status chip wraps; CTAs stacked full-width; compact telemetry below |
| 01 About | Photo frame first, then profile |
| 05 Contact | Contact panel on top. The stream is offset so the emitter sits under the lock; orbit rx 150 / ry 90 with Discord (left), GitHub (right), LinkedIn (bottom); Enter Core below; CORE REACHED + footer centered |
| Telemetry / HUD | Telemetry only on 00, HUD reduced to "SCROLL TO ORBIT" (00) and "CORE REACHED" (05) |
| Touch | All tap targets ≥ 40px; no hover states on touch, rail and nav use tap |

## Deliberate deviations from default design rules

These are intentional and part of the identity. Flag them in reviews only if they hurt legibility:
- Dark UI with cyan/neon accents and glow (Vex Network reference).
- Glass panels: used only where text has to sit over the stream.
- Monospace for interface labels and HUD data: it carries the "data core" theme, it is never used for reading text.

## Known gaps in the current Figma (fix before or during build)

- H1 "Hi, I'm Paul. Welcome to the Core." has no role in it; the role is carried by the status chip and the first line of the intro.
- Gradients (sky, nav fade, light shaft) and the whole `Stream/Full` vector spec use raw hex values. Their colors match the tokens; in code they must reference the CSS variables.
- Photo is a placeholder until Paul provides one. Project cards have no screenshots yet.
- No reduced-motion frame.
- Figma quirk: instances of components whose paints are variable-bound sometimes come out at opacity 1. After creating instances, sync paint opacities from the main component.
