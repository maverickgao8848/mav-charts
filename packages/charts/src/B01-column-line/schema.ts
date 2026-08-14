export type ColumnLineDatum = {
  label: string;
  scaleValue: number | null;
  ratePercent: number | null;
  detail?: string;
};
export type ColumnLineGeometryDatum = ColumnLineDatum & {
  index: number;
  peakScale: boolean;
  latestRate: boolean;
};
export type ColumnLineDomains = {
  scale: readonly [number, number];
  rate: readonly [0, 100];
};

export function validateColumnLineData(data: readonly ColumnLineDatum[]) {
  const errors: string[] = [],
    labels = new Set<string>();
  data.forEach((datum, index) => {
    if (typeof datum.label !== "string" || !datum.label.trim())
      errors.push(`Datum ${index} requires a non-blank label.`);
    const key = datum.label.trim().toLocaleLowerCase();
    if (labels.has(key))
      errors.push(`Datum ${index} duplicates label ${datum.label}.`);
    labels.add(key);
    if (
      datum.scaleValue !== null &&
      (!Number.isFinite(datum.scaleValue) ||
        typeof datum.scaleValue !== "number")
    )
      errors.push(`Datum ${index} has an invalid scale value.`);
    if (
      datum.ratePercent !== null &&
      (!Number.isFinite(datum.ratePercent) ||
        typeof datum.ratePercent !== "number" ||
        datum.ratePercent < 0 ||
        datum.ratePercent > 100)
    )
      errors.push(`Datum ${index} rate must be within 0..100.`);
    if (datum.detail !== undefined && typeof datum.detail !== "string")
      errors.push(`Datum ${index} detail must be text.`);
  });
  return { valid: errors.length === 0, errors } as const;
}

export function getColumnLineDomains(
  data: readonly ColumnLineDatum[],
): ColumnLineDomains {
  const values = data
    .map(({ scaleValue }) => scaleValue)
    .filter(
      (value): value is number => value !== null && Number.isFinite(value),
    );
  if (!values.length) return { scale: [0, 1], rate: [0, 100] };
  const minimum = Math.min(...values),
    maximum = Math.max(...values);
  let scale: readonly [number, number];
  if (minimum >= 0) scale = [0, maximum === 0 ? 1 : maximum * 1.1];
  else if (maximum <= 0) scale = [minimum * 1.1, 0];
  else {
    const padding = (maximum - minimum) * 0.08;
    scale = [minimum - padding, maximum + padding];
  }
  return { scale, rate: [0, 100] };
}

export function buildColumnLineGeometry(
  data: readonly ColumnLineDatum[],
): ColumnLineGeometryDatum[] {
  const peak = data.reduce<number | null>(
    (current, datum, index) =>
      datum.scaleValue !== null &&
      (current === null ||
        datum.scaleValue > (data[current].scaleValue as number))
        ? index
        : current,
    null,
  );
  const latest = data.reduce<number | null>(
    (current, datum, index) => (datum.ratePercent !== null ? index : current),
    null,
  );
  return data.map((datum, index) => ({
    ...datum,
    index,
    peakScale: index === peak,
    latestRate: index === latest,
  }));
}

export function mapColumnLineScaleY(
  value: number,
  domain: readonly [number, number],
  range: readonly [number, number],
) {
  const ratio = (value - domain[0]) / (domain[1] - domain[0] || 1);
  return range[0] + ratio * (range[1] - range[0]);
}
export function mapColumnLineRateY(
  value: number,
  range: readonly [number, number],
) {
  return range[0] + (value / 100) * (range[1] - range[0]);
}
export function normalizeColumnRect(y: number, height: number) {
  return { y: Math.min(y, y + height), height: Math.abs(height) } as const;
}
