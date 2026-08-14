export type MultiSeriesLineDatum = {
  label: string;
  value: number | null;
  comparison: number | null;
  detail?: string;
};

export type MultiSeriesKey = "value" | "comparison";
export type MultiSeriesLineSegment = {
  series: MultiSeriesKey;
  startIndex: number;
  endIndex: number;
  indices: readonly number[];
};
export type MultiSeriesLineGeometryDatum = MultiSeriesLineDatum & {
  index: number;
  missingValue: boolean;
  missingComparison: boolean;
  latestValue: boolean;
  latestComparison: boolean;
  valueLabelDy: number;
  comparisonLabelDy: number;
};

export function validateMultiSeriesLineData(
  data: readonly MultiSeriesLineDatum[],
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
      ) {
        errors.push(`Datum ${index} contains a non-finite ${key}.`);
      }
    }
  });
  return { valid: errors.length === 0, errors } as const;
}

export function getMultiSeriesLineDomain(
  data: readonly MultiSeriesLineDatum[],
): readonly [number, number] {
  const values = data
    .flatMap(({ value, comparison }) => [value, comparison])
    .filter(
      (entry): entry is number =>
        typeof entry === "number" && Number.isFinite(entry),
    );
  if (!values.length) return [0, 1];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum === maximum) {
    const span = Math.max(1, Math.abs(minimum) * 0.1);
    return [minimum - span, maximum + span];
  }
  const padding = (maximum - minimum) * 0.1;
  return [minimum - padding, maximum + padding];
}

export function buildMultiSeriesLineSegments(
  data: readonly MultiSeriesLineDatum[],
  series: MultiSeriesKey,
): readonly MultiSeriesLineSegment[] {
  const result: MultiSeriesLineSegment[] = [];
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

export function buildMultiSeriesLineGeometry(
  data: readonly MultiSeriesLineDatum[],
): readonly MultiSeriesLineGeometryDatum[] {
  let latestValue = -1;
  let latestComparison = -1;
  for (let index = data.length - 1; index >= 0; index--) {
    if (latestValue < 0 && data[index].value !== null) latestValue = index;
    if (latestComparison < 0 && data[index].comparison !== null)
      latestComparison = index;
  }
  const domain = getMultiSeriesLineDomain(data);
  const span = domain[1] - domain[0];
  const latestDatum = latestValue >= 0 ? data[latestValue] : undefined;
  const collide =
    latestValue >= 0 &&
    latestValue === latestComparison &&
    latestDatum?.value !== null &&
    latestDatum?.value !== undefined &&
    latestDatum.comparison !== null &&
    Math.abs(latestDatum.value - latestDatum.comparison) / span < 0.12;
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

export const mapMultiSeriesLineX = (
  index: number,
  count: number,
  range: readonly [number, number],
) =>
  count <= 1
    ? (range[0] + range[1]) / 2
    : range[0] + (index / (count - 1)) * (range[1] - range[0]);
export const mapMultiSeriesLineY = (
  value: number,
  domain: readonly [number, number],
  range: readonly [number, number],
) =>
  range[0] +
  ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]);
