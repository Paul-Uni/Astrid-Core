# Workshop: Designing astridcore.dev with Claude + Figma

*My notes on how the design came together, 19–20 Oct 2026. What we did, why, what went wrong, and what I'd reuse.*

Figma file: https://www.figma.com/design/nDASzxVT0RalUB1S45Oq43
Source of truth for the build: `PRODUCT.md`, `DESIGN.md` in this repo.

---

## 0. The result in one paragraph

A one-page CV site built around **the data stream**: a vertical beam of light wrapped in level rings of data blocks, inspired by the Destiny 2 Vex Network. Scrolling moves the camera down the stream and around it through six stations (00 Entry → 05 Contact). At the bottom sits the Core: a lock with "Enter Core", the gate to my private area (chat with my local agent Astrid). The site is named after my main PC, Astrid, the core every other device connects to.

Deliverables: desktop (6 frames, 1440×900), mobile (6 frames + menu, 390 wide), components, color/type tokens, motion specs, a clickable prototype, and `DESIGN.md` / `PRODUCT.md` that describe all of it for the build.

---

## 1. Start with a concept, not with pixels

**What we did**
- Answered three questions before anything was drawn:
  1. **Vibe:** personal, Vex Network look, lots of motion while scrolling, the motion centered on a data "pillar".
  2. **Content:** personality + skills/projects, basically a CV as a website.
  3. **References:** two sites (EnduroSat Space Service, Mapa do Astro) plus game screenshots for color and background.
- The references were "too complex", but they shared one principle: **one 3D object pinned in the middle, content runs around it as you scroll.** That became the core idea.
- Then the story clicked: Astrid = my PC = the core. The page is the way *into* the core, which explains both the name and the login.

**Lesson**
> A strong concept answers "why does it look like this?" Every later decision (the lock, the orbit rail, "Enter Core", the HUD values) came from that one story.

---

## 2. The visual system first: tokens, then layout

**Colors** (Figma variables, collection "Core Colors")

| Token | Hex | Role |
| --- | --- | --- |
| void | `#070A1F` | background |
| indigo | `#141B45` | surfaces |
| steel | `#2A3A7A` | geometry |
| vex-cyan | `#6FF2E6` | edges, glow, accents |
| ice | `#B8F4FF` | text on dark |
| magenta-core | `#E2337F` | the way into the core |
| dusk-pink | `#F28AB8` | sky haze |
| beam-violet | `#B13CFF` | reserved |
| + scene colors | cyan-shade, indigo-raised, sky-mid, light | stream/sky only |

**Type:** three families with fixed jobs.
- **Pixelify Sans:** titles, buttons, logo (bitmap feel, still has lowercase)
- **Space Grotesk:** everything you read
- **JetBrains Mono:** nav, labels, data (`// 03 PROJECTS`, `cam.θ 120°`)

**Lessons**
> - Build colors as **variables** and text as **styles** from day one. Later changes (font swaps, color tweaks) then happen in one place.
> - I tried Silkscreen first (all caps, too loud), then Pixelify Sans. Seeing it in place beats debating it.

---

## 3. The hero, iterated hard

The hero went through the most rounds. Each round was triggered by concrete feedback with references.

| Round | Feedback | Change |
| --- | --- | --- |
| 1 | — | Wireframe-cube **tower** on the right, text left |
| 2 | "Not a tower, a data **upstream** that opens upward" + game screenshots | Rings around a beam, light source at the top |
| 3 | Bitmap font for titles, no big bodies in the background | Silkscreen → later Pixelify, only small fragments |
| 4 | "Stream in the **middle**, take your time, make it extra" | Centered stream with depth (back/front halves), bloom, light flare |
| 5 | "More detail" + "you should only see the **top** of the beam" | Real data blocks, 4600px tall stream as a component; hero only shows the top |
| 6 | Rings must be **level**, 5 ring types from Destiny | Rebuilt with 5 types, constant size, clusters with gaps |
| 7 | Remove the horizontal dot rows in the beam | Vertical streaks → mixed with small dashes → streaks removed |

**The 5 ring types** (from studying the game):
1. small, thin, 3–4 long segments
2. small, thick, many tiny blocks
3. medium, thin, almost transparent, many fine elements
4. medium, thick, machinery chunks
5. large, fine lines around everything

**Lessons**
> - **Screenshots of the reference beat descriptions.** "Data upstream" only became clear with the in-game images.
> - Say what's *wrong* precisely ("the dots look like rings passing through"). Each precise sentence saved a round.
> - Ask for questions before big changes. The ring-type round started with 4 questions (arrangement, width, size, spacing) and landed in one go.

---

## 4. Components and consistency

Built as real Figma components with variants:
- `Nav` (links + Login), `Nav/Mobile`, `Menu Button`
- `Button/Ghost` ("View projects"), `Button/Core` ("Enter Core"): Default / Hover / Pressed / Focus
- `Orbit Rail/Item`: Active / Inactive
- `Chip`, `Section Label`, `Social Node` (with icon swap), icon slots
- `Stream/Full`, `Beam/Particles/Slow|Mid|Fast`

**Audit pass** (before moving on): margins, fonts of the two CTAs, hardcoded colors → variables, contrast of small text, missing hover/focus states.

