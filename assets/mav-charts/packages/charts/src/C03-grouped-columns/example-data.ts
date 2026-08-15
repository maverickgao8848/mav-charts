import type { GroupedColumnDatum } from "./schema";

export const groupedColumnExample = Object.freeze([
  { label: "Momentum", value: 84, comparison: 62, detail: "Current focus" },
  { label: "Adoption", value: 68, comparison: 54 },
  { label: "Retention", value: 57, comparison: 71 },
] as const satisfies readonly GroupedColumnDatum[]);

export const groupedColumnEdgeCases = Object.freeze({
  empty: [] as readonly GroupedColumnDatum[],
  single: [{ label: "Only category", value: 76, comparison: 64, detail: "One paired comparison" }] as const satisfies readonly GroupedColumnDatum[],
  missingPrimary: [
    { label: "Momentum", value: null, comparison: 62 },
    { label: "Adoption", value: 68, comparison: 54 },
    { label: "Retention", value: 57, comparison: 71 },
  ] as const satisfies readonly GroupedColumnDatum[],
  missingComparison: [
    { label: "Momentum", value: 84, comparison: null },
    { label: "Adoption", value: 68, comparison: 54 },
    { label: "Retention", value: 57, comparison: 71 },
  ] as const satisfies readonly GroupedColumnDatum[],
  negative: [
    { label: "North", value: -14, comparison: -8 },
    { label: "West", value: 9, comparison: 5 },
    { label: "South", value: -4, comparison: 7 },
  ] as const satisfies readonly GroupedColumnDatum[],
  extreme: [
    { label: "Baseline", value: 2, comparison: 4 },
    { label: "Outlier", value: 2_000_000_000, comparison: 1_400_000_000 },
    { label: "Recovery", value: 640_000_000, comparison: 720_000_000 },
  ] as const satisfies readonly GroupedColumnDatum[],
  longLabel: [
    { label: "Enterprise activation completion", value: 84, comparison: 62 },
    { label: "Independent specialist adoption", value: 68, comparison: 54 },
    { label: "Returning customer retention", value: 57, comparison: 71 },
  ] as const satisfies readonly GroupedColumnDatum[],
  flatZero: [
    { label: "North", value: 0, comparison: 0 },
    { label: "West", value: 20, comparison: 20 },
    { label: "South", value: 20, comparison: 20 },
  ] as const satisfies readonly GroupedColumnDatum[],
  invalid: [
    { label: "", value: 84, comparison: 62 },
    { label: "", value: Number.POSITIVE_INFINITY, comparison: 54 },
  ] as const satisfies readonly GroupedColumnDatum[],
});
