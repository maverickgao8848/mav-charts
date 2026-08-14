import type { StackedAreaDatum } from "./schema";
export const stackedAreaExample = [
  { label: "Q1", value: 38, comparison: 24 },
  { label: "Q2", value: 46, comparison: 31 },
  { label: "Q3", value: 57, comparison: 36 },
  { label: "Q4", value: 69, comparison: 42, detail: "Latest complete total" },
] as const satisfies readonly StackedAreaDatum[];
export const stackedAreaEdgeCases = {
  empty: [] as readonly StackedAreaDatum[],
  single: [{ label: "Only period", value: 24, comparison: 16 }],
  missingValue: [
    { label: "Jan", value: 12, comparison: 8 },
    { label: "Feb", value: 14, comparison: 9 },
    { label: "Mar", value: null, comparison: 10 },
    { label: "Apr", value: 18, comparison: 11 },
    { label: "May", value: 20, comparison: 12 },
  ],
  missingComparison: [
    { label: "Jan", value: 12, comparison: 8 },
    { label: "Feb", value: 15, comparison: 9 },
    { label: "Mar", value: 16, comparison: null },
    { label: "Apr", value: 18, comparison: 11 },
    { label: "May", value: 20, comparison: 12 },
  ],
  zero: [
    { label: "A", value: 0, comparison: 0 },
    { label: "B", value: 8, comparison: 0 },
    { label: "C", value: 0, comparison: 5 },
  ],
  constant: [
    { label: "A", value: 7, comparison: 3 },
    { label: "B", value: 7, comparison: 3 },
    { label: "C", value: 7, comparison: 3 },
  ],
  arbitrary: [
    { label: "A", value: 20, comparison: 15 },
    { label: "B", value: 70, comparison: 50 },
    { label: "C", value: 5, comparison: 8 },
  ],
  extreme: [
    { label: "Tiny", value: 0.0002, comparison: 0.0003 },
    { label: "Huge", value: 800_000_000, comparison: 700_000_000 },
  ],
  longLabel: [
    { label: "First enterprise reporting interval", value: 14, comparison: 12 },
    {
      label: "Second metropolitan reporting interval",
      value: 22,
      comparison: 18,
    },
    { label: "Final specialist reporting interval", value: 27, comparison: 24 },
  ],
  invalidNegative: [{ label: "Broken", value: -1, comparison: 3 }],
  duplicate: [
    { label: "Same", value: 1, comparison: 2 },
    { label: "Same", value: 2, comparison: 3 },
  ],
  nonfinite: [{ label: "Broken", value: 2, comparison: Number.NaN }],
} as const satisfies Record<string, readonly StackedAreaDatum[]>;
