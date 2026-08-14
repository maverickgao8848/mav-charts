export type ColumnTargetDatum = {
  label: string;
  actual: number | null;
  target: number | null;
  detail?: string;
};
export type ColumnTargetGeometryDatum = ColumnTargetDatum & {
  index: number;
  delta: number | null;
  absoluteDelta: number | null;
  focus: boolean;
};
export type ColumnTargetDomain = readonly [number, number];

export function validateColumnTargetData(data: readonly ColumnTargetDatum[]) {
  const errors: string[] = [],
    labels = new Set<string>();
  data.forEach((datum, index) => {
    if (typeof datum.label !== "string" || !datum.label.trim())
      errors.push(`Datum ${index} requires a non-blank label.`);
    const key = datum.label.trim().toLocaleLowerCase();
    if (labels.has(key))
      errors.push(`Datum ${index} duplicates label ${datum.label}.`);
    labels.add(key);
    for (const field of ["actual", "target"] as const)
      if (
        datum[field] !== null &&
        (typeof datum[field] !== "number" || !Number.isFinite(datum[field]))
      )
        errors.push(`Datum ${index} has an invalid ${field}.`);
    if (datum.detail !== undefined && typeof datum.detail !== "string")
      errors.push(`Datum ${index} detail must be text.`);
  });
  return { valid: errors.length === 0, errors } as const;
}

export function getColumnTargetDomain(
  data: readonly ColumnTargetDatum[],
): ColumnTargetDomain {
  const values = data
    .flatMap(({ actual, target }) => [actual, target])
    .filter(
      (value): value is number => value !== null && Number.isFinite(value),
    );
  if (!values.length) return [0, 1];
  const minimum = Math.min(...values),
    maximum = Math.max(...values);
  if (minimum >= 0) return [0, maximum === 0 ? 1 : maximum * 1.1];
  if (maximum <= 0) return [minimum * 1.1, 0];
  const padding = (maximum - minimum) * 0.08;
  return [minimum - padding, maximum + padding];
}

export function buildColumnTargetGeometry(
  data: readonly ColumnTargetDatum[],
): ColumnTargetGeometryDatum[] {
  const deltas = data.map(({ actual, target }) =>
    actual === null || target === null ? null : actual - target,
  );
  const largest = Math.max(
    -Infinity,
    ...deltas.filter((delta): delta is number => delta !== null).map(Math.abs),
  );
  const focusIndex =
    largest > 0
      ? deltas.findIndex(
          (delta) => delta !== null && Math.abs(delta) === largest,
        )
      : -1;
  return data.map((datum, index) => ({
    ...datum,
    index,
    delta: deltas[index],
    absoluteDelta: deltas[index] === null ? null : Math.abs(deltas[index]!),
    focus: index === focusIndex,
  }));
}

export function mapColumnTargetY(
  value: number,
  domain: ColumnTargetDomain,
  range: readonly [number, number],
) {
  const ratio = (value - domain[0]) / (domain[1] - domain[0] || 1);
  return range[0] + ratio * (range[1] - range[0]);
}
export function normalizeColumnTargetRect(y: number, height: number) {
  return { y: Math.min(y, y + height), height: Math.abs(height) } as const;
}
