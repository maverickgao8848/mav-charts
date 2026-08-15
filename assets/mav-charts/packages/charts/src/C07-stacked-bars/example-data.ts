import type { StackedBarDatum } from "./schema";
export const stackedBarExample = [{ label: "North America", value: 58, comparison: 42, detail: "Example total is 100" }, { label: "Europe", value: 71, comparison: 29 }, { label: "Asia Pacific", value: 46, comparison: 54 }] as const satisfies readonly StackedBarDatum[];
export const stackedBarEdgeCases = {
  empty: [] as readonly StackedBarDatum[], single: [{ label: "Only category", value: 44, comparison: 31 }],
  missingValue: [{ label: "Base missing", value: null, comparison: 36 }, { label: "Complete", value: 48, comparison: 37 }], missingComparison: [{ label: "Upper missing", value: 64, comparison: null }, { label: "Complete", value: 51, comparison: 28 }],
  negative: [{ label: "Both negative", value: -14, comparison: -8 }, { label: "Both positive", value: 9, comparison: 5 }, { label: "Split signs", value: -4, comparison: 7 }],
  arbitraryTotal: [{ label: "Not normalized", value: 80, comparison: 45 }, { label: "Another total", value: 23, comparison: 18 }],
  extreme: [{ label: "Baseline", value: 2, comparison: 4 }, { label: "Outlier", value: 1_200_000_000, comparison: 800_000_000 }],
  longLabel: [{ label: "Enterprise customers across northern metropolitan territories", value: 64, comparison: 36 }, { label: "Independent regional partners", value: 48, comparison: 52 }],
  flat: [{ label: "Zero", value: 0, comparison: 0 }, { label: "Equal", value: 20, comparison: 20 }], invalid: [{ label: "", value: 1, comparison: 2 }, { label: "Broken", value: Infinity, comparison: 3 }],
} as const satisfies Record<string, readonly StackedBarDatum[]>;
