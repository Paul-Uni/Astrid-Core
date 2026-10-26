import { CORE_PULSE, pulseFlareGLSL, type pulseUniforms } from "./corePulse";
import { calmGLSL, calmUniforms } from "./calmZones";
import { endUniforms } from "./endBlend";
import { STREAM } from "./streamSpec";
import { AdditiveBlending, Color, DoubleSide, ShaderMaterial, Vector2, Vector3, Vector4 } from "three";

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

/**
 * Full-screen sky: void → indigo (45%) → sky-mid (72%) → void, plus dusk
 * haze around the beam (strength `haze`; 0 on the login page). At the end of the descent (uEnd) it goes dark: near
 * void everywhere except a low magenta glow around the well (`uWell`, uv).
 */
export function createSkyMaterial(colors: {
  void: Color;
  indigo: Color;
  skyMid: Color;
  duskPink: Color;
  magenta: Color;
}, haze = 0.42) {
  return new ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uHaze: { value: haze },
      uVoid: { value: colors.void },
      uIndigo: { value: colors.indigo },
      uSkyMid: { value: colors.skyMid },
      uDusk: { value: colors.duskPink },
      uMagenta: { value: colors.magenta },
      uResolution: { value: [1440, 900] },
      uHazeScale: { value: 1 },
      uWell: { value: new Vector2(0.5, 0.75) },
      ...endUniforms,
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
      uniform vec2 uResolution, uWell;
      uniform float uHazeScale, uEnd, uHaze;
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
        c = mix(c, hazeColor, haze * uHaze);

        // End of the descent: dark, lit only from the well.
        vec2 w = (vUv - uWell) * uResolution / uHazeScale / vec2(420.0, 170.0);
        float well = exp(-dot(w, w));
        vec3 dark = mix(uVoid, uIndigo, 0.3 * (1.0 - t));
        dark = mix(dark, mix(uSkyMid, uMagenta, well * 0.6), well * 0.6);
        c = mix(c, dark, uEnd);

        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}

/**
 * Distant silhouettes (STREAM.silhouettes): full-screen pass right after the
 * sky. Per layer, a periodic 1D skyline from hashed columns (no textures),
 * blended over the sky as a faint dark tint: dusk-pink roof rims and a rim
 * on the side facing the beam where a building steps down. Far layers are
 * drawn first so nearer ones cover them. Depth sits just in front of the sky, so every scene object
 * stays in front.
 *
 * Ground (04 → 05): `uRim` is the floor's far edge on screen, an ellipse
 * (center x, y, half width, half height, px; written by Silhouettes). Once
 * it rises above a layer's base line the skyline stands on it, nothing is
 * drawn below it, and a haze glows along it. `uSink` (0..1) lowers every
 * building into that edge one block at a time, each column a little later
 * than the next, with an ice flash on the roof of a column while it sinks.
 */
