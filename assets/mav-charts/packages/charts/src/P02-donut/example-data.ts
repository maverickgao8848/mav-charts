import type { DonutDatum } from "./schema";
export const donutExample = Object.freeze([
  { label: "Enterprise", value: 73, detail: "Largest reported segment" },
  { label: "Mid-market", value: 18 },
  { label: "Self-serve", value: 9 },
] as const satisfies readonly DonutDatum[]);
export const donutEdgeCases = Object.freeze({
  empty: [] as readonly DonutDatum[],
  single: [{ label: "Only segment", value: 42 }],
  missing: [
    { label: "Reported", value: 60 },
    { label: "Awaiting report", value: null },
    { label: "Reported too", value: 40 },
  ],
  zero: [
    { label: "Active", value: 100 },
    { label: "Zero allocation", value: 0 },
  ],
  allZero: [
    { label: "A", value: 0 },
    { label: "B", value: 0 },
  ],
  equal: [
    { label: "A", value: 1 },
    { label: "B", value: 1 },
    { label: "C", value: 1 },
  ],
  extreme: [
    { label: "Dominant", value: 1_000_000_000 },
    { label: "Trace", value: 0.001 },
  ],
  longLabel: [
    {
      label: "Enterprise customers in international regulated markets",
      value: 62,
    },
    { label: "All remaining customers", value: 38 },
  ],
  many: Array.from({ length: 12 }, (_, index) => ({
    label: `Segment ${index + 1}`,
    value: index + 1,
  })),
  negative: [{ label: "Invalid", value: -1 }],
  duplicate: [
    { label: "Same", value: 2 },
    { label: "same", value: 3 },
  ],
  blank: [{ label: " ", value: 2 }],
  nonfinite: [{ label: "Broken", value: Number.POSITIVE_INFINITY }],
} as const satisfies Record<string, readonly DonutDatum[]>);
