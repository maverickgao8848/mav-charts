import type { TreemapDatum } from "./schema";

export const treemapExample = [
  { label: "Company A", value: 34, parent: "Leaders" },
  { label: "Company B", value: 24, parent: "Leaders" },
  { label: "Company C", value: 16, parent: "Challengers" },
  { label: "Company D", value: 11, parent: "Challengers" },
  { label: "Others", value: 15, parent: "Long tail" },
] as const satisfies readonly TreemapDatum[];

export const treemapEdgeCases = {
  empty: [] as readonly TreemapDatum[],
  single: [{ label: "Only category", value: 42, parent: "Market" }],
  missing: [{ label: "Reported", value: 40 }, { label: "Not reported", value: null }, { label: "Also reported", value: 20 }],
  zero: [{ label: "Leader", value: 50 }, { label: "Zero share", value: 0 }, { label: "Context", value: 25 }],
  allZero: [{ label: "No activity A", value: 0 }, { label: "No activity B", value: 0 }],
  extreme: [{ label: "Dominant", value: 1_000_000_000 }, { label: "Tiny", value: 1 }, { label: "Smaller", value: 0.001 }],
  longLabel: [{ label: "North American enterprise reporting division", value: 45 }, { label: "Asia Pacific specialist distribution network", value: 30 }, { label: "Independent regional partners", value: 25 }],
  many: Array.from({ length: 18 }, (_, index) => ({ label: `Category ${index + 1}`, value: 20 - index, parent: index < 6 ? "Leaders" : index < 12 ? "Middle" : "Tail" })),
  equal: [{ label: "A", value: 10 }, { label: "B", value: 10 }, { label: "C", value: 10 }, { label: "D", value: 10 }],
  negative: [{ label: "Invalid negative", value: -1 }],
  invalid: [{ label: "", value: 10 }],
  duplicate: [{ label: "Same", value: 10 }, { label: "Same", value: 20 }],
  nonfinite: [{ label: "Broken", value: Number.POSITIVE_INFINITY }],
  blankParent: [{ label: "A", value: 10, parent: " " }],
} as const satisfies Record<string, readonly TreemapDatum[]>;

