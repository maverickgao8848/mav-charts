import type { SimpleColumnDatum } from "./schema";

export const simpleColumnExample = Object.freeze([
  { label: "North", value: 72, detail: "Largest region" },
  { label: "West", value: 58 },
  { label: "Central", value: 46 },
  { label: "South", value: 39 },
  { label: "East", value: 31 },
] as const satisfies readonly SimpleColumnDatum[]);

export const simpleColumnEdgeCases = Object.freeze({
  empty: [] as readonly SimpleColumnDatum[],
  single: [{ label: "Only category", value: 42, detail: "Single observation" }] as const satisfies readonly SimpleColumnDatum[],
  missing: [
    { label: "North", value: 72 },
    { label: "West", value: null, detail: "Not reported" },
    { label: "South", value: 39 },
  ] as const satisfies readonly SimpleColumnDatum[],
  negative: [
    { label: "North", value: -18 },
    { label: "West", value: 8 },
    { label: "Central", value: -6 },
    { label: "South", value: 14 },
  ] as const satisfies readonly SimpleColumnDatum[],
  extreme: [
    { label: "Baseline", value: 1 },
    { label: "Outlier", value: 1_000_000_000 },
    { label: "Recovery", value: 420_000_000 },
  ] as const satisfies readonly SimpleColumnDatum[],
  longLabel: [
    { label: "North American enterprise accounts", value: 72 },
    { label: "Independent European specialists", value: 58 },
    { label: "Asia Pacific emerging markets", value: 46 },
  ] as const satisfies readonly SimpleColumnDatum[],
  invalid: [
    { label: "North", value: 72 },
    { label: "North", value: 58 },
  ] as const satisfies readonly SimpleColumnDatum[],
});

