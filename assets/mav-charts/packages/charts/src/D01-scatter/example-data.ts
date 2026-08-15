import type { ScatterDatum } from "./schema";
export const scatterExample = [
  { label: "Point 1", value: 28, comparison: 42 },
  { label: "Point 2", value: 36, comparison: 55 },
  { label: "Point 3", value: 49, comparison: 68 },
  { label: "Point 4", value: 61, comparison: 59 },
] as const satisfies readonly ScatterDatum[];
export const scatterEdgeCases = {
  empty: [] as readonly ScatterDatum[],
  single: [{ label: "Only point", value: 24, comparison: 18 }],
  missing: [
    { label: "Reported", value: 10, comparison: 20 },
    { label: "Missing X", value: null, comparison: 24 },
    { label: "Missing Y", value: 18, comparison: null },
    { label: "Complete", value: 22, comparison: 28 },
  ],
  negative: [
    { label: "A", value: -20, comparison: -8 },
    { label: "B", value: -5, comparison: 12 },
    { label: "C", value: 14, comparison: -16 },
  ],
  constant: [
    { label: "A", value: 7, comparison: 9 },
    { label: "B", value: 7, comparison: 9 },
    { label: "C", value: 7, comparison: 9 },
  ],
  extreme: [
    { label: "Tiny", value: -900_000_000, comparison: 0.0002 },
    { label: "Huge", value: 1_500_000_000, comparison: 800_000_000 },
  ],
  overlap: [
    { label: "Alpha", value: 12, comparison: 18 },
    { label: "Beta", value: 12, comparison: 18 },
    { label: "Gamma", value: 12, comparison: 18 },
  ],
  longLabel: [
    { label: "First enterprise reporting cohort", value: 12, comparison: 20 },
    {
      label: "Second metropolitan reporting cohort",
      value: 24,
      comparison: 31,
    },
  ],
  invalid: [{ label: "", value: 1, comparison: 2 }],
  duplicate: [
    { label: "Same", value: 1, comparison: 2 },
    { label: "Same", value: 2, comparison: 3 },
  ],
  nonfinite: [{ label: "Broken", value: Number.NaN, comparison: 2 }],
} as const satisfies Record<string, readonly ScatterDatum[]>;
