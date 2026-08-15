import type { ErrorBarDatum } from "./schema";
export const errorBarExample = [
  {
    label: "North",
    estimate: 72,
    lower: 61,
    upper: 84,
    focus: true,
    detail: "Highest estimate",
  },
  { label: "South", estimate: 55, lower: 46, upper: 68 },
  { label: "East", estimate: 63, lower: 56, upper: 70 },
  { label: "West", estimate: 41, lower: 31, upper: 54 },
] as const satisfies readonly ErrorBarDatum[];
export const errorBarEdgeCases = {
  empty: [] as readonly ErrorBarDatum[],
  single: [{ label: "Only", estimate: 24, lower: 18, upper: 32 }],
  missing: [
    { label: "Reported", estimate: 24, lower: 18, upper: 32 },
    { label: "Pending", estimate: null, lower: null, upper: null },
    { label: "Latest", estimate: 29, lower: 21, upper: 34 },
  ],
  negative: [
    { label: "Loss A", estimate: -12, lower: -20, upper: -6 },
    { label: "Loss B", estimate: -4, lower: -9, upper: 2 },
  ],
  asymmetric: [
    { label: "Skewed low", estimate: 50, lower: 20, upper: 58 },
    { label: "Skewed high", estimate: 42, lower: 38, upper: 75 },
  ],
  zeroError: [
    { label: "Exact A", estimate: 20, lower: 20, upper: 20 },
    { label: "Exact B", estimate: 35, lower: 35, upper: 35 },
  ],
  constant: [
    { label: "A", estimate: 10, lower: 8, upper: 12 },
    { label: "B", estimate: 10, lower: 8, upper: 12 },
    { label: "C", estimate: 10, lower: 8, upper: 12 },
  ],
  extreme: [
    { label: "Tiny", estimate: 0.0002, lower: 0.0001, upper: 0.0004 },
    {
      label: "Huge",
      estimate: 1_200_000_000,
      lower: 900_000_000,
      upper: 1_800_000_000,
    },
  ],
  longLabel: [
    {
      label: "North American enterprise confidence interval",
      estimate: 72,
      lower: 61,
      upper: 84,
    },
    {
      label: "Independent European specialist estimate",
      estimate: 55,
      lower: 46,
      upper: 68,
    },
  ],
  invalidOrder: [{ label: "Broken", estimate: 12, lower: 18, upper: 20 }],
  partialMissing: [{ label: "Partial", estimate: 12, lower: null, upper: 20 }],
  invalid: [{ label: "", estimate: 12, lower: 10, upper: 14 }],
  duplicate: [
    { label: "Same", estimate: 12, lower: 10, upper: 14 },
    { label: "Same", estimate: 18, lower: 15, upper: 20 },
  ],
  nonfinite: [{ label: "Broken", estimate: Infinity, lower: 1, upper: 2 }],
} as const satisfies Record<string, readonly ErrorBarDatum[]>;
