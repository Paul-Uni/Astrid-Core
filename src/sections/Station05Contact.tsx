import { GlassPanel } from "@/ui/GlassPanel";
import { SectionLabel } from "@/ui/SectionLabel";
import { SocialNode } from "@/ui/SocialNode";
import { CoreGate } from "@/ui/CoreGate";
import { Section } from "./Section";
import { STATIONS } from "@/tokens/stations";

/**
 * Station 05 — Contact. Translated from Figma node 49:5916.
 * Contact panel left; three Social Nodes on the orbit ring around the Core
 * Gate, which sits at the emitter's gravity well; footer bottom-right.
 */
export function Station05Contact() {
  const station = STATIONS[5]!;
  return (
    <Section station={station}>
      <div className="relative mx-auto h-full min-h-[56.25rem] w-full max-w-[90rem] max-md:flex max-md:flex-col max-md:gap-10 max-md:pt-[6.75rem] max-md:pb-16 max-md:min-h-[60.625rem]">
        {/* Contact panel — Figma (84, 150), width 500, padding 32 */}
        <GlassPanel
          className="flex w-[31.25rem] flex-col gap-5 p-8 max-md:gap-4"
          style={{ position: "absolute", left: "5.25rem", top: "9.375rem" }}
          m={{ x: 20, w: 340, p: 24 }}
          aria-labelledby="contact-h2"
        >
          <SectionLabel index={5} name="Contact" />
          <h2
            id="contact-h2"
            className="font-pixel text-display-l max-md:text-display-m"
            style={{ color: "var(--color-ice)" }}
          >
            {"Let’s talk."}
          </h2>
          <p
            className="font-sans text-body-m"
            style={{ color: "var(--color-ice)" }}
          >
            Open to internships and working student roles in software,
            data or AI. Available now, full-time during university breaks.
          </p>

          <a
            href="mailto:ponyeikedi@gmail.com"
            className="group flex w-full items-center gap-4 py-3 max-md:gap-3"
            style={{ borderBottom: "1px solid var(--color-vex-cyan)" }}
          >
            <span
              className="min-w-24 font-mono text-mono-label uppercase max-md:min-w-0"
              style={{ color: "var(--color-vex-cyan)" }}
            >
              email
            </span>
            <span
              className="min-w-0 flex-1 font-sans text-body-l max-md:text-body-m"
              style={{ color: "var(--color-ice)" }}
            >
              ponyeikedi@gmail.com
            </span>
            <span
              aria-hidden
              className="font-sans text-body-l max-md:text-body-m"
              style={{ color: "var(--color-vex-cyan)" }}
            >
              ↗
            </span>
          </a>

        </GlassPanel>

        {/* Social nodes ride on the WebGL orbit ring (scene/OrbitRing moves them each
            frame). These Figma positions are the fallback without WebGL. */}
        <div data-orbit-node="discord" className="absolute left-0 top-0" style={{ transform: "translate(22.75rem, 35.5625rem)" }}>
          <SocialNode platform="discord" label="Discord·copy" copyValue="paul_lauer" />
        </div>
        <div data-orbit-node="github" className="absolute left-0 top-0" style={{ transform: "translate(60.75rem, 30.625rem)" }}>
          <SocialNode platform="github" label="GitHub ↗" href="https://github.com/Paul-Uni" />
        </div>
        <div data-orbit-node="linkedin" className="absolute left-0 top-0" style={{ transform: "translate(71.0625rem, 42.125rem)" }}>
          <SocialNode
            platform="linkedin"
            label="LinkedIn ↗"
            href="https://www.linkedin.com/in/paul-onyeikedi-4520a12a0/"
          />
        </div>

        {/* Core Gate: a point at the well's mouth (720, 610); the floor lines up with it, the throat drops below.
            Phones (Figma m05): centered on the beam at y 636 */}
        <div className="absolute left-[45rem] top-[38.125rem] max-md:left-1/2 max-md:top-[39.75rem]">
          <CoreGate href="/login" />
        </div>

        {/* Phones: the HUD's CORE REACHED moves here, centered above the footer (Figma m05) */}
        <p className="absolute left-1/2 top-[55.75rem] -translate-x-1/2 whitespace-nowrap font-mono text-mono-label uppercase text-ice/85 md:hidden">
          <span
            aria-hidden
            className="mr-1.5 inline-block size-1.5 rounded-full align-middle"
            style={{ backgroundColor: "var(--color-vex-cyan)", boxShadow: "var(--glow-cyan)" }}
          />
          Core reached
        </p>

        {/* Footer — Figma (1028, 851); phones: centered at the bottom (Figma m05) */}
        <p
          className="absolute left-[64.25rem] top-[53.1875rem] font-mono text-mono-data uppercase max-md:left-1/2 max-md:top-[57.75rem] max-md:-translate-x-1/2 max-md:whitespace-nowrap"
          style={{ color: "var(--color-ice)" }}
        >
          © 2026 Paul Onyeikedi · astridcore.dev
        </p>
      </div>
    </Section>
  );
}
