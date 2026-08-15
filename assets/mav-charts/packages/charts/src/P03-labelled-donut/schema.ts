export type LabelledDonutDatum = {
  label: string;
  value: number | null;
  detail?: string;
};

export type LabelledDonutGeometryDatum = LabelledDonutDatum & {
  index: number;
  missing: boolean;
  zero: boolean;
  renderable: boolean;
  share: number | null;
  startAngle: number;
  endAngle: number;
  midAngle: number;
  focus: boolean;
};

export type LabelledDonutLabelPosition = {
  index: number;
  side: "left" | "right";
  x: number;
  y: number;
};

export function validateLabelledDonutData(data: readonly LabelledDonutDatum[]) {
  const errors: string[] = [], labels = new Set<string>();
  data.forEach((datum, index) => {
    const label = datum.label.trim(), key = label.toLocaleLowerCase();
    if (!label) errors.push(`Slice ${index} requires a non-empty label.`);
    if (labels.has(key)) errors.push(`Slice ${index} duplicates label ${datum.label}.`);
    labels.add(key);
    if (datum.value !== null && (!Number.isFinite(datum.value) || datum.value < 0))
      errors.push(`Slice ${index} value must be finite, non-negative, or null.`);
  });
  return { valid: errors.length === 0, errors } as const;
}

export function buildLabelledDonutGeometry(data: readonly LabelledDonutDatum[]) {
  const total = data.reduce((sum, datum) => sum + (datum.value !== null && datum.value > 0 ? datum.value : 0), 0);
  let angle = -90;
  const positive = data.filter((datum) => datum.value !== null && datum.value > 0);
  const maximum = positive.length ? Math.max(...positive.map((datum) => datum.value!)) : null;
  let focused = false;
  const geometry = data.map((datum, index): LabelledDonutGeometryDatum => {
    const renderable = datum.value !== null && datum.value > 0,
      share = renderable && total > 0 ? datum.value! / total : null,
      startAngle = angle,
      endAngle = angle + (share === null ? 0 : share * 360),
      focus = renderable && !focused && datum.value === maximum;
    if (focus) focused = true;
    angle = endAngle;
    return { ...datum, index, missing: datum.value === null, zero: datum.value === 0, renderable, share, startAngle, endAngle, midAngle: (startAngle + endAngle) / 2, focus };
  });
  return { geometry, total, renderable: geometry.filter((datum) => datum.renderable), focus: geometry.find((datum) => datum.focus) ?? null } as const;
}

export const getLabelledDonutAngle = (value: number, total: number) => total > 0 ? value / total * 360 : 0;

export function layoutLabelledDonutLabels(
  geometry: readonly LabelledDonutGeometryDatum[],
  minimumGap = 0.42,
): LabelledDonutLabelPosition[] {
  const candidates = geometry.filter((datum) => datum.renderable).map((datum) => {
    const radians = datum.midAngle * Math.PI / 180, side = Math.cos(radians) >= 0 ? "right" as const : "left" as const;
    return { index: datum.index, side, x: side === "right" ? 1 : -1, y: Math.sin(radians) };
  });
  for (const side of ["left", "right"] as const) {
    const items = candidates.filter((item) => item.side === side).sort((a, b) => a.y - b.y);
    for (let index = 1; index < items.length; index++) items[index].y = Math.max(items[index].y, items[index - 1].y + minimumGap);
    if (items.length && items.at(-1)!.y > 1) {
      const shift = items.at(-1)!.y - 1;
      items.forEach((item) => { item.y -= shift; });
    }
    if (items.length && items[0].y < -1) {
      const shift = -1 - items[0].y;
      items.forEach((item) => { item.y += shift; });
    }
  }
  return candidates.sort((a, b) => a.index - b.index);
}
