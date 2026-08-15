import type { BoxPlotDatum } from "./schema";
const missing = (label: string): BoxPlotDatum => ({ label, min: null, q1: null, median: null, q3: null, max: null });
export const boxPlotExample = [
  { label: "Core", min: 18, q1: 26, median: 34, q3: 43, max: 52, outliers: [9, 61] },
  { label: "Growth", min: 22, q1: 31, median: 38, q3: 47, max: 58, outliers: [65] },
  { label: "Scale", min: 14, q1: 24, median: 30, q3: 39, max: 49 },
  { label: "Frontier", min: 25, q1: 35, median: 44, q3: 51, max: 63, outliers: [70] },
] as const satisfies readonly BoxPlotDatum[];
export const boxPlotEdgeCases = {
  empty: [] as readonly BoxPlotDatum[],
  single: [{ label: "Only category", min: 2, q1: 4, median: 7, q3: 9, max: 13, outliers: [18] }],
  missing: [missing("Not reported"), { label: "Complete", min: 3, q1: 5, median: 7, q3: 10, max: 14 }],
  negative: [{ label: "Loss cohort", min: -40, q1: -28, median: -17, q3: -9, max: -2, outliers: [-55] }, { label: "Mixed cohort", min: -12, q1: -4, median: 2, q3: 8, max: 17 }],
  constant: [{ label: "No spread", min: 7, q1: 7, median: 7, q3: 7, max: 7 }, { label: "Reference", min: 5, q1: 6, median: 7, q3: 8, max: 9 }],
  extreme: [{ label: "Micro", min: 0.0001, q1: 0.0002, median: 0.0003, q3: 0.0005, max: 0.0008, outliers: [0.0012] }, { label: "Macro", min: 700_000_000, q1: 900_000_000, median: 1_100_000_000, q3: 1_300_000_000, max: 1_500_000_000, outliers: [1_900_000_000] }],
  outliers: [{ label: "Heavy tails", min: 10, q1: 21, median: 30, q3: 38, max: 49, outliers: [-8, 72, 86] }, { label: "Compact", min: 18, q1: 23, median: 27, q3: 31, max: 36 }],
  longLabel: [{ label: "Enterprise customers across northern metropolitan territories", min: 10, q1: 20, median: 30, q3: 40, max: 50 }, { label: "Independent specialist regional partners", min: 15, q1: 24, median: 32, q3: 39, max: 47 }],
  invalidOrder: [{ label: "Broken", min: 1, q1: 8, median: 5, q3: 10, max: 12 }],
  duplicate: [{ label: "Same", min: 1, q1: 2, median: 3, q3: 4, max: 5 }, { label: "Same", min: 2, q1: 3, median: 4, q3: 5, max: 6 }],
  nonfinite: [{ label: "Broken", min: 1, q1: 2, median: Infinity, q3: 4, max: 5 }],
  invalidOutlier: [{ label: "Inside", min: 1, q1: 2, median: 3, q3: 4, max: 5, outliers: [4.5] }],
  partialMissing: [{ label: "Partial", min: null, q1: 2, median: 3, q3: 4, max: 5 }],
} as const satisfies Record<string, readonly BoxPlotDatum[]>;
