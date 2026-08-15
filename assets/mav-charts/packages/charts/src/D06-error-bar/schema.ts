export type ErrorBarDatum = {
  label: string;
  estimate: number | null;
  lower: number | null;
  upper: number | null;
  detail?: string;
  focus?: boolean;
};
export type ErrorBarGeometryDatum = Omit<
  ErrorBarDatum,
  "estimate" | "lower" | "upper"
> & {
  estimate: number;
  lower: number;
  upper: number;
  index: number;
  lowerError: number;
  upperError: number;
  errors: readonly [number, number];
  focused: boolean;
  labelDx: number;
  labelDy: number;
  labelAnchor: "start" | "end";
};

export function validateErrorBarData(data: readonly ErrorBarDatum[]) {
  const errors: string[] = [],
    labels = new Set<string>();
  data.forEach((datum, index) => {
    const label = datum.label.trim();
    if (!label) errors.push(`Datum ${index} requires a non-empty label.`);
    if (labels.has(label))
      errors.push(`Datum ${index} duplicates label ${datum.label}.`);
    labels.add(label);
    const values = [datum.estimate, datum.lower, datum.upper],
      allNull = values.every((v) => v === null),
      allFinite = values.every(
        (v) => typeof v === "number" && Number.isFinite(v),
      );
    if (!allNull && !allFinite)
      errors.push(
        `Datum ${index} must provide estimate, lower, and upper as all finite or all null.`,
      );
    if (
      allFinite &&
      !(datum.lower! <= datum.estimate! && datum.estimate! <= datum.upper!)
    )
      errors.push(`Datum ${index} must satisfy lower <= estimate <= upper.`);
  });
  return { valid: errors.length === 0, errors } as const;
}
const paddedDomain = (values: readonly number[]): readonly [number, number] => {
  if (!values.length) return [0, 1];
  const min = Math.min(...values),
    max = Math.max(...values);
  if (min === max) {
    const span = Math.max(1, Math.abs(min) * 0.1);
    return [min - span, max + span];
  }
  const pad = (max - min) * 0.1;
  return [min - pad, max + pad];
};
export function getErrorBarDomain(
  data: readonly ErrorBarDatum[],
): readonly [number, number] {
  return paddedDomain(
    data
      .flatMap((d) => [d.lower, d.upper])
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v)),
  );
}
export function buildErrorBarGeometry(
  data: readonly ErrorBarDatum[],
): readonly ErrorBarGeometryDatum[] {
  const complete = data
      .map((d, index) => ({ d, index }))
      .filter(
        (
          entry,
        ): entry is {
          d: ErrorBarDatum & { estimate: number; lower: number; upper: number };
          index: number;
        } =>
          typeof entry.d.estimate === "number" &&
          Number.isFinite(entry.d.estimate) &&
          typeof entry.d.lower === "number" &&
          Number.isFinite(entry.d.lower) &&
          typeof entry.d.upper === "number" &&
          Number.isFinite(entry.d.upper),
      ),
    explicitFocus = complete.some(({ d }) => d.focus === true);
  return complete.map(({ d, index }, visibleIndex) => {
    const nearRight = index >= Math.max(0, data.length - 2);
    return {
      ...d,
      index,
      lowerError: d.estimate - d.lower,
      upperError: d.upper - d.estimate,
      errors: [d.estimate - d.lower, d.upper - d.estimate] as const,
      focused: d.focus === true || (!explicitFocus && visibleIndex === 0),
      labelDx: nearRight ? -9 : 9,
      labelDy: -11,
      labelAnchor: nearRight ? "end" : "start",
    };
  });
}
export const getErrorBarXDomain = (count: number): readonly [number, number] =>
  count <= 1 ? [-0.5, 0.5] : [-0.25, count - 0.75];
export const mapErrorBarX = (
  index: number,
  domain: readonly [number, number],
  range: readonly [number, number],
) =>
  range[0] +
  ((index - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]);
export const mapErrorBarY = (
  value: number,
  domain: readonly [number, number],
  range: readonly [number, number],
) =>
  range[0] +
  ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]);