**Lessons**
> - Run an audit before building more screens. Fixing tokens once is cheaper than fixing six frames.
> - Focus states are not optional (keyboard users, WCAG AA).

---

## 5. Sections 01–05: content from the CV

All copy comes from my CV, translated to English (the site is in English for international recruiters).

| Station | Content | Layout idea |
| --- | --- | --- |
| 01 About | profile, interests, languages, photo (placeholder) | panel left, photo right |
| 02 Skills | 3 clusters | **spread around the stream**, connected to the beam |
| 03 Projects | Astrid (featured), CAM, astridcore.dev | nodes along the stream, GitHub links |
| 04 Background | timeline | alternating around the beam, newest first |
| 05 Contact | "Let's talk", email | lock on the emitter, socials orbit the core |

**Decisions along the way**
- Contact: no phone/address public. Email, GitHub, LinkedIn, Discord only.
- GPA removed from the site.
- The Core doesn't explain itself: just a lock + "Enter Core".
- Socials became **icon nodes on an orbit** around the lock. Email stays static and big (the main action). Discord copies the username on click.
- Boxes get **organic offsets** (3–16px) so the layout doesn't feel rigid.
- Orbit rail: idle shows only diamonds + current station label, hover pops all labels.

**Lessons**
> - Never invent content. Everything traceable to the CV keeps the site honest.
> - Interactive elements shouldn't keep flying around: animate *in*, then rest so they're clickable.
> - When I said "nav" but meant "orbit rail", it cost a full revert. Name things precisely; the component names help.

---

## 6. Motion and prototype

- **Keyframes in Figma:** satellites fly in along the orbit (staggered), lock scales in, rail labels slide in on hover.
- **Beam particles:** three desynced layers (75 / 112.5 / 150 px/s), 16 s seamless loop.
- **Prototype "Camera ride":** ↓/↑ keys, rail, nav, CTAs, Smart Animate between stations.
- **Ambient motion spec** (code only): rings rotate 40–90 s per turn, alternating directions; fragments drift and tumble; everything stops with reduced motion.

**Problems and fixes**
| Problem | Cause | Fix |
| --- | --- | --- |
| Presentation laggy | thousands of vectors + blur, 7× 4600px | **bake** the stream to PNG, keep vectors on a source page |
| Beam no longer animatable | particles baked in | separate particle layer on top |
| Page "squishes" between stations | stream mirrored on every other station, Smart Animate tweened the flip | remove mirroring |
| Particle animation stops when switching | prototype treats frames as separate screens | accepted; the real site is one continuous scene |
| Animation loops in Figma | Figma plays timelines on loop | spec says "plays once" in code |

**Lessons**
> - Figma is the **spec**, not the product. Real 3D orbit, rotation and continuous scroll belong in WebGL.
> - Write motion as numbers (duration, speed, easing) in `DESIGN.md`. Then the build doesn't depend on my memory.

---

## 7. Mobile

390 px, own layout (not just scaled down):
- stream scaled to 0.55, centered behind the content
- panels stacked with offsets, short dashed connectors on the beam
- nav: logo + Login + menu button → fullscreen menu
- rail: diamonds only
- 05: smaller orbit, lock on the emitter
- new styles: `Display/M` 34px, `Heading/S` 22px

**Lesson**
> Designing mobile *before* coding means components get built responsive from the start, instead of retrofitted.

---

## 8. Tooling notes (Claude + Figma)

- **Figma MCP on Starter/View seat: 20 calls per month.** I hit it mid-session. Switched to Figma Education (uni mail, Professional features). Moving the file: save local copy → import into the new account → new file key in the docs.
- **Never paste access tokens into a chat.** Revoke if it happens.
- Figma quirks hit repeatedly:
  - binding a variable to a paint resets its opacity → re-apply opacity after binding
  - instances sometimes don't inherit paint opacity → sync from main component
  - images created in one call and applied in another can get dropped → create + apply in one call
  - keyframes can't be set on layers inside instances
  - dashed/closed shapes can't use path-trim animation
- Exit codes: `grep` returns 1 when it finds nothing. That's a pass, not an error.

---

## 9. How I'd run this again (checklist)

1. Write the story in 3 sentences (what is the site, why does it look like this).
2. Collect 3–5 references, including screenshots, and say what to take from each.
3. Tokens: colors as variables, 2–3 type families with fixed jobs.
4. Hero first, iterate with screenshots and precise feedback.
5. Components + audit (tokens, states, contrast) before more screens.
6. Fill sections with real content only.
7. Motion as keyframes + numbers in the spec; prototype for feel.
8. Mobile before code.
9. Keep `PRODUCT.md` / `DESIGN.md` in sync after every decision.
10. Save a named Figma version at each milestone.

---

## 10. Open items

- [ ] Photo for 01 About (placeholder "IMAGE PENDING" until then)
- [ ] Make GitHub repos `Astrid` and `Astrid-Core` public
- [ ] Revoke the Figma token that was pasted in chat
- [ ] Build: Next.js setup → hero → WebGL stream → sections → motion → verify loop (see `CLAUDE.md`)
- [ ] Later: logo, live telemetry (Raspberry Pi status), Astrid chat behind the gate
