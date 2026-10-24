import { AdditiveBlending, Color, ShaderMaterial, Vector3 } from "three";

/**
 * Shader materials for the stream. All colors come in as uniforms from the
 * palette (CSS tokens); shaders never hold color literals.
 * Additive materials add light on top of the sky, like the Figma bloom.
 */

const WORLD_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying float vWorldY;
  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldY = worldPosition.y;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const additive = {
  transparent: true,
  depthWrite: false,
  blending: AdditiveBlending,
} as const;

/** Full-screen sky: void → indigo (45%) → sky-mid (72%) → void, plus dusk haze around the beam. */
export function createSkyMaterial(colors: {
  void: Color;
  indigo: Color;
  skyMid: Color;
  duskPink: Color;
  magenta: Color;
}) {
  return new ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uVoid: { value: colors.void },
      uIndigo: { value: colors.indigo },
      uSkyMid: { value: colors.skyMid },
      uDusk: { value: colors.duskPink },
      uMagenta: { value: colors.magenta },
      uResolution: { value: [1440, 900] },
      uHazeScale: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.9999, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uVoid, uIndigo, uSkyMid, uDusk, uMagenta;
      uniform vec2 uResolution;
      uniform float uHazeScale;
      varying vec2 vUv;
      void main() {
        float t = 1.0 - vUv.y; // 0 top, 1 bottom
        vec3 c = mix(uVoid, uIndigo, smoothstep(0.0, 0.45, t));
        c = mix(c, uSkyMid, smoothstep(0.45, 0.72, t));
        c = mix(c, uVoid, smoothstep(0.72, 1.0, t));

        // Dusk haze: magenta core fading to dusk-pink, centered on the beam.
        vec2 px = (vUv - vec2(0.5, 0.42)) * uResolution / uHazeScale;
        vec2 q = px / vec2(330.0, 380.0);
        float haze = exp(-dot(q, q));
        vec3 hazeColor = mix(uDusk, uMagenta, haze);
        c = mix(c, hazeColor, haze * 0.42);

        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}

/** Soft elliptical glow sprite (light source, halo, emitter glow). */
export function createGlowMaterial(color: Color, intensity: number, falloff: number) {
  return new ShaderMaterial({
    ...additive,
    uniforms: {
      uColor: { value: color },
      uIntensity: { value: intensity },
      uFalloff: { value: falloff },
    },
    vertexShader: WORLD_VERTEX,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity, uFalloff;
      varying vec2 vUv;
      void main() {
        float d = length(vUv * 2.0 - 1.0);
        // max(…, 1e-6): pow() is undefined for a base ≤ 0 and returns NaN on ANGLE/D3D.
        float a = pow(max(1.0 - d, 1e-6), uFalloff) * step(d, 1.0) * uIntensity;
        gl_FragColor = vec4(uColor * a, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}

/** Light shaft under the source: bright at the top, fading down. */
export function createShaftMaterial(color: Color, intensity: number) {
  return new ShaderMaterial({
    ...additive,
    uniforms: { uColor: { value: color }, uIntensity: { value: intensity } },
    vertexShader: WORLD_VERTEX,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity;
      varying vec2 vUv;
      void main() {
        float x = (vUv.x - 0.5) * 2.0;
        // Clamp: interpolated vUv.y can dip just below 0 at the edge → pow() NaN → bloom blacks out the frame.
        float a = exp(-x * x * 4.0) * pow(clamp(vUv.y, 1e-6, 1.0), 1.6) * uIntensity;
        gl_FragColor = vec4(uColor * a, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}

/**
 * The beam: soft cyan body, white core line, fine dashed data lines and
 * three layers of small bits rising at 75 / 112.5 / 150 px/s (DESIGN.md).
 * Works in Figma px around the beam axis so sizes match the spec 1:1.
 */
export function createBeamMaterial(colors: { cyan: Color; ice: Color; light: Color }, widthPx: number, topPx: number, bottomPx: number) {
  return new ShaderMaterial({
    ...additive,
    uniforms: {
      uTime: { value: 0 },
      uCyan: { value: colors.cyan },
      uIce: { value: colors.ice },
      uLight: { value: colors.light },
      uWidthPx: { value: widthPx },
      uTopPx: { value: topPx },
      uBottomPx: { value: bottomPx },
    },
    vertexShader: WORLD_VERTEX,
    fragmentShader: /* glsl */ `
      uniform float uTime, uWidthPx, uTopPx, uBottomPx;
      uniform vec3 uCyan, uIce, uLight;
      varying vec2 vUv;
      varying float vWorldY;

      float sq(float x) { return x * x; }

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      void main() {
        float px = (vUv.x - 0.5) * uWidthPx; // px from the beam axis
        float py = vWorldY * 100.0;          // px, up is positive
        float ax = abs(px);
        vec3 c = vec3(0.0);

        // Soft cyan body (88px beam) with a wider faint glow.
        c += uCyan * (exp(-sq(ax / 36.0)) * 0.11 + exp(-sq(ax / 70.0)) * 0.025);

        // White core line.
        c += uLight * (exp(-sq(ax)) * 0.85 + exp(-sq(ax / 6.0)) * 0.05);

        // Fine dashed vertical data lines.
        const float cols[4] = float[4](9.0, 17.0, 26.0, 35.0);
        for (int i = 0; i < 4; i++) {
          for (int s = 0; s < 2; s++) {
            float colX = cols[i] * (s == 0 ? -1.0 : 1.0);
            float seed = hash(vec2(colX, 7.0));
            float len = 10.0 + seed * 22.0;
            float y = py - uTime * (20.0 + seed * 25.0);
            float dash = step(fract(y / len + seed), 0.5 + seed * 0.25);
            float line = 1.0 - smoothstep(0.5, 1.2, abs(px - colX));
            c += mix(uCyan, uIce, 0.5) * dash * line * 0.16;
          }
        }

        // Three layers of small rising bits (slow = dim, fast = bright).
        if (ax < 38.0) {
          for (int l = 0; l < 3; l++) {
            float fl = float(l);
            float speed = 75.0 + 37.5 * fl;
            float y = py - uTime * speed;
            vec2 cellSize = vec2(4.0, 9.0);
            vec2 cell = floor(vec2(px, y) / cellSize);
            vec2 f = fract(vec2(px, y) / cellSize);
            float h = hash(cell + fl * 17.31);
            float on = step(0.957, h)
              * step(f.y, 0.3 + 0.55 * hash(cell + 3.7))
              * step(0.25, f.x) * step(f.x, 0.75);
            c += mix(uIce, uLight, 0.4) * on * (0.22 + 0.16 * fl);
          }
        }

        // Fade in under the light source and out into the emitter.
        float fade = smoothstep(uBottomPx, uBottomPx + 160.0, py) * (1.0 - smoothstep(uTopPx - 90.0, uTopPx, py));
        // Hard window so the glow tails reach exactly zero before the plane edge
        // (sRGB output would otherwise turn tiny tails into a visible band).
        fade *= 1.0 - smoothstep(uWidthPx * 0.3, uWidthPx * 0.5, ax);
        gl_FragColor = vec4(c * fade, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}

/**
 * Rings: geometry from ringGeometry.ts, spun around the beam axis in the
 * vertex shader. Drawn in two passes so the beam sits between them:
 * back pass (dimmed) → beam → front pass (bright).
 */
export function createRingMaterial(pass: "back" | "front", solid: boolean) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: solid,
    uniforms: {
      uTime: { value: 0 },
      uCamPos: { value: new Vector3() },
      uFront: { value: pass === "front" ? 1 : 0 },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aColor;
      attribute float aAlpha;
      attribute float aSpin;
      uniform float uTime;
      varying vec3 vColor;
      varying float vAlpha;
      varying vec3 vWorld;
      varying float vNy;
      void main() {
        float a = aSpin * uTime;
        float c = cos(a), s = sin(a);
        vec3 p = position;
        p.xz = vec2(c * p.x - s * p.z, s * p.x + c * p.z);
        vNy = normal.y;
        vColor = aColor;
        vAlpha = aAlpha;
        vec4 wp = modelMatrix * vec4(p, 1.0);
        vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uCamPos;
      uniform float uFront;
      varying vec3 vColor;
      varying float vAlpha;
      varying vec3 vWorld;
      varying float vNy;
      void main() {
        float facing = dot(normalize(vWorld.xz + 1e-5), normalize(uCamPos.xz + 1e-5));
        if ((facing >= 0.0) != (uFront > 0.5)) discard;
        // Top faces lit, side faces in shade (cyan → cyan-shade).
        float shade = vNy > 0.5 ? 1.0 : 0.55;
        float dim = uFront > 0.5 ? 1.0 : 0.38;
        gl_FragColor = vec4(vColor * shade, vAlpha * dim);
        #include <colorspace_fragment>
      }
    `,
  });
}

/** Shared cube animation: drift up and outward, tumble, fade in/out over each life, respawn. */
const FRAGMENT_VERTEX = /* glsl */ `
  attribute vec3 aOrigin; // radius, angle, y (world)
  attribute vec4 aSeed;   // rise px/s, tumble rad/s, phase 0..1, size px
  uniform float uTime;
  varying float vAlpha;
  varying float vNy;
  varying vec3 vCenter;
  const float RISE_PX = 360.0;
  const float OUTWARD = 0.5;
  mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
  mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
  mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0); }
  void main() {
    float life = fract(aSeed.z + uTime * aSeed.x / RISE_PX);
    float r = aOrigin.x + life * OUTWARD;
    vec3 center = vec3(cos(aOrigin.y) * r, aOrigin.z + life * RISE_PX / 100.0, sin(aOrigin.y) * r);
    float t = uTime * aSeed.y + aSeed.z * 6.2831;
    mat3 rot = rotX(t) * rotY(t * 0.73) * rotZ(t * 0.41);
    vec3 p = rot * (position * aSeed.w / 100.0) + center;
    vNy = (rot * normal).y;
    vAlpha = smoothstep(0.0, 0.15, life) * (1.0 - smoothstep(0.8, 1.0, life));
    vCenter = center;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p, 1.0);
  }
`;

/**
 * Wireframe cube fragments: indigo faces with cyan edges. Like the rings,
 * drawn in a back and a front pass (by cube center) so the beam sits between.
 */
export function createFragmentMaterial(
  pass: "back" | "front",
  kind: "faces" | "edges",
  colors: { top: Color; side: Color; edge: Color },
) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: kind === "faces",
    uniforms: {
      uTime: { value: 0 },
      uCamPos: { value: new Vector3() },
      uFront: { value: pass === "front" ? 1 : 0 },
      uEdges: { value: kind === "edges" ? 1 : 0 },
      uTop: { value: colors.top },
      uSide: { value: colors.side },
      uEdge: { value: colors.edge },
    },
    vertexShader: FRAGMENT_VERTEX,
    fragmentShader: /* glsl */ `
      uniform vec3 uCamPos, uTop, uSide, uEdge;
      uniform float uFront, uEdges;
      varying float vAlpha;
      varying float vNy;
      varying vec3 vCenter;
      void main() {
        float facing = dot(normalize(vCenter.xz + 1e-5), normalize(uCamPos.xz + 1e-5));
        if ((facing >= 0.0) != (uFront > 0.5)) discard;
        float dim = uFront > 0.5 ? 1.0 : 0.55;
        vec3 c = uEdges > 0.5 ? uEdge : mix(uSide, uTop, smoothstep(0.3, 0.8, vNy));
        float a = (uEdges > 0.5 ? 0.9 : 0.85) * vAlpha * dim;
        gl_FragColor = vec4(c, a);
        #include <colorspace_fragment>
      }
    `,
  });
}
