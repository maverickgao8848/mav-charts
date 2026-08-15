export type ValueDotLineDatum = {
  label: string;
  value: number | null;
  detail?: string;
};

export type ValueDotLabelLane = -1 | 1;
export type ValueDotLabelAnchor = "start" | "middle" | "end";
export type ValueDotLineGeometryDatum = ValueDotLineDatum & {
  index: number;
  missing: boolean;
  labelLane: ValueDotLabelLane;
  labelAnchor: ValueDotLabelAnchor;
};
export type ValueDotLineSegment = {
  startIndex: number;
  endIndex: number;
  indices: readonly number[];
};

export function validateValueDotLineData(data: readonly ValueDotLineDatum[]) {
  const errors: string[] = [];
  const labels = new Set<string>();
  data.forEach((datum, index) => {
    const label = datum.label.trim();
    if (!label) errors.push(`Datum ${index} requires a non-empty label.`);
    if (labels.has(label)) errors.push(`Datum ${index} duplicates label ${datum.label}.`);
    labels.add(label);
    if (datum.value !== null && !Number.isFinite(datum.value))
      errors.push(`Datum ${index} contains a non-finite value.`);
  });
  return { valid: errors.length === 0, errors } as const;
}

export function getValueDotLineDomain(
  data: readonly ValueDotLineDatum[],
): readonly [number, number] {
  const values = data
    .map(({ value }) => value)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!values.length) return [0, 1];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum === maximum) {
    const span = Math.max(1, Math.abs(minimum) * 0.1);
    return [minimum - span, maximum + span];
  }
  const padding = (maximum - minimum) * 0.14;
  return [minimum - padding, maximum + padding];
}

export function buildValueDotLineGeometry(
  data: readonly ValueDotLineDatum[],
): readonly ValueDotLineGeometryDatum[] {
  const domain = getValueDotLineDomain(data);
  const span = domain[1] - domain[0];
  let collisionRun = 0;
  return data.map((datum, index) => {
    const previous = index > 0 ? data[index - 1].value : null;
    const nearPrevious =
      datum.value !== null &&
      previous !== null &&
      Math.abs(datum.value - previous) / span < 0.13;
    collisionRun = nearPrevious ? collisionRun + 1 : 0;
    const normalized = datum.value === null ? 0.5 : (datum.value - domain[0]) / span;
    const labelLane: ValueDotLabelLane =
      normalized > 0.82 ? 1 : normalized < 0.18 ? -1 : collisionRun % 2 === 1 ? 1 : -1;
    return {
      ...datum,
      index,
      missing: datum.value === null,
      labelLane,
      labelAnchor: index === 0 ? "start" : index === data.length - 1 ? "end" : "middle",
    };
  });
}

export function buildValueDotLineSegments(
  data: readonly ValueDotLineDatum[],
): readonly ValueDotLineSegment[] {
  const result: ValueDotLineSegment[] = [];
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
  data.forEach((datum, index) => (datum.value === null ? flush() : indices.push(index)));
  flush();
  return result;
}

export const mapValueDotLineX = (
  index: number,
  count: number,
  range: readonly [number, number],
) =>
  count <= 1
    ? (range[0] + range[1]) / 2
    : range[0] + (index / (count - 1)) * (range[1] - range[0]);

export const mapValueDotLineY = (
  value: number,
  domain: readonly [number, number],
  range: readonly [number, number],
) => range[0] + ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]);
