import { Nav } from "@/chrome/Nav";
import { OrbitRail } from "@/chrome/OrbitRail";
import { Hud } from "@/chrome/Hud";
import { Section } from "@/sections/Section";
import { ScrollProgressDriver } from "./ScrollProgressDriver";
import { STATIONS } from "@/tokens/stations";

export default function Home() {
  return (
    <>
      {/* Scene placeholder: Phase A ships only the sky gradient.
          The WebGL <Stage /> replaces this element in Phase C. */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 sky-gradient"
      />

      <ScrollProgressDriver />
      <Nav />
      <OrbitRail />
      <Hud />

      <main className="relative">
        {STATIONS.map((station) => (
          <Section key={station.id} station={station} />
        ))}
      </main>
    </>
  );
}
