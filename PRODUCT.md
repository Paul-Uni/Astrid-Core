# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js / React. The data stream (hero background and scroll scene) is rendered in WebGL (Three.js), scroll-driven. Deployment target: self-hosted, domain on Cloudflare.

## Language

All site copy is English (international teams, recruiters outside Germany). Section names: About, Skills, Projects, Background, Contact.

## Users

**Primary (public):** Recruiters and hiring engineers evaluating Paul for a working-student position (Werkstudent) in C#/.NET software development. They arrive from applications, LinkedIn or GitHub and decide in under 60 seconds whether to reach out.

**Secondary (public):** Peers and collaborators arriving via GitHub or word of mouth.

**Private:** Paul himself. He enters through the login gate ("Enter Core") into his private area.

## Product Purpose

Paul's professional home on his own domain, astridcore.dev. The public side is a CV as a website: who he is, what he can do, what he has built, how to reach him. The private side is the entrance to **Astrid**, his main PC and personal data core: all his other devices connect to it, which is where the name Astrid-Core comes from.

## Positioning

Paul's own site, under his own domain, controlled entirely by him. The site *is* the core: visitors scroll down a data stream into it, the camera circling it as they go. That makes it a personal statement, not a generic developer template.

## Operating Context

- Recruiters spend under 60 seconds. All core facts (name, role, status, contact) must be readable without waiting for or understanding the animation.
- Desktop (recruiter laptop) is the primary context; mobile (390px) has its own layout (Figma page "02 Mobile") and must work fully.
- Paul reaches the private area from his own devices.

## Capabilities and Constraints

- **Public, one long scroll page** along the data stream, six stations (see the orbit rail in DESIGN.md):
  - 00 Entry: hero, name, role, status, CTAs
  - 01 About: profile text, interests (AI/ML, game development, strength training), languages (German native, English C1), photo of Paul (placeholder frame until the photo exists)
  - 02 Skills: C#, .NET, Git, OOP, Unity, Python, Java, JavaScript, TypeScript, React, MySQL, Docker, RoadRunner · AI & agents: Ollama/local LLMs, tool calling, prompt design, Claude Code · Methods: Scrum
  - 03 Projects (exactly three): **Astrid** (local AI desktop assistant, Python + Ollama, own message architecture, tool calling, modular skill system; source: https://github.com/Paul-Uni/Astrid) · **CAM** (Complexity Assistance Manager, team project with Carbyte / SE Labs 2025: AI backend in C#, React/TypeScript flowchart editor, Scrum) · **astridcore.dev itself** (this site; "behind the scenes" links to the source: https://github.com/Paul-Uni/Astrid-Core)
  - 04 Path: B.Sc. Informatik, Ruhr-Universität Bochum (since 10/2024) · B.Sc. Angewandte Informatik, RUB (10/2021–07/2024) · Abitur, Carl-Strehl-Schule Marburg (2018–2021)
  - 05 Core: contact, then "Enter Core" leading to the login
- **Public contact:** e-mail ponyeikedi@gmail.com, GitHub https://github.com/Paul-Uni, LinkedIn https://www.linkedin.com/in/paul-onyeikedi-2b4b44265/, Discord `paul_lauer`. Phone number and address are never shown on the site.
- **Status line:** open to working-student roles in C#/.NET, available now, 8–10 h/week, more during semester breaks.
- **Private (later):** login-protected area: chat with Paul's local agent Astrid (Ollama on his PC), later access to his personal file system / Obsidian vault.
- **Core Telemetry panel:** stays as designed for now (decorative). Planned later: live status of Paul's own devices, e.g. whether his Raspberry Pi is up.
- **Undecided:** password mechanism.

## Brand Commitments

- Name: **Astrid-Core** (domain astridcore.dev). Astrid is the name of Paul's main PC and of his assistant.
- Person: **Paul Onyeikedi**, addressed as "Paul".
- Visual language inspired by the Destiny 2 Vex Network (data stream, wireframe fragments, dusk sky). Inspired only: no game assets, logos or names on the site.

## Evidence on Hand

- Paul's CV (Softwareentwicklung, 2026) is the only source for facts. Everything on the site must be traceable to it or to Paul directly.
- The GPA is **not** shown on the site.
- No fabricated projects, numbers, employers, testimonials or metrics. Accepted exception: the Core Telemetry panel and HUD values are decorative world-building until they are wired to real device status.

## Product Principles

1. **Legibility in 60 seconds.** A recruiter who scans without reading leaves knowing: Paul, C#/.NET developer and CS student, open to Werkstudent roles, how to reach him.
2. **Personal without being precious.** The stream is the identity, but it frames the content, it never hides it.
3. **Visible gate, hard separation.** The entrance (Login / Enter Core) is visible to everyone as part of the concept, but the private area is not accessible without authentication: no private route, data or content is served, rendered or fetched before a valid login, and the check happens server-side.
4. **Low maintenance overhead.** No CMS. Content lives in the codebase and is easy for Paul to update.

## Accessibility & Inclusion

WCAG 2.1 AA baseline. Full experience without motion (`prefers-reduced-motion`): all content readable, stream shown as a still.
