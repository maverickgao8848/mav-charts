export type HeatmapDatum = {
  row: string;
  column: string;
  value: number | null;
  detail?: string;
};

export type HeatmapGeometryDatum = {
  row: string;
  column: string;
  rowIndex: number;
  columnIndex: number;
  value: number | null;
  normalized: number | null;
  missing: "explicit" | "implicit" | null;
  detail?: string;
};

export type HeatmapGeometryResult = {
  rows: readonly string[];
  columns: readonly string[];
  cells: readonly HeatmapGeometryDatum[];
  domain: readonly [number, number];
};

export function validateHeatmapData(data: readonly HeatmapDatum[]) {
  const errors: string[] = [];
  const coordinates = new Set<string>();
  data.forEach((datum, index) => {
    if (!datum.row.trim()) errors.push(`Datum ${index} requires a non-empty row.`);
    if (!datum.column.trim()) errors.push(`Datum ${index} requires a non-empty column.`);
    if (datum.value !== null && (typeof datum.value !== "number" || !Number.isFinite(datum.value))) errors.push(`Datum ${index} contains a non-finite value.`);
    const coordinate = `${datum.row}\u0000${datum.column}`;
    if (coordinates.has(coordinate)) errors.push(`Datum ${index} duplicates coordinate ${datum.row}/${datum.column}.`);
    coordinates.add(coordinate);
  });
  return { valid: errors.length === 0, errors } as const;
}

export function getHeatmapDomain(data: readonly HeatmapDatum[]): readonly [number, number] {
  const values = data.map(({ value }) => value).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!values.length) return [0, 1];
  return [Math.min(...values), Math.max(...values)];
}

export function normalizeHeatmapValue(value: number | null, domain: readonly [number, number]): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  if (domain[0] === domain[1]) return 0.5;
  return (value - domain[0]) / (domain[1] - domain[0]);
}

export function buildHeatmapGeometry(data: readonly HeatmapDatum[]): HeatmapGeometryResult {
  const rows = [...new Set(data.map(({ row }) => row))];
  const columns = [...new Set(data.map(({ column }) => column))];
  const domain = getHeatmapDomain(data);
  const source = new Map(data.map((datum) => [`${datum.row}\u0000${datum.column}`, datum]));
  const cells = rows.flatMap((row, rowIndex) => columns.map((column, columnIndex): HeatmapGeometryDatum => {
    const datum = source.get(`${row}\u0000${column}`);
    const value = datum?.value ?? null;
    return {
      row,
      column,
      rowIndex,
      columnIndex,
      value,
      normalized: normalizeHeatmapValue(value, domain),
      missing: datum ? datum.value === null ? "explicit" : null : "implicit",
      detail: datum?.detail,
    };
  }));
  return { rows, columns, cells, domain };
}
