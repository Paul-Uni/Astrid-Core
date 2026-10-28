/**
 * Integrated laptop GPUs (Intel Iris / UHD): they can't afford a live backdrop blur over the
 * animated stage, and they start the stage one quality step down (AdaptiveEffects).
 */
const INTEGRATED_GPU = /intel|iris|uhd graphics|hd graphics/i;

/**
 * localStorage key: set once an integrated GPU was seen, so the head script in layout.tsx can
 * turn the blur off before the first paint on the next visit (the GPU is only known once the
 * stage's WebGL context exists).
 */
export const NO_BLUR_KEY = "astrid:no-blur";

export function isIntegratedGpu(gl: WebGLRenderingContext | WebGL2RenderingContext) {
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? "");
  return INTEGRATED_GPU.test(renderer);
}
