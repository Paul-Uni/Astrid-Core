"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import type { VignetteEffect } from "postprocessing";
import { endUniforms } from "./endBlend";
import { STREAM } from "./streamSpec";

/**
 * Below this share of the display's refresh rate (sustained) the scene counts as too heavy for this GPU.
 * Relative, because 70 fps is smooth on a 60 Hz screen but stutters on a 120 Hz one. Capped at 120 Hz,
 * so a 240 Hz screen doesn't demand 190 fps.
 */
const MIN_FPS_SHARE = 0.8;
const MAX_REFRESH = 120;
/** Integrated laptop GPUs start one step down, instead of stuttering through the first seconds and then visibly switching. */
const INTEGRATED_GPU = /intel|iris|uhd graphics|hd graphics/i;

/**
 * Real bloom pass (Figma fakes it with a blurred duplicate). Only bright parts glow: light, beam core, ring tops.
 * Vignette: off during the descent, darkens the frame edges at its end (station 05).
 * No multisampling: the composer renders into its own buffers and MSAA there costs far more than the soft edges give.
 */
function Effects({ bloom }: { bloom: boolean }) {
  const vignette = useRef<VignetteEffect>(null);
  useFrame(() => {
    if (vignette.current) vignette.current.darkness = STREAM.end.vignette.darkness * endUniforms.uEnd.value;
  });
  return (
    <EffectComposer multisampling={0}>
      {bloom ? <Bloom mipmapBlur luminanceThreshold={0.5} luminanceSmoothing={0.2} intensity={0.7} radius={0.65} /> : <></>}
      <Vignette ref={vignette} offset={STREAM.end.vignette.offset} darkness={0} />
    </EffectComposer>
  );
}

/**
 * Quality steps, best first. Each sustained drop below MIN_FPS_SHARE moves one step down for the rest of the visit:
 * first fewer pixels (the cost scales with dpr²), then no bloom (the heaviest pass) and no panel blur
 * (`html[data-lean]`, globals.css).
 */
const STEPS = [
  { dpr: 1.75, bloom: true, lean: false },
  { dpr: 1.25, bloom: true, lean: false },
  { dpr: 1, bloom: false, lean: true },
] as const;
const LAST_STEP = STEPS.length - 1;
/** The first frames compile the shaders and always stutter: start judging the frame rate after this (ms). */
const MONITOR_DELAY = 3000;

/**
 * Effects plus the quality steps above. Skipped under reduced motion: the loop renders on demand there,
 * so the frame rate says nothing.
 */
function startStep(gl: WebGLRenderingContext | WebGL2RenderingContext) {
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "");
  return INTEGRATED_GPU.test(renderer) ? 1 : 0;
}

export function AdaptiveEffects({ still }: { still: boolean }) {
  const context = useThree((s) => s.gl).getContext();
  const [step, setStep] = useState(() => startStep(context));
  const [watching, setWatching] = useState(false);
  const setDpr = useThree((s) => s.setDpr);

  useEffect(() => {
    const id = window.setTimeout(() => setWatching(true), MONITOR_DELAY);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (step === 0) return;
    setDpr(Math.min(window.devicePixelRatio, STEPS[step]!.dpr));
    document.documentElement.toggleAttribute("data-lean", STEPS[step]!.lean);
    return () => document.documentElement.removeAttribute("data-lean");
  }, [step, setDpr]);

  const lower = () =>
    setStep((s) => {
      const next = s + 1;
      // A screen already at or below the next step's dpr gains nothing from it: go straight on.
      return next < LAST_STEP && window.devicePixelRatio <= STEPS[next]!.dpr ? next + 1 : Math.min(next, LAST_STEP);
    });

  return (
    <>
      {watching && !still && step < LAST_STEP && <PerformanceMonitor bounds={(refresh) => [Math.min(refresh, MAX_REFRESH) * MIN_FPS_SHARE, Math.max(refresh, MAX_REFRESH)]} onDecline={lower} />}
      <Effects bloom={STEPS[step]!.bloom} />
    </>
  );
}
