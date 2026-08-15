import type { MultiSeriesAreaDatum } from "./schema";
export const multiSeriesAreaExample = [
  { label: "Q1", value: 42, comparison: 31 },
  { label: "Q2", value: 55, comparison: 37 },
  { label: "Q3", value: 68, comparison: 49 },
  { label: "Q4", value: 73, comparison: 58, detail: "Latest reporting period" },
] as const satisfies readonly MultiSeriesAreaDatum[];
export const multiSeriesAreaEdgeCases = {
  empty: [] as readonly MultiSeriesAreaDatum[],
  single: [{ label: "Only period", value: 24, comparison: 19 }],
  missingPrimary: [
    { label: "Jan", value: 12, comparison: 11 },
    { label: "Feb", value: null, comparison: 14 },
    { label: "Mar", value: 18, comparison: 17 },
    { label: "Apr", value: 23, comparison: 20 },
  ],
  missingComparison: [
    { label: "Jan", value: 12, comparison: 11 },
    { label: "Feb", value: 15, comparison: null },
    { label: "Mar", value: 18, comparison: 17 },
    { label: "Apr", value: 23, comparison: 20 },
  ],
  leadingGap: [
    { label: "Not started", value: null, comparison: null },
    { label: "First report", value: 8, comparison: 6 },
    { label: "Next", value: 11, comparison: 9 },
  ],
  trailingGap: [
    { label: "Reported", value: 8, comparison: 6 },
    { label: "Latest report", value: 11, comparison: 9 },
    { label: "Pending", value: null, comparison: null },
  ],
  negative: [
    { label: "A", value: -12, comparison: -18 },
    { label: "B", value: -5, comparison: -9 },
    { label: "C", value: -18, comparison: -14 },
  ],
  mixed: [
    { label: "A", value: -12, comparison: 8 },
    { label: "B", value: 5, comparison: -9 },
    { label: "C", value: 18, comparison: 14 },
  ],
  constant: [
    { label: "A", value: 7, comparison: 7 },
    { label: "B", value: 7, comparison: 7 },
    { label: "C", value: 7, comparison: 7 },
  ],
  extreme: [
    { label: "Start", value: 0.0002, comparison: -900_000_000 },
    { label: "Middle", value: 800_000_000, comparison: 250_000_000 },
    { label: "End", value: 1_500_000_000, comparison: 1_100_000_000 },
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
  invalid: [
    { label: "", value: 2, comparison: 1 },
    { label: "Broken", value: Infinity, comparison: 2 },
  ],
  duplicate: [
    { label: "Same", value: 1, comparison: 2 },
    { label: "Same", value: 2, comparison: 3 },
  ],
  nonfinite: [{ label: "Broken", value: 2, comparison: Number.NaN }],
} as const satisfies Record<string, readonly MultiSeriesAreaDatum[]>;
