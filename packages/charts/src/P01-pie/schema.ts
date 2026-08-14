export type PieDatum = { label: string; value: number | null; detail?: string };

export type PieGeometryDatum = PieDatum & {
  index: number;
  missing: boolean;
  zero: boolean;
  total: number;
  share: number | null;
  startAngle: number;
  endAngle: number;
  angle: number;
  focus: boolean;
};

export type PieValidation = { valid: true } | { valid: false; reason: string };

export function validatePieData(data: readonly PieDatum[]): PieValidation {
  const labels = new Set<string>();
  let total = 0;
  for (const datum of data) {
    if (typeof datum.label !== "string" || !datum.label.trim()) return { valid: false, reason: "Slice labels must be non-blank." };
    const key = datum.label.trim().toLocaleLowerCase();
    if (labels.has(key)) return { valid: false, reason: "Slice labels must be unique." };
    labels.add(key);
    if (datum.value !== null && (!Number.isFinite(datum.value) || datum.value < 0)) return { valid: false, reason: "Slice values must be finite, non-negative, or null." };
    if (datum.value !== null) total += datum.value;
    if (datum.detail !== undefined && typeof datum.detail !== "string") return { valid: false, reason: "Slice detail must be text." };
  }
  if (data.length > 0 && total <= 0) return { valid: false, reason: "At least one known slice must be greater than zero so the whole is defined." };
  return { valid: true };
}

export function buildPieGeometry(data: readonly PieDatum[]): PieGeometryDatum[] {
  const total = data.reduce((sum, datum) => sum + (datum.value ?? 0), 0);
  const focusIndex = data.findIndex(({ value }) => value !== null && value > 0);
  let cursor = 0;
  return data.map((datum, index) => {
    const angle = datum.value === null || total <= 0 ? 0 : datum.value / total * 360;
    const startAngle = cursor;
    cursor += angle;
    return {
      ...datum,
      index,
      missing: datum.value === null,
      zero: datum.value === 0,
      total,
      share: datum.value === null || total <= 0 ? null : datum.value / total,
      startAngle,
      endAngle: cursor,
      angle,
      focus: index === focusIndex,
    };
  });
}

export const getPieAngle = (value: number, total: number) => total > 0 ? value / total * 360 : 0;

