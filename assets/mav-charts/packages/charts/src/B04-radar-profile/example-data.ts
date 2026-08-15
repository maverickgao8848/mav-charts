import type { RadarProfileDatum } from "./schema";
export const radarProfileExample = [
  { label: "Product", value: 82, comparison: 68 },
  { label: "Technology", value: 91, comparison: 72 },
  { label: "Channel", value: 63, comparison: 74 },
  { label: "Brand", value: 76, comparison: 69 },
  { label: "Cost", value: 58, comparison: 65 },
] as const satisfies readonly RadarProfileDatum[];
export const radarProfileEdgeCases = {
  empty: [] as readonly RadarProfileDatum[],
  single: [{ label: "Only axis", value: 80, comparison: 60 }],
  twoAxes: [
    { label: "A", value: 80, comparison: 60 },
    { label: "B", value: 40, comparison: 70 },
  ],
  missingPrimary: [
    { label: "A", value: 80, comparison: 60 },
    { label: "B", value: null, comparison: 70 },
    { label: "C", value: 50, comparison: 65 },
    { label: "D", value: 60, comparison: 55 },
  ],
  missingComparison: [
    { label: "A", value: 80, comparison: 60 },
    { label: "B", value: 70, comparison: null },
    { label: "C", value: 50, comparison: 65 },
    { label: "D", value: 60, comparison: 55 },
  ],
  missingBoth: [
    { label: "A", value: 80, comparison: 60 },
    { label: "Missing", value: null, comparison: null },
    { label: "C", value: 50, comparison: 65 },
    { label: "D", value: 60, comparison: 55 },
  ],
  zero: [
    { label: "A", value: 0, comparison: 100 },
    { label: "B", value: 50, comparison: 0 },
    { label: "C", value: 100, comparison: 50 },
  ],
  boundaries: [
    { label: "A", value: 0, comparison: 0 },
    { label: "B", value: 100, comparison: 100 },
    { label: "C", value: 50, comparison: 50 },
  ],
  constant: [
    { label: "A", value: 60, comparison: 60 },
    { label: "B", value: 60, comparison: 60 },
    { label: "C", value: 60, comparison: 60 },
    { label: "D", value: 60, comparison: 60 },
  ],
  longLabel: [
    { label: "Product proposition clarity", value: 80, comparison: 70 },
    { label: "Technology delivery capability", value: 75, comparison: 65 },
    { label: "Distribution channel effectiveness", value: 68, comparison: 72 },
    { label: "Brand preference and awareness", value: 82, comparison: 74 },
  ],
  negative: [{ label: "Bad", value: -1, comparison: 50 }],
  over100: [{ label: "Bad", value: 101, comparison: 50 }],
  invalid: [{ label: "", value: 50, comparison: 50 }],
  duplicate: [
    { label: "Same", value: 50, comparison: 50 },
    { label: "Same", value: 60, comparison: 60 },
    { label: "Other", value: 70, comparison: 70 },
  ],
  nonfinite: [{ label: "Broken", value: Infinity, comparison: 50 }],
} as const satisfies Record<string, readonly RadarProfileDatum[]>;
