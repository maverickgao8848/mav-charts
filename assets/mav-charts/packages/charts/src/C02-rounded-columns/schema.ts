export type RoundedColumnDatum = {
  label: string;
  value: number | null;
  detail?: string;
};

export type RoundedColumnGeometryDatum = RoundedColumnDatum & {
  index: number;
  missing: boolean;
  focus: boolean;
};

export function validateRoundedColumnData(data: readonly RoundedColumnDatum[]) {
  const errors: string[] = [];
  const labels = new Set<string>();
  data.forEach((datum, index) => {
    const label = datum.label.trim();
    if (!label) errors.push(`Datum ${index} requires a non-empty label.`);
    if (labels.has(label)) errors.push(`Datum ${index} duplicates label ${datum.label}.`);
    labels.add(label);
    if (datum.value !== null && (typeof datum.value !== "number" || !Number.isFinite(datum.value))) {
      errors.push(`Datum ${index} contains a non-finite value.`);
    }
  });
  return { valid: errors.length === 0, errors } as const;
}

export function buildRoundedColumnGeometry(data: readonly RoundedColumnDatum[]): readonly RoundedColumnGeometryDatum[] {
  const focusIndex = data.findIndex(({ value }) => value !== null && value !== 0);
  return data.map((datum, index) => ({ ...datum, index, missing: datum.value === null, focus: index === focusIndex }));
}

export function getRoundedColumnDomain(data: readonly RoundedColumnDatum[]): readonly [number, number] {
  const values = data.map(({ value }) => value).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!values.length) return [0, 1];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum >= 0) return [0, maximum === 0 ? 1 : maximum * 1.12];
  if (maximum <= 0) return [minimum * 1.12, 0];
  const padding = (maximum - minimum) * 0.08;
  return [minimum - padding, maximum + padding];
}

export function getControlledColumnRadius(width: number, height: number, requestedRadius: number): number {
  if (![width, height, requestedRadius].every(Number.isFinite)) return 0;
  return Math.max(0, Math.min(Math.max(0, requestedRadius), Math.abs(width) / 2, Math.abs(height) / 2));
}