export function createSilhouetteMaterial(colors: { void: Color; indigo: Color; duskPink: Color; ice: Color }) {
  const S = STREAM.silhouettes;
  const f = (x: number) => x.toFixed(4);
  const heights = S.layers
    .map((l, i) => {
      const n = columns(l);
      return /* glsl */ `
        float height${i}(float c) {
          c = mod(c, ${f(n)});
          float g = floor(c / ${f(l.group)});
          float local = c - g * ${f(l.group)};
          float seed = ${f(i * 17.31)};
          float h = mix(${f(l.minH)}, ${f(l.maxH)}, pow(hash(g + seed), 1.6));
          if (hash(g * 3.7 + seed) < ${f(l.tower)}) h += ${f(l.towerH)};
          if (hash(g * 5.3 + seed) < ${f(l.gap)}) h = ${f(l.minH)} * 0.4;
          bool edge = local < 0.5 || local > ${f(l.group - 1.5)};
          if (edge && hash(c * 1.9 + seed) < 0.5) h -= ${f(l.step)};
          h = floor(h / ${f(l.step)}) * ${f(l.step)};
          // Sinking: each column starts a little later and goes down whole steps.
          float s = clamp((uSink - hash(c * 7.7 + seed) * ${f(S.sink.spread)}) / ${f(1 - S.sink.spread)}, 0.0, 1.0);
          sinking = s * (1.0 - s) * 4.0;
          h = max(h - floor(s * (h / ${f(l.step)} + 1.0)) * ${f(l.step)}, 0.0);
          return h * uScale;
        }
      `;
    })
    .join("");
  const layers = S.layers
    .map((l, i) => {
      const n = columns(l);
      return /* glsl */ `
        {
          float colW = ${f((360 * l.pan) / n)} * uScale;
          float x = px.x + uTheta * ${f(l.pan)} * uScale;
          float cf = x / colW;
          float c = floor(cf);
          float h = height${i}(c);
          float flash = sinking;
          float has = h > 0.5 ? 1.0 : 0.0;
          float base = min(mix(${f(l.horizon[0])}, ${f(l.horizon[1])}, uProgress) * uResolution.y, ground);
          // Seen from the camera's pitch, like the rings: each roof shows as a band above its front edge.
          float top = colW * ${f(l.group)} * uRoof;
          float roof = base - h;   // front edge of the roof
          float crown = roof - top; // back edge of the roof
          float d = px.y - roof;    // px below the roof's front edge
          float dc = px.y - crown;
          float inside = smoothstep(-0.75, 0.75, dc) * has;
          float onRoof = inside * (1.0 - smoothstep(-0.75, 0.75, d));
          float a = ${f(l.dark)} * uBoost * mix(1.0, ${f(S.base)}, smoothstep(0.0, ${f(l.fade)} * uScale, max(d, 0.0)));
          float rim = (1.0 - smoothstep(0.0, ${f(S.rimPx)}, abs(dc))) * has;
          rim = max(rim, (1.0 - smoothstep(0.0, ${f(S.rimPx)}, abs(d))) * has * ${f(S.roof.edge)});

          // Side facing the beam, where the next building toward the center is lower.
          float toward = px.x < uResolution.x * 0.5 ? 1.0 : -1.0;
          float hn = height${i}(c + toward);
          float edgeDist = (toward > 0.0 ? 1.0 - fract(cf) : fract(cf)) * colW;
          float side = (1.0 - smoothstep(0.0, ${f(S.rimPx)}, edgeDist)) * step(0.0, dc) * step(px.y, base - hn - (hn > 0.5 ? top : 0.0))
            * (1.0 - smoothstep(0.0, ${f(S.sideFade)} * uScale, dc)) * has; // a sunk building has no side
          rim = max(rim, side) * ${f(S.rim)};

          vec3 body = mix(shade, uDusk, ${f(S.roof.lift)} * onRoof);
          float clip = 1.0 - smoothstep(ground - ${f(S.ground.fade)} * uScale, ground, px.y); // nothing below the floor's edge
          float cover = inside * clip;
          // Solid against farther layers: a building replaces whatever stands behind it,
          // and only lets the sky through (haze), so back rows never show through front ones.
          pc = mix(pc, body * a, cover);
          alpha = mix(alpha, a, cover);
          // Backlight rim on top (premultiplied "over").
          float rr = rim * (1.0 + flash) * clip;
          pc = mix(uDusk, uIce, flash) * rr + pc * (1.0 - rr);
          alpha = rr + alpha * (1.0 - rr);
        }
      `;
    })
    .join("");
  return new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: true,
    uniforms: {
      ...endUniforms,
      ...calmUniforms,
      uVoid: { value: colors.void },
      uIndigo: { value: colors.indigo },
      uDusk: { value: colors.duskPink },
      uIce: { value: colors.ice },
      uResolution: { value: new Vector2(1440, 900) },
      uDpr: { value: 1 },
      uScale: { value: 1 },
      uBoost: { value: 1 },
      uTheta: { value: 0 },
      uProgress: { value: 0 },
      uSink: { value: 0 },
      uRoof: { value: 0 },
      uRim: { value: new Vector4(0, 1e5, 1, 0) },
    },
    vertexShader: /* glsl */ `
      void main() {
        gl_Position = vec4(position.xy, 0.9998, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uVoid, uIndigo, uDusk, uIce;
      uniform vec2 uResolution;
      uniform vec4 uRim;
      uniform float uDpr, uScale, uBoost, uTheta, uProgress, uSink, uRoof, uEnd;
      ${calmGLSL}
      float hash(float n) { return fract(sin(n * 12.9898 + 4.1414) * 43758.5453); }
      float sinking; // 0..1..0 while the column last measured is going down
      ${heights}
      void main() {
        vec2 px = vec2(gl_FragCoord.x, uResolution.y * uDpr - gl_FragCoord.y) / uDpr; // CSS px, y down
        // Floor's far edge above this pixel column (far away when it isn't on screen).
        float t = (px.x - uRim.x) / uRim.z;
        float ground = abs(t) < 1.0 ? uRim.y - uRim.w * sqrt(1.0 - t * t) : 1e5;
        vec3 shade = mix(uVoid, uIndigo, 0.35);
        vec3 pc = vec3(0.0);
        float alpha = 0.0;
        ${layers}

        // Haze glowing along the floor's edge, under the skyline.
        float above = ground - px.y;
        float haze = ${f(S.ground.haze)} * exp(-abs(above) / (${f(S.ground.hazePx)} * uScale)) * (ground < 1e4 ? 1.0 : 0.0);
        haze *= mix(1.0, 0.25, step(above, 0.0)) * (1.0 - uEnd); // thinner over the floor itself; gone at the dark end
        pc = pc + uDusk * haze * (1.0 - alpha);
        alpha = alpha + haze * (1.0 - alpha);

        if (alpha < 0.002) discard;
        vec3 col = pc / alpha;
        alpha *= (1.0 - ${f(S.calm)} * calmMask()) * (1.0 - ${f(S.endFade)} * uEnd);
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }
    `,
  });
}

