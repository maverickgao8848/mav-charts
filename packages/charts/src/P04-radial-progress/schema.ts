export type RadialProgressDatum = {
  label: string;
  value: number | null;
  detail?: string;
};

export type RadialProgressGeometryDatum = Omit<RadialProgressDatum, "value"> & {
  value: number;
  remainder: number;
  index: number;
};

export function validateRadialProgressData(data: readonly RadialProgressDatum[]) {
  const errors: string[] = [];
  data.forEach((datum, index) => {
    if (!datum.label.trim()) errors.push(`Datum ${index} requires a non-empty label.`);
    if (typeof datum.value !== "number" || !Number.isFinite(datum.value)) {
      errors.push(`Datum ${index} contains a missing or non-finite percentage.`);
      return;
    }
    if (datum.value < 0 || datum.value > 100) {
      errors.push(`Datum ${index} percentage must be between 0 and 100 inclusive.`);
    }
  });
  return { valid: errors.length === 0, errors } as const;
}

export function buildRadialProgressGeometry(data: readonly RadialProgressDatum[]): readonly RadialProgressGeometryDatum[] {
  return data.map((datum, index) => {
    const finite = typeof datum.value === "number" && Number.isFinite(datum.value) ? datum.value : 0;
    const value = Math.min(100, Math.max(0, finite));
    return { ...datum, value, remainder: 100 - value, index };
  });
}

