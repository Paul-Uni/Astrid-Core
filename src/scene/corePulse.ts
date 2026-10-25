/**
 * The core's heartbeat. One clock drives the core flare, the pulse rising
 * up the beam and the ripple running through the floor, so all three read
 * as one beat. Hovering or focusing Enter Core ("boost") speeds it up and
 * tints the light from ice to dusk pink.
 *
 * The uniform objects are shared by reference between materials, so
 * updating them once per frame updates every shader that uses them.
 */
export const CORE_PULSE = {
  /** Seconds per beat at rest / while Enter Core is hovered. */
  period: 7,
  boostPeriod: 1.5,
  /** Phase shown under reduced motion: between beats, nothing in flight. */
  restPhase: 0.9,
  /** Share of a beat the pulse needs to rise and shrink away (gulp) / the ripple to cross the floor. */
  riseShare: 0.8,
  waveShare: 0.7,
} as const;

export const pulseUniforms = {
  uPulse: { value: CORE_PULSE.restPhase as number },
  uBoost: { value: 0 },
};

/** Core flare for a beat phase (0..1): sharp rise, fast decay. Same curve as `pulseFlareGLSL`. */
export function pulseFlare(phase: number) {
  return Math.min(1, phase / 0.03) * Math.exp(-Math.max(phase - 0.03, 0) * 14);
}

export const pulseFlareGLSL = /* glsl */ `
  float pulseFlare(float phase) {
    return min(1.0, phase / 0.03) * exp(-max(phase - 0.03, 0.0) * 14.0);
  }
`;
