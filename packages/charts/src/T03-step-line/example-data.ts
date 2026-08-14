import type { StepLineDatum } from "./schema";
export const stepLineExample = [
  { label: "Stage 1", value: 18 },
  { label: "Stage 2", value: 32 },
  { label: "Stage 3", value: 61 },
  { label: "Stage 4", value: 73, detail: "Latest policy state" },
] as const satisfies readonly StepLineDatum[];
export const stepLineEdgeCases = {
  empty: [] as readonly StepLineDatum[],
  single: [{ label: "Only state", value: 24 }],
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
  ],
  extreme: [
    { label: "Start", value: 0.0002 },
    { label: "Middle", value: 800_000_000 },
    { label: "End", value: 1_500_000_000 },
  ],
  longLabel: [
    { label: "First enterprise policy interval", value: 14 },
    { label: "Second metropolitan policy interval", value: 22 },
    { label: "Final specialist policy interval", value: 27 },
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
} as const satisfies Record<string, readonly StepLineDatum[]>;
