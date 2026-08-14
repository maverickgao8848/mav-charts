import type { GroupedBarDatum } from "./schema";

export const groupedBarExample = [
  { label: "North America", value: 84, comparison: 62, detail: "Primary focus" },
  { label: "Europe", value: 68, comparison: 74 },
  { label: "Asia Pacific", value: 57, comparison: 49 },
] as const satisfies readonly GroupedBarDatum[];

export const groupedBarEdgeCases = {
  empty: [] as readonly GroupedBarDatum[],
  single: [{ label: "Only category", value: 72, comparison: 64 }],
  missingPrimary: [{ label: "Reported pair", value: 64, comparison: 51 }, { label: "Primary unavailable", value: null, comparison: 46 }],
  missingComparison: [{ label: "Comparison unavailable", value: 70, comparison: null }, { label: "Reported pair", value: 55, comparison: 49 }],
  negative: [{ label: "Positive result", value: 32, comparison: 18 }, { label: "Reversal", value: -24, comparison: -11 }, { label: "Crossed zero", value: 16, comparison: -19 }],
  extreme: [{ label: "Large market", value: 2_400_000_000, comparison: 1_900_000_000 }, { label: "Small market", value: 800_000, comparison: 650_000 }],
  longLabel: [{ label: "Enterprise customers across northern metropolitan territories", value: 81, comparison: 69 }, { label: "Independent regional partners", value: 58, comparison: 63 }],
  flat: [{ label: "Alpha", value: 0, comparison: 0 }, { label: "Beta", value: 0, comparison: 0 }],
  invalid: [{ label: "", value: 10, comparison: 12 }, { label: "Broken", value: Number.POSITIVE_INFINITY, comparison: 4 }],
} as const satisfies Record<string, readonly GroupedBarDatum[]>;
