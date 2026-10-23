import { GlassPanel } from "@/ui/GlassPanel";
import { SectionLabel } from "@/ui/SectionLabel";
import { PhotoFrame } from "@/ui/PhotoFrame";
import { Section } from "./Section";
import { STATIONS } from "@/tokens/stations";

const INTERESTS = ["AI & machine learning", "Game development", "Strength training"] as const;
const LANGUAGES = ["German · native", "English · C1"] as const;

/**
 * Station 01 — About. Translated from Figma node 45:1950.
 * Profile panel left (520px wide), photo frame right.
 */
export function Station01About() {
  const station = STATIONS[1]!;
  return (
    <Section station={station}>
      <div className="relative mx-auto h-full min-h-[52rem] w-full max-w-[90rem]">
        {/* Profile panel — Figma pos (80, 150), width 520 */}
        <GlassPanel
          className="flex w-[32.5rem] flex-col gap-5 p-8"
          style={{ position: "absolute", left: "5rem", top: "9.375rem" }}
          aria-labelledby="about-h2"
        >
          <SectionLabel index={1} name="About" />

          <h2
            id="about-h2"
            className="font-pixel text-display-l"
            style={{ color: "var(--color-ice)" }}
          >
            {"Who’s behind"}
            <br />
            the core.
          </h2>

          <p
            className="font-sans text-body-m"
            style={{ color: "var(--color-ice)" }}
          >
            {"I’m Paul, a computer science student at Ruhr University Bochum, now in my 5th semester. In a Scrum team project I built a C# AI backend and connected it to a React/TypeScript editor. Outside of lectures I keep building my own things: games in Unity and Python, a .NET MAUI desktop app, and Astrid, an AI assistant that runs fully local on my own machine."}
          </p>

          <hr
            aria-hidden
            className="h-px w-full border-0"
            style={{ backgroundColor: "var(--color-vex-cyan)" }}
          />

          <div className="flex flex-wrap items-start gap-8">
            <FactsColumn label="Interests" items={INTERESTS} />
            <FactsColumn label="Languages" items={LANGUAGES} />
          </div>
        </GlassPanel>

        {/* Photo frame — Figma pos (958, 232) */}
        <div className="absolute left-[59.875rem] top-[14.5rem]">
          <PhotoFrame />
        </div>
      </div>
    </Section>
  );
}

function FactsColumn({
  label,
  items,
}: {
  label: string;
  items: readonly string[];
}) {
  return (
    <div className="flex flex-1 flex-col items-start gap-2 min-w-0">
      <p
        className="font-mono text-mono-label uppercase"
        style={{ color: "var(--color-vex-cyan)" }}
      >
        {`// ${label.toUpperCase()}`}
      </p>
      {items.map((item) => (
        <p
          key={item}
          className="font-sans text-body-m"
          style={{ color: "var(--color-ice)" }}
        >
          {item}
        </p>
      ))}
    </div>
  );
}
