import { GlassPanel } from "@/ui/GlassPanel";
import { SectionLabel } from "@/ui/SectionLabel";
import { PhotoFrame } from "@/ui/PhotoFrame";
import { Section } from "./Section";
import { mobilePlacement } from "@/ui/mobilePlacement";
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
      <div className="relative mx-auto h-full min-h-[56.25rem] w-full max-w-[90rem] max-md:flex max-md:flex-col max-md:gap-10 max-md:pt-[6.75rem] max-md:pb-16">
        {/* Profile panel — Figma pos (80, 150), width 520 */}
        <GlassPanel
          className="flex w-[32.5rem] flex-col gap-5 p-8 max-md:gap-4"
          style={{ position: "absolute", left: "5rem", top: "9.375rem" }}
          m={{ x: 14, w: 346, p: 24 }}
          tether
          aria-labelledby="about-h2"
        >
          <SectionLabel index={1} name="About" />

          <h2
            id="about-h2"
            className="font-pixel text-display-l max-md:text-display-m"
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
            {"I’m Paul, currently doing my bachelor in computer science at the Ruhr University Bochum. Outside of lectures I keep building things: games in Unity, small handy tools like a Twitch bot, and Astrid, an AI assistant that runs fully local on my own machine."}
            <br />
            <br />
            {"I also play video games and consider myself a gym rat, so if I’m not at home or at uni, I’m probably at the gym :D"}
          </p>

          <hr
            aria-hidden
            className="h-px w-full border-0"
            style={{ backgroundColor: "var(--color-vex-cyan)" }}
          />

          <div className="flex flex-wrap items-start gap-8 max-md:flex-nowrap max-md:gap-5">
            <FactsColumn label="Interests" items={INTERESTS} />
            <FactsColumn label="Languages" items={LANGUAGES} />
          </div>
        </GlassPanel>

        {/* Photo frame — Figma pos (958, 232); on phones it comes first */}
        <div className="absolute left-[58.5rem] top-[14.5rem]" {...mobilePlacement({ x: 40, order: -1 })}>
          <PhotoFrame tether />
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
