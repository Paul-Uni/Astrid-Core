import { GlassPanel } from "@/ui/GlassPanel";
import { SectionLabel } from "@/ui/SectionLabel";
import { Section } from "./Section";
import { STATIONS } from "@/tokens/stations";

type Entry = {
  dateRange: string;
  current?: boolean;
  title: string;
  org: string;
  body?: string;
  /** Figma pos within the 90rem container (rem). */
  pos: { left: string; top: string };
};

/** Figma 48:4933 — ordered newest→oldest, alternating right/left of beam. */
const ENTRIES: readonly Entry[] = [
  {
    dateRange: "10/2024 — TODAY",
    current: true,
    title: "B.Sc. Computer Science",
    org: "Ruhr University Bochum · 5th semester",
    body: "Focus: software development, computer networks, operating systems, intro to AI.",
    pos: { left: "57.625rem", top: "7.3125rem" },
  },
  {
    dateRange: "2025 — 2026",
    title: "Simulation lab & research",
    org: "Ruhr University Bochum",
    body: "Built the RUB campus in RoadRunner as a driving environment for LiDAR agents. Literature review on emotion representations in LLMs.",
    pos: { left: "6.3125rem", top: "18.75rem" },
  },
  {
    dateRange: "2025",
    title: "Team project: CAM",
    org: "Carbyte / SE Labs · Scrum",
    body: "AI backend in C#, flowchart editor in React/TypeScript.",
    pos: { left: "51.8125rem", top: "24.75rem" },
  },
  {
    dateRange: "10/2021 — 07/2024",
    title: "B.Sc. Applied Computer Science",
    org: "Ruhr University Bochum",
    body: "Switched to the B.Sc. Computer Science.",
    pos: { left: "4.75rem", top: "37.0625rem" },
  },
  {
    dateRange: "08/2018 — 07/2021",
    title: "Abitur",
    org: "Carl-Strehl-Schule · Marburg",
    pos: { left: "57.25rem", top: "40.1875rem" },
  },
];

/**
 * Station 04 — Background. Translated from Figma node 48:4933.
 * Header top-left, five timeline entries alternating sides.
 * Current entry carries a dusk-pink date to mark "today".
 */
export function Station04Background() {
  const station = STATIONS[4]!;
  return (
    <Section station={station}>
      <div className="relative mx-auto h-full min-h-[56.25rem] w-full max-w-[90rem]">
        {/* Header — Figma (72, 128), width 440 */}
        <GlassPanel
          className="flex w-[27.5rem] flex-col gap-3 p-7"
          style={{ position: "absolute", left: "4.5rem", top: "8rem" }}
          aria-labelledby="background-h2"
        >
          <SectionLabel index={4} name="Background" />
          <h2
            id="background-h2"
            className="font-pixel text-display-l"
            style={{ color: "var(--color-ice)" }}
          >
            The path so far.
          </h2>
        </GlassPanel>

        {ENTRIES.map((e) => (
          <GlassPanel
            key={e.title + e.dateRange}
            className="flex w-[25rem] flex-col gap-2 p-5.5"
            style={{ position: "absolute", left: e.pos.left, top: e.pos.top }}
          >
            <p
              className="font-mono text-mono-label uppercase"
              style={{
                color: e.current
                  ? "var(--color-dusk-pink)"
                  : "var(--color-vex-cyan)",
              }}
            >
              {e.dateRange}
            </p>
            <h3
              className="font-pixel text-heading-m"
              style={{ color: "var(--color-ice)" }}
            >
              {e.title}
            </h3>
            <p
              className="font-mono text-mono-data uppercase"
              style={{ color: "var(--color-ice)" }}
            >
              {e.org}
            </p>
            {e.body && (
              <p
                className="font-sans text-body-m"
                style={{ color: "var(--color-ice)" }}
              >
                {e.body}
              </p>
            )}
          </GlassPanel>
        ))}
      </div>
    </Section>
  );
}
