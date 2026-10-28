import { GlassPanel } from "@/ui/GlassPanel";
import { SectionLabel } from "@/ui/SectionLabel";
import { Chip } from "@/ui/Chip";
import { Section } from "./Section";
import { STATIONS } from "@/tokens/stations";
import type { MobilePlacement } from "@/ui/mobilePlacement";

type Cluster = {
  index: string;        // "01", "02", "03"
  title: string;
  chips: readonly string[];
  /** Absolute position within the 90rem container (Figma pixel → rem). */
  pos: { left: string; top: string };
  width: string;
  /** Mobile placement (Figma m02). */
  m: MobilePlacement;
};

const CLUSTERS: readonly Cluster[] = [
  {
    index: "01",
    title: "Languages & frameworks",
    chips: ["Python", "C#", ".NET", "Java", "JavaScript", "TypeScript", "React", "Unity"],
    pos: { left: "50.6875rem", top: "13.0625rem" },
    width: "27.5rem",
    m: { x: 28, w: 334, p: 20 },
  },
  {
    index: "02",
    title: "AI & agents",
    chips: ["Ollama · local LLMs", "Tool calling", "Prompt design", "Claude Code"],
    pos: { left: "13.25rem", top: "29.5rem" },
    width: "23.75rem",
    m: { x: 12, w: 340, p: 20 },
  },
  {
    index: "03",
    title: "Tools & methods",
    chips: ["Git", "Docker", "MySQL", "SQLite", "RoadRunner", "OOP", "Scrum"],
    pos: { left: "56.375rem", top: "34.125rem" },
    width: "22.5rem",
    m: { x: 24, w: 336, p: 20 },
  },
];

/**
 * Station 02 — Skills. Translated from Figma node 46:2933.
 * Header panel top-left, then three cluster panels spread around the stream.
 */
export function Station02Skills() {
  const station = STATIONS[2]!;
  return (
    <Section station={station}>
      <div className="relative mx-auto h-full min-h-[56.25rem] w-full max-w-[90rem] max-md:flex max-md:flex-col max-md:gap-10 max-md:pt-[6.75rem] max-md:pb-16">
        {/* Header panel — Figma pos (96, 132), width 420 */}
        <GlassPanel
          className="flex w-[26.25rem] flex-col gap-4 p-8"
          style={{ position: "absolute", left: "6rem", top: "8.25rem" }}
          m={{ x: 16, w: 340, p: 24 }}
          aria-labelledby="skills-h2"
        >
          <SectionLabel index={2} name="Skills" />
          <h2
            id="skills-h2"
            className="font-pixel text-display-l max-md:text-display-m"
            style={{ color: "var(--color-ice)" }}
          >
            The stack.
          </h2>
          <p
            className="font-sans text-body-m"
            style={{ color: "var(--color-ice)" }}
          >
            What I work with, sorted by what I use it for.
          </p>
        </GlassPanel>

        {CLUSTERS.map((c) => (
          <GlassPanel
            key={c.index}
            tether
            m={c.m}
            className="flex flex-col gap-3.5 p-6"
            style={{
              position: "absolute",
              left: c.pos.left,
              top: c.pos.top,
              width: c.width,
            }}
          >
            <div className="flex w-full flex-col gap-1.5">
              <p
                className="font-mono text-mono-data uppercase"
                style={{ color: "var(--color-vex-cyan)" }}
              >
                {`// ${c.index} · ${c.chips.length.toString().padStart(2, "0")} NODES`}
              </p>
              <p
                className="font-pixel text-heading-m max-md:text-heading-s"
                style={{ color: "var(--color-ice)" }}
              >
                {c.title}
              </p>
            </div>
            <div className="flex w-full flex-wrap items-start gap-2">
              {c.chips.map((chip) => (
                <Chip key={chip}>{chip}</Chip>
              ))}
            </div>
          </GlassPanel>
        ))}
      </div>
    </Section>
  );
}
