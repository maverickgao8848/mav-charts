import type { NeedleGaugeDatum } from "./schema";

export const needleGaugeExample = { label: "Capacity utilization", value: 72, min: 0, max: 100, thresholds: [{ label: "Low", max: 40 }, { label: "Balanced", max: 75 }, { label: "High", max: 100 }], detail: "Current operating level" } as const satisfies NeedleGaugeDatum;

export const needleGaugeEdgeCases = {
  empty: null,
  singleBand: { label: "Completion", value: 64, min: 0, max: 100, thresholds: [{ label: "Full range", max: 100 }] } as const satisfies NeedleGaugeDatum,
  missing: { ...needleGaugeExample, value: null } as const satisfies NeedleGaugeDatum,
  negativeRange: { label: "Temperature variance", value: -12, min: -40, max: 20, thresholds: [{ label: "Cold", max: -20 }, { label: "Expected", max: 5 }, { label: "Warm", max: 20 }] } as const satisfies NeedleGaugeDatum,
  minimum: { ...needleGaugeExample, value: 0 } as const satisfies NeedleGaugeDatum,
  maximum: { ...needleGaugeExample, value: 100 } as const satisfies NeedleGaugeDatum,
  belowRange: { ...needleGaugeExample, value: -1 } as const satisfies NeedleGaugeDatum,
  aboveRange: { ...needleGaugeExample, value: 101 } as const satisfies NeedleGaugeDatum,
  equalRange: { label: "Invalid", value: 1, min: 1, max: 1, thresholds: [{ label: "Only", max: 1 }] } as const satisfies NeedleGaugeDatum,
  unordered: { ...needleGaugeExample, thresholds: [{ label: "First", max: 75 }, { label: "Backwards", max: 50 }, { label: "Last", max: 100 }] } as const satisfies NeedleGaugeDatum,
  uncovered: { ...needleGaugeExample, thresholds: [{ label: "Partial", max: 80 }] } as const satisfies NeedleGaugeDatum,
  nonfinite: { ...needleGaugeExample, value: Number.POSITIVE_INFINITY } as const satisfies NeedleGaugeDatum,
  extreme: { label: "Global scale", value: 750_000_000, min: -1_000_000_000, max: 1_000_000_000, thresholds: [{ label: "Lower", max: 0 }, { label: "Upper", max: 1_000_000_000 }] } as const satisfies NeedleGaugeDatum,
  longLabel: { label: "Very long enterprise infrastructure saturation indicator", value: 58, min: 0, max: 100, thresholds: [{ label: "Comfortable operating envelope", max: 45 }, { label: "Heightened monitoring required", max: 75 }, { label: "Critical intervention range", max: 100 }] } as const satisfies NeedleGaugeDatum,
} as const;

