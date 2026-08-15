export type TargetLineStatus = "missing" | "below" | "at" | "above";
export type TargetLineDatum = { label: string; actual: number | null; target: number; detail?: string };
export type TargetLineGeometryDatum = TargetLineDatum & { index: number; delta: number | null; status: TargetLineStatus; latestActual: boolean; latestTarget: boolean };
export type TargetLineSegment = { startIndex: number; endIndex: number; indices: readonly number[] };

export function validateTargetLineData(data: readonly TargetLineDatum[]) {
  const errors: string[] = [];
  const labels = new Set<string>();
  data.forEach((datum, index) => {
    const label = datum.label.trim();
    if (!label) errors.push(`Datum ${index} requires a non-empty label.`);
    if (labels.has(label)) errors.push(`Datum ${index} duplicates label ${datum.label}.`);
    labels.add(label);
    if (datum.actual !== null && !Number.isFinite(datum.actual)) errors.push(`Datum ${index} contains a non-finite actual.`);
    if (!Number.isFinite(datum.target)) errors.push(`Datum ${index} requires a finite target.`);
  });
  return { valid: errors.length === 0, errors } as const;
}

export function getTargetLineDomain(data: readonly TargetLineDatum[]): readonly [number, number] {
  const values = data.flatMap(({ actual, target }) => [target, ...(actual === null ? [] : [actual])]).filter(Number.isFinite);
  if (!values.length) return [0, 1];
  const minimum = Math.min(...values), maximum = Math.max(...values);
  if (minimum === maximum) { const span = Math.max(1, Math.abs(minimum) * 0.1); return [minimum - span, maximum + span]; }
  const padding = (maximum - minimum) * 0.12;
  return [minimum - padding, maximum + padding];
}

export function buildTargetLineGeometry(data: readonly TargetLineDatum[]): readonly TargetLineGeometryDatum[] {
  let latestActual = -1;
  for (let index = data.length - 1; index >= 0; index -= 1) if (data[index].actual !== null) { latestActual = index; break; }
  return data.map((datum, index) => {
    const delta = datum.actual === null ? null : datum.actual - datum.target;
    return { ...datum, index, delta, status: delta === null ? "missing" : Math.abs(delta) < 1e-9 ? "at" : delta > 0 ? "above" : "below", latestActual: index === latestActual, latestTarget: index === data.length - 1 };
  });
}

export function buildTargetLineSegments(data: readonly TargetLineDatum[]): readonly TargetLineSegment[] {
  const result: TargetLineSegment[] = []; let indices: number[] = [];
  const flush = () => { if (indices.length) result.push({ startIndex: indices[0], endIndex: indices.at(-1)!, indices }); indices = []; };
  data.forEach((datum, index) => datum.actual === null ? flush() : indices.push(index)); flush(); return result;
}

export const mapTargetLineX = (index: number, count: number, range: readonly [number, number]) => count <= 1 ? (range[0] + range[1]) / 2 : range[0] + index / (count - 1) * (range[1] - range[0]);
export const mapTargetLineY = (value: number, domain: readonly [number, number], range: readonly [number, number]) => range[0] + (value - domain[0]) / (domain[1] - domain[0]) * (range[1] - range[0]);
