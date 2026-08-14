import type { ColumnLineDatum } from "./schema";

export const columnLineExample = Object.freeze([
  { label: "Q1", scaleValue: 128, ratePercent: 28, detail: "Opening quarter" },
  { label: "Q2", scaleValue: 143, ratePercent: 34 },
  { label: "Q3", scaleValue: 159, ratePercent: 39 },
  { label: "Q4", scaleValue: 173, ratePercent: 42, detail: "Latest quarter" },
] as const satisfies readonly ColumnLineDatum[]);

export const columnLineEdgeCases = Object.freeze({
  empty: [] as readonly ColumnLineDatum[],
  single: [
    { label: "Only", scaleValue: 42, ratePercent: 35 },
  ] as const satisfies readonly ColumnLineDatum[],
  missingScale: [
    { label: "Jan", scaleValue: 20, ratePercent: 25 },
    { label: "Feb", scaleValue: null, ratePercent: 30 },
    { label: "Mar", scaleValue: 35, ratePercent: 40 },
  ] as const satisfies readonly ColumnLineDatum[],
  missingRate: [
    { label: "Jan", scaleValue: 20, ratePercent: 25 },
    { label: "Feb", scaleValue: 30, ratePercent: null },
    { label: "Mar", scaleValue: 35, ratePercent: 40 },
  ] as const satisfies readonly ColumnLineDatum[],
  missingBoth: [
    { label: "Jan", scaleValue: 20, ratePercent: 25 },
    { label: "Feb", scaleValue: null, ratePercent: null },
    { label: "Mar", scaleValue: 35, ratePercent: 40 },
  ] as const satisfies readonly ColumnLineDatum[],
  negativeScale: [
    { label: "Q1", scaleValue: -18, ratePercent: 22 },
    { label: "Q2", scaleValue: 8, ratePercent: 35 },
    { label: "Q3", scaleValue: -6, ratePercent: 48 },
  ] as const satisfies readonly ColumnLineDatum[],
  allNegativeScale: [
    { label: "A", scaleValue: -20, ratePercent: 20 },
    { label: "B", scaleValue: -8, ratePercent: 40 },
  ] as const satisfies readonly ColumnLineDatum[],
  zero: [
    { label: "A", scaleValue: 0, ratePercent: 0 },
    { label: "B", scaleValue: 0, ratePercent: 100 },
  ] as const satisfies readonly ColumnLineDatum[],
  extreme: [
    { label: "Base", scaleValue: 1, ratePercent: 0.001 },
    { label: "Scale", scaleValue: 1_000_000_000, ratePercent: 99.999 },
  ] as const satisfies readonly ColumnLineDatum[],
  longLabel: [
    {
      label: "January after international product expansion",
      scaleValue: 120,
      ratePercent: 27,
    },
    {
      label: "February after international product expansion",
      scaleValue: 150,
      ratePercent: 36,
    },
    {
      label: "March after international product expansion",
      scaleValue: 180,
      ratePercent: 41,
    },
  ] as const satisfies readonly ColumnLineDatum[],
  flat: [
    { label: "A", scaleValue: 40, ratePercent: 30 },
    { label: "B", scaleValue: 40, ratePercent: 30 },
    { label: "C", scaleValue: 40, ratePercent: 30 },
  ] as const satisfies readonly ColumnLineDatum[],
  rateBelow: [
    { label: "Bad", scaleValue: 20, ratePercent: -1 },
  ] as const satisfies readonly ColumnLineDatum[],
  rateAbove: [
    { label: "Bad", scaleValue: 20, ratePercent: 101 },
  ] as const satisfies readonly ColumnLineDatum[],
  duplicate: [
    { label: "Q1", scaleValue: 20, ratePercent: 30 },
    { label: "q1", scaleValue: 18, ratePercent: 28 },
  ] as const satisfies readonly ColumnLineDatum[],
  nonfiniteScale: [
    { label: "Bad", scaleValue: Number.POSITIVE_INFINITY, ratePercent: 20 },
  ] as const satisfies readonly ColumnLineDatum[],
  nonfiniteRate: [
    { label: "Bad", scaleValue: 20, ratePercent: Number.NaN },
  ] as const satisfies readonly ColumnLineDatum[],
  blank: [
    { label: " ", scaleValue: 20, ratePercent: 30 },
  ] as const satisfies readonly ColumnLineDatum[],
});
