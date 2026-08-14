export type TimelineDatum = {
  label: string;
  start: number | null;
  end: number | null;
  detail?: string;
};

export type TimelineGeometryDatum = Omit<TimelineDatum, "start" | "end"> & {
  start: number;
  end: number;
  duration: number;
  lane: number;
  index: number;
};

export type TimelineGeometryResult = {
  items: readonly TimelineGeometryDatum[];
  domain: readonly [number, number];
  laneCount: number;
};

export function validateTimelineData(data: readonly TimelineDatum[]) {
  const errors: string[] = [];
  data.forEach((datum, index) => {
    if (!datum.label.trim()) errors.push(`Datum ${index} requires a non-empty label.`);
    if (typeof datum.start !== "number" || !Number.isFinite(datum.start) || typeof datum.end !== "number" || !Number.isFinite(datum.end)) {
      errors.push(`Datum ${index} contains a missing or non-finite time.`);
      return;
    }
    if (datum.end < datum.start) errors.push(`Datum ${index} end must be greater than or equal to start.`);
  });
  return { valid: errors.length === 0, errors } as const;
}

export function getTimelineDomain(data: readonly TimelineDatum[]): readonly [number, number] {
  const values = data.flatMap(({ start, end }) => [start, end]).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!values.length) return [0, 1];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum === maximum) return [minimum - 1, maximum + 1];
  const padding = (maximum - minimum) * 0.06;
  return [minimum - padding, maximum + padding];
}

export function mapTimelineX(value: number, domain: readonly [number, number], range: readonly [number, number]): number {
  if (domain[0] === domain[1]) return (range[0] + range[1]) / 2;
  return range[0] + ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]);
}

export function buildTimelineGeometry(data: readonly TimelineDatum[]): TimelineGeometryResult {
  const domain = getTimelineDomain(data);
  const valid = data.map((datum, index) => ({
    ...datum,
    start: typeof datum.start === "number" && Number.isFinite(datum.start) ? datum.start : 0,
    end: typeof datum.end === "number" && Number.isFinite(datum.end) ? datum.end : 0,
    index,
  }));
  const laneEnds: number[] = [];
  const laneByIndex = new Map<number, number>();
  [...valid].sort((a, b) => a.start - b.start || a.end - b.end || a.index - b.index).forEach((datum) => {
    let lane = laneEnds.findIndex((end) => datum.start >= end);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(datum.end);
    } else {
      laneEnds[lane] = datum.end;
    }
    laneByIndex.set(datum.index, lane);
  });
  const items = valid.map((datum) => ({ ...datum, duration: Math.max(0, datum.end - datum.start), lane: laneByIndex.get(datum.index) ?? 0 }));
  return { items, domain, laneCount: Math.max(1, laneEnds.length) };
}

