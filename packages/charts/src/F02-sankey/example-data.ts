import type { SankeyDatum } from "./schema";

export const sankeyExample: readonly SankeyDatum[] = [
  {
    source: "Inputs",
    target: "Production",
    value: 82,
    detail: "All material entering the chain",
  },
  { source: "Production", target: "Brand", value: 61 },
  { source: "Production", target: "Platform", value: 21 },
  { source: "Brand", target: "Channel", value: 47 },
  { source: "Brand", target: "Loss", value: 14 },
  { source: "Platform", target: "Customers", value: 21 },
  { source: "Channel", target: "Customers", value: 47 },
] as const;

export const sankeyEdgeCases = {
  empty: [] as readonly SankeyDatum[],
  single: [{ source: "Origin", target: "Destination", value: 12 }],
  missing: [
    { source: "Input", target: "Process", value: 30 },
    { source: "Process", target: "Pending", value: null },
    { source: "Process", target: "Output", value: 18 },
  ],
  split: [
    { source: "Input", target: "Core", value: 100 },
    { source: "Core", target: "Direct", value: 68 },
    { source: "Core", target: "Partner", value: 32 },
  ],
  merge: [
    { source: "Direct", target: "Customers", value: 44 },
    { source: "Partner", target: "Customers", value: 26 },
  ],
  deep: [
    { source: "A", target: "B", value: 80 },
    { source: "B", target: "C", value: 70 },
    { source: "C", target: "D", value: 58 },
    { source: "D", target: "E", value: 43 },
    { source: "E", target: "F", value: 31 },
  ],
  extreme: [
    { source: "Source", target: "Main", value: 1_800_000_000 },
    { source: "Source", target: "Minor", value: 1 },
  ],
  longLabel: [
    {
      source: "North American enterprise acquisition",
      target: "Independent retail distribution partners",
      value: 72,
    },
    {
      source: "Independent retail distribution partners",
      target: "Repeat customers",
      value: 55,
    },
  ],
  invalid: [{ source: "Input", target: "Output", value: -2 }],
  zero: [{ source: "Input", target: "Output", value: 0 }],
  blank: [{ source: " ", target: "Output", value: 2 }],
  self: [{ source: "Loop", target: "Loop", value: 2 }],
  cycle: [
    { source: "A", target: "B", value: 2 },
    { source: "B", target: "A", value: 1 },
  ],
  duplicate: [
    { source: "A", target: "B", value: 2 },
    { source: "A", target: "B", value: 1 },
  ],
  nonfinite: [{ source: "A", target: "B", value: Number.POSITIVE_INFINITY }],
} as const;
