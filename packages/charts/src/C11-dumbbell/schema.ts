export type DumbbellDatum = {
  label: string;
  before: number | null;
  after: number | null;
  beforeLabel?: string;
  afterLabel?: string;
};

export type DumbbellGeometryDatum = Omit<DumbbellDatum, "before" | "after"> & {
  before: number;
  after: number;
  beforeX: number;
  afterX: number;
  delta: number;
  direction: "up" | "down" | "flat";
};

export function validateDumbbellData(data: readonly DumbbellDatum[]) {
  const errors: string[] = [];
  data.forEach((datum, index) => {
    if (!datum.label.trim()) errors.push(`Datum ${index} requires a non-empty label.`);
    if (typeof datum.before !== "number" || !Number.isFinite(datum.before) || typeof datum.after !== "number" || !Number.isFinite(datum.after)) errors.push(`Datum ${index} contains a missing or non-finite value.`);
  });
  return { valid: errors.length === 0, errors } as const;
}

export function getDumbbellDomain(data: readonly DumbbellDatum[]): readonly [number, number] {
  const values = data.flatMap(({ before, after }) => [before, after]).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (!values.length) return [0, 1];
  if (minimum === maximum) return [minimum - 1, maximum + 1];
  const padding = (maximum - minimum) * 0.08;
  return [minimum - padding, maximum + padding];
}

export function buildDumbbellGeometry(data: readonly DumbbellDatum[], left = 118, right = 532): readonly DumbbellGeometryDatum[] {
  const [minimum, maximum] = getDumbbellDomain(data);
  const x = (value: number) => left + ((value - minimum) / (maximum - minimum)) * (right - left);
  return data.map((datum) => ({
    ...datum,
    before: typeof datum.before === "number" && Number.isFinite(datum.before) ? datum.before : 0,
    after: typeof datum.after === "number" && Number.isFinite(datum.after) ? datum.after : 0,
    beforeX: x(typeof datum.before === "number" && Number.isFinite(datum.before) ? datum.before : 0),
    afterX: x(typeof datum.after === "number" && Number.isFinite(datum.after) ? datum.after : 0),
    delta: (typeof datum.after === "number" && Number.isFinite(datum.after) ? datum.after : 0) - (typeof datum.before === "number" && Number.isFinite(datum.before) ? datum.before : 0),
    direction: datum.after! > datum.before! ? "up" : datum.after! < datum.before! ? "down" : "flat",
  }));
}
