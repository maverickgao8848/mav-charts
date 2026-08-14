import type { TargetLineDatum } from "./schema";
export const targetLineExample = [
  { label: "Q1", actual: 62, target: 75 },
  { label: "Q2", actual: 71, target: 75 },
  { label: "Q3", actual: 83, target: 75 },
  { label: "Q4", actual: 91, target: 75, detail: "Latest result" },
] as const satisfies readonly TargetLineDatum[];
export const targetLineEdgeCases = {
  empty: [] as readonly TargetLineDatum[], single: [{ label: "Only", actual: 24, target: 30 }],
  missing: [{ label: "Jan", actual: 12, target: 16 }, { label: "Feb", actual: null, target: 16 }, { label: "Mar", actual: 18, target: 16 }, { label: "Apr", actual: 23, target: 16 }],
  leadingGap: [{ label: "Pending", actual: null, target: 10 }, { label: "First", actual: 8, target: 10 }, { label: "Next", actual: 11, target: 10 }],
  trailingGap: [{ label: "Reported", actual: 8, target: 10 }, { label: "Latest", actual: 11, target: 10 }, { label: "Pending", actual: null, target: 10 }],
  negative: [{ label: "A", actual: -12, target: -8 }, { label: "B", actual: -5, target: -8 }, { label: "C", actual: -18, target: -8 }],
  constant: [{ label: "A", actual: 7, target: 7 }, { label: "B", actual: 7, target: 7 }, { label: "C", actual: 7, target: 7 }],
  targetAbove: [{ label: "A", actual: 10, target: 40 }, { label: "B", actual: 14, target: 40 }, { label: "C", actual: 18, target: 40 }],
  targetBelow: [{ label: "A", actual: 40, target: 10 }, { label: "B", actual: 44, target: 10 }, { label: "C", actual: 48, target: 10 }],
  atTarget: [{ label: "A", actual: 20, target: 20 }, { label: "B", actual: 20, target: 20 }, { label: "C", actual: 20, target: 20 }],
  extreme: [{ label: "Start", actual: .0002, target: 900_000_000 }, { label: "End", actual: 1_500_000_000, target: 900_000_000 }],
  longLabel: [{ label: "First enterprise reporting interval", actual: 14, target: 20 }, { label: "Second metropolitan reporting interval", actual: 22, target: 20 }, { label: "Final specialist reporting interval", actual: 27, target: 20 }],
  invalid: [{ label: "", actual: 2, target: 4 }], duplicate: [{ label: "Same", actual: 1, target: 2 }, { label: "Same", actual: 2, target: 2 }],
  nonfinite: [{ label: "Broken", actual: Infinity, target: 2 }], invalidTarget: [{ label: "Broken target", actual: 2, target: Number.NaN }],
} as const satisfies Record<string, readonly TargetLineDatum[]>;
