import type { SynchronizedPanel } from "./schema";

const labels = ["Q1", "Q2", "Q3", "Q4"] as const;
const panel = (id: string, title: string, unit: string, values: readonly (number | null)[]): SynchronizedPanel => ({ id, title, unit, data: labels.map((label, index) => ({ label, value: values[index] ?? null })) });

export const synchronizedSmallMultiplesExample = [
  panel("revenue", "Revenue", "$M", [118, 132, 149, 171]),
  panel("margin", "Operating margin", "%", [18.2, 17.4, 19.1, 21.6]),
  panel("nps", "Customer advocacy", "pts", [41, 45, 44, 52]),
] as const satisfies readonly SynchronizedPanel[];

export const synchronizedSmallMultiplesEdgeCases = {
  empty: [] as readonly SynchronizedPanel[],
  twoPanels: synchronizedSmallMultiplesExample.slice(0, 2),
  fourPanels: [...synchronizedSmallMultiplesExample, panel("tickets", "Support tickets", "cases", [920, 860, 790, 710])],
  missing: [panel("revenue", "Revenue", "$M", [118, null, 149, 171]), panel("margin", "Operating margin", "%", [18.2, 17.4, null, 21.6]), panel("nps", "Customer advocacy", "pts", [null, 45, 44, 52])],
  leadingTrailing: [panel("revenue", "Revenue", "$M", [null, 132, 149, 171]), panel("margin", "Operating margin", "%", [18.2, 17.4, 19.1, null])],
  negative: [panel("change", "Quarterly change", "%", [-12, -4, 3, 9]), panel("balance", "Net balance", "pts", [-80, -30, -45, 20])],
  constant: [panel("uptime", "Uptime", "%", [99, 99, 99, 99]), panel("headcount", "Headcount", "people", [40, 40, 40, 40])],
  extreme: [panel("micro", "Defect ratio", "ppm", [0.0002, 0.0005, 0.0003, 0.0008]), panel("scale", "Transactions", "events", [2_000_000, 90_000_000, 800_000_000, 1_500_000_000])],
  longLabels: [{ id: "revenue", title: "Enterprise recurring revenue", unit: "$M", data: [{ label: "First enterprise reporting interval", value: 118 }, { label: "Second metropolitan reporting interval", value: 132 }, { label: "Third specialist reporting interval", value: 149 }] }, { id: "margin", title: "Operating contribution margin", unit: "%", data: [{ label: "First enterprise reporting interval", value: 18 }, { label: "Second metropolitan reporting interval", value: 19 }, { label: "Third specialist reporting interval", value: 22 }] }],
  mismatchedLabels: [panel("a", "A", "u", [1, 2, 3, 4]), { ...panel("b", "B", "v", [4, 3, 2, 1]), data: [{ label: "Q1", value: 4 }, { label: "WRONG", value: 3 }, { label: "Q3", value: 2 }, { label: "Q4", value: 1 }] }],
  onePanel: synchronizedSmallMultiplesExample.slice(0, 1),
  fivePanels: [...synchronizedSmallMultiplesExample, panel("a", "A", "u", [1, 2, 3, 4]), panel("b", "B", "v", [4, 3, 2, 1])],
  duplicatePanel: [synchronizedSmallMultiplesExample[0], { ...synchronizedSmallMultiplesExample[1], id: "revenue" }],
  nonfinite: [panel("a", "A", "u", [1, Infinity, 3, 4]), panel("b", "B", "v", [1, 2, 3, 4])],
} as const satisfies Record<string, readonly SynchronizedPanel[]>;
