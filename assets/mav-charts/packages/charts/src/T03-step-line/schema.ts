export type StepLineDatum = {
  label: string;
  value: number | null;
  detail?: string;
};
export type StepLineGeometryDatum = StepLineDatum & {
  index: number;
  missing: boolean;
  latestValid: boolean;
};
export type StepLineSegment = {
  startIndex: number;
  endIndex: number;
  indices: readonly number[];
};
export type StepLinePoint = {
  x: number;
  y: number;
  index: number;
  value: number;
};

export function validateStepLineData(data: readonly StepLineDatum[]) {
  const errors: string[] = [];
  const labels = new Set<string>();
  data.forEach((datum, index) => {
    const label = datum.label.trim();
    if (!label) errors.push(`Datum ${index} requires a non-empty label.`);
    if (labels.has(label))
      errors.push(`Datum ${index} duplicates label ${datum.label}.`);
    labels.add(label);
    if (
      datum.value !== null &&
      (typeof datum.value !== "number" || !Number.isFinite(datum.value))
    )
      errors.push(`Datum ${index} contains a non-finite value.`);
  });
  return { valid: errors.length === 0, errors } as const;
}

export function buildStepLineGeometry(
  data: readonly StepLineDatum[],
): readonly StepLineGeometryDatum[] {
  let latest = -1;
  for (let index = data.length - 1; index >= 0; index--)
    if (data[index].value !== null) {
      latest = index;
      break;
    }
  return data.map((datum, index) => ({
    ...datum,
    index,
    missing: datum.value === null,
    latestValid: index === latest,
  }));
}

export function buildStepLineSegments(
  data: readonly StepLineDatum[],
): readonly StepLineSegment[] {
  const result: StepLineSegment[] = [];
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
  data.forEach((datum, index) =>
    datum.value === null ? flush() : indices.push(index),
  );
  flush();
  return result;
}

export function getStepLineDomain(
  data: readonly StepLineDatum[],
): readonly [number, number] {
  const values = data
    .map(({ value }) => value)
    .filter(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value),
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

export const mapStepLineX = (
  index: number,
  count: number,
  range: readonly [number, number],
) =>
  count <= 1
    ? (range[0] + range[1]) / 2
    : range[0] + (index / (count - 1)) * (range[1] - range[0]);
export const mapStepLineY = (
  value: number,
  domain: readonly [number, number],
  range: readonly [number, number],
) =>
  range[0] +
  ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]);

/** Ying-compatible stepAfter geometry: retain the old y until the next x, then jump vertically. */
export function buildStepAfterPath(points: readonly StepLinePoint[]): string {
  return points
    .map((point, index) =>
      index === 0 ? `M${point.x} ${point.y}` : `H${point.x} V${point.y}`,
    )
    .join(" ");
}

export function buildStepAfterPaths(
  data: readonly StepLineDatum[],
  xRange: readonly [number, number],
  yRange: readonly [number, number],
): readonly string[] {
  const domain = getStepLineDomain(data);
  return buildStepLineSegments(data).map(({ indices }) =>
    buildStepAfterPath(
      indices.map((index) => ({
        index,
        value: data[index].value as number,
        x: mapStepLineX(index, data.length, xRange),
        y: mapStepLineY(data[index].value as number, domain, yRange),
      })),
    ),
  );
}
