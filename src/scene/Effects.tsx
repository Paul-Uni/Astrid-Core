"use client";

import { Bloom, EffectComposer } from "@react-three/postprocessing";

/** Real bloom pass (Figma fakes it with a blurred duplicate). Only bright parts glow: light, beam core, ring tops. */
export function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur luminanceThreshold={0.5} luminanceSmoothing={0.2} intensity={0.7} radius={0.65} />
    </EffectComposer>
  );
}
