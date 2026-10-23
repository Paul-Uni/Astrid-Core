import { GlassPanel } from "@/ui/GlassPanel";
import { StatusChip } from "@/ui/StatusChip";
import { SectionLabel } from "@/ui/SectionLabel";
import { ButtonGhost } from "@/ui/ButtonGhost";
import { ButtonCore } from "@/ui/ButtonCore";
import { CoreTelemetry } from "@/ui/CoreTelemetry";
import { Section } from "./Section";
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
      <div className="relative mx-auto h-full min-h-[52rem] w-full max-w-[90rem]">
        {/* Intro panel — left side, Figma pos (88, 168) */}
        <GlassPanel
          className="absolute left-[5.5rem] top-[10.5rem] flex max-w-[29rem] flex-col gap-7 p-8"
          aria-labelledby="entry-h1"
        >
          <StatusChip>Open to Working Student roles · C# / .NET</StatusChip>

          <SectionLabel index={0} name="Entry Point" />

          <h1
            id="entry-h1"
            className="font-pixel text-display-l"
            style={{ color: "var(--color-ice)" }}
          >
            {"Hi, I’m Paul."}
            <br />
            Welcome
            <br />
            to the Core.
          </h1>

          <p
            className="font-sans text-body-l max-w-[25rem]"
            style={{ color: "var(--color-ice)" }}
          >
            Computer science student at Ruhr University Bochum, focused on
            C#/.NET development. I build apps, tools and my own data core:
            Astrid. Scroll, and the camera takes you along.
          </p>

          <div className="flex flex-wrap items-start gap-4">
            <ButtonGhost href="#projects">View projects</ButtonGhost>
            <ButtonCore href="#login">
              Enter Core
              <span aria-hidden>→</span>
            </ButtonCore>
          </div>
        </GlassPanel>

        {/* Core Telemetry — right side, Figma pos (1136, 594) */}
        <div className="absolute left-[71rem] top-[37.125rem]">
          <CoreTelemetry />
        </div>
      </div>
    </Section>
  );
}
