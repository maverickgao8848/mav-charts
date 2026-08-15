export type ProfitBridgeKind = "opening" | "change" | "closing";

export type ProfitBridgeDatum = {
  label: string;
  value: number | null;
  kind: ProfitBridgeKind;
  detail?: string;
};

export type ProfitBridgeGeometryDatum = Omit<ProfitBridgeDatum, "value"> & {
  value: number;
  range: readonly [number, number];
  runningTotal: number;
  direction: "up" | "down" | "total";
};

export type ProfitBridgeValidation = {
  valid: boolean;
  errors: readonly string[];
};

export function validateProfitBridgeData(data: readonly ProfitBridgeDatum[]): ProfitBridgeValidation {
  const errors: string[] = [];

  if (data.length < 2) errors.push("Profit bridge requires at least opening and closing values.");
  if (data[0]?.kind !== "opening") errors.push("The first datum must have kind 'opening'.");
  if (data.at(-1)?.kind !== "closing") errors.push("The last datum must have kind 'closing'.");

  data.forEach((datum, index) => {
    if (!datum.label.trim()) errors.push(`Datum ${index} requires a non-empty label.`);
    if (typeof datum.value !== "number" || !Number.isFinite(datum.value)) errors.push(`Datum ${index} has a missing or non-finite value.`);
    if (index > 0 && index < data.length - 1 && datum.kind !== "change") {
      errors.push(`Intermediate datum ${index} must have kind 'change'.`);
    }
  });

  if (errors.length === 0 && data.length >= 2) {
    const expectedClosing = data.slice(0, -1).reduce((total, datum, index) => index === 0 ? (datum.value as number) : total + (datum.value as number), 0);
    const reportedClosing = data.at(-1)?.value as number;
    const tolerance = Math.max(1e-9, Math.abs(expectedClosing) * 1e-9);
    if (Math.abs(expectedClosing - reportedClosing) > tolerance) {
      errors.push(`Closing value ${reportedClosing} does not equal the calculated total ${expectedClosing}.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function buildProfitBridgeGeometry(data: readonly ProfitBridgeDatum[]): readonly ProfitBridgeGeometryDatum[] {
  let runningTotal = 0;

  return data.map((datum) => {
    const value = typeof datum.value === "number" && Number.isFinite(datum.value) ? datum.value : 0;
    if (datum.kind === "opening" || datum.kind === "closing") {
      runningTotal = value;
      return { ...datum, value, range: [Math.min(0, value), Math.max(0, value)], runningTotal, direction: "total" };
    }

    const nextTotal = runningTotal + value;
    const range = [Math.min(runningTotal, nextTotal), Math.max(runningTotal, nextTotal)] as const;
    runningTotal = nextTotal;
    return { ...datum, value, range, runningTotal, direction: value >= 0 ? "up" : "down" };
  });
}
