import { Nav } from "@/chrome/Nav";
import { OrbitRail } from "@/chrome/OrbitRail";
import { Hud } from "@/chrome/Hud";
import { Station00Entry } from "@/sections/Station00Entry";
import { Station01About } from "@/sections/Station01About";
import { Station02Skills } from "@/sections/Station02Skills";
import { Station03Projects } from "@/sections/Station03Projects";
import { Station04Background } from "@/sections/Station04Background";
import { Station05Contact } from "@/sections/Station05Contact";
import { ScrollProgressDriver } from "./ScrollProgressDriver";
import { PanelPowerOn } from "./PanelPowerOn";
import { StageLoader } from "@/scene/StageLoader";
import { Tethers } from "@/chrome/Tethers";

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
      <Tethers />

      <ScrollProgressDriver />
      <PanelPowerOn />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-14 focus:top-4 focus:z-50 focus:border focus:border-vex-cyan focus:bg-void focus:px-4 focus:py-2 focus:font-mono focus:text-mono-label focus:uppercase focus:text-ice"
      >
        Skip to content
      </a>
      <Nav />

      <main id="main" tabIndex={-1} className="relative focus:outline-none">
        <Station00Entry />
        <Station01About />
        <Station02Skills />
        <Station03Projects />
        <Station04Background />
        <Station05Contact />
      </main>

      {/* Fixed chrome after the content, so keyboard users reach the stations first. */}
      <OrbitRail />
      <Hud />
    </>
  );
}
