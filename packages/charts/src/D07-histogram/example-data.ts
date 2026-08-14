import type { HistogramBin } from "./schema";
export const histogramExample = [
  { start: 0, end: 10, count: 4 }, { start: 10, end: 20, count: 11 }, { start: 20, end: 30, count: 18 }, { start: 30, end: 40, count: 27 }, { start: 40, end: 50, count: 20 }, { start: 50, end: 60, count: 9 }, { start: 60, end: 70, count: 3 },
] as const satisfies readonly HistogramBin[];
export const histogramEdgeCases = {
  empty: [] as readonly HistogramBin[],
  single: [{ start: 0, end: 5, count: 8 }],
  missing: [{ start: 0, end: 10, count: 4 }, { start: 10, end: 20, count: null, detail: "Collection failed" }, { start: 20, end: 30, count: 7 }],
  zeroCount: [{ start: 0, end: 10, count: 0 }, { start: 10, end: 20, count: 5 }, { start: 20, end: 30, count: 0 }],
  ties: [{ start: 0, end: 10, count: 12 }, { start: 10, end: 20, count: 12 }, { start: 20, end: 30, count: 5 }],
  extreme: [{ start: 0, end: 1_000_000_000, count: 1 }, { start: 1_000_000_000, end: 2_000_000_000, count: 900_000_000 }, { start: 2_000_000_000, end: 3_000_000_000, count: 3 }],
  longLabel: [{ start: 0, end: 10, count: 4, label: "First long custom interval label for enterprise accounts" }, { start: 10, end: 20, count: 9, label: "Second long custom interval label for regional partners" }],
  negativeRange: [{ start: -30, end: -20, count: 3 }, { start: -20, end: -10, count: 8 }, { start: -10, end: 0, count: 5 }],
  invalidGap: [{ start: 0, end: 10, count: 2 }, { start: 12, end: 22, count: 3 }],
  unequalWidth: [{ start: 0, end: 10, count: 2 }, { start: 10, end: 25, count: 3 }],
  overlap: [{ start: 0, end: 10, count: 2 }, { start: 8, end: 18, count: 3 }],
  negativeCount: [{ start: 0, end: 10, count: -1 }],
  noninteger: [{ start: 0, end: 10, count: 1.5 }],
  duplicate: [{ start: 0, end: 10, count: 2 }, { start: 0, end: 10, count: 3 }],
  nonfinite: [{ start: 0, end: Infinity, count: 2 }],
  blankLabel: [{ start: 0, end: 10, count: 2, label: " " }],
} as const satisfies Record<string, readonly HistogramBin[]>;
