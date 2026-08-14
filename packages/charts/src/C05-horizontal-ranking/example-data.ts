import type { HorizontalRankingDatum } from "./schema";

export const horizontalRankingExample = Object.freeze([
  { label: "Enterprise", value: 173, detail: "Largest contribution" },
  { label: "Mid-market", value: 128 },
  { label: "Partner network", value: 96 },
] as const satisfies readonly HorizontalRankingDatum[]);

export const horizontalRankingEdgeCases = Object.freeze({
  empty: [] as readonly HorizontalRankingDatum[],
  single: [{ label: "Only category", value: 42, detail: "Single ranked observation" }] as const satisfies readonly HorizontalRankingDatum[],
  missing: [
    { label: "Enterprise", value: 173 },
    { label: "Not reported", value: null, detail: "Missing remains a row" },
    { label: "Partner network", value: 96 },
  ] as const satisfies readonly HorizontalRankingDatum[],
  negative: [
    { label: "Growth", value: 18 },
    { label: "Flat", value: 0 },
    { label: "Contraction", value: -12 },
    { label: "Largest decline", value: -28 },
  ] as const satisfies readonly HorizontalRankingDatum[],
  ties: [
    { label: "First tied input", value: 120 },
    { label: "Second tied input", value: 120 },
    { label: "Third place", value: 90 },
    { label: "Fourth input", value: 70 },
  ] as const satisfies readonly HorizontalRankingDatum[],
  extreme: [
    { label: "Outlier", value: 2_000_000_000 },
    { label: "Recovery", value: 640_000_000 },
    { label: "Baseline", value: 2 },
  ] as const satisfies readonly HorizontalRankingDatum[],
  longLabel: [
    { label: "Enterprise activation completion across strategic accounts", value: 173 },
    { label: "Independent specialist adoption in European markets", value: 128 },
    { label: "Returning customer retention for the annual cohort", value: 96 },
  ] as const satisfies readonly HorizontalRankingDatum[],
  invalid: [
    { label: "", value: 173 },
    { label: "", value: Number.POSITIVE_INFINITY },
  ] as const satisfies readonly HorizontalRankingDatum[],
});
