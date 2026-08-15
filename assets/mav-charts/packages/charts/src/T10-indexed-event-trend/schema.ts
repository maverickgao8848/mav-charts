export type IndexedEventDatum = {
  label: string;
  value: number | null;
  comparison: number | null;
  event?: string;
  detail?: string;
};
export type IndexedSeriesKey = "value" | "comparison";
export type IndexedEventGeometryDatum = IndexedEventDatum & {
  index: number;
  eventLabel: string | null;
  latestValue: boolean;
  latestComparison: boolean;
  valueLabelDy: number;
  comparisonLabelDy: number;
};
export type IndexedEventMarker = {
  index: number;
  label: string;
  category: string;
};

export function validateIndexedEventData(data: readonly IndexedEventDatum[]) {
  const errors: string[] = [],
    labels = new Set<string>();
  data.forEach((datum, index) => {
    const label = datum.label.trim();
    if (!label) errors.push(`Datum ${index} requires a non-empty label.`);
    if (labels.has(label))
      errors.push(`Datum ${index} duplicates label ${datum.label}.`);
    labels.add(label);
    for (const key of ["value", "comparison"] as const) {
      const value = datum[key];
      if (
        value !== null &&
        (typeof value !== "number" || !Number.isFinite(value))
      )
        errors.push(`Datum ${index} contains a non-finite ${key}.`);
    }
    if (datum.event !== undefined && !datum.event.trim())
      errors.push(`Datum ${index} has a blank event.`);
  });
  return { valid: errors.length === 0, errors } as const;
}

export function getIndexedEventDomain(
  data: readonly IndexedEventDatum[],
): readonly [number, number] {
  const values = [
    100,
    ...data
      .flatMap(({ value, comparison }) => [value, comparison])
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v)),
  ];
  const min = Math.min(...values),
    max = Math.max(...values);
  if (min === max) return [min - 5, max + 5];
  const padding = (max - min) * 0.1;
  return [min - padding, max + padding];
}

export function buildIndexedEventSegments(
  data: readonly IndexedEventDatum[],
  series: IndexedSeriesKey,
) {
  const result: number[][] = [];
  let current: number[] = [];
  const flush = () => {
    if (current.length) result.push(current);
    current = [];
  };
  data.forEach((datum, index) =>
    datum[series] === null ? flush() : current.push(index),
  );
  flush();
  return result;
}

export function buildIndexedEventGeometry(
  data: readonly IndexedEventDatum[],
): readonly IndexedEventGeometryDatum[] {
  let latestValue = -1,
    latestComparison = -1;
  for (let i = data.length - 1; i >= 0; i--) {
    if (latestValue < 0 && data[i].value !== null) latestValue = i;
    if (latestComparison < 0 && data[i].comparison !== null)
      latestComparison = i;
  }
  const [min, max] = getIndexedEventDomain(data),
    span = max - min;
  const multipleEvents = data.filter((datum) => datum.event?.trim()).length > 1;
  const sameLatest = latestValue >= 0 && latestValue === latestComparison;
  const collide =
    sameLatest &&
    data[latestValue].value !== null &&
    data[latestValue].comparison !== null &&
    Math.abs(data[latestValue].value! - data[latestValue].comparison!) / span <
      0.13;
  return data.map((datum, index) => ({
    ...datum,
    index,
    eventLabel: datum.event?.trim() || null,
    latestValue: index === latestValue,
    latestComparison: index === latestComparison,
    valueLabelDy: multipleEvents ? 22 : collide ? -15 : -11,
    comparisonLabelDy: collide ? 20 : -11,
  }));
}

export function getIndexedEventMarkers(
  data: readonly IndexedEventDatum[],
): readonly IndexedEventMarker[] {
  return data.flatMap((datum, index) =>
    datum.event?.trim()
      ? [{ index, label: datum.event.trim(), category: datum.label }]
      : [],
  );
}
export const mapIndexedEventX = (
  index: number,
  count: number,
  range: readonly [number, number],
) =>
  count <= 1
    ? (range[0] + range[1]) / 2
    : range[0] + (index / (count - 1)) * (range[1] - range[0]);
export const mapIndexedEventY = (
  value: number,
  domain: readonly [number, number],
  range: readonly [number, number],
) =>
  range[0] +
  ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]);
