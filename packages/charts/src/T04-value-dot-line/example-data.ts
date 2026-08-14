import type { ValueDotLineDatum } from "./schema";

export const valueDotLineExample = [
  { label: "Week 1", value: 128 },
  { label: "Week 2", value: 143 },
  { label: "Week 3", value: 139 },
  { label: "Week 4", value: 173, detail: "Latest measured value" },
] as const satisfies readonly ValueDotLineDatum[];

export const valueDotLineEdgeCases = {
  empty: [] as readonly ValueDotLineDatum[],
  single: [{ label: "Only period", value: 24 }],
  missing: [
    { label: "Jan", value: 12 },
    { label: "Feb", value: null },
    { label: "Mar", value: 18 },
    { label: "Apr", value: 23 },
  ],
  leadingGap: [
    { label: "Not started", value: null },
    { label: "First report", value: 8 },
    { label: "Next", value: 11 },
  ],
  trailingGap: [
    { label: "Reported", value: 8 },
    { label: "Latest report", value: 11 },
    { label: "Pending", value: null },
  ],
  negative: [
    { label: "A", value: -12 },
    { label: "B", value: -5 },
    { label: "C", value: -18 },
  ],
  constant: [
    { label: "A", value: 7 },
    { label: "B", value: 7 },
    { label: "C", value: 7 },
    { label: "D", value: 7 },
  ],
  nearCollision: [
    { label: "W1", value: 80 },
    { label: "W2", value: 100 },
    { label: "W3", value: 100.2 },
    { label: "W4", value: 99.9 },
    { label: "W5", value: 120 },
  ],
  extreme: [
    { label: "Start", value: 0.0002 },
    { label: "Middle", value: 800_000_000 },
    { label: "End", value: 1_500_000_000 },
  ],
  longLabel: [
    { label: "First enterprise reporting interval", value: 14 },
    { label: "Second metropolitan reporting interval", value: 22 },
    { label: "Final specialist reporting interval", value: 27 },
  ],
  invalid: [
    { label: "", value: 2 },
    { label: "Broken", value: Infinity },
  ],
  duplicate: [
    { label: "Same", value: 1 },
    { label: "Same", value: 2 },
  ],
  nonfinite: [{ label: "Broken", value: Number.NaN }],
} as const satisfies Record<string, readonly ValueDotLineDatum[]>;
