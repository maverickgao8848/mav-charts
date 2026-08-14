import type { IndexedEventDatum } from "./schema";
export const indexedEventExample = [
  { label: "T-2", value: 100, comparison: 100 },
  { label: "T-1", value: 106, comparison: 103 },
  { label: "Event", value: 118, comparison: 105, event: "Policy launch" },
  { label: "T+1", value: 127, comparison: 109 },
  {
    label: "T+2",
    value: 139,
    comparison: 112,
    detail: "Latest indexed reading",
  },
] as const satisfies readonly IndexedEventDatum[];
export const indexedEventEdgeCases = {
  empty: [] as readonly IndexedEventDatum[],
  single: [{ label: "Only", value: 108, comparison: 101, event: "Launch" }],
  noEvent: [
    { label: "A", value: 100, comparison: 100 },
    { label: "B", value: 108, comparison: 103 },
  ],
  missingPrimary: [
    { label: "A", value: 100, comparison: 100 },
    { label: "B", value: 105, comparison: 102 },
    { label: "C", value: null, comparison: 104 },
    { label: "D", value: 114, comparison: 106 },
    { label: "E", value: 120, comparison: 108 },
  ],
  missingComparison: [
    { label: "A", value: 100, comparison: 100 },
    { label: "B", value: 105, comparison: 102 },
    { label: "C", value: 109, comparison: null },
    { label: "D", value: 114, comparison: 106 },
    { label: "E", value: 120, comparison: 108 },
  ],
  leadingGap: [
    { label: "Pending", value: null, comparison: null },
    { label: "A", value: 100, comparison: 100 },
    { label: "B", value: 106, comparison: 103 },
  ],
  trailingGap: [
    { label: "A", value: 100, comparison: 100 },
    { label: "B", value: 106, comparison: 103 },
    { label: "Pending", value: null, comparison: null },
  ],
  multipleEvents: [
    { label: "T-2", value: 100, comparison: 100, event: "Announcement" },
    { label: "T-1", value: 104, comparison: 102 },
    { label: "T0", value: 113, comparison: 104, event: "Market opens" },
    { label: "T+1", value: 124, comparison: 108, event: "Guidance update" },
    { label: "T+2", value: 131, comparison: 111 },
  ],
  negativeIndex: [
    { label: "A", value: -20, comparison: -5 },
    { label: "B", value: 40, comparison: 25 },
    { label: "C", value: 90, comparison: 70 },
  ],
  constantAt100: [
    { label: "A", value: 100, comparison: 100 },
    { label: "B", value: 100, comparison: 100 },
    { label: "C", value: 100, comparison: 100 },
  ],
  extreme: [
    { label: "A", value: -900_000_000, comparison: 100 },
    {
      label: "Event",
      value: 800_000_000,
      comparison: 200_000_000,
      event: "Extreme reset",
    },
    { label: "C", value: 1_500_000_000, comparison: 700_000_000 },
  ],
  longEvent: [
    { label: "Before", value: 100, comparison: 100 },
    {
      label: "Intervention",
      value: 118,
      comparison: 105,
      event: "Major cross-market policy announcement",
    },
    { label: "After", value: 127, comparison: 109 },
  ],
  longLabel: [
    {
      label: "First enterprise reporting interval",
      value: 100,
      comparison: 100,
    },
    {
      label: "Second metropolitan reporting interval",
      value: 110,
      comparison: 104,
      event: "Launch",
    },
    {
      label: "Final specialist reporting interval",
      value: 121,
      comparison: 108,
    },
  ],
  invalid: [{ label: "", value: 100, comparison: 100, event: "   " }],
  duplicate: [
    { label: "Same", value: 100, comparison: 100 },
    { label: "Same", value: 102, comparison: 101 },
  ],
  nonfinite: [{ label: "Broken", value: Number.NaN, comparison: 100 }],
} as const satisfies Record<string, readonly IndexedEventDatum[]>;
