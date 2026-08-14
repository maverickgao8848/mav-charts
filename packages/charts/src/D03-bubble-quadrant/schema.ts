export type BubbleQuadrantDatum = {
  label: string;
  x: number | null;
  y: number | null;
  size: number | null;
  detail?: string;
};

export type BubbleQuadrantName = "leaders" | "challengers" | "niche" | "watch";

export type BubbleQuadrantGeometryDatum = Omit<BubbleQuadrantDatum, "x" | "y" | "size"> & {
  x: number;
  y: number;
  size: number;
  radius: number;
  quadrant: BubbleQuadrantName;
  labelDx: number;
  labelDy: number;
  index: number;
};

export type BubbleQuadrantThresholds = { x: number; y: number };

export function validateBubbleQuadrantData(data: readonly BubbleQuadrantDatum[]) {
  const errors: string[] = [];
  data.forEach((datum, index) => {
    if (!datum.label.trim()) errors.push(`Datum ${index} requires a non-empty label.`);
    for (const key of ["x", "y", "size"] as const) {
      if (typeof datum[key] !== "number" || !Number.isFinite(datum[key])) errors.push(`Datum ${index} contains a missing or non-finite ${key} value.`);
    }
    if (typeof datum.size === "number" && Number.isFinite(datum.size) && datum.size < 0) errors.push(`Datum ${index} size must be non-negative.`);
  });
  return { valid: errors.length === 0, errors } as const;
}

function quadrantFor(x: number, y: number, thresholds: BubbleQuadrantThresholds): BubbleQuadrantName {
  if (x >= thresholds.x && y >= thresholds.y) return "leaders";
  if (x < thresholds.x && y >= thresholds.y) return "challengers";
  if (x >= thresholds.x && y < thresholds.y) return "watch";
  return "niche";
}

export function buildBubbleQuadrantGeometry(data: readonly BubbleQuadrantDatum[], thresholds: BubbleQuadrantThresholds = { x: 50, y: 50 }, maximumRadius = 34): readonly BubbleQuadrantGeometryDatum[] {
  const finiteSizes = data.map(({ size }) => size).filter((size): size is number => typeof size === "number" && Number.isFinite(size) && size >= 0);
  const maximumSize = Math.max(0, ...finiteSizes);
  return data.map((datum, index) => {
    const x = typeof datum.x === "number" && Number.isFinite(datum.x) ? datum.x : 0;
    const y = typeof datum.y === "number" && Number.isFinite(datum.y) ? datum.y : 0;
    const size = typeof datum.size === "number" && Number.isFinite(datum.size) ? Math.max(0, datum.size) : 0;
    const earlierCollision = data.slice(0, index).filter((candidate) => {
      if (typeof candidate.x !== "number" || typeof candidate.y !== "number") return false;
      return Math.abs(candidate.x - x) <= 4 && Math.abs(candidate.y - y) <= 4;
    }).length;
    const collisionBand = earlierCollision % 3;
    const radius = maximumSize === 0 ? 0 : Math.sqrt(size / maximumSize) * maximumRadius;
    return {
      ...datum,
      x,
      y,
      size,
      radius,
      quadrant: quadrantFor(x, y, thresholds),
      labelDx: collisionBand === 1 ? -(radius + 16) : 0,
      labelDy: collisionBand === 1 ? radius + 8 : collisionBand === 2 ? maximumRadius * 2 + 28 : 0,
      index,
    };
  });
}

const paddedDomain = (values: readonly number[]): readonly [number, number] => {
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum === maximum) return [minimum - 1, maximum + 1];
  const padding = (maximum - minimum) * 0.1;
  return [minimum - padding, maximum + padding];
};

export function getBubbleQuadrantDomains(data: readonly BubbleQuadrantDatum[], thresholds: BubbleQuadrantThresholds = { x: 50, y: 50 }) {
  const xValues = data.map(({ x }) => x).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const yValues = data.map(({ y }) => y).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return {
    x: paddedDomain([...xValues, thresholds.x]),
    y: paddedDomain([...yValues, thresholds.y]),
  } as const;
}
