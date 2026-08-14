export type StackedColumnDatum = {
  label: string;
  value: number | null;
  comparison: number | null;
  detail?: string;
};

export type StackedSeriesKey = "value" | "comparison";

export type StackedColumnGeometryDatum = StackedColumnDatum & {
  index: number;
  focus: boolean;
  missingValue: boolean;
  missingComparison: boolean;
  complete: boolean;
  total: number | null;
  positiveTotal: number;
  negativeTotal: number;
  valueStart: number | null;
  valueEnd: number | null;
  comparisonStart: number | null;
  comparisonEnd: number | null;
  positiveLabelSeries: StackedSeriesKey | null;
  negativeLabelSeries: StackedSeriesKey | null;
};

export function validateStackedColumnData(data: readonly StackedColumnDatum[]) {
  const errors: string[] = [];
  const labels = new Set<string>();
  data.forEach((datum, index) => {
    const label = datum.label.trim();
    if (!label) errors.push(`Datum ${index} requires a non-empty label.`);
    if (labels.has(label)) errors.push(`Datum ${index} duplicates label ${datum.label}.`);
    labels.add(label);
    for (const key of ["value", "comparison"] as const) {
      const value = datum[key];
      if (value !== null && (typeof value !== "number" || !Number.isFinite(value))) errors.push(`Datum ${index} contains a non-finite ${key}.`);
    }
  });
  return { valid: errors.length === 0, errors } as const;
}

export function buildStackedColumnGeometry(data: readonly StackedColumnDatum[]): readonly StackedColumnGeometryDatum[] {
  return data.map((datum, index) => {
    let positive = 0;
    let negative = 0;
    const positions: Record<StackedSeriesKey, { start: number | null; end: number | null }> = {
      value: { start: null, end: null }, comparison: { start: null, end: null },
    };
    for (const key of ["value", "comparison"] as const) {
      const amount = datum[key];
      if (amount === null) continue;
      if (amount >= 0) {
        positions[key] = { start: positive, end: positive + amount };
        positive += amount;
      } else {
        positions[key] = { start: negative, end: negative + amount };
        negative += amount;
      }
    }
    const positiveLabelSeries = (["comparison", "value"] as const).find((key) => datum[key] !== null && (datum[key] as number) > 0) ?? null;
    const negativeLabelSeries = (["comparison", "value"] as const).find((key) => datum[key] !== null && (datum[key] as number) < 0) ?? null;
    const complete = datum.value !== null && datum.comparison !== null;
    return {
      ...datum,
      index,
      focus: index === 0,
      missingValue: datum.value === null,
      missingComparison: datum.comparison === null,
      complete,
      total: complete ? datum.value! + datum.comparison! : null,
      positiveTotal: positive,
      negativeTotal: negative,
      valueStart: positions.value.start,
      valueEnd: positions.value.end,
      comparisonStart: positions.comparison.start,
      comparisonEnd: positions.comparison.end,
      positiveLabelSeries,
      negativeLabelSeries,
    };
  });
}

export function getStackedColumnDomain(data: readonly StackedColumnDatum[]): readonly [number, number] {
  const geometry = buildStackedColumnGeometry(data);
  if (!geometry.length || geometry.every(({ value, comparison }) => value === null && comparison === null)) return [0, 1];
  const minimum = Math.min(0, ...geometry.map(({ negativeTotal }) => negativeTotal));
  const maximum = Math.max(0, ...geometry.map(({ positiveTotal }) => positiveTotal));
  if (minimum === 0) return [0, maximum === 0 ? 1 : maximum * 1.12];
  if (maximum === 0) return [minimum * 1.12, 0];
  const padding = (maximum - minimum) * 0.08;
  return [minimum - padding, maximum + padding];
}
