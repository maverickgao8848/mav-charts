export type HistogramBin = { start: number; end: number; count: number | null; label?: string; detail?: string };
export type HistogramGeometryBin = HistogramBin & { index: number; width: number; missing: boolean; peak: boolean; intervalLabel: string; plotValue: number };
const close = (a: number, b: number, tolerance: number) => Math.abs(a - b) <= tolerance;

export function validateHistogramBins(data: readonly HistogramBin[]) {
  const errors: string[] = [];
  let expectedWidth: number | null = null;
  data.forEach((bin, index) => {
    if (!Number.isFinite(bin.start) || !Number.isFinite(bin.end) || !(bin.start < bin.end)) errors.push(`Bin ${index} requires finite start < end.`);
    if (bin.count !== null && (!Number.isFinite(bin.count) || !Number.isInteger(bin.count) || bin.count < 0)) errors.push(`Bin ${index} count must be a non-negative integer or null.`);
    if (bin.label !== undefined && !bin.label.trim()) errors.push(`Bin ${index} label cannot be blank.`);
    const width = bin.end - bin.start;
    if (Number.isFinite(width) && width > 0) {
      if (expectedWidth === null) expectedWidth = width;
      else { const tolerance = Math.max(1e-9, Math.abs(expectedWidth) * 1e-9); if (!close(width, expectedWidth, tolerance)) errors.push(`Bin ${index} width differs from the first bin.`); }
    }
    if (index > 0) {
      const previous = data[index - 1], tolerance = Math.max(1e-9, Math.abs(previous.end - previous.start) * 1e-9);
      if (!(bin.start > previous.start)) errors.push(`Bin ${index} must be strictly ordered after the previous start.`);
      if (!close(bin.start, previous.end, tolerance)) errors.push(`Bin ${index} must start exactly where the previous bin ends (no gap or overlap).`);
    }
  });
  return { valid: errors.length === 0, errors } as const;
}

export function buildHistogramGeometry(data: readonly HistogramBin[]): readonly HistogramGeometryBin[] {
  const finiteCounts = data.map(({ count }) => count).filter((count): count is number => count !== null);
  const maximum = finiteCounts.length ? Math.max(...finiteCounts) : null;
  const peakIndex = maximum === null ? -1 : data.findIndex(({ count }) => count === maximum);
  return data.map((bin, index) => ({ ...bin, index, width: bin.end - bin.start, missing: bin.count === null, peak: index === peakIndex, intervalLabel: bin.label ?? `[${formatHistogramBoundary(bin.start)}, ${formatHistogramBoundary(bin.end)})`, plotValue: bin.count ?? 0 }));
}

export function getHistogramYDomain(data: readonly HistogramBin[]): readonly [number, number] {
  const counts = data.map(({ count }) => count).filter((count): count is number => count !== null && Number.isFinite(count));
  const maximum = counts.length ? Math.max(...counts) : 0;
  return [0, maximum > 0 ? maximum * 1.1 : 1];
}
export const getHistogramBarWidth = (count: number, plotWidth: number, gapRatio = 0.08) => (plotWidth / Math.max(count, 1)) * (1 - gapRatio);
export const mapHistogramY = (count: number, domain: readonly [number, number], range: readonly [number, number]) => range[0] + ((count - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]);
export const formatHistogramBoundary = (value: number) => { const absolute = Math.abs(value); if (absolute >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`; if (absolute >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`; if (absolute >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`; return Number(value.toFixed(4)).toString(); };
