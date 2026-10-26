# CLAUDE.md — astridcore.dev

## Project
Personal site on my own domain (astridcore.dev, Cloudflare), self-hosted.
- **Public side:** CV as a website. One scroll page down a data stream with six stations (00 Entry → 05 Contact), links (GitHub, LinkedIn, Discord) and three projects.
- **Login gate:** `/login` is a stand-in ("Enter Password" box + arrow button, does nothing). Every LOGIN / Enter Core link points there.
- **Private side (later):** chat with my local agent Astrid, later access to my file system. Nothing private is served before a real server-side login.
- `PRODUCT.md` (users, purpose, facts) and `DESIGN.md` (tokens, components, specs) are the source of truth. Read both before UI work and keep DESIGN.md current with every visual change.
- Figma: https://www.figma.com/design/nDASzxVT0RalUB1S45Oq43
  - Desktop: hero `2:3`, stream `14:21`, scroll map `14:1945`.
  - Mobile page `101:2`: m00 `102:304`, m01 `103:350`, m02 `104:394`, m03 `105:458`, m04 `106:516`, m05 `107:560`, menu `107:832`.
  - The Figma copy is partly outdated. The code copy wins; facts come from my CV or from me.

## Roles
- The Figma design is mine. The web implementation is yours: own the technical decisions and verify visuals yourself without being asked.
- I often edit files myself while you work. Treat my changes as the current state, build on them, never revert them.
- I write in English or German. Answer in the language I used.

## How I give input
- Short, direct requests, often several in a row or mid-task. Finish the current change, then pick up the new one.
- Visual references go in `References/` (sketches, screenshots of bugs). When I mention one, open it first. The folder is gitignored.
- If a request is ambiguous but small, make the most likely change, say what you assumed in one line, and offer the alternative. Ask only when a wrong guess would cost real rework.

## Stack
Next.js 16 (Turbopack), React 19, TypeScript, Tailwind 4, React Three Fiber stage in `src/scene/*`, Zustand, `@base-ui/react` for dialogs/menus.
- Sections: `src/sections/Station0X*.tsx`. Chrome (nav, rail, HUD, tethers, mobile menu): `src/chrome/*`. Building blocks: `src/ui/*`. Stream spec: `src/scene/streamSpec.ts`.
- Phones (< 768px) use `mobilePlacement()` / the `m` prop on GlassPanel instead of the desktop absolute layout.

## Hard rules
- Colors, sizes, spacing and durations come from the tokens in `globals.css` / DESIGN.md. Add a token rather than hardcoding a value.
- Magenta is reserved for the way into the core (LOGIN, Enter Core, the login arrow). Public actions use cyan.
- Buttons: Button/Core `outline` (magenta frame, 200ms fade to translucent Enter Core pink on hover/focus) for LOGIN and Enter Core; `compact` for the nav. Button/Ghost (cyan) for public actions.
- Respect `prefers-reduced-motion`. Motion only where it helps; use the animate / review-animations skills for it.
- Before hand-rolling a dialog, combobox, toast etc., run `pick-ui-library` (base-ui is already installed).
- Figma MCP output is a reference for layout and behavior, never code to paste in.
- No placeholders, TODOs or lorem ipsum unless I ask for one. Current intended placeholders: the `/login` page and the photo frame in 01 About (until I provide a photo).
- Never commit: `Resume_Paul_Onyeikedi.pdf`, `*.fig`, `References/`, `docs/references/`, `.claude/settings.local.json`.
- Never delete `.agents/`: `.claude/skills/*` are symlinks into it.
- Commit or push only when I ask. Commits end with the Co-Authored-By line from the session.

## Verify (every visual change)
1. The dev server usually runs already on `localhost:3000` (LAN `192.168.178.20:3000` for my phone). Don't start a second one.
2. Screenshot with Playwright at desktop 1440×900 and mobile 390×844 (@2x, isMobile). Wait for `[data-stage=ready]`, remove `nextjs-portal` (dev badge). `@playwright/test` only resolves from the project root, so put temp scripts there as dot-files and delete them afterwards. Screenshots go to the scratchpad.
3. For scroll-driven or 3D changes, also shoot the in-between states (e.g. several points between two stations), not just the landing positions. For hover/transition changes, measure the computed styles over time.
4. Look at the screenshots before reporting. `npx tsc --noEmit` and `npx eslint src` must show 0 errors.

## Impeccable
- The full Impeccable loop is **paused** (see DESIGN.md "Workflow status"). Don't run `/impeccable` commands or treat their findings as blocking on your own.
- When I ask for it ("run the loop once", "critique"), run that one command properly (both assessments as sub-agents, detector included), then go back to normal work.
- One design rule set only: Impeccable plus the Emil Kowalski skills. Don't install other general design-rule skills.

## How to report back
Short and direct. Lead with what changed, then what's verified (with screenshot paths), then what's still open. Mention anything you changed beyond the request, and anything of mine you saw but left alone. No long recaps.
