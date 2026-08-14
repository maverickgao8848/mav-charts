import type { RoundedColumnDatum } from "./schema";

export const roundedColumnExample = Object.freeze([
  { label: "Momentum", value: 84, detail: "Current focus" },
  { label: "Adoption", value: 68 },
  { label: "Retention", value: 57 },
] as const satisfies readonly RoundedColumnDatum[]);

export const roundedColumnEdgeCases = Object.freeze({
  empty: [] as readonly RoundedColumnDatum[],
  single: [{ label: "Completion", value: 76, detail: "Single friendly KPI" }] as const satisfies readonly RoundedColumnDatum[],
  missing: [
    { label: "Momentum", value: 84 },
    { label: "Adoption", value: null, detail: "Not reported" },
    { label: "Retention", value: 57 },
  ] as const satisfies readonly RoundedColumnDatum[],
  negative: [
    { label: "North", value: -14 },
    { label: "West", value: 9 },
    { label: "South", value: -4 },
  ] as const satisfies readonly RoundedColumnDatum[],
  smallAndZero: [
    { label: "Zero", value: 0 },
    { label: "Small", value: 0.2 },
    { label: "Larger", value: 20 },
  ] as const satisfies readonly RoundedColumnDatum[],
  extreme: [
    { label: "Baseline", value: 2 },
    { label: "Outlier", value: 2_000_000_000 },
    { label: "Recovery", value: 640_000_000 },
  ] as const satisfies readonly RoundedColumnDatum[],
  longLabel: [
    { label: "Enterprise activation completion", value: 84 },
    { label: "Independent specialist adoption", value: 68 },
    { label: "Returning customer retention", value: 57 },
  ] as const satisfies readonly RoundedColumnDatum[],
  invalid: [
    { label: "", value: 84 },
    { label: "Broken", value: Number.POSITIVE_INFINITY },
  ] as const satisfies readonly RoundedColumnDatum[],
});
