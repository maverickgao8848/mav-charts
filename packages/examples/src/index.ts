export type NumericDatum = {
  label: string;
  value: number | null;
};

export const deterministicTrend: readonly NumericDatum[] = Object.freeze([
  { label: "Jan", value: 42 },
  { label: "Feb", value: 47 },
  { label: "Mar", value: 45 },
  { label: "Apr", value: 56 },
  { label: "May", value: 63 },
  { label: "Jun", value: 68 },
]);

export const numericEdgeCases = Object.freeze({
  empty: [] as readonly NumericDatum[],
  single: [{ label: "Only point", value: 12 }] as readonly NumericDatum[],
  signed: [
    { label: "Positive", value: 18 },
    { label: "Negative", value: -7 },
    { label: "Zero", value: 0 },
  ] as readonly NumericDatum[],
  missing: [
    { label: "Observed", value: 21 },
    { label: "Missing", value: null },
    { label: "Recovered", value: 26 },
  ] as readonly NumericDatum[],
  longLabels: [
    { label: "A deliberately long category label used to verify wrapping", value: 32 },
  ] as readonly NumericDatum[],
  extreme: [
    { label: "Baseline", value: 1 },
    { label: "Outlier", value: 1_000_000 },
  ] as readonly NumericDatum[],
});
