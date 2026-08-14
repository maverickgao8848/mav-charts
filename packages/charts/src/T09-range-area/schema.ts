export type RangeAreaDatum = {
  label: string;
  low: number | null;
  median: number | null;
  high: number | null;
  detail?: string;
};

export type RangeAreaGeometryDatum = Omit<RangeAreaDatum, "low" | "median" | "high"> & {
  low: number;
  median: number;
  high: number;
  range: readonly [number, number];
  spread: number;
};

export function validateRangeAreaData(data: readonly RangeAreaDatum[]) {
  const errors: string[] = [];
  data.forEach((datum, index) => {
    if (!datum.label.trim()) errors.push(`Datum ${index} requires a non-empty label.`);
    const values = [datum.low, datum.median, datum.high];
    if (values.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
      errors.push(`Datum ${index} contains a missing or non-finite value.`);
      return;
    }
    if ((datum.low as number) > (datum.median as number) || (datum.median as number) > (datum.high as number)) {
      errors.push(`Datum ${index} must satisfy low ≤ median ≤ high.`);
    }
  });
  return { valid: errors.length === 0, errors } as const;
}

const finite = (value: number | null) => typeof value === "number" && Number.isFinite(value) ? value : 0;

export function buildRangeAreaGeometry(data: readonly RangeAreaDatum[]): readonly RangeAreaGeometryDatum[] {
  return data.map((datum) => {
    const low = finite(datum.low);
    const median = finite(datum.median);
    const high = finite(datum.high);
    return { ...datum, low, median, high, range: [low, high], spread: high - low };
  });
}

export function getRangeAreaDomain(data: readonly RangeAreaDatum[]): readonly [number, number] {
  const values = data.flatMap(({ low, high }) => [low, high]).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!values.length) return [0, 1];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum === maximum) return [minimum - 1, maximum + 1];
  const padding = (maximum - minimum) * 0.1;
  const step = Math.max(1, 10 ** Math.floor(Math.log10(maximum - minimum) - 1));
  return [Math.floor((minimum - padding) / step) * step, Math.ceil((maximum + padding) / step) * step];
}
