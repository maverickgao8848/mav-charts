export type MultiSeriesAreaDatum = {
  label: string;
  value: number | null;
  comparison: number | null;
  detail?: string;
};
export type MultiSeriesAreaKey = "value" | "comparison";
export type MultiSeriesAreaSegment = {
  series: MultiSeriesAreaKey;
  startIndex: number;
  endIndex: number;
  indices: readonly number[];
};
export type MultiSeriesAreaGeometryDatum = MultiSeriesAreaDatum & {
  index: number;
  missingValue: boolean;
  missingComparison: boolean;
  latestValue: boolean;
  latestComparison: boolean;
  valueLabelDy: number;
  comparisonLabelDy: number;
};
export function validateMultiSeriesAreaData(
  data: readonly MultiSeriesAreaDatum[],
) {
  const errors: string[] = [];
  const labels = new Set<string>();
  data.forEach((datum, index) => {
    const label = datum.label.trim();
    if (!label) errors.push(`Datum ${index} requires a non-empty label.`);
    if (labels.has(label))
      errors.push(`Datum ${index} duplicates label ${datum.label}.`);
    labels.add(label);
    for (const key of ["value", "comparison"] as const) {
      const entry = datum[key];
      if (
        entry !== null &&
        (typeof entry !== "number" || !Number.isFinite(entry))
      )
        errors.push(`Datum ${index} contains a non-finite ${key}.`);
    }
  });
  return { valid: errors.length === 0, errors } as const;
}
export function getMultiSeriesAreaDomain(
  data: readonly MultiSeriesAreaDatum[],
): readonly [number, number] {
  const values = data
    .flatMap(({ value, comparison }) => [value, comparison])
    .filter(
      (entry): entry is number =>
        typeof entry === "number" && Number.isFinite(entry),
    );
  if (!values.length) return [0, 1];
  const minimum = Math.min(0, ...values),
    maximum = Math.max(0, ...values);
  if (minimum === 0 && maximum === 0) return [0, 1];
  if (minimum === 0) return [0, maximum * 1.1];
  if (maximum === 0) return [minimum * 1.1, 0];
  const span = maximum - minimum,
    padding = span * 0.1;
  return [minimum - padding, maximum + padding];
}
export function buildMultiSeriesAreaSegments(
  data: readonly MultiSeriesAreaDatum[],
  series: MultiSeriesAreaKey,
): readonly MultiSeriesAreaSegment[] {
  const result: MultiSeriesAreaSegment[] = [];
  let indices: number[] = [];
  const flush = () => {
    if (indices.length)
      result.push({
        series,
        startIndex: indices[0],
        endIndex: indices[indices.length - 1],
        indices,
      });
    indices = [];
  };
  data.forEach((datum, index) =>
    datum[series] === null ? flush() : indices.push(index),
  );
  flush();
  return result;
}
export function buildMultiSeriesAreaGeometry(
  data: readonly MultiSeriesAreaDatum[],
): readonly MultiSeriesAreaGeometryDatum[] {
  let latestValue = -1,
    latestComparison = -1;
  for (let index = data.length - 1; index >= 0; index--) {
    if (latestValue < 0 && data[index].value !== null) latestValue = index;
    if (latestComparison < 0 && data[index].comparison !== null)
      latestComparison = index;
  }
  const domain = getMultiSeriesAreaDomain(data),
    span = domain[1] - domain[0],
    latest = latestValue >= 0 ? data[latestValue] : undefined;
  const collide =
    latestValue === latestComparison &&
    latest?.value != null &&
    latest.comparison != null &&
    Math.abs(latest.value - latest.comparison) / span < 0.1;
  return data.map((datum, index) => ({
    ...datum,
    index,
    missingValue: datum.value === null,
    missingComparison: datum.comparison === null,
    latestValue: index === latestValue,
    latestComparison: index === latestComparison,
    valueLabelDy: collide ? -14 : -11,
    comparisonLabelDy: collide ? 19 : -11,
  }));
}
export const mapMultiSeriesAreaX = (
  index: number,
  count: number,
  range: readonly [number, number],
) =>
  count <= 1
    ? (range[0] + range[1]) / 2
    : range[0] + (index / (count - 1)) * (range[1] - range[0]);
export const mapMultiSeriesAreaY = (
  value: number,
  domain: readonly [number, number],
  range: readonly [number, number],
) =>
  range[0] +
  ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]);
