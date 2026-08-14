import type { QuadrantScatterDatum, QuadrantScatterThresholds } from "./schema";
export const quadrantScatterThresholds = {
  x: 50,
  y: 50,
} as const satisfies QuadrantScatterThresholds;
export const quadrantScatterExample = [
  {
    label: "Nova",
    x: 72,
    y: 81,
    focus: true,
    detail: "High reach and momentum",
  },
  { label: "MAV", x: 35, y: 64 },
  { label: "Axis", x: 68, y: 29 },
  { label: "Core", x: 31, y: 24 },
] as const satisfies readonly QuadrantScatterDatum[];
export const quadrantScatterEdgeCases = {
  empty: [] as readonly QuadrantScatterDatum[],
  single: [{ label: "Solo", x: 62, y: 71 }],
  eachQuadrant: [
    { label: "UR", x: 70, y: 70 },
    { label: "UL", x: 30, y: 70 },
    { label: "LL", x: 30, y: 30 },
    { label: "LR", x: 70, y: 30 },
  ],
  boundary: [
    { label: "Vertical", x: 50, y: 70 },
    { label: "Horizontal", x: 70, y: 50 },
    { label: "Crossing", x: 50, y: 50 },
  ],
  missing: [
    { label: "Complete", x: 62, y: 71 },
    { label: "Missing X", x: null, y: 24 },
    { label: "Missing Y", x: 32, y: null },
  ],
  negative: [
    { label: "A", x: -80, y: -20 },
    { label: "B", x: -40, y: 30 },
    { label: "C", x: 20, y: -60 },
  ],
  constant: [
    { label: "A", x: 10, y: 10 },
    { label: "B", x: 10, y: 10 },
    { label: "C", x: 10, y: 10 },
  ],
  extreme: [
    { label: "Tiny", x: 0.00001, y: -0.00002 },
    { label: "Huge", x: 1_000_000_000, y: 2_000_000_000 },
  ],
  overlap: [
    { label: "Alpha", x: 68, y: 72 },
    { label: "Beta", x: 69, y: 71 },
    { label: "Gamma", x: 67, y: 73 },
    { label: "Delta", x: 68, y: 72 },
  ],
  longLabel: [
    { label: "North American enterprise platform accounts", x: 78, y: 74 },
    { label: "Independent European specialist providers", x: 43, y: 65 },
  ],
  invalid: [{ label: "", x: 2, y: 3 }],
  duplicate: [
    { label: "Same", x: 2, y: 3 },
    { label: "Same", x: 4, y: 5 },
  ],
  nonfinite: [{ label: "Broken", x: Infinity, y: 2 }],
} as const satisfies Record<string, readonly QuadrantScatterDatum[]>;