/** Whole columns per orbit, and a whole number of buildings, so a silhouette row wraps seamlessly. */
function columns(l: (typeof STREAM.silhouettes.layers)[number]) {
  return Math.max(l.group, Math.round((360 * l.pan) / l.col / l.group) * l.group);
}

/** Soft elliptical glow sprite (emitter glow). */
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

/**
 * The beam: soft cyan body, white core line, fine dashed data lines and
 * three layers of small bits rising at 75 / 112.5 / 150 px/s (DESIGN.md).
 * Works in Figma px around the beam axis so sizes match the spec 1:1.
 */
export function createBeamMaterial(
  colors: { cyan: Color; ice: Color; light: Color; dusk: Color },
  widthPx: number,
  topPx: number,
  topFadePx: number,
  bottomPx: number,
  pulse: typeof pulseUniforms,
  throat: { sheetPx: number; px: number; rest: number },
) {
  return new ShaderMaterial({
    ...additive,
    uniforms: {
      ...pulse,
      ...endUniforms,
      uDusk: { value: colors.dusk },
      uTime: { value: 0 },
      uCyan: { value: colors.cyan },
      uIce: { value: colors.ice },
      uLight: { value: colors.light },
      uWidthPx: { value: widthPx },
      uTopPx: { value: topPx },
      uTopFade: { value: topFadePx },
      uBottomPx: { value: bottomPx },
    },
    vertexShader: WORLD_VERTEX,
    fragmentShader: /* glsl */ `
      uniform float uTime, uWidthPx, uTopPx, uTopFade, uBottomPx, uPulse, uBoost, uEnd;
      uniform vec3 uCyan, uIce, uLight, uDusk;
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
            float speed = 24.0 + 12.0 * fl;
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

        // Fade in from above the page and out into the emitter.
        float fade = smoothstep(uBottomPx, uBottomPx + 160.0, py) * (1.0 - smoothstep(uTopPx - uTopFade, uTopPx, py));
        // Hard window so the glow tails reach exactly zero before the plane edge
        // (sRGB output would otherwise turn tiny tails into a visible band).
        float window = 1.0 - smoothstep(uWidthPx * 0.3, uWidthPx * 0.5, ax);
        fade *= window;
        // End of the descent: through the keyhole, the beam dims down the throat.
        float throat = mix(${throat.rest.toFixed(3)}, 1.0, smoothstep(${(throat.sheetPx - throat.px).toFixed(1)}, ${throat.sheetPx.toFixed(1)}, py));
        fade *= mix(1.0, throat, uEnd);

        // Core pulse, a "gulp": a bulge wider than the beam leaves the core,
        // rises ~1700px (out of the deep throat) while slowing down, and shrinks into the core line
        // instead of fading out.
        float s = clamp(uPulse / ${CORE_PULSE.riseShare.toFixed(2)}, 0.0, 1.0);
        float k = 1.0 - s;                             // size left
        float yP = uBottomPx - 40.0 + 1700.0 * (1.0 - k * k);
        float hw = 2.0 + 40.0 * k;                     // half width, px
        float hh = 20.0 + 60.0 * k;                    // half height, px
        float op = smoothstep(0.0, 0.05, s) * step(uPulse, ${CORE_PULSE.riseShare.toFixed(2)});
        float blob = exp(-sq((py - yP) / hh)) * exp(-sq(ax / hw)) * op * (0.35 + 0.45 * k);
        vec3 pulse = mix(uLight, mix(uIce, uDusk, uBoost), 0.45) * blob
          * smoothstep(uBottomPx - 10.0, uBottomPx + 30.0, py) * window;

        gl_FragColor = vec4(c * fade + pulse, 1.0);
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
        // Brightness fades continuously around the ring (back dim, front bright).
        // The pass only decides draw order; a hard switch here reads as the
        // ring entering a surface at its sides.
        float dim = mix(0.38, 1.0, smoothstep(-0.7, 0.7, facing));
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
  attribute float aOrbit; // orbit speed around the beam, rad/s
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
    // Counter-clockwise seen from above: front cubes cross the beam left → right
    // in front of it, back cubes right → left behind it, so depth reads clearly.
    float angle = aOrigin.y - uTime * aOrbit;
    vec3 center = vec3(cos(angle) * r, aOrigin.z + life * RISE_PX / 100.0, sin(angle) * r);
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
  /** How far cubes fade inside calm zones (0 = not at all, the main stage; 1 = gone). */
  calm = 0,
) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: kind === "faces",
    uniforms: {
      ...calmUniforms,
      uCalm: { value: calm },
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
      uniform float uFront, uEdges, uCalm;
      varying float vAlpha;
      varying float vNy;
      varying vec3 vCenter;
      ${calmGLSL}
      void main() {
        float facing = dot(normalize(vCenter.xz + 1e-5), normalize(uCamPos.xz + 1e-5));
        if ((facing >= 0.0) != (uFront > 0.5)) discard;
        float dim = mix(0.55, 1.0, smoothstep(-0.7, 0.7, facing));
        vec3 c = uEdges > 0.5 ? uEdge : mix(uSide, uTop, smoothstep(0.3, 0.8, vNy));
        // Front cubes are opaque so the beam never shows through them.
        float a = mix(uEdges > 0.5 ? 0.9 : 0.85, 1.0, step(0.0, facing)) * vAlpha * dim;
        if (uCalm > 0.0) a *= 1.0 - uCalm * calmMask();
        gl_FragColor = vec4(c, a);
        #include <colorspace_fragment>
      }
    `,
  });
}

