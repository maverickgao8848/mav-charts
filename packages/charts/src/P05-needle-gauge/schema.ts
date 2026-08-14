export type GaugeThreshold = { label: string; max: number };
export type NeedleGaugeDatum = { label: string; value: number | null; min: number; max: number; thresholds: readonly GaugeThreshold[]; detail?: string };
export type GaugeBandGeometry = GaugeThreshold & { index: number; min: number; span: number; share: number; startAngle: number; endAngle: number; containsValue: boolean };
export type NeedleGaugeGeometry = { datum: NeedleGaugeDatum; span: number; ratio: number; needleAngle: number; needleRotation: number; bands: readonly GaugeBandGeometry[] };
export type NeedleGaugeValidation = { valid: true } | { valid: false; reason: string };

export function validateNeedleGaugeData(data: NeedleGaugeDatum): NeedleGaugeValidation {
  if (typeof data.label !== "string" || !data.label.trim()) return { valid: false, reason: "Gauge label must be non-blank." };
  if (!Number.isFinite(data.min) || !Number.isFinite(data.max) || data.min >= data.max) return { valid: false, reason: "Gauge min and max must be finite with min < max." };
  if (data.value === null || !Number.isFinite(data.value)) return { valid: false, reason: "Gauge value must be a finite number." };
  if (data.value < data.min || data.value > data.max) return { valid: false, reason: "Gauge value must remain inside the declared range." };
  if (!data.thresholds.length) return { valid: false, reason: "Gauge requires at least one ordered threshold." };
  let previous = data.min;
  for (const threshold of data.thresholds) {
    if (typeof threshold.label !== "string" || !threshold.label.trim()) return { valid: false, reason: "Threshold labels must be non-blank." };
    if (!Number.isFinite(threshold.max) || threshold.max <= previous || threshold.max > data.max) return { valid: false, reason: "Threshold maxima must be finite, strictly increasing, and inside the range." };
    previous = threshold.max;
  }
  if (previous !== data.max) return { valid: false, reason: "The final threshold must equal the gauge maximum." };
  return { valid: true };
}

export function buildNeedleGaugeGeometry(data: NeedleGaugeDatum): NeedleGaugeGeometry {
  const span = data.max - data.min, ratio = (data.value! - data.min) / span;
  let previous = data.min;
  const bands = data.thresholds.map((threshold, index) => {
    const bandSpan = threshold.max - previous, share = bandSpan / span, startAngle = mapGaugeAngle(previous, data.min, data.max), endAngle = mapGaugeAngle(threshold.max, data.min, data.max);
    const band = { ...threshold, index, min: previous, span: bandSpan, share, startAngle, endAngle, containsValue: data.value! >= previous && (index === data.thresholds.length - 1 ? data.value! <= threshold.max : data.value! < threshold.max) };
    previous = threshold.max;
    return band;
  });
  return { datum: data, span, ratio, needleAngle: 180 - ratio * 180, needleRotation: -90 + ratio * 180, bands };
}

export const mapGaugeAngle = (value: number, min: number, max: number) => 180 - (value - min) / (max - min) * 180;
export const mapNeedleRotation = (value: number, min: number, max: number) => -90 + (value - min) / (max - min) * 180;
