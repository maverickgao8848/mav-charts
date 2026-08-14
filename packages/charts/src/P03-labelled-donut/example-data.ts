import type { LabelledDonutDatum } from "./schema";

export const labelledDonutExample = [
  { label: "Direct sales", value: 51, detail: "Largest reported channel" },
  { label: "Subscriptions", value: 29 },
  { label: "Licensing", value: 20 },
] as const satisfies readonly LabelledDonutDatum[];

export const labelledDonutEdgeCases = {
  empty: [] as readonly LabelledDonutDatum[],
  single: [{ label: "Only channel", value: 100 }],
  missing: [{ label: "Direct", value: 70 }, { label: "Unreported", value: null }, { label: "Partner", value: 30 }],
  zero: [{ label: "Direct", value: 70 }, { label: "No contribution", value: 0 }, { label: "Partner", value: 30 }],
  allZero: [{ label: "Direct", value: 0 }, { label: "Partner", value: 0 }],
  equal: [{ label: "North", value: 25 }, { label: "East", value: 25 }, { label: "South", value: 25 }, { label: "West", value: 25 }],
  extreme: [{ label: "Dominant", value: 1_000_000_000 }, { label: "Tiny", value: 1 }, { label: "Trace", value: 0.001 }],
  longLabel: [{ label: "Direct enterprise distribution across North America", value: 51 }, { label: "Recurring subscription partnerships", value: 29 }, { label: "Regional licensing agreements", value: 20 }],
  many: Array.from({ length: 8 }, (_, index) => ({ label: `Channel ${index + 1}`, value: 8 - index })) as readonly LabelledDonutDatum[],
  negative: [{ label: "Invalid", value: -1 }],
  duplicate: [{ label: "Direct", value: 60 }, { label: "direct", value: 40 }],
  nonfinite: [{ label: "Invalid", value: Number.POSITIVE_INFINITY }],
  blank: [{ label: " ", value: 10 }],
} as const;
