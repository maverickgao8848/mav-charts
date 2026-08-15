export type GroupedColumnDatum = {
  label: string;
  value: number | null;
  comparison: number | null;
  detail?: string;
};

export type GroupedColumnGeometryDatum = GroupedColumnDatum & {
  index: number;
  missingValue: boolean;
  missingComparison: boolean;
  focus: boolean;
};

export type GroupedColumnSlots = {
  groupWidth: number;
  barWidth: number;
  gap: number;
  offsets: readonly number[];
};

export function validateGroupedColumnData(data: readonly GroupedColumnDatum[]) {
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

export function buildGroupedColumnGeometry(data: readonly GroupedColumnDatum[]): readonly GroupedColumnGeometryDatum[] {
  return data.map((datum, index) => ({ ...datum, index, missingValue: datum.value === null, missingComparison: datum.comparison === null, focus: index === 0 }));
}

export function getGroupedColumnDomain(data: readonly GroupedColumnDatum[]): readonly [number, number] {
  const values = data.flatMap(({ value, comparison }) => [value, comparison]).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!values.length) return [0, 1];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum >= 0) return [0, maximum === 0 ? 1 : maximum * 1.12];
  if (maximum <= 0) return [minimum * 1.12, 0];
  const padding = (maximum - minimum) * 0.08;
  return [minimum - padding, maximum + padding];
}

export function getGroupedColumnSlots(groupWidth: number, seriesCount = 2, gapRatio = 0.1): GroupedColumnSlots {
  const safeWidth = Number.isFinite(groupWidth) ? Math.max(0, groupWidth) : 0;
  const count = Number.isInteger(seriesCount) ? Math.max(1, seriesCount) : 1;
  const safeRatio = Number.isFinite(gapRatio) ? Math.max(0, Math.min(gapRatio, 0.5)) : 0;
  const gap = count === 1 ? 0 : safeWidth * safeRatio / (count - 1);
  const barWidth = Math.max(0, (safeWidth - gap * (count - 1)) / count);
  const offsets = Array.from({ length: count }, (_, index) => index * (barWidth + gap));
  return { groupWidth: safeWidth, barWidth, gap, offsets };
}
