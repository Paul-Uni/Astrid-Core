import { Nav } from "@/chrome/Nav";
import { OrbitRail } from "@/chrome/OrbitRail";
import { Hud } from "@/chrome/Hud";
import { Section } from "@/sections/Section";
import { Station00Entry } from "@/sections/Station00Entry";
import { Station01About } from "@/sections/Station01About";
import { Station02Skills } from "@/sections/Station02Skills";
import { Station03Projects } from "@/sections/Station03Projects";
import { Station04Background } from "@/sections/Station04Background";
import { Station05Contact } from "@/sections/Station05Contact";
import { ScrollProgressDriver } from "./ScrollProgressDriver";
import { StageLoader } from "@/scene/StageLoader";
import { STATIONS } from "@/tokens/stations";

export default function Home() {
  return (
    <>
      {/* CSS sky: shows before the WebGL stage loads and whenever WebGL is
          unavailable. The stage paints over it once ready. */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 sky-gradient"
      />
      <StageLoader />

      <ScrollProgressDriver />
      <Nav />
      <OrbitRail />
      <Hud />

      <main className="relative">
        <Station00Entry />
        <Station01About />
        <Station02Skills />
        <Station03Projects />
        <Station04Background />
        <Station05Contact />
      </main>
    </>
  );
}
