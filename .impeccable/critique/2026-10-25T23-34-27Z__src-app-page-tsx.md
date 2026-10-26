---
target: homepage
total_score: 20
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 3
target_identity: "file:C:\\Users\\paulo\\local\\Astrid_Core\\src\\app\\page.tsx"
target_fingerprint: "sha256:3a100694fe11739fe2e5f79ff7d78d4efcf28432405390f1b0c303898ece06c5"
target_path: "C:\\Users\\paulo\\local\\Astrid_Core\\src\\app\\page.tsx"
timestamp: 2026-10-25T23-34-27Z
slug: src-app-page-tsx
---
Method: dual-agent (A: design review, B: detector + browser)

## Design Health: 20/32 (Acceptable). H7 and H10 are n/a.
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | System status | 3 | Nav links never mark the current section; only the rail does |
| 2 | Match real world | 2 | World-building jargon: Enter Core, nodes, cam.θ, uplink |
| 3 | User control | 2 | Every LOGIN / Enter Core link points at #login, which no element has |
| 4 | Consistency | 3 | Email shown twice on 05; CAM appears in both 03 and 04 |
| 5 | Error prevention | 3 | Discord copy falls back when the clipboard fails |
| 6 | Recognition | 3 | Rail labels only on hover; mobile diamonds have no labels |
| 7 | Flexibility | n/a | One-page portfolio |
| 8 | Minimalism | 2 | Telemetry, HUD and NODES counters compete with content; hero stacks 7 elements |
| 9 | Error recovery | 2 | LOGIN gives no feedback at all |
| 10 | Help | n/a | Portfolio |

## Specificity
Authored for this product: stream, core, padlock, the Astrid namesake. It drifts toward generic HUD style in the bracket panels, the `// 0n` meta lines and the fake telemetry.
Detector: the CLI scan of src found 0. Overlay findings dark-glow, kickers, numbered labels, scanline stripes and em-dashes are false positives, because DESIGN.md specifies them. Seven real wrap issues: six single-word last lines (hero intro, About, CAM, mobile scroll hint, mobile Astrid meta) and one unbalanced h3, "B.Sc. Applied Computer Science".

## Priority issues
1. [P0] All 6 #login links (Nav x2, hero, CoreGate, 05, mobile menu) do nothing. Fix: a real /login gate page, or a non-link "CORE LOCKED" state. Command: /impeccable harden
2. [P1] The solid magenta Enter Core outweighs the recruiter's actions (View projects, Email me). Fix: make the public action solid and Enter Core the outline variant; remove the duplicate email action on 05. Command: /impeccable clarify
3. [P1] The H1 says "Welcome to the Core" but never states the role. Fix: put the role in or directly under the H1. Command: /impeccable typeset
4. [P1] The "IMAGE PENDING" photo frame opens 01, and on mobile it shows before any text. Fix: add the photo or hide the frame. Command: /impeccable distill
5. [P2] Mobile: rail overlaps panel edges, the Discord label touches the left edge, the menu links are 16px tall, and the hero CTAs sit below the fold. Command: /impeccable adapt

## Persona red flags
Recruiter: role comes after the brand line, Enter Core is dead, no CV download, Python listed before C#. Jordan: LOGIN does nothing. Riley: dead link; fake "online" telemetry. Casey: menu button out of thumb reach, tiny menu links, no back-to-top.

## Minor
HUD text sits on the hero bracket; a ring passes behind ABOUT in the nav; the games line has no links; the CAM text is duplicated; org names use the 12px data style.

## Questions
Should magenta go to the public CTA until the core opens? Could the telemetry panel become Download CV? Why does Astrid have no screenshot or clip?
