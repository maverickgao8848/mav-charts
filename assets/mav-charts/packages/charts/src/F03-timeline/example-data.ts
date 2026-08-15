import type { TimelineDatum } from "./schema";

export const timelineExample = Object.freeze([
  { label: "Policy", start: 2022.0, end: 2022.8, detail: "Policy framework" },
  { label: "Pilot", start: 2022.6, end: 2024.0, detail: "Initial market pilot" },
  { label: "Scale", start: 2023.5, end: 2025.2, detail: "Capacity expansion" },
  { label: "Export", start: 2024.6, end: 2026.1, detail: "Export program" },
  { label: "Mature", start: 2025.5, end: 2027.0, detail: "Mature operating phase" },
] as const satisfies readonly TimelineDatum[]);

export const timelineEdgeCases = Object.freeze({
  empty: [] as readonly TimelineDatum[],
  single: [{ label: "Pilot", start: 2, end: 8, detail: "Only phase" }] as const satisfies readonly TimelineDatum[],
  missing: [{ label: "Unknown", start: null, end: 8 }] as const satisfies readonly TimelineDatum[],
  inverted: [{ label: "Reversed", start: 8, end: 2 }] as const satisfies readonly TimelineDatum[],
  negative: [
    { label: "Preparation", start: -18, end: -4 },
    { label: "Launch", start: -6, end: 3 },
    { label: "Review", start: 2, end: 14 },
  ] as const satisfies readonly TimelineDatum[],
  zeroDuration: [
    { label: "Decision", start: 0, end: 0, detail: "Milestone" },
    { label: "Delivery", start: 2, end: 8 },
  ] as const satisfies readonly TimelineDatum[],
  extreme: [
    { label: "Ancient baseline", start: -1_000_000, end: -900_000 },
    { label: "Long horizon", start: 500_000_000, end: 1_000_000_000 },
  ] as const satisfies readonly TimelineDatum[],
  longLabel: [
    { label: "Regulatory consultation and stakeholder alignment", start: 2022, end: 2023.2 },
    { label: "International production capacity expansion", start: 2022.8, end: 2025.1 },
    { label: "Commercial availability across priority markets", start: 2024.4, end: 2027 },
  ] as const satisfies readonly TimelineDatum[],
  overlap: [
    { label: "Alpha", start: 0, end: 8 },
    { label: "Beta", start: 1, end: 7 },
    { label: "Gamma", start: 2, end: 6 },
    { label: "Delta", start: 3, end: 5 },
  ] as const satisfies readonly TimelineDatum[],
});

