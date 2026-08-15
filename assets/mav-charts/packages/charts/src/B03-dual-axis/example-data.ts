import type { DualAxisDatum } from "./schema";

export const dualAxisExample = Object.freeze([
  { label: "Jan", barValue: 38, lineValue: 29, detail: "Opening month" },
  { label: "Feb", barValue: 44, lineValue: 31 },
  { label: "Mar", barValue: 50, lineValue: 30 },
  { label: "Apr", barValue: 58, lineValue: 34 },
  { label: "May", barValue: 64, lineValue: 36 },
  { label: "Jun", barValue: 71, lineValue: 35, detail: "Latest month" },
] as const satisfies readonly DualAxisDatum[]);

export const dualAxisEdgeCases = Object.freeze({
  empty: [] as readonly DualAxisDatum[],
  single: [{ label: "Only", barValue: 42, lineValue: 18, detail: "Single period" }] as const satisfies readonly DualAxisDatum[],
  missingBar: [
    { label: "Jan", barValue: 38, lineValue: 29 },
    { label: "Feb", barValue: null, lineValue: 31, detail: "Revenue unavailable" },
    { label: "Mar", barValue: 50, lineValue: 30 },
  ] as const satisfies readonly DualAxisDatum[],
  missingLine: [
    { label: "Jan", barValue: 38, lineValue: 29 },
    { label: "Feb", barValue: 44, lineValue: null, detail: "Margin unavailable" },
    { label: "Mar", barValue: 50, lineValue: 30 },
  ] as const satisfies readonly DualAxisDatum[],
  invalid: [
    { label: "Jan", barValue: 38, lineValue: 29 },
    { label: "Jan", barValue: 44, lineValue: 31 },
  ] as const satisfies readonly DualAxisDatum[],
  nonfinite: [{ label: "Bad", barValue: Number.POSITIVE_INFINITY, lineValue: 20 }] as const satisfies readonly DualAxisDatum[],
  negative: [
    { label: "Q1", barValue: -18, lineValue: -4 },
    { label: "Q2", barValue: 8, lineValue: 2 },
    { label: "Q3", barValue: -6, lineValue: 5 },
    { label: "Q4", barValue: 14, lineValue: -2 },
  ] as const satisfies readonly DualAxisDatum[],
  extreme: [
    { label: "Baseline", barValue: 1, lineValue: 0.001 },
    { label: "Outlier", barValue: 1_000_000_000, lineValue: 99.999 },
    { label: "Recovery", barValue: 420_000_000, lineValue: 42.42 },
  ] as const satisfies readonly DualAxisDatum[],
  longLabel: [
    { label: "January after the infrastructure migration", barValue: 38, lineValue: 29 },
    { label: "February after the infrastructure migration", barValue: 44, lineValue: 31 },
    { label: "March after the infrastructure migration", barValue: 50, lineValue: 30 },
  ] as const satisfies readonly DualAxisDatum[],
  flat: [
    { label: "Jan", barValue: 42, lineValue: 18 },
    { label: "Feb", barValue: 42, lineValue: 18 },
    { label: "Mar", barValue: 42, lineValue: 18 },
  ] as const satisfies readonly DualAxisDatum[],
});

