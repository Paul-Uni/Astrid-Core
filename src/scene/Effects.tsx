"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import type { VignetteEffect } from "postprocessing";
import { endUniforms } from "./endBlend";
import { STREAM } from "./streamSpec";

/**
 * Real bloom pass (Figma fakes it with a blurred duplicate). Only bright parts glow: light, beam core, ring tops.
 * Vignette: off during the descent, darkens the frame edges at its end (station 05).
 */
export function Effects() {
  const vignette = useRef<VignetteEffect>(null);
  useFrame(() => {
    if (vignette.current) vignette.current.darkness = STREAM.end.vignette.darkness * endUniforms.uEnd.value;
  });
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur luminanceThreshold={0.5} luminanceSmoothing={0.2} intensity={0.7} radius={0.65} />
      <Vignette ref={vignette} offset={STREAM.end.vignette.offset} darkness={0} />
    </EffectComposer>
  );
}
