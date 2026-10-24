import type { ReactNode } from "react";
import { GlassPanel } from "@/ui/GlassPanel";
import { SectionLabel } from "@/ui/SectionLabel";
import { Chip } from "@/ui/Chip";
import { Section } from "./Section";
import { STATIONS } from "@/tokens/stations";

/**
 * Station 03 — Projects. Translated from Figma node 47:3936.
 * Three projects, exactly, per PRODUCT.md: Astrid (featured, left),
 * CAM (right lower), astridcore.dev (right upper).
 */
export function Station03Projects() {
  const station = STATIONS[3]!;
  return (
    <Section station={station}>
      <div className="relative mx-auto h-full min-h-[56.25rem] w-full max-w-[90rem]">
        {/* Header — Figma (80, 138), width 470 */}
        <GlassPanel
          className="flex w-[29.375rem] flex-col gap-3 p-7"
          style={{ position: "absolute", left: "5rem", top: "8.625rem" }}
          aria-labelledby="projects-h2"
        >
          <SectionLabel index={3} name="Projects" />
          <h2
            id="projects-h2"
            className="font-pixel text-display-l"
            style={{ color: "var(--color-ice)" }}
          >
            {"What I’ve built."}
          </h2>
        </GlassPanel>

        {/* astridcore.dev — right upper, Figma (829, 111), width 440 */}
        <GlassPanel
          className="flex w-[27.5rem] flex-col gap-3 p-6"
          style={{ position: "absolute", left: "51.8125rem", top: "6.9375rem" }}
        >
          <MetaLine>{"// NODE 03 · LIVE · YOU ARE HERE"}</MetaLine>
          <h3
            className="font-pixel text-heading-m"
            style={{ color: "var(--color-ice)" }}
          >
            astridcore.dev
          </h3>
          <Body>
            This site: a scroll-driven data stream with a login-gated private
            side.
          </Body>
          <Chips chips={["Figma", "Next.js", "Three.js", "Cloudflare"]} />
          <FooterLink tone="dusk" href="https://github.com/Paul-Uni/Astrid-Core">
            ↳ behind the scenes · source on GitHub ↗
          </FooterLink>
        </GlassPanel>

        {/* Astrid featured — left, Figma (120, 332), width 470 */}
        <GlassPanel
          className="flex w-[29.375rem] flex-col gap-4 p-7"
          style={{ position: "absolute", left: "7.5rem", top: "20.75rem" }}
          aria-labelledby="astrid-h3"
        >
          <MetaLine>{"// NODE 01 · IN DEVELOPMENT · SINCE 2026"}</MetaLine>
          <h3
            id="astrid-h3"
            className="font-pixel text-display-l"
            style={{ color: "var(--color-ice)" }}
          >
            Astrid
          </h3>
          <Body>
            A local AI desktop assistant. It drives a language model through
            Ollama, with no cloud involved.
          </Body>
          <Bullet>
            Own message architecture, system-prompt design and tool calling:
            the model requests, Python executes.
          </Bullet>
          <Bullet>
            Modular skill system, so new abilities plug in as separate modules.
          </Bullet>
          <Chips chips={["Python", "Ollama", "Local LLMs", "Tool calling"]} />
          <FooterLink tone="dusk">
            ↳ the core this site is named after
          </FooterLink>
          <FooterLink tone="cyan" href="https://github.com/Paul-Uni/Astrid">
            ↳ source on GitHub ↗
          </FooterLink>
        </GlassPanel>

        {/* CAM — right lower, Figma (904, 416), width 440. Moved to x 808 so it
            ends at 1248, ≥16px clear of the active rail label (DESIGN.md). */}
        <GlassPanel
          className="flex w-[27.5rem] flex-col gap-3 p-6"
          style={{ position: "absolute", left: "50.5rem", top: "26rem" }}
          aria-labelledby="cam-h3"
        >
          <MetaLine>{"// NODE 02 · TEAM PROJECT · 2025"}</MetaLine>
          <div className="flex w-full flex-col gap-1">
            <h3
              id="cam-h3"
              className="font-pixel text-heading-m"
              style={{ color: "var(--color-ice)" }}
            >
              CAM
            </h3>
            <p
              className="font-mono text-mono-label uppercase"
              style={{ color: "var(--color-ice)" }}
            >
              Complexity Assistance Manager
            </p>
          </div>
          <Body>
            Team project with Carbyte / SE Labs, run in Scrum: a flowchart
            editor that visualizes client project workflows.
          </Body>
          <Bullet>
            Built the AI backend in C# and its connection to the editor.
          </Bullet>
          <Bullet>
            Co-designed the editor; frontend in React/TypeScript.
          </Bullet>
          <Chips chips={["C#", ".NET", "React", "TypeScript", "React Flow", "Git"]} />
        </GlassPanel>
      </div>
    </Section>
  );
}

/* ---------- local helpers ---------- */

function MetaLine({ children }: { children: ReactNode }) {
  return (
    <p
      className="font-mono text-mono-data uppercase"
      style={{ color: "var(--color-vex-cyan)" }}
    >
      {children}
    </p>
  );
}

function Body({ children }: { children: ReactNode }) {
  return (
    <p className="font-sans text-body-m" style={{ color: "var(--color-ice)" }}>
      {children}
    </p>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <p
      className="flex gap-2.5 font-sans text-body-m"
      style={{ color: "var(--color-ice)" }}
    >
      <span aria-hidden style={{ color: "var(--color-vex-cyan)" }}>▸</span>
      <span className="flex-1">{children}</span>
    </p>
  );
}

function Chips({ chips }: { chips: readonly string[] }) {
  return (
    <div className="flex w-full flex-wrap items-start gap-2">
      {chips.map((c) => (
        <Chip key={c}>{c}</Chip>
      ))}
    </div>
  );
}

function FooterLink({
  children,
  tone,
  href,
}: {
  children: ReactNode;
  tone: "cyan" | "dusk";
  href?: string;
}) {
  const color =
    tone === "cyan" ? "var(--color-vex-cyan)" : "var(--color-dusk-pink)";
  const className = "font-mono text-mono-data lowercase";
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={className}
        style={{ color }}
      >
        {children}
      </a>
    );
  }
  return (
    <p className={className} style={{ color }}>
      {children}
    </p>
  );
}
