import { GlassPanel } from "@/ui/GlassPanel";
import { SectionLabel } from "@/ui/SectionLabel";
import { ButtonGhost } from "@/ui/ButtonGhost";
import { SocialNode } from "@/ui/SocialNode";
import { CoreGate } from "@/ui/CoreGate";
import { Section } from "./Section";
import { STATIONS } from "@/tokens/stations";

/**
 * Station 05 — Contact. Translated from Figma node 49:5916.
 * Contact panel left; three Social Nodes on a dashed orbit around the
 * Core Gate; Enter Core centered on the emitter; footer bottom-right.
 */
export function Station05Contact() {
  const station = STATIONS[5]!;
  return (
    <Section station={station}>
      <div className="relative mx-auto h-full min-h-[56.25rem] w-full max-w-[90rem]">
        {/* Contact orbit — dashed cyan ellipse around the Core Gate */}
        <img
          aria-hidden
          src="/contact-orbit.svg"
          alt=""
          className="pointer-events-none absolute inset-0 size-full"
        />

        {/* Contact panel — Figma (84, 150), width 500, padding 32 */}
        <GlassPanel
          className="flex w-[31.25rem] flex-col gap-5 p-8"
          style={{ position: "absolute", left: "5.25rem", top: "9.375rem" }}
          aria-labelledby="contact-h2"
        >
          <SectionLabel index={5} name="Contact" />
          <h2
            id="contact-h2"
            className="font-pixel text-display-l"
            style={{ color: "var(--color-ice)" }}
          >
            {"Let’s talk."}
          </h2>
          <p
            className="font-sans text-body-m"
            style={{ color: "var(--color-ice)" }}
          >
            Open to working student roles in C#/.NET. Available now, 8–10
            hours a week, more during semester breaks.
          </p>

          <a
            href="mailto:ponyeikedi@gmail.com"
            className="group flex w-full items-center gap-4 py-3"
            style={{ borderBottom: "1px solid var(--color-vex-cyan)" }}
          >
            <span
              className="font-mono text-mono-label uppercase"
              style={{ color: "var(--color-vex-cyan)", minWidth: "6rem" }}
            >
              email
            </span>
            <span
              className="flex-1 font-sans text-body-l"
              style={{ color: "var(--color-ice)" }}
            >
              ponyeikedi@gmail.com
            </span>
            <span
              aria-hidden
              className="font-sans text-body-l"
              style={{ color: "var(--color-vex-cyan)" }}
            >
              ↗
            </span>
          </a>

          <ButtonGhost href="mailto:ponyeikedi@gmail.com">Email me</ButtonGhost>
        </GlassPanel>

        {/* Social nodes — Figma positions */}
        <div className="absolute left-[22.75rem] top-[35.5625rem]">
          <SocialNode
            platform="discord"
            label="Discord · copy"
            copyValue="paul_lauer"
          />
        </div>
        <div className="absolute left-[60.75rem] top-[30.625rem]">
          <SocialNode
            platform="github"
            label="GitHub ↗"
            href="https://github.com/Paul-Uni"
          />
        </div>
        <div className="absolute left-[71.0625rem] top-[42.125rem]">
          <SocialNode
            platform="linkedin"
            label="LinkedIn ↗"
            href="https://www.linkedin.com/in/paul-onyeikedi-2b4b44265/"
          />
        </div>

        {/* Core Gate — Figma (633, 658), centered on the emitter */}
        <div className="absolute left-[39.5625rem] top-[41.125rem]">
          <CoreGate href="#login" />
        </div>

        {/* Footer — Figma (1028, 851) */}
        <p
          className="absolute left-[64.25rem] top-[53.1875rem] font-mono text-mono-data uppercase"
          style={{ color: "var(--color-ice)" }}
        >
          © 2026 Paul Onyeikedi · astridcore.dev
        </p>
      </div>
    </Section>
  );
}
