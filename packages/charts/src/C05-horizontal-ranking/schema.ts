export type HorizontalRankingDatum = {
  label: string;
  value: number | null;
  detail?: string;
};

export type HorizontalRankingGeometryDatum = HorizontalRankingDatum & {
  originalIndex: number;
  sortedIndex: number;
  rank: number | null;
  missing: boolean;
  focus: boolean;
};

export function validateHorizontalRankingData(data: readonly HorizontalRankingDatum[]) {
  const errors: string[] = [];
  const labels = new Set<string>();
  data.forEach((datum, index) => {
    const label = datum.label.trim();
    if (!label) errors.push(`Datum ${index} requires a non-empty label.`);
    if (labels.has(label)) errors.push(`Datum ${index} duplicates label ${datum.label}.`);
    labels.add(label);
    if (datum.value !== null && (typeof datum.value !== "number" || !Number.isFinite(datum.value))) errors.push(`Datum ${index} contains a non-finite value.`);
  });
  return { valid: errors.length === 0, errors } as const;
}

export function buildHorizontalRankingGeometry(data: readonly HorizontalRankingDatum[]): readonly HorizontalRankingGeometryDatum[] {
  const sorted = data.map((datum, originalIndex) => ({ ...datum, originalIndex })).sort((left, right) => {
    if (left.value === null && right.value === null) return left.originalIndex - right.originalIndex;
    if (left.value === null) return 1;
    if (right.value === null) return -1;
    return right.value - left.value || left.originalIndex - right.originalIndex;
  });
  let previousValue: number | null | undefined;
  let previousRank = 0;
  return sorted.map((datum, sortedIndex) => {
    const rank = datum.value === null ? null : datum.value === previousValue ? previousRank : sortedIndex + 1;
    if (datum.value !== null) {
      previousValue = datum.value;
      previousRank = rank!;
    }
    return { ...datum, sortedIndex, rank, missing: datum.value === null, focus: sortedIndex === 0 && datum.value !== null };
  });
}

export function getHorizontalRankingDomain(data: readonly HorizontalRankingDatum[]): readonly [number, number] {
  const values = data.map(({ value }) => value).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!values.length) return [0, 1];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum >= 0) return [0, maximum === 0 ? 1 : maximum * 1.1];
  if (maximum <= 0) return [minimum * 1.1, 0];
  const padding = (maximum - minimum) * 0.08;
  return [minimum - padding, maximum + padding];
}

export function mapHorizontalRankingX(value: number, domain: readonly [number, number], plotWidth: number): number {
  const width = Number.isFinite(plotWidth) ? Math.max(0, plotWidth) : 0;
  const span = domain[1] - domain[0];
  return span === 0 ? 0 : ((value - domain[0]) / span) * width;
}

export function getHorizontalRankingLength(value: number, domain: readonly [number, number], plotWidth: number): number {
  return Math.abs(mapHorizontalRankingX(value, domain, plotWidth) - mapHorizontalRankingX(0, domain, plotWidth));
}
