import type { HeatmapDatum } from "./schema";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const hours = ["00", "04", "08", "10", "12", "14", "16", "18", "20", "24"] as const;

export const heatmapExample = Object.freeze(days.flatMap((row, rowIndex) => hours.map((column, columnIndex) => ({
  row,
  column,
  value: row === "Wed" && column === "12" ? 100 : 12 + ((rowIndex * 17 + columnIndex * 23 + rowIndex * columnIndex * 7) % 86),
  detail: row === "Wed" && column === "12" ? "Weekly pressure point" : undefined,
}))) satisfies readonly HeatmapDatum[]);

export const heatmapEdgeCases = Object.freeze({
  empty: [] as readonly HeatmapDatum[],
  single: [{ row: "Mon", column: "12", value: 42, detail: "Only observation" }] as const satisfies readonly HeatmapDatum[],
  missing: [
    { row: "Mon", column: "AM", value: 24 },
    { row: "Mon", column: "PM", value: null, detail: "Sensor offline" },
    { row: "Tue", column: "AM", value: 41 },
    { row: "Tue", column: "PM", value: 36 },
  ] as const satisfies readonly HeatmapDatum[],
  duplicate: [
    { row: "Mon", column: "AM", value: 24 },
    { row: "Mon", column: "AM", value: 41 },
  ] as const satisfies readonly HeatmapDatum[],
  negative: [
    { row: "North", column: "Q1", value: -18 },
    { row: "North", column: "Q2", value: 4 },
    { row: "South", column: "Q1", value: -6 },
    { row: "South", column: "Q2", value: 14 },
  ] as const satisfies readonly HeatmapDatum[],
  extreme: [
    { row: "Baseline", column: "Before", value: -1_000_000 },
    { row: "Baseline", column: "After", value: 2 },
    { row: "Outlier", column: "Before", value: 500_000 },
    { row: "Outlier", column: "After", value: 1_000_000_000 },
  ] as const satisfies readonly HeatmapDatum[],
  longLabel: [
    { row: "North American enterprise accounts", column: "Before migration", value: 24 },
    { row: "North American enterprise accounts", column: "After migration", value: 62 },
    { row: "Independent European specialists", column: "Before migration", value: 37 },
    { row: "Independent European specialists", column: "After migration", value: 81 },
  ] as const satisfies readonly HeatmapDatum[],
  sparse: [
    { row: "Mon", column: "AM", value: 24 },
    { row: "Tue", column: "Noon", value: 58 },
    { row: "Wed", column: "PM", value: 86 },
  ] as const satisfies readonly HeatmapDatum[],
  constant: [
    { row: "North", column: "Q1", value: 42 },
    { row: "North", column: "Q2", value: 42 },
    { row: "South", column: "Q1", value: 42 },
    { row: "South", column: "Q2", value: 42 },
  ] as const satisfies readonly HeatmapDatum[],
});
