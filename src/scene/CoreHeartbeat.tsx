"use client";

import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useCoreStore } from "@/store/useCoreStore";
import { CORE_PULSE, pulseUniforms } from "./corePulse";

/**
 * Advances the core heartbeat once per frame. Mounted first in the canvas so
 * every material reads this frame's phase. Under reduced motion the beat
 * holds still between pulses; hover still tints the core (one redraw).
 */
export function CoreHeartbeat({ still }: { still: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => useCoreStore.subscribe(() => invalidate()), [invalidate]);

  useFrame((_, delta) => {
    const target = useCoreStore.getState().hover ? 1 : 0;
    const { uPulse, uBoost } = pulseUniforms;
    if (still) {
      uBoost.value = target;
      uPulse.value = CORE_PULSE.restPhase;
      return;
    }
    const dt = Math.min(delta, 0.1);
    uBoost.value += (target - uBoost.value) * (1 - Math.exp(-dt * 6));
    const period = CORE_PULSE.period + (CORE_PULSE.boostPeriod - CORE_PULSE.period) * uBoost.value;
    uPulse.value = (uPulse.value + dt / period) % 1;
  });
  return null;
}
