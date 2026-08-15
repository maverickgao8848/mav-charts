import type { StackedColumnDatum } from "./schema";

export const stackedColumnExample = Object.freeze([
  { label: "Momentum", value: 64, comparison: 36, detail: "Largest base segment" },
  { label: "Adoption", value: 48, comparison: 52 },
  { label: "Retention", value: 72, comparison: 28 },
] as const satisfies readonly StackedColumnDatum[]);

export const stackedColumnEdgeCases = Object.freeze({
  empty: [] as readonly StackedColumnDatum[],
  single: [{ label: "Only category", value: 62, comparison: 38, detail: "One complete composition" }] as const satisfies readonly StackedColumnDatum[],
  missingValue: [
    { label: "Momentum", value: null, comparison: 36, detail: "Base not reported" },
    { label: "Adoption", value: 48, comparison: 52 },
    { label: "Retention", value: 72, comparison: 28 },
  ] as const satisfies readonly StackedColumnDatum[],
  missingComparison: [
    { label: "Momentum", value: 64, comparison: null, detail: "Upper segment not reported" },
    { label: "Adoption", value: 48, comparison: 52 },
    { label: "Retention", value: 72, comparison: 28 },
  ] as const satisfies readonly StackedColumnDatum[],
  negative: [
    { label: "North", value: -14, comparison: -8 },
    { label: "West", value: 9, comparison: 5 },
    { label: "South", value: -4, comparison: 7 },
  ] as const satisfies readonly StackedColumnDatum[],
  extreme: [
    { label: "Baseline", value: 2, comparison: 4 },
    { label: "Outlier", value: 1_200_000_000, comparison: 800_000_000 },
    { label: "Recovery", value: 400_000_000, comparison: 240_000_000 },
  ] as const satisfies readonly StackedColumnDatum[],
  longLabel: [
    { label: "Enterprise activation completion", value: 64, comparison: 36 },
    { label: "Independent specialist adoption", value: 48, comparison: 52 },
    { label: "Returning customer retention", value: 72, comparison: 28 },
  ] as const satisfies readonly StackedColumnDatum[],
  flatZero: [
    { label: "North", value: 0, comparison: 0 },
    { label: "West", value: 20, comparison: 20 },
    { label: "South", value: 20, comparison: 20 },
  ] as const satisfies readonly StackedColumnDatum[],
  invalid: [
    { label: "", value: 64, comparison: 36 },
    { label: "", value: Number.POSITIVE_INFINITY, comparison: 52 },
  ] as const satisfies readonly StackedColumnDatum[],
});
