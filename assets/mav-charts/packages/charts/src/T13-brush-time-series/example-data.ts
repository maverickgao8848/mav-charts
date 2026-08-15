import type { BrushTimeSeriesDatum } from "./schema";

const hours = [
  42, 48, 51, 58, 56, 63, 68, 64, 71, 76, 73, 81,
  86, 83, 91, 96, 93, 101, 106, 103, 111, 116, 113, 121,
];

export const brushTimeSeriesExample = Object.freeze(hours.map((value, index) => ({
  label: `${String(index).padStart(2, "0")}:00`,
  value,
  detail: index < 8 ? "Overnight" : index < 18 ? "Business hours" : "Evening",
})) satisfies readonly BrushTimeSeriesDatum[]);

export const brushTimeSeriesEdgeCases = Object.freeze({
  empty: [] as readonly BrushTimeSeriesDatum[],
  single: [{ label: "12:00", value: 42, detail: "Only observation" }] as const satisfies readonly BrushTimeSeriesDatum[],
  missing: [{ label: "13:00", value: null, detail: "Sensor offline" }] as const satisfies readonly BrushTimeSeriesDatum[],
  invalid: [{ label: "", value: 18 }] as const satisfies readonly BrushTimeSeriesDatum[],
  signed: [
    { label: "Mon", value: -18 },
    { label: "Tue", value: -8 },
    { label: "Wed", value: 4 },
    { label: "Thu", value: 14 },
    { label: "Fri", value: -3 },
  ] as const satisfies readonly BrushTimeSeriesDatum[],
  extreme: [
    { label: "Baseline", value: 2 },
    { label: "Peak", value: 1_000_000 },
    { label: "Recovery", value: 420_000 },
  ] as const satisfies readonly BrushTimeSeriesDatum[],
  longLabel: [
    { label: "Monday after the infrastructure migration", value: 42 },
    { label: "Tuesday after the infrastructure migration", value: 68 },
    { label: "Wednesday after the infrastructure migration", value: 57 },
    { label: "Thursday after the infrastructure migration", value: 81 },
  ] as const satisfies readonly BrushTimeSeriesDatum[],
});

