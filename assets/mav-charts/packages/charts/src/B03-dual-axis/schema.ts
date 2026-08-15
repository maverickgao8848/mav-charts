export type DualAxisDatum = {
  label: string;
  barValue: number | null;
  lineValue: number | null;
  detail?: string;
};

export type DualAxisGeometryDatum = DualAxisDatum & { index: number };

export type DualAxisDomains = {
  bar: readonly [number, number];
  line: readonly [number, number];
};

export function validateDualAxisData(data: readonly DualAxisDatum[]) {
  const errors: string[] = [];
  const labels = new Set<string>();
  data.forEach((datum, index) => {
    if (!datum.label.trim()) errors.push(`Datum ${index} requires a non-empty label.`);
    if (labels.has(datum.label)) errors.push(`Datum ${index} duplicates label ${datum.label}.`);
    labels.add(datum.label);
    for (const key of ["barValue", "lineValue"] as const) {
      if (datum[key] !== null && (typeof datum[key] !== "number" || !Number.isFinite(datum[key]))) errors.push(`Datum ${index} contains a non-finite ${key}.`);
    }
  });
  return { valid: errors.length === 0, errors } as const;
}

export function buildDualAxisGeometry(data: readonly DualAxisDatum[]): readonly DualAxisGeometryDatum[] {
  return data.map((datum, index) => ({ ...datum, index }));
}

const lineDomain = (values: readonly number[]): readonly [number, number] => {
  if (!values.length) return [0, 1];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum === maximum) {
    const padding = Math.max(1, Math.abs(minimum) * 0.1);
    return [minimum - padding, maximum + padding];
  }
  const padding = (maximum - minimum) * 0.1;
  return [minimum - padding, maximum + padding];
};

const barDomain = (values: readonly number[]): readonly [number, number] => {
  if (!values.length) return [0, 1];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum >= 0) return [0, maximum === 0 ? 1 : maximum * 1.1];
  if (maximum <= 0) return [minimum * 1.1, 0];
  const padding = (maximum - minimum) * 0.08;
  return [minimum - padding, maximum + padding];
};

export function getDualAxisDomains(data: readonly DualAxisDatum[]): DualAxisDomains {
  const bars = data.map(({ barValue }) => barValue).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const lines = data.map(({ lineValue }) => lineValue).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return { bar: barDomain(bars), line: lineDomain(lines) };
}

