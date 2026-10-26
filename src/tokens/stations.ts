export type StationId = 0 | 1 | 2 | 3 | 4 | 5;

export type Station = {
  readonly id: StationId;
  readonly theta: number;    // orbit angle in degrees
  readonly depth: number;    // world units from the top of the stream
  readonly slug: string;
  readonly label: string;    // display label for nav / orbit rail
  readonly figmaNodeId: string;
};

export const STATIONS: readonly Station[] = [
  { id: 0, theta: 0,   depth: 0,    slug: "entry",      label: "ENTRY",      figmaNodeId: "2:3"     },
  { id: 1, theta: 60,  depth: 740,  slug: "about",      label: "ABOUT",      figmaNodeId: "45:1950" },
  { id: 2, theta: 120, depth: 1480, slug: "skills",     label: "SKILLS",     figmaNodeId: "46:2933" },
  { id: 3, theta: 180, depth: 2220, slug: "projects",   label: "PROJECTS",   figmaNodeId: "47:3936" },
  { id: 4, theta: 240, depth: 2960, slug: "background", label: "BACKGROUND", figmaNodeId: "48:4933" },
  { id: 5, theta: 300, depth: 3700, slug: "contact",    label: "CONTACT",    figmaNodeId: "49:5916" },
] as const;


/** Desktop nav section links (chrome/NavLinks). */
export const NAV_LINKS = STATIONS.slice(1).map((s) => ({
  slug: s.slug,
  label: s.label.charAt(0) + s.label.slice(1).toLowerCase(),
}));

/**
 * Nav links fade out between 00 and 01: fully visible until `from`, gone at
 * `to` (share of the scroll from 00 to 01), then inert.
 */
export const NAV_FADE = { from: 0.1, to: 0.7 } as const;
