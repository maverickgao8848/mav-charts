export type DonutDatum = {
  label: string;
  value: number | null;
  detail?: string;
};
export type DonutGeometryDatum = DonutDatum & {
  index: number;
  missing: boolean;
  zero: boolean;
  renderable: boolean;
  share: number | null;
  focus: boolean;
};

export function validateDonutData(data: readonly DonutDatum[]) {
  const errors: string[] = [],
    labels = new Set<string>();
  data.forEach((datum, index) => {
    const label = datum.label.trim(),
      key = label.toLocaleLowerCase();
    if (!label) errors.push(`Slice ${index} requires a non-empty label.`);
    if (labels.has(key))
      errors.push(`Slice ${index} duplicates label ${datum.label}.`);
    labels.add(key);
    if (
      datum.value !== null &&
      (!Number.isFinite(datum.value) || datum.value < 0)
    )
      errors.push(
        `Slice ${index} value must be finite, non-negative, or null.`,
      );
  });
  if (
    data.length > 0 &&
    !data.some((datum) => datum.value !== null && datum.value > 0)
  )
    errors.push("Donut data requires a positive reported total.");
  return { valid: errors.length === 0, errors } as const;
}

export function buildDonutGeometry(data: readonly DonutDatum[]) {
  const total = data.reduce(
      (sum, datum) =>
        sum + (datum.value !== null && datum.value > 0 ? datum.value : 0),
      0,
    ),
    focusIndex = data.findIndex(
      (datum) => datum.value !== null && datum.value > 0,
    ),
    geometry = data.map((datum, index): DonutGeometryDatum => ({
      ...datum,
      index,
      missing: datum.value === null,
      zero: datum.value === 0,
      renderable: datum.value !== null && datum.value > 0,
      share:
        datum.value !== null && datum.value > 0 && total > 0
          ? datum.value / total
          : null,
      focus: index === focusIndex,
    }));
  return {
    geometry,
    total,
    renderable: geometry.filter((datum) => datum.renderable),
    focus: focusIndex < 0 ? null : geometry[focusIndex],
  } as const;
}

export const getDonutAngle = (value: number, total: number) =>
  total > 0 ? (value / total) * 360 : 0;