/**
 * Emitter floor: a gravity well, drawn like the textbook picture of a
 * massive object bending spacetime (References/"example lock" side view).
 * The grid sheet stays flat, then plunges into a narrow, very deep throat
 * that runs off the bottom of the screen: depth uWellDepth * r0^2 / (r^2 + r0^2),
 * r0 = uWellRadius. Each core beat sends one ripple out over the sheet.
 * Works in Figma px from the beam axis. Fades at the rim and at the
 * viewport edges (uViewport = drawing buffer size, set every frame).
 */
export function createFloorMaterial(
  colors: { cyan: Color; ice: Color; dusk: Color },
  spec: { radius: number; gridCell: number },
  well: { depth: number; radius: number },
  pulse: typeof pulseUniforms,
  end: { r0: number; r1: number; edge: number; calm: number },
) {
  return new ShaderMaterial({
    ...additive,
    side: DoubleSide,
    uniforms: {
      ...pulse,
      ...endUniforms,
      ...calmUniforms,
      uCyan: { value: colors.cyan },
      uIce: { value: colors.ice },
      uDusk: { value: colors.dusk },
      uRadius: { value: spec.radius },
      uCell: { value: spec.gridCell },
      uWellDepth: { value: well.depth },
      uWellRadius: { value: well.radius },
      uViewport: { value: new Vector2(1, 1) },
    },
    vertexShader: /* glsl */ `
      uniform float uWellDepth, uWellRadius;
      varying vec2 vP;
      varying float vWell;
      void main() {
        vP = position.xy * 100.0; // px on the flat sheet
        float r0 = uWellRadius;
        vWell = r0 * r0 / (dot(vP, vP) + r0 * r0);
        vec3 pos = position;
        pos.z -= uWellDepth * vWell / 100.0; // local z is world up (the plane lies flat)
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uPulse, uBoost, uRadius, uCell, uEnd;
      uniform vec2 uViewport;
      uniform vec3 uCyan, uIce, uDusk;
      varying vec2 vP;
      varying float vWell;
      ${calmGLSL}

      float sq(float x) { return x * x; }
      // Anti-aliased line of width w (px) around distance d.
      float line(float d, float w) {
        float fw = max(fwidth(d), 1e-4);
        return 1.0 - smoothstep(w * 0.5, w * 0.5 + fw, abs(d));
      }

      void main() {
        vec2 p = vP;
        float r = length(p);
        vec2 sc = gl_FragCoord.xy / uViewport;
        float edge = smoothstep(0.0, 0.2, sc.x) * smoothstep(1.0, 0.8, sc.x) * smoothstep(0.0, 0.04, sc.y);
        // Gone by the sheet's edge, where the skyline stands: no grid over the buildings.
        float rim = (1.0 - smoothstep(uRadius * 0.7, uRadius, r)) * edge;

        // Spacetime grid: square cells turned 45 deg, brighter down the throat.
        vec2 q = vec2(p.x + p.y, p.y - p.x) * 0.70710678 / uCell;
        vec2 gq = abs(fract(q - 0.5) - 0.5) / max(fwidth(q), vec2(1e-4));
        float grid = 1.0 - min(min(gq.x, gq.y), 1.0);
        vec3 c = uCyan * grid * (0.15 + 0.35 * sqrt(vWell)) * rim;

        // One ripple per beat, running out over the sheet.
        float w = uPulse / ${CORE_PULSE.waveShare.toFixed(2)};
        if (w < 1.0) {
          float rr = mix(60.0, 520.0, 1.0 - sq(1.0 - w));
          float alpha = smoothstep(0.0, 0.09, w) * (1.0 - w);
          c += mix(uIce, uDusk, uBoost) * (line(r - rr, 2.5) + exp(-sq((r - rr) / 12.0)) * 0.4) * alpha * rim;
        }

        // End of the descent: bright near the well, near-black toward the
        // edges and behind panels.
        float lit = mix(${end.edge.toFixed(3)}, 1.0, 1.0 - smoothstep(${end.r0.toFixed(1)}, ${end.r1.toFixed(1)}, r));
        c *= mix(1.0, lit * (1.0 - ${end.calm.toFixed(3)} * calmMask()), uEnd);

        // Deep in the throat triangles collapse on screen and fwidth() turns
        // inf/NaN; drop those pixels, or bloom spreads the NaN over the frame.
        if (any(isnan(c)) || any(isinf(c))) discard;
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}

/**
 * Core lock: one flat padlock of translucent dark glass hovering over the
 * well's mouth (References/"example lock"). Tinted by `rest` (vex-cyan),
 * turning `hover` (magenta) while Enter Core is hovered (uBoost). A void plate, faintly tinted by
 * the edge color, dims the floor grid behind it so the neon outline reads
 * against the pink floor. The core lights it from below around the keyhole,
 * flaring on each beat. Writes depth: the beam below it is hidden except
 * where it drops through the keyhole (a real hole in the mesh).
 */
export function createLockMaterial(
  colors: { void: Color; rest: Color; hover: Color; ice: Color },
  pulse: typeof pulseUniforms,
) {
  return new ShaderMaterial({
    transparent: true,
    depthWrite: true,
    side: DoubleSide,
    uniforms: {
      ...pulse,
      uVoid: { value: colors.void },
      uRest: { value: colors.rest },
      uHover: { value: colors.hover },
      uIce: { value: colors.ice },
    },
    vertexShader: /* glsl */ `
      varying vec2 vXZ;
      void main() {
        vXZ = position.xy; // shape px from the keyhole center
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uPulse, uBoost;
      uniform vec3 uVoid, uRest, uHover, uIce;
      varying vec2 vXZ;
      ${pulseFlareGLSL}

      float sq(float x) { return x * x; }

      void main() {
        float glow = exp(-sq(length(vXZ) / 50.0)) * (0.35 + 0.9 * pulseFlare(uPulse));
        vec3 tint = mix(uRest, uHover, uBoost);
        vec3 col = mix(uVoid, tint, 0.12 + 0.08 * uBoost) + mix(uIce, tint, 0.5) * glow * 0.45;
        float alpha = clamp(0.55 + 0.25 * glow, 0.0, 1.0);
        gl_FragColor = vec4(col, alpha);
        #include <colorspace_fragment>
      }
    `,
  });
}

/** Core lock outline: neon edges (silhouette and keyhole), hot enough to bloom. Vex-cyan at rest, magenta on Enter Core hover; whiter on each beat. */
export function createLockEdgeMaterial(colors: { rest: Color; hover: Color; light: Color }, pulse: typeof pulseUniforms) {
  return new ShaderMaterial({
    ...additive,
    uniforms: {
      ...pulse,
      uRest: { value: colors.rest },
      uHover: { value: colors.hover },
      uLight: { value: colors.light },
    },
    vertexShader: /* glsl */ `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uPulse, uBoost;
      uniform vec3 uRest, uHover, uLight;
      ${pulseFlareGLSL}
      void main() {
        vec3 col = mix(mix(uRest, uHover, uBoost), uLight, 0.2 * pulseFlare(uPulse)) * (2.0 + 0.6 * uBoost);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}

/**
 * Soft glow ring on the sheet under the hovering lock, like its shadow cast
 * in light. Flat ring geometry in px (local xy); the profile is a soft band
 * at `r` px, `width` wide, over a faint disc. Takes the lock's tint (rest →
 * hover with uBoost), breathes with the bob (`uLift` 0..1: brighter and
 * tighter as the lock comes down) and flares on each beat.
 */
export function createLockShadowMaterial(
  colors: { rest: Color; hover: Color },
  spec: { r: number; width: number },
  pulse: typeof pulseUniforms,
) {
  return new ShaderMaterial({
    ...additive,
    uniforms: { ...pulse, uRest: { value: colors.rest }, uHover: { value: colors.hover }, uLift: { value: 0.5 } },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() {
        vP = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uPulse, uBoost, uLift;
      uniform vec3 uRest, uHover;
      varying vec2 vP;
      ${pulseFlareGLSL}
      float sq(float x) { return x * x; }
      void main() {
        float r0 = ${spec.r.toFixed(1)} * (1.04 - 0.08 * (1.0 - uLift));
        float r = length(vP);
        float band = exp(-sq((r - r0) / ${(spec.width / 2).toFixed(1)}));
        float disc = exp(-sq(r / r0)) * 0.25;
        float k = (band + disc) * (0.32 + 0.1 * (1.0 - uLift) + 0.35 * pulseFlare(uPulse));
        gl_FragColor = vec4(mix(uRest, uHover, uBoost) * k, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}

/**
 * Dust and data specks (STREAM.dust): screen-space points in three parallax
 * layers. Per point: `aSeed` (x, y in a tile slightly larger than the
 * screen, phase, glint 0/1) and `aLayer`. Each layer moves with the page
 * scroll and the orbit at its own rate and drifts up slowly, wrapping
 * around the tile. Additive; depth just in front of the sky, so every scene
 * object stays in front.
 */
export function createDustMaterial(colors: { ice: Color; cyan: Color }) {
  const D = STREAM.dust;
  const f = (x: number) => x.toFixed(4);
  const v3 = (pick: (l: (typeof D.layers)[number]) => number) => `vec3(${D.layers.map((l) => f(pick(l))).join(", ")})`;
  return new ShaderMaterial({
    ...additive,
    depthTest: true,
    uniforms: {
      ...endUniforms,
      ...calmUniforms,
      uIce: { value: colors.ice },
      uCyan: { value: colors.cyan },
      uResolution: { value: new Vector2(1440, 900) },
      uDpr: { value: 1 },
      uScale: { value: 1 },
      uScroll: { value: 0 },
      uTheta: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      uniform vec2 uResolution;
      uniform float uDpr, uScale, uScroll, uTheta, uTime;
      attribute vec4 aSeed;
      attribute float aLayer;
      varying float vAlpha;
      varying float vGlint;
      void main() {
        vec3 layer = vec3(step(aLayer, 0.5), step(0.5, aLayer) * step(aLayer, 1.5), step(1.5, aLayer));
        vec2 tile = uResolution * 1.2;
        vec2 move = vec2(
          -uTheta * dot(layer, ${v3((l) => l.pan)}),
          -uScroll * dot(layer, ${v3((l) => l.speed)}) - uTime * dot(layer, ${v3((l) => l.drift)})
        ) * vec2(uScale, 1.0);
        vec2 p = mod(aSeed.xy * tile + move, tile) - (tile - uResolution) * 0.5; // CSS px, y down
        float glint = aSeed.w * pow(max(0.0, sin(uTime * ${f(D.glint.rate)} + aSeed.z * 6.2831)), ${f(D.glint.sharp)});
        float nearBeam = 1.0 - smoothstep(0.0, ${f(D.glint.near)} * uScale, abs(p.x - uResolution.x * 0.5));
        vGlint = glint * mix(0.6, 1.0, nearBeam);
        vAlpha = dot(layer, ${v3((l) => l.alpha)}) * (1.0 + vGlint * ${f(D.glint.boost)});
        gl_PointSize = dot(layer, ${v3((l) => l.size)}) * uScale * uDpr * (1.0 + vGlint);
        gl_Position = vec4(p.x / uResolution.x * 2.0 - 1.0, 1.0 - p.y / uResolution.y * 2.0, 0.9997, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uIce, uCyan;
      uniform float uEnd;
      varying float vAlpha;
      varying float vGlint;
      ${calmGLSL}
      void main() {
        vec2 q = gl_PointCoord - 0.5;
        float soft = 1.0 - smoothstep(0.2, 0.5, length(q));
        float a = vAlpha * soft * (1.0 - ${f(D.calm)} * calmMask()) * mix(1.0, ${f(D.end)}, uEnd);
        gl_FragColor = vec4(mix(uIce, uCyan, min(vGlint, 1.0)) * a, 1.0);
        #include <colorspace_fragment>
      }
    `,
  });
}
