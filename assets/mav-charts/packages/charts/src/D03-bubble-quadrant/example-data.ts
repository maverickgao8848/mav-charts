import type { BubbleQuadrantDatum } from "./schema";

export const bubbleQuadrantExample = Object.freeze([
  { label: "Nova", x: 84, y: 74, size: 42, detail: "Highest share and growth" },
  { label: "Axis", x: 66, y: 63, size: 28, detail: "Scaled challenger" },
  { label: "MAV", x: 48, y: 82, size: 34, detail: "High growth, lower price" },
  { label: "Core", x: 37, y: 44, size: 20, detail: "Stable niche" },
  { label: "Via", x: 73, y: 33, size: 18, detail: "Price-led watch item" },
  { label: "Fold", x: 27, y: 61, size: 12, detail: "Early challenger" },
] as const satisfies readonly BubbleQuadrantDatum[]);

export const bubbleQuadrantEdgeCases = Object.freeze({
  empty: [] as readonly BubbleQuadrantDatum[],
  single: [{ label: "Solo", x: 52, y: 58, size: 16, detail: "Only observation" }] as const satisfies readonly BubbleQuadrantDatum[],
  missing: [{ label: "Unknown", x: 42, y: null, size: 10 }] as const satisfies readonly BubbleQuadrantDatum[],
  invalid: [{ label: "", x: 42, y: 58, size: -1 }] as const satisfies readonly BubbleQuadrantDatum[],
  negative: [
    { label: "Legacy", x: -42, y: -18, size: 16 },
    { label: "Reset", x: 12, y: -4, size: 25 },
    { label: "Recovery", x: -8, y: 22, size: 9 },
  ] as const satisfies readonly BubbleQuadrantDatum[],
  zeroSize: [
    { label: "No volume", x: 35, y: 62, size: 0 },
    { label: "Active", x: 70, y: 76, size: 20 },
  ] as const satisfies readonly BubbleQuadrantDatum[],
  extreme: [
    { label: "Baseline", x: -1_000_000, y: 2, size: 1 },
    { label: "Outlier", x: 2_000_000, y: 1_000_000, size: 1_000_000_000 },
  ] as const satisfies readonly BubbleQuadrantDatum[],
  longLabel: [
    { label: "North American enterprise platform accounts", x: 78, y: 74, size: 42 },
    { label: "Independent European specialist providers", x: 43, y: 65, size: 24 },
    { label: "Asia Pacific emerging digital challengers", x: 64, y: 38, size: 30 },
  ] as const satisfies readonly BubbleQuadrantDatum[],
  overlap: [
    { label: "Alpha", x: 68, y: 72, size: 42 },
    { label: "Beta", x: 69, y: 71, size: 24 },
    { label: "Gamma", x: 67, y: 73, size: 12 },
    { label: "Delta", x: 34, y: 38, size: 18 },
  ] as const satisfies readonly BubbleQuadrantDatum[],
});

