export type StackedAreaDatum = {
  label: string;
  value: number | null;
  comparison: number | null;
  detail?: string;
};
export type StackedAreaGeometryDatum = StackedAreaDatum & {
  index: number;
  missingWhole: boolean;
  chartValue: number | null;
  chartComparison: number | null;
  valueStart: number | null;
  valueEnd: number | null;
  comparisonStart: number | null;
  comparisonEnd: number | null;
  total: number | null;
  latestComplete: boolean;
};
export type StackedAreaSegment = {
  startIndex: number;
  endIndex: number;
  indices: readonly number[];
};
export function validateStackedAreaData(data: readonly StackedAreaDatum[]) {
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
      if (typeof entry === "number" && entry < 0)
        errors.push(`Datum ${index} contains a negative ${key}.`);
    }
  });
  return { valid: errors.length === 0, errors } as const;
}
export function buildStackedAreaGeometry(
  data: readonly StackedAreaDatum[],
): readonly StackedAreaGeometryDatum[] {
  let latest = -1;
  for (let i = data.length - 1; i >= 0; i--)
    if (data[i].value !== null && data[i].comparison !== null) {
      latest = i;
      break;
    }
  return data.map((datum, index) => {
    const complete = datum.value !== null && datum.comparison !== null,
      total = complete ? datum.value! + datum.comparison! : null;
    return {
      ...datum,
      index,
      missingWhole: !complete,
      chartValue: complete ? datum.value : null,
      chartComparison: complete ? datum.comparison : null,
      valueStart: complete ? 0 : null,
      valueEnd: complete ? datum.value : null,
      comparisonStart: complete ? datum.value : null,
      comparisonEnd: total,
      total,
      latestComplete: index === latest,
    };
  });
}
export function buildStackedAreaSegments(
  data: readonly StackedAreaDatum[],
): readonly StackedAreaSegment[] {
  const result: StackedAreaSegment[] = [];
  let indices: number[] = [];
  const flush = () => {
    if (indices.length)
      result.push({
        startIndex: indices[0],
        endIndex: indices[indices.length - 1],
        indices,
      });
    indices = [];
  };
  data.forEach((d, i) =>
    d.value === null || d.comparison === null ? flush() : indices.push(i),
  );
  flush();
  return result;
}
export function getStackedAreaDomain(
  data: readonly StackedAreaDatum[],
): readonly [number, number] {
  const totals = data
    .flatMap((d) =>
      d.value !== null && d.comparison !== null ? [d.value + d.comparison] : [],
    )
    .filter(Number.isFinite);
  const max = Math.max(0, ...totals);
  return [0, max > 0 ? max * 1.1 : 1];
}
export const mapStackedAreaX = (
  index: number,
  count: number,
  range: readonly [number, number],
) =>
  count <= 1
    ? (range[0] + range[1]) / 2
    : range[0] + (index / (count - 1)) * (range[1] - range[0]);
export const mapStackedAreaY = (
  value: number,
  domain: readonly [number, number],
  range: readonly [number, number],
) =>
  range[0] +
  ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]);
