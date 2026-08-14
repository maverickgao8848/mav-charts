import type { RangeAreaDatum } from "./schema";

export const rangeAreaExample = Object.freeze([
  { label: "Jan", low: 34, median: 43, high: 52 },
  { label: "Feb", low: 37, median: 48, high: 57 },
  { label: "Mar", low: 42, median: 53, high: 61 },
  { label: "Apr", low: 39, median: 55, high: 64 },
  { label: "May", low: 46, median: 61, high: 70 },
  { label: "Jun", low: 52, median: 67, high: 75 },
  { label: "Jul", low: 55, median: 72, high: 82 },
] as const satisfies readonly RangeAreaDatum[]);

export const rangeAreaEdgeCases = Object.freeze({
  empty: [] as readonly RangeAreaDatum[],
  single: [{ label: "Only", low: 4, median: 5, high: 8 }] as const satisfies readonly RangeAreaDatum[],
  missing: [{ label: "Missing median", low: 4, median: null, high: 8 }] as const satisfies readonly RangeAreaDatum[],
  inverted: [{ label: "Invalid order", low: 9, median: 5, high: 8 }] as const satisfies readonly RangeAreaDatum[],
  signed: [
    { label: "Q1", low: -18, median: -8, high: 3 },
    { label: "Q2", low: -6, median: 4, high: 14 },
  ] as const satisfies readonly RangeAreaDatum[],
  extreme: [
    { label: "Baseline", low: 1, median: 2, high: 3 },
    { label: "Shock", low: 100_000, median: 500_000, high: 1_000_000 },
  ] as const satisfies readonly RangeAreaDatum[],
  longLabel: [
    { label: "January after the policy reset", low: 34, median: 43, high: 52 },
    { label: "February after the policy reset", low: 37, median: 48, high: 57 },
  ] as const satisfies readonly RangeAreaDatum[],
});
