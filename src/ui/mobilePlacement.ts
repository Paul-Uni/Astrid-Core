import type { CSSProperties } from "react";

/**
 * Where a block sits in the mobile station layout (< 768px, Figma page
 * "02 Mobile"), in Figma px on the 390 frame: `x` = left offset, `w` =
 * width, `p` = padding, `order` = position in the stacked column (default
 * DOM order). On phones the station becomes a single column; the
 * `[data-m]` rule in globals.css drops the desktop absolute position and
 * applies these values. Desktop is untouched.
 */
export type MobilePlacement = { x: number; w?: number; p?: number; order?: number };

const rem = (px: number) => `${px / 16}rem`;
/** Room kept free at the right edge for the orbit rail (10px gutter + diamonds). */
const RAIL = 28;

export function mobilePlacement(m: MobilePlacement): {
  "data-m": "";
  style: CSSProperties;
} {
  const vars: Record<string, string> = { "--m-x": rem(m.x) };
  // Figma width, shrinking on phones narrower than 390 so the rail stays clear.
  if (m.w !== undefined) vars["--m-w"] = `min(${rem(m.w)}, calc(100% - ${rem(m.x + RAIL)}))`;
  if (m.p !== undefined) vars["--m-p"] = rem(m.p);
  if (m.order !== undefined) vars["--m-order"] = String(m.order);
  return { "data-m": "", style: vars as CSSProperties };
}
