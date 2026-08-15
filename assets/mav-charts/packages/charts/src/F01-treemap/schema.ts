export type TreemapDatum = {
  label: string;
  value: number | null;
  parent?: string;
  detail?: string;
};

export type TreemapGeometryDatum = TreemapDatum & {
  index: number;
  missing: boolean;
  zero: boolean;
  renderable: boolean;
  focus: boolean;
  share: number | null;
};

export function validateTreemapData(data: readonly TreemapDatum[]) {
  const errors: string[] = [];
  const labels = new Set<string>();
  data.forEach((datum, index) => {
    const label = datum.label.trim();
    if (!label) errors.push(`Datum ${index} requires a non-empty label.`);
    if (labels.has(label)) errors.push(`Datum ${index} duplicates label ${datum.label}.`);
    labels.add(label);
    if (datum.parent !== undefined && !datum.parent.trim()) errors.push(`Datum ${index} parent cannot be blank.`);
    if (datum.value !== null && (!Number.isFinite(datum.value) || datum.value < 0)) errors.push(`Datum ${index} value must be finite, non-negative, or null.`);
  });
  return { valid: errors.length === 0, errors } as const;
}

export function buildTreemapGeometry(data: readonly TreemapDatum[]) {
  const total = data.reduce((sum, datum) => sum + (datum.value !== null && datum.value > 0 ? datum.value : 0), 0);
  const focusIndex = data.findIndex((datum) => datum.value !== null && datum.value > 0);
  const tiles: readonly TreemapGeometryDatum[] = data.map((datum, index) => ({
    ...datum,
    index,
    missing: datum.value === null,
    zero: datum.value === 0,
    renderable: datum.value !== null && datum.value > 0,
    focus: index === focusIndex,
    share: datum.value !== null && datum.value > 0 && total > 0 ? datum.value / total : null,
  }));
  return { tiles, total, renderable: tiles.filter((tile) => tile.renderable) } as const;
}

export const getTreemapArea = (value: number, total: number, plotArea: number) => total > 0 && value > 0 ? (value / total) * plotArea : 0;

