import type { RadialProgressDatum } from "./schema";

export const radialProgressExample = Object.freeze([
  { label: "Activation", value: 78, detail: "New accounts reaching first value" },
  { label: "Retention", value: 64, detail: "Accounts active after 30 days" },
  { label: "Expansion", value: 49, detail: "Accounts increasing paid usage" },
] as const satisfies readonly RadialProgressDatum[]);

export const radialProgressEdgeCases = Object.freeze({
  empty: [] as readonly RadialProgressDatum[],
  single: [{ label: "Activation", value: 78, detail: "Single KPI" }] as const satisfies readonly RadialProgressDatum[],
  missing: [{ label: "Retention", value: null, detail: "Not reported" }] as const satisfies readonly RadialProgressDatum[],
  invalid: [{ label: "", value: 42 }] as const satisfies readonly RadialProgressDatum[],
  negative: [{ label: "Activation", value: -8 }] as const satisfies readonly RadialProgressDatum[],
  over100: [{ label: "Expansion", value: 112 }] as const satisfies readonly RadialProgressDatum[],
  extreme: [
    { label: "Not started", value: 0 },
    { label: "Almost zero", value: 0.01 },
    { label: "Almost complete", value: 99.99 },
    { label: "Complete", value: 100 },
  ] as const satisfies readonly RadialProgressDatum[],
  longLabel: [
    { label: "Activation after verified workspace onboarding", value: 78 },
    { label: "Thirty-day retained enterprise workspaces", value: 64 },
    { label: "Expansion among established annual accounts", value: 49 },
  ] as const satisfies readonly RadialProgressDatum[],
});

