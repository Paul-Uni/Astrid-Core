import { GlassPanel } from "@/ui/GlassPanel";
import { StatusChip } from "@/ui/StatusChip";
import { SectionLabel } from "@/ui/SectionLabel";
import { ButtonGhost } from "@/ui/ButtonGhost";
import { ButtonCore } from "@/ui/ButtonCore";
import { CoreTelemetry } from "@/ui/CoreTelemetry";
import { Section } from "./Section";
import { mobilePlacement } from "@/ui/mobilePlacement";
import { STATIONS } from "@/tokens/stations";

/**
 * Station 00 — Entry Point hero.
 *
 * Translated from Figma node 2:3. Layout is pixel-accurate at 1440 using
 * rem on a 90rem (1440px) centered container, so CTRL+zoom scales both
 * panels and their offsets together with the viewport.
 */
export function Station00Entry() {
  const station = STATIONS[0]!;
  return (
    <Section station={station}>
      <div className="relative mx-auto h-full min-h-[56.25rem] w-full max-w-[90rem] max-md:flex max-md:flex-col max-md:gap-10 max-md:pt-[18.75rem] max-md:pb-16">
        {/* Intro panel — left side, Figma pos (88, 168) */}
        <GlassPanel
          className="flex max-w-[29rem] flex-col gap-7 p-8 max-md:gap-4"
          style={{ position: "absolute", left: "5.5rem", top: "10.5rem" }}
          m={{ x: 20, w: 340, p: 24 }}
          aria-labelledby="entry-h1"
          data-power-style="boot"
        >
          <StatusChip>Open to internships & working student roles · software, data, AI</StatusChip>

          <SectionLabel index={0} name="Entry Point" />

          <h1
            id="entry-h1"
            className="font-pixel text-display-l max-md:text-display-m"
            style={{ color: "var(--color-ice)" }}
          >
            {"Hi, I’m Paul."}
            <span className="mt-3 block font-pixel text-heading-m text-vex-cyan max-md:text-heading-s">
              Software &amp; AI developer
            </span>
          </h1>

          <div className="flex flex-col gap-3">
            <p
              className="font-sans text-body-l max-w-[25rem] max-md:text-body-m"
              style={{ color: "var(--color-ice)" }}
            >
              Computer science student at Ruhr University Bochum, focused on
              C#/Python development and Artificial Intelligence. I build apps, tools and my own data core:
              Astrid.
            </p>
            <p
              className="font-mono text-mono-data lowercase"
              style={{ color: "var(--color-dusk-pink)" }}
            >
              ↕ scroll, and explore the panels below.
            </p>
          </div>

          <div className="flex flex-wrap items-start gap-4 max-md:flex-col max-md:items-stretch max-md:gap-2.5">
            <ButtonGhost href="#projects" className="max-md:justify-center">View projects</ButtonGhost>
            <ButtonCore href="#contact" variant="outline" className="max-md:justify-center">
              Contact me
              <span aria-hidden>↓</span>
            </ButtonCore>
          </div>
        </GlassPanel>

        {/* Core Telemetry — right side, Figma pos (1136, 594); on phones compact below the intro */}
        <div className="absolute left-[71rem] top-[37.125rem]" {...mobilePlacement({ x: 32 })}>
          <CoreTelemetry />
        </div>

        {/* Phones: the HUD is reduced to this line at the end of 00 (DESIGN.md Mobile) */}
        <p className="ml-5 font-mono text-mono-label uppercase text-ice/85 md:hidden">
          ↓ Scroll to orbit
        </p>
      </div>
    </Section>
  );
}
