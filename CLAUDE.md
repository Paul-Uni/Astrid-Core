# CLAUDE.md — astridcore.dev

## Project
Personal site on my own domain (astridcore.dev, Cloudflare), self-hosted.
- **Public side:** CV as a website: one scroll page along a data stream (stations 00 Entry → 05 Core), with links (GitHub, LinkedIn) and three projects.
- **Private side (later):** login-protected area ("Enter Core") with a chat to my local agent Astrid, later access to my file system.
- Treat `PRODUCT.md` and `DESIGN.md` as the source of truth for users, purpose and visual system. Read both before any UI work.
- Figma: https://www.figma.com/design/nDASzxVT0RalUB1S45Oq43 (hero = node `2:3`, stream = `14:21`, scroll map = `14:1945`).

## Stack for design work
- **Impeccable**: core design rules, slop detector, hooks, CI checks.
- **Emil Kowalski skills**: motion, edge cases, mobile feel.
- **Figma MCP**: design input (read-only in Claude Code).
- **Playwright** (MCP or CLI): opens the running site and verifies the result.

Do not install or use other general design-rule skills (e.g. Taste Skill). One rule set only.

## Hard rules
- No placeholders, TODOs, lorem ipsum or skipped sections. Every component is finished before the verify loop starts.
- Use existing tokens and components. No hardcoded colors, sizes or spacing outside `DESIGN.md` tokens.
- Figma MCP output (React + Tailwind) is a reference for layout and behavior, never code to paste in.
- Before hand-rolling a toast, dialog, combobox, etc., run `pick-ui-library`.
- Motion only where `find-animation-opportunities` says it helps. Respect `prefers-reduced-motion`.
- Never mark UI work done without running the verify loop (step 3) and showing me the screenshots.

## Workflow

### 0. Setup (once, skip if files exist)
1. `/impeccable init` → writes `PRODUCT.md`.
2. If a Figma file exists: `get_variable_defs` → seed `DESIGN.md` with its tokens. Otherwise `/impeccable document` builds `DESIGN.md` from the code.
3. `/impeccable hooks on`.

### 1. Input
- **Figma link given:** extract file key + node ID, run `get_design_context` and `get_screenshot`. Save the screenshot as the reference for step 3.
- **No Figma:** take my short description, run `prototype` for 2–3 variants, show them, and **wait for me to pick one**. Don't pick for me.

### 2. Build
- Implement in the real codebase with project conventions.
- Motion: `find-animation-opportunities` → `animate`.
- Let the Impeccable hook findings guide fixes as you go.

### 3. Verify loop (repeat until clean)
1. Start the dev server. Playwright opens `localhost` at desktop width and again with `--mobile`. Take screenshots of both.
2. Compare against the step-1 reference. Fix layout, spacing and type mismatches.
3. `break-ui`: long names, empty lists, huge numbers, failed network.
4. `mobile-native`: 100vh, tap delay, input zoom, safe areas, sticky hover.
5. `review-animations` (+ `animation-performance` if anything drops frames).
6. `/impeccable critique` for hierarchy and clarity.
7. Any finding → back to step 2. Exit only when the detector shows 0 findings and the screenshots match.

### 4. Ship
1. `/impeccable polish`, then `/impeccable audit`.
2. `/impeccable document` so `DESIGN.md` stays current.
3. Make sure the Impeccable detector runs in CI on PRs.
4. Summarize for me: what changed, final screenshots (desktop + mobile), anything left open.

## How to report back
Short and direct. What changed, what's verified, what's still open. No long recaps.
