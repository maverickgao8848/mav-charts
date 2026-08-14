import type { PieDatum } from "./schema";

export const pieExample = [
  { label: "Core product", value: 42, detail: "Largest contribution" },
  { label: "Services", value: 33 },
  { label: "Partners", value: 25 },
] as const satisfies readonly PieDatum[];

export const pieEdgeCases = {
  empty: [] as const satisfies readonly PieDatum[],
  single: [{ label: "Only category", value: 100 }] as const satisfies readonly PieDatum[],
  missing: [{ label: "Reported", value: 70 }, { label: "Awaiting source", value: null }, { label: "Other", value: 30 }] as const satisfies readonly PieDatum[],
  zero: [{ label: "Primary", value: 65 }, { label: "No contribution", value: 0 }, { label: "Secondary", value: 35 }] as const satisfies readonly PieDatum[],
  allZero: [{ label: "A", value: 0 }, { label: "B", value: 0 }] as const satisfies readonly PieDatum[],
  allMissing: [{ label: "A", value: null }, { label: "B", value: null }] as const satisfies readonly PieDatum[],
  negative: [{ label: "A", value: 8 }, { label: "B", value: -1 }] as const satisfies readonly PieDatum[],
  extreme: [{ label: "Dominant", value: 999_999_999 }, { label: "Minor", value: 1 }] as const satisfies readonly PieDatum[],
  longLabel: [{ label: "Long enterprise implementation and advisory programs", value: 54 }, { label: "Recurring software subscriptions", value: 31 }, { label: "Other partner-delivered services", value: 15 }] as const satisfies readonly PieDatum[],
  duplicate: [{ label: "North", value: 60 }, { label: " north ", value: 40 }] as const satisfies readonly PieDatum[],
  nonfinite: [{ label: "A", value: Number.POSITIVE_INFINITY }, { label: "B", value: 1 }] as const satisfies readonly PieDatum[],
  blank: [{ label: " ", value: 1 }] as const satisfies readonly PieDatum[],
} as const;

