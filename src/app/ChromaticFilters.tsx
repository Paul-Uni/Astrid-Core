/**
 * RGB-split filters for the panel power-on glitch (globals.css
 * "crt-content"), after codepen.io/fand/pen/EgGwjg: each filter splits the
 * image into its red channel and its green/blue channels, shifts them in
 * opposite directions and screens them back together. At zero shift that
 * is the original image, so only the fringes show. One filter per glitch
 * frame (`r` / `c`: red and cyan shift, px); the animation steps through
 * them. Pure channel math, no colors.
 */
const FRAMES = [
  { id: "ca-1", r: 4, c: -4 },
  { id: "ca-2", r: -3, c: 5 },
  { id: "ca-3", r: 6, c: -2 },
  { id: "ca-4", r: -2, c: 3 },
  { id: "ca-5", r: 1, c: -1 },
] as const;

export function ChromaticFilters() {
  return (
    <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
      {FRAMES.map(({ id, r, c }) => (
        <filter key={id} id={id} x="-2%" y="0" width="104%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
          <feOffset in="red" dx={r} dy="0" result="redShift" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cyan" />
          <feOffset in="cyan" dx={c} dy="0" result="cyanShift" />
          <feBlend in="redShift" in2="cyanShift" mode="screen" />
        </filter>
      ))}
    </svg>
  );
}
