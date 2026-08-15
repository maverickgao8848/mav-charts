export type SimpleColumnDatum = {
  label: string;
  value: number | null;
  detail?: string;
};

export type SimpleColumnGeometryDatum = SimpleColumnDatum & {
  index: number;
  missing: boolean;
};

export function validateSimpleColumnData(data: readonly SimpleColumnDatum[]) {
  const errors: string[] = [];
  const labels = new Set<string>();
  data.forEach((datum, index) => {
    if (!datum.label.trim()) errors.push(`Datum ${index} requires a non-empty label.`);
    if (labels.has(datum.label)) errors.push(`Datum ${index} duplicates label ${datum.label}.`);
    labels.add(datum.label);
    if (datum.value !== null && (typeof datum.value !== "number" || !Number.isFinite(datum.value))) errors.push(`Datum ${index} contains a non-finite value.`);
  });
  return { valid: errors.length === 0, errors } as const;
}

export function buildSimpleColumnGeometry(data: readonly SimpleColumnDatum[]): readonly SimpleColumnGeometryDatum[] {
  return data.map((datum, index) => ({ ...datum, index, missing: datum.value === null }));
}

export function getSimpleColumnDomain(data: readonly SimpleColumnDatum[]): readonly [number, number] {
  const values = data.map(({ value }) => value).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!values.length) return [0, 1];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum >= 0) return [0, maximum === 0 ? 1 : maximum * 1.1];
  if (maximum <= 0) return [minimum * 1.1, 0];
  const padding = (maximum - minimum) * 0.08;
  return [minimum - padding, maximum + padding];
}

