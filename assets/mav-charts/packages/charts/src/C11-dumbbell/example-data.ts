import type { DumbbellDatum } from "./schema";

export const dumbbellExample = Object.freeze([
  { label: "North", before: 38, after: 64, beforeLabel: "2024", afterLabel: "2026" },
  { label: "East", before: 56, after: 72, beforeLabel: "2024", afterLabel: "2026" },
  { label: "Central", before: 46, after: 43, beforeLabel: "2024", afterLabel: "2026" },
  { label: "West", before: 31, after: 58, beforeLabel: "2024", afterLabel: "2026" },
  { label: "South", before: 61, after: 69, beforeLabel: "2024", afterLabel: "2026" },
] as const satisfies readonly DumbbellDatum[]);

export const dumbbellEdgeCases = Object.freeze({
  empty: [] as readonly DumbbellDatum[],
  single: [{ label: "Single", before: 10, after: 20 }] as const satisfies readonly DumbbellDatum[],
  missing: [{ label: "Missing after", before: 10, after: null }] as const satisfies readonly DumbbellDatum[],
  signed: [{ label: "Loss-making region", before: -18, after: 7 }] as const satisfies readonly DumbbellDatum[],
  flat: [{ label: "No change", before: 42, after: 42 }] as const satisfies readonly DumbbellDatum[],
  extreme: [{ label: "Extreme scale", before: 1, after: 1_000_000 }] as const satisfies readonly DumbbellDatum[],
  longLabel: [{ label: "A deliberately long operating region name requiring truncation", before: 24, after: 31 }] as const satisfies readonly DumbbellDatum[],
});
