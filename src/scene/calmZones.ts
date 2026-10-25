"use client";

import { useFrame } from "@react-three/fiber";
import { Vector4 } from "three";

/**
 * Calm zones: the screen boxes of text panels and social nodes (DOM elements
 * marked `data-calm`). Backdrop shaders darken and quiet down inside them so
 * text and icons always win over the scene behind.
 *
 * The uniform objects are shared by reference between materials, so
 * updating them once per frame updates every shader that uses them.
 */
export const CALM = {
  /** Most boxes passed to the shaders (the busiest station has 7). */
  max: 12,
  /** Soft edge around each box, CSS px. */
  feather: 96,
} as const;

export const calmUniforms = {
  /** Boxes in drawing-buffer px, y up: x, y, width, height. */
  uCalmRects: { value: Array.from({ length: CALM.max }, () => new Vector4()) },
  uCalmCount: { value: 0 },
  uCalmFeather: { value: CALM.feather as number },
};

/** 0 outside every calm box, 1 inside one, soft in between. */
export const calmGLSL = /* glsl */ `
  uniform vec4 uCalmRects[${CALM.max}];
  uniform int uCalmCount;
  uniform float uCalmFeather;
  float calmMask() {
    float m = 0.0;
    for (int i = 0; i < ${CALM.max}; i++) {
      if (i >= uCalmCount) break;
      vec4 r = uCalmRects[i];
      vec2 d = max(abs(gl_FragCoord.xy - (r.xy + r.zw * 0.5)) - r.zw * 0.5, 0.0);
      m = max(m, 1.0 - smoothstep(0.0, uCalmFeather, length(d)));
    }
    return m;
  }
`;

const SELECTOR = "[data-calm]";

/** Reads the calm boxes on screen once per frame (layout reads only, no writes). */
export function CalmZones() {
  useFrame(({ gl, size }) => {
    const dpr = gl.getPixelRatio();
    const { uCalmRects, uCalmCount, uCalmFeather } = calmUniforms;
    let n = 0;
    for (const el of document.querySelectorAll(SELECTOR)) {
      if (n >= CALM.max) break;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.bottom < 0 || r.top > size.height || r.right < 0 || r.left > size.width) continue;
      uCalmRects.value[n++]!.set(r.left * dpr, (size.height - r.bottom) * dpr, r.width * dpr, r.height * dpr);
    }
    uCalmCount.value = n;
    uCalmFeather.value = CALM.feather * dpr;
  });
  return null;
}
