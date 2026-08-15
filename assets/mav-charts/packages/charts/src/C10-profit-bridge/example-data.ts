import type { ProfitBridgeDatum } from "./schema";

export const profitBridgeExample = Object.freeze([
  { label: "Base", value: 78, kind: "opening", detail: "Opening EBITDA" },
  { label: "Price", value: 12, kind: "change", detail: "Pricing contribution" },
  { label: "Mix", value: -8, kind: "change", detail: "Portfolio mix drag" },
  { label: "Efficiency", value: 7, kind: "change", detail: "Operating efficiency" },
  { label: "FX", value: -5, kind: "change", detail: "Currency headwind" },
  { label: "Now", value: 84, kind: "closing", detail: "Reported EBITDA" },
] as const satisfies readonly ProfitBridgeDatum[]);

export const profitBridgeEdgeCases = Object.freeze({
  empty: [] as readonly ProfitBridgeDatum[],
  single: [{ label: "Only", value: 10, kind: "opening" }] as const satisfies readonly ProfitBridgeDatum[],
  missing: [
    { label: "Base", value: 10, kind: "opening" },
    { label: "Unknown", value: null, kind: "change" },
    { label: "Now", value: 10, kind: "closing" },
  ] as const satisfies readonly ProfitBridgeDatum[],
  mismatch: [
    { label: "Base", value: 10, kind: "opening" },
    { label: "Growth", value: 5, kind: "change" },
    { label: "Reported", value: 99, kind: "closing" },
  ] as const satisfies readonly ProfitBridgeDatum[],
  negativeClosing: [
    { label: "Base", value: 8, kind: "opening" },
    { label: "Loss", value: -20, kind: "change" },
    { label: "Now", value: -12, kind: "closing" },
  ] as const satisfies readonly ProfitBridgeDatum[],
  longLabel: [
    { label: "Base", value: 1, kind: "opening" },
    { label: "One-off revaluation with an intentionally long label", value: 999_999, kind: "change" },
    { label: "Now", value: 1_000_000, kind: "closing" },
  ] as const satisfies readonly ProfitBridgeDatum[],
});
