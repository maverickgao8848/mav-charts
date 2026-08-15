export type BoxPlotDatum = { label: string; min: number | null; q1: number | null; median: number | null; q3: number | null; max: number | null; outliers?: readonly number[]; detail?: string };
export type BoxPlotGeometryDatum = BoxPlotDatum & { index: number; missing: boolean; focus: boolean };
const keys = ["min", "q1", "median", "q3", "max"] as const;

export function validateBoxPlotData(data: readonly BoxPlotDatum[]) {
  const errors: string[] = [], labels = new Set<string>();
  data.forEach((datum, index) => {
    const label = datum.label.trim();
    if (!label || labels.has(label)) errors.push(`Datum ${index} requires a unique non-empty label.`);
    labels.add(label);
    const values = keys.map((key) => datum[key]);
    const nullCount = values.filter((value) => value === null).length;
    if (nullCount !== 0 && nullCount !== keys.length) errors.push(`Datum ${index} must provide all five summary values or make the whole category missing.`);
    if (values.some((value) => value !== null && (typeof value !== "number" || !Number.isFinite(value)))) errors.push(`Datum ${index} contains a non-finite summary value.`);
    if (nullCount === 0) {
      const finite = values as number[];
      if (!(finite[0] <= finite[1] && finite[1] <= finite[2] && finite[2] <= finite[3] && finite[3] <= finite[4])) errors.push(`Datum ${index} must satisfy min <= q1 <= median <= q3 <= max.`);
      for (const outlier of datum.outliers ?? []) if (!Number.isFinite(outlier) || (outlier >= finite[0] && outlier <= finite[4])) errors.push(`Datum ${index} outliers must be finite and outside [min, max].`);
    } else if ((datum.outliers?.length ?? 0) > 0) errors.push(`Datum ${index} cannot attach outliers to a missing summary.`);
  });
  return { valid: errors.length === 0, errors } as const;
}

export function buildBoxPlotGeometry(data: readonly BoxPlotDatum[]): readonly BoxPlotGeometryDatum[] {
  const firstValid = data.findIndex(({ median }) => median !== null);
  return data.map((datum, index) => ({ ...datum, index, missing: datum.median === null, focus: index === firstValid }));
}

export function getBoxPlotDomain(data: readonly BoxPlotDatum[]): readonly [number, number] {
  const values = data.flatMap((datum) => [...keys.map((key) => datum[key]), ...(datum.outliers ?? [])]).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!values.length) return [0, 1];
  const minimum = Math.min(...values), maximum = Math.max(...values);
  if (minimum === maximum) { const span = Math.max(1, Math.abs(minimum) * 0.1); return [minimum - span, maximum + span]; }
  const padding = (maximum - minimum) * 0.1;
  return [minimum - padding, maximum + padding];
}

export const mapBoxPlotY = (value: number, domain: readonly [number, number], range: readonly [number, number]) => range[0] + ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]);
export const getBoxPlotX = (index: number, count: number, range: readonly [number, number]) => count <= 1 ? (range[0] + range[1]) / 2 : range[0] + ((index + 0.5) / count) * (range[1] - range[0]);
export const getBoxPlotWidth = (count: number, plotWidth: number) => Math.min(72, (plotWidth / Math.max(count, 1)) * 0.38);
