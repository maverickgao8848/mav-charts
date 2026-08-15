export type QuadrantScatterDatum = {
  label: string;
  x: number | null;
  y: number | null;
  detail?: string;
  focus?: boolean;
};
export type QuadrantScatterThresholds = { x: number; y: number };
export type QuadrantName =
  "upper-right" | "upper-left" | "lower-left" | "lower-right" | "boundary";
export type QuadrantScatterGeometryDatum = Omit<
  QuadrantScatterDatum,
  "x" | "y"
> & {
  x: number;
  y: number;
  index: number;
  quadrant: QuadrantName;
  labelDx: number;
  labelDy: number;
  labelAnchor: "start" | "end";
  focused: boolean;
};

export function validateQuadrantScatterThresholds(
  thresholds: QuadrantScatterThresholds,
) {
  const errors: string[] = [];
  if (!Number.isFinite(thresholds.x)) errors.push("thresholdX must be finite.");
  if (!Number.isFinite(thresholds.y)) errors.push("thresholdY must be finite.");
  return { valid: errors.length === 0, errors } as const;
}
export function validateQuadrantScatterData(
  data: readonly QuadrantScatterDatum[],
) {
  const errors: string[] = [],
    labels = new Set<string>();
  data.forEach((datum, index) => {
    const label = datum.label.trim();
    if (!label) errors.push(`Datum ${index} requires a non-empty label.`);
    if (labels.has(label))
      errors.push(`Datum ${index} duplicates label ${datum.label}.`);
    labels.add(label);
    for (const key of ["x", "y"] as const) {
      const value = datum[key];
      if (
        value !== null &&
        (typeof value !== "number" || !Number.isFinite(value))
      )
        errors.push(`Datum ${index} contains a non-finite ${key}.`);
    }
  });
  return { valid: errors.length === 0, errors } as const;
}
export function classifyQuadrant(
  x: number,
  y: number,
  thresholds: QuadrantScatterThresholds,
): QuadrantName {
  if (x === thresholds.x || y === thresholds.y) return "boundary";
  if (x > thresholds.x && y > thresholds.y) return "upper-right";
  if (x < thresholds.x && y > thresholds.y) return "upper-left";
  if (x < thresholds.x && y < thresholds.y) return "lower-left";
  return "lower-right";
}
const paddedDomain = (values: readonly number[]): readonly [number, number] => {
  const min = Math.min(...values),
    max = Math.max(...values);
  if (min === max) {
    const span = Math.max(1, Math.abs(min) * 0.1);
    return [min - span, max + span];
  }
  const pad = (max - min) * 0.1;
  return [min - pad, max + pad];
};
export function getQuadrantScatterDomains(
  data: readonly QuadrantScatterDatum[],
  thresholds: QuadrantScatterThresholds,
): { x: readonly [number, number]; y: readonly [number, number] } {
  const xs = data
      .map((d) => d.x)
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v)),
    ys = data
      .map((d) => d.y)
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  return {
    x: paddedDomain([...xs, thresholds.x]),
    y: paddedDomain([...ys, thresholds.y]),
  };
}
export function buildQuadrantScatterGeometry(
  data: readonly QuadrantScatterDatum[],
  thresholds: QuadrantScatterThresholds,
): readonly QuadrantScatterGeometryDatum[] {
  const valid = data
      .map((d, index) => ({ d, index }))
      .filter(
        (
          entry,
        ): entry is {
          d: QuadrantScatterDatum & { x: number; y: number };
          index: number;
        } =>
          typeof entry.d.x === "number" &&
          Number.isFinite(entry.d.x) &&
          typeof entry.d.y === "number" &&
          Number.isFinite(entry.d.y),
      ),
    domains = getQuadrantScatterDomains(data, thresholds);
  return valid.map(({ d, index }, geometryIndex) => {
    const collisions = valid
        .slice(0, geometryIndex)
        .filter(
          (p) => Math.abs(p.d.x - d.x) <= 2 && Math.abs(p.d.y - d.y) <= 2,
        ).length,
      band = collisions % 4,
      xRatio = (d.x - domains.x[0]) / (domains.x[1] - domains.x[0]),
      yRatio = (d.y - domains.y[0]) / (domains.y[1] - domains.y[0]),
      left = xRatio > 0.82 || band === 1 || band === 3,
      labelDx = left ? -10 - band * 8 : 10 + band * 8,
      labelDy =
        yRatio > 0.82
          ? 16 + band * 22
          : yRatio < 0.18
            ? -10 - band * 22
            : band === 2
              ? 18
              : band === 3
                ? -18
                : -10;
    return {
      ...d,
      index,
      quadrant: classifyQuadrant(d.x, d.y, thresholds),
      labelDx,
      labelDy,
      labelAnchor: left ? "end" : "start",
      focused:
        d.focus === true ||
        (!valid.some((p) => p.d.focus === true) && geometryIndex === 0),
    };
  });
}
export const mapQuadrantScatterX = (
  value: number,
  domain: readonly [number, number],
  range: readonly [number, number],
) =>
  range[0] +
  ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]);
export const mapQuadrantScatterY = (
  value: number,
  domain: readonly [number, number],
  range: readonly [number, number],
) =>
  range[0] +
  ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]);
