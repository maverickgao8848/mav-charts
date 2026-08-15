export type GroupedBarDatum = { label: string; value: number | null; comparison: number | null; detail?: string };

export type GroupedBarGeometryDatum = GroupedBarDatum & {
  index: number;
  missingValue: boolean;
  missingComparison: boolean;
  focus: boolean;
};

export type GroupedBarSlots = { groupHeight: number; barHeight: number; gap: number; offsets: readonly number[] };

export function validateGroupedBarData(data: readonly GroupedBarDatum[]) {
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

export const buildGroupedBarGeometry = (data: readonly GroupedBarDatum[]): readonly GroupedBarGeometryDatum[] =>
  data.map((datum, index) => ({ ...datum, index, missingValue: datum.value === null, missingComparison: datum.comparison === null, focus: index === 0 }));

export function getGroupedBarDomain(data: readonly GroupedBarDatum[]): readonly [number, number] {
  const values = data.flatMap(({ value, comparison }) => [value, comparison]).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!values.length) return [0, 1];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum >= 0) return [0, maximum === 0 ? 1 : maximum * 1.12];
  if (maximum <= 0) return [minimum * 1.12, 0];
  const padding = (maximum - minimum) * 0.08;
  return [minimum - padding, maximum + padding];
}

export function getGroupedBarSlots(groupHeight: number, seriesCount = 2, gapRatio = 0.12): GroupedBarSlots {
  const safeHeight = Number.isFinite(groupHeight) ? Math.max(0, groupHeight) : 0;
  const count = Number.isInteger(seriesCount) ? Math.max(1, seriesCount) : 1;
  const safeRatio = Number.isFinite(gapRatio) ? Math.max(0, Math.min(gapRatio, 0.5)) : 0;
  const gap = count === 1 ? 0 : safeHeight * safeRatio / (count - 1);
  const barHeight = Math.max(0, (safeHeight - gap * (count - 1)) / count);
  return { groupHeight: safeHeight, barHeight, gap, offsets: Array.from({ length: count }, (_, index) => index * (barHeight + gap)) };
}

export const mapGroupedBarX = (value: number, domain: readonly [number, number], range: readonly [number, number]) => {
  const [minimum, maximum] = domain;
  if (maximum === minimum) return range[0];
  return range[0] + ((value - minimum) / (maximum - minimum)) * (range[1] - range[0]);
};

export const getGroupedBarLength = (value: number, domain: readonly [number, number], range: readonly [number, number]) =>
  Math.abs(mapGroupedBarX(value, domain, range) - mapGroupedBarX(0, domain, range));
