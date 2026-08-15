export type RadarProfileDatum = {
  label: string;
  value: number | null;
  comparison: number | null;
  detail?: string;
};
export type RadarProfileGeometryDatum = RadarProfileDatum & {
  index: number;
  angle: number;
  primaryRadius: number | null;
  comparisonRadius: number | null;
  primaryPoint: readonly [number, number] | null;
  comparisonPoint: readonly [number, number] | null;
};
export function validateRadarProfileData(data: readonly RadarProfileDatum[]) {
  const errors: string[] = [],
    labels = new Set<string>();
  data.forEach((datum, index) => {
    const label = datum.label.trim();
    if (!label) errors.push(`Axis ${index} requires a non-empty label.`);
    if (labels.has(label))
      errors.push(`Axis ${index} duplicates label ${datum.label}.`);
    labels.add(label);
    for (const key of ["value", "comparison"] as const) {
      const value = datum[key];
      if (
        value !== null &&
        (!Number.isFinite(value) || value < 0 || value > 100)
      )
        errors.push(
          `Axis ${index} ${key} must be finite within 0..100 or null.`,
        );
    }
  });
  return { valid: errors.length === 0, errors } as const;
}
export const mapRadarRadius = (value: number, maximumRadius: number) =>
  (value / 100) * maximumRadius;
export function mapRadarPoint(
  value: number,
  angle: number,
  maximumRadius: number,
  center: readonly [number, number] = [0, 0],
) {
  const radians = ((angle - 90) * Math.PI) / 180,
    radius = mapRadarRadius(value, maximumRadius);
  return [
    center[0] + Math.cos(radians) * radius,
    center[1] + Math.sin(radians) * radius,
  ] as const;
}
export function buildRadarProfileGeometry(
  data: readonly RadarProfileDatum[],
  maximumRadius = 1,
) {
  const count = Math.max(data.length, 1),
    geometry: readonly RadarProfileGeometryDatum[] = data.map(
      (datum, index) => {
        const angle = (index * 360) / count;
        return {
          ...datum,
          index,
          angle,
          primaryRadius:
            datum.value === null
              ? null
              : mapRadarRadius(datum.value, maximumRadius),
          comparisonRadius:
            datum.comparison === null
              ? null
              : mapRadarRadius(datum.comparison, maximumRadius),
          primaryPoint:
            datum.value === null
              ? null
              : mapRadarPoint(datum.value, angle, maximumRadius),
          comparisonPoint:
            datum.comparison === null
              ? null
              : mapRadarPoint(datum.comparison, angle, maximumRadius),
        };
      },
    );
  const primaryPeak = geometry
      .filter((datum) => datum.value !== null)
      .reduce<RadarProfileGeometryDatum | null>(
        (peak, datum) => (!peak || datum.value! > peak.value! ? datum : peak),
        null,
      ),
    comparisonPeak = geometry
      .filter((datum) => datum.comparison !== null)
      .reduce<RadarProfileGeometryDatum | null>(
        (peak, datum) =>
          !peak || datum.comparison! > peak.comparison! ? datum : peak,
        null,
      );
  return {
    geometry,
    primaryPeak,
    comparisonPeak,
    primaryComplete:
      geometry.filter((datum) => datum.value !== null).length >= 3,
    comparisonComplete:
      geometry.filter((datum) => datum.comparison !== null).length >= 3,
  } as const;
}
