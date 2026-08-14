export type FunnelDatum = { label: string; value: number | null; detail?: string };

export type FunnelGeometryDatum = FunnelDatum & {
  index: number;
  missing: boolean;
  /** Equal categorical row weight for Recharts; never a synthetic stage value. */
  layoutWeight: 1;
  widthRatio: number | null;
  nextWidthRatio: number | null;
  conversionFromPrevious: number | null;
  lossFromPrevious: number | null;
  dropToNext: number | null;
  focus: boolean;
};

export type FunnelValidation = { valid: true } | { valid: false; reason: string };

export function validateFunnelData(data: readonly FunnelDatum[]): FunnelValidation {
  const labels = new Set<string>();
  let previousKnown: number | null = null;
  for (const datum of data) {
    if (typeof datum.label !== "string" || !datum.label.trim()) return { valid: false, reason: "Stage labels must be non-blank." };
    const key = datum.label.trim().toLocaleLowerCase();
    if (labels.has(key)) return { valid: false, reason: "Stage labels must be unique." };
    labels.add(key);
    if (datum.value !== null && (!Number.isFinite(datum.value) || datum.value < 0)) return { valid: false, reason: "Stage values must be finite, non-negative, or null." };
    if (datum.value !== null) {
      if (previousKnown !== null && datum.value > previousKnown) return { valid: false, reason: "Funnel values must not increase downstream." };
      previousKnown = datum.value;
    }
    if (datum.detail !== undefined && typeof datum.detail !== "string") return { valid: false, reason: "Stage detail must be text." };
  }
  return { valid: true };
}

export function buildFunnelGeometry(data: readonly FunnelDatum[]): FunnelGeometryDatum[] {
  const known = data.filter((datum): datum is FunnelDatum & { value: number } => datum.value !== null);
  const maximum = known[0]?.value ?? 0;
  const drops = data.map((datum, index) => {
    const next = data[index + 1];
    return datum.value !== null && next !== undefined && next.value !== null ? datum.value - next.value : null;
  });
  const largestDrop = Math.max(-Infinity, ...drops.filter((drop): drop is number => drop !== null));
  const focusIndex = largestDrop > 0 ? drops.findIndex((drop) => drop !== null && drop === largestDrop) : -1;
  return data.map((datum, index) => {
    const previous = data[index - 1]?.value ?? null;
    const next = data[index + 1];
    return {
      ...datum,
      index,
      missing: datum.value === null,
      layoutWeight: 1,
      widthRatio: datum.value === null || maximum === 0 ? datum.value === 0 ? 0 : null : datum.value / maximum,
      nextWidthRatio: datum.value === null || next?.value === null || next === undefined || maximum === 0
        ? null
        : next.value / maximum,
      conversionFromPrevious: datum.value === null || previous === null || previous === 0 ? null : datum.value / previous,
      lossFromPrevious: datum.value === null || previous === null ? null : previous - datum.value,
      dropToNext: drops[index],
      focus: index === focusIndex,
    };
  });
}

export const getFunnelWidthRatio = (value: number, maximum: number) => maximum > 0 ? value / maximum : 0;
export const mapFunnelWidth = (value: number, maximum: number, availableWidth: number) => getFunnelWidthRatio(value, maximum) * availableWidth;
