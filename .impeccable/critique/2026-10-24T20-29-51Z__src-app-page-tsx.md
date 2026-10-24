---
target: whole public page
total_score: 21
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\paulo\\local\\Astrid_Core\\src\\app\\page.tsx"
target_fingerprint: "sha256:fa8748da495ef928d089990792e76677e32d206fd64a5aa648e2b362fb1d4873"
target_path: "C:\\Users\\paulo\\local\\Astrid_Core\\src\\app\\page.tsx"
timestamp: 2026-10-24T20-29-51Z
slug: src-app-page-tsx
---
Method: dual-agent (A: design review · B: detector + browser)

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Rail + live HUD show position; active rail label collides with panels at 03/04 |
| 2 | Match System / Real World | 3 | Plain section names; "NODE 01", "uplink", telemetry need filtering |
| 3 | User Control and Freedom | 2 | Enter Core / LOGIN dead (#login), mobile menu button inert |
| 4 | Consistency and Standards | 3 | Chips forced lowercase; plain-text line styled like links (Station03Projects:82) |
| 5 | Error Prevention | 2 | Dead #login targets; mailto shows external-link arrow |
| 6 | Recognition Rather Than Recall | 3 | Idle rail shows diamonds only until hover |
| 7 | Flexibility and Efficiency | 2 | No skip link; 13 tabs to first content CTA |
| 8 | Aesthetic and Minimalist Design | 2 | Previous station bleeds under nav; HUD prints over body text |
| 9 | Error Recovery | 1 | Discord copy failure silent; #login no feedback |
| 10 | Help and Documentation | n/a | Single-scroll CV |
| Total | | 21/36 | Acceptable (58%) |

Priority issues:
1. [P1] Station framing: scroll-margin 13rem + panel tops 8–10rem land headings at y≈350–400; previous station bleeds under nav; Contact lock/Enter Core/LinkedIn below fold at 1440×900. Fix: frame each section as its 1440×900 Figma frame (scroll-margin ≈ 0), nav backdrop band.
2. [P1] HUD overlaps body text on every station (Hud.tsx fixed bottom-left z-40; detector text-occlusion on mobile). Fix: bottom safe zone for panels or HUD backdrop.
3. [P1] Magenta CTA contrast 3.5:1 (ice on magenta-core, ButtonCore) fails AA; most prominent CTA serves an audience of one. Fix: darker text or deeper fill, reconsider CTA weight.
4. [P2] Duplicate sr-only h2 before visible headings (h2 before h1), no skip link, rail before main in tab order.
5. [P2] Recruiter keyword scan: lowercase chips (c#, .net), role not in H1, availability only in Contact.

Detector: source scan clean (0). URL scan 18: low-contrast 2 (real), dark-glow 3 (intentional), kicker-above-heading 6 (intentional station markers), numbered-section-labels 3 (false positive: dates), em-dash-overuse 1 (mostly false positive), straggler 1, unbalanced-heading 1. Mobile adds body-text-viewport-edge (About panel 210px overflow) and text-occlusion (HUD).
