export type ScatterDatum = {
  label: string;
  value: number | null;
  comparison: number | null;
  detail?: string;
};
export type ScatterGeometryDatum = ScatterDatum & {
  index: number;
  missing: boolean;
  focus: boolean;
  labelDx: number;
  labelDy: number;
};
export function validateScatterData(data: readonly ScatterDatum[]) {
  const errors: string[] = [],
    labels = new Set<string>();
  data.forEach((d, i) => {
    const label = d.label.trim();
    if (!label) errors.push(`Datum ${i} requires a non-empty label.`);
    if (labels.has(label))
      errors.push(`Datum ${i} duplicates label ${d.label}.`);
    labels.add(label);
    for (const key of ["value", "comparison"] as const) {
      const v = d[key];
      if (v !== null && (typeof v !== "number" || !Number.isFinite(v)))
        errors.push(`Datum ${i} contains a non-finite ${key}.`);
    }
  });
  return { valid: errors.length === 0, errors } as const;
}
export function getScatterDomain(
  data: readonly ScatterDatum[],
  key: "value" | "comparison",
): readonly [number, number] {
  const values = data
    .filter((d) => d.value !== null && d.comparison !== null)
    .map((d) => d[key]!)
    .filter(Number.isFinite);
  if (!values.length) return [0, 1];
  const min = Math.min(...values),
    max = Math.max(...values);
  if (min === max) {
    const span = Math.max(1, Math.abs(min) * 0.1);
    return [min - span, max + span];
  }
  const pad = (max - min) * 0.1;
  return [min - pad, max + pad];
}
export function buildScatterGeometry(
  data: readonly ScatterDatum[],
): readonly ScatterGeometryDatum[] {
  const first = data.findIndex(
    (d) => d.value !== null && d.comparison !== null,
  );
  const xDomain = getScatterDomain(data, "value"),
    yDomain = getScatterDomain(data, "comparison");
  const groups = new Map<string, number>();
  const offsets = [
    [12, -11],
    [12, 17],
    [-12, -11],
    [-12, 17],
  ] as const;
  return data.map((d, index) => {
    const missing = d.value === null || d.comparison === null;
    const key = missing ? `missing-${index}` : `${d.value}|${d.comparison}`,
      order = groups.get(key) ?? 0;
    groups.set(key, order + 1);
    const [overlapDx, overlapDy] = offsets[order % offsets.length];
    const xRatio = missing
      ? 0.5
      : (d.value! - xDomain[0]) / (xDomain[1] - xDomain[0]);
    const yRatio = missing
      ? 0.5
      : (d.comparison! - yDomain[0]) / (yDomain[1] - yDomain[0]);
    const labelDx = order > 0 ? overlapDx : xRatio > 0.72 ? -12 : 12;
    const labelDy = order > 0 ? overlapDy : yRatio > 0.72 ? 17 : -11;
    return { ...d, index, missing, focus: index === first, labelDx, labelDy };
  });
}
export const mapScatterX = (
  value: number,
  domain: readonly [number, number],
  range: readonly [number, number],
) =>
  range[0] +
  ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]);
export const mapScatterY = (
  value: number,
  domain: readonly [number, number],
  range: readonly [number, number],
) =>
  range[0] +
  ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]);
