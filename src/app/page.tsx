import { Nav } from "@/chrome/Nav";
import { OrbitRail } from "@/chrome/OrbitRail";
import { Hud } from "@/chrome/Hud";
import { Section } from "@/sections/Section";
import { Station00Entry } from "@/sections/Station00Entry";
import { ScrollProgressDriver } from "./ScrollProgressDriver";
import { STATIONS } from "@/tokens/stations";

export default function Home() {
  return (
    <>
      {/* Scene placeholder: Phase A/B ship the sky gradient.
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
        <Station00Entry />
        {/* Stations 01–05 remain placeholder shells until Phase E. */}
        {STATIONS.slice(1).map((station) => (
          <Section key={station.id} station={station} />
        ))}
      </main>
    </>
  );
}
