import type { ColumnTargetDatum } from "./schema";

export const columnTargetExample = Object.freeze([
  {
    label: "Team one",
    actual: 68,
    target: 80,
    detail: "Largest absolute target gap",
  },
  { label: "Team two", actual: 82, target: 80 },
  { label: "Team three", actual: 74, target: 80 },
  { label: "Team four", actual: 91, target: 80 },
] as const satisfies readonly ColumnTargetDatum[]);

export const columnTargetEdgeCases = Object.freeze({
  empty: [] as readonly ColumnTargetDatum[],
  single: [
    { label: "Only", actual: 42, target: 50 },
  ] as const satisfies readonly ColumnTargetDatum[],
  missingActual: [
    { label: "A", actual: 40, target: 50 },
    { label: "B", actual: null, target: 55 },
    { label: "C", actual: 62, target: 60 },
  ] as const satisfies readonly ColumnTargetDatum[],
  missingTarget: [
    { label: "A", actual: 40, target: 50 },
    { label: "B", actual: 54, target: null },
    { label: "C", actual: 62, target: 60 },
  ] as const satisfies readonly ColumnTargetDatum[],
  missingBoth: [
    { label: "A", actual: 40, target: 50 },
    { label: "B", actual: null, target: null },
    { label: "C", actual: 62, target: 60 },
  ] as const satisfies readonly ColumnTargetDatum[],
  signed: [
    { label: "A", actual: -18, target: -10 },
    { label: "B", actual: 8, target: 12 },
    { label: "C", actual: -6, target: 4 },
  ] as const satisfies readonly ColumnTargetDatum[],
  allNegative: [
    { label: "A", actual: -20, target: -15 },
    { label: "B", actual: -8, target: -12 },
  ] as const satisfies readonly ColumnTargetDatum[],
  zero: [
    { label: "A", actual: 0, target: 0 },
    { label: "B", actual: 0, target: 10 },
  ] as const satisfies readonly ColumnTargetDatum[],
  equal: [
    { label: "A", actual: 40, target: 40 },
    { label: "B", actual: 60, target: 60 },
  ] as const satisfies readonly ColumnTargetDatum[],
  ties: [
    { label: "A", actual: 70, target: 80 },
    { label: "B", actual: 90, target: 80 },
    { label: "C", actual: 75, target: 80 },
  ] as const satisfies readonly ColumnTargetDatum[],
  variableTargets: [
    { label: "A", actual: 45, target: 50 },
    { label: "B", actual: 68, target: 75 },
    { label: "C", actual: 82, target: 80 },
  ] as const satisfies readonly ColumnTargetDatum[],
  extreme: [
    { label: "Base", actual: 1, target: 2 },
    { label: "Scale", actual: 1_000_000_000, target: 900_000_000 },
  ] as const satisfies readonly ColumnTargetDatum[],
  longLabel: [
    {
      label: "Northern enterprise customer success organization",
      actual: 72,
      target: 80,
    },
    {
      label: "International strategic account management organization",
      actual: 88,
      target: 85,
    },
  ] as const satisfies readonly ColumnTargetDatum[],
  duplicate: [
    { label: "A", actual: 40, target: 50 },
    { label: "a", actual: 45, target: 50 },
  ] as const satisfies readonly ColumnTargetDatum[],
  nonfiniteActual: [
    { label: "Bad", actual: Number.POSITIVE_INFINITY, target: 50 },
  ] as const satisfies readonly ColumnTargetDatum[],
  nonfiniteTarget: [
    { label: "Bad", actual: 40, target: Number.NaN },
  ] as const satisfies readonly ColumnTargetDatum[],
  blank: [
    { label: " ", actual: 40, target: 50 },
  ] as const satisfies readonly ColumnTargetDatum[],
});
