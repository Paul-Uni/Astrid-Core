import { Color } from "three";

const TOKENS = [
  "void",
  "indigo",
  "steel",
  "vex-cyan",
  "ice",
  "magenta-core",
  "dusk-pink",
  "cyan-shade",
  "indigo-raised",
  "sky-mid",
  "light",
] as const;

export type PaletteToken = (typeof TOKENS)[number];
export type Palette = Record<PaletteToken, Color>;

/**
 * Reads the DESIGN.md color tokens from the CSS custom properties on :root,
 * so the scene and the DOM share one palette with no duplicated hex values.
 * Client only.
 */
export function readPalette(): Palette {
  const styles = getComputedStyle(document.documentElement);
  const palette = {} as Palette;
  for (const token of TOKENS) {
    const value = styles.getPropertyValue(`--color-${token}`).trim();
    // Tokens are authored in sRGB; three converts to linear for lighting.
    palette[token] = new Color().setStyle(value);
  }
  return palette;
}
