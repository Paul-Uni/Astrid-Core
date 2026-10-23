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

export const NAV_LINKS = STATIONS.slice(1).map((s) => ({
  slug: s.slug,
  label: s.label === "BACKGROUND" ? "Background" :
         s.label === "CONTACT"    ? "Contact"    :
         s.label === "PROJECTS"   ? "Projects"   :
         s.label === "SKILLS"     ? "Skills"     :
         s.label === "ABOUT"      ? "About"      : s.label,
}));
