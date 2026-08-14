export type BrushTimeSeriesDatum = {
  label: string;
  value: number | null;
  detail?: string;
};

export type BrushTimeSeriesGeometryDatum = Omit<BrushTimeSeriesDatum, "value"> & {
  value: number;
  index: number;
};

export function validateBrushTimeSeriesData(data: readonly BrushTimeSeriesDatum[]) {
  const errors: string[] = [];
  data.forEach((datum, index) => {
    if (!datum.label.trim()) errors.push(`Datum ${index} requires a non-empty label.`);
    if (typeof datum.value !== "number" || !Number.isFinite(datum.value)) {
      errors.push(`Datum ${index} contains a missing or non-finite value.`);
    }
  });
  return { valid: errors.length === 0, errors } as const;
}

export function buildBrushTimeSeriesGeometry(data: readonly BrushTimeSeriesDatum[]): readonly BrushTimeSeriesGeometryDatum[] {
  return data.map((datum, index) => ({
    ...datum,
    value: typeof datum.value === "number" && Number.isFinite(datum.value) ? datum.value : 0,
    index,
  }));
}

export function getBrushTimeSeriesDomain(data: readonly BrushTimeSeriesDatum[]): readonly [number, number] {
  const values = data.map(({ value }) => value).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!values.length) return [0, 1];
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(0, ...values);
  if (minimum === maximum) return [minimum - 1, maximum + 1];
  const padding = (maximum - minimum) * 0.08;
  return [minimum < 0 ? minimum - padding : 0, maximum + padding];
}

