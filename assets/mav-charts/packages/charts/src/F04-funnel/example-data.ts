import type { FunnelDatum } from "./schema";

export const funnelExample = Object.freeze([
  { label: "Market leads", value: 1000, detail: "Qualified top-of-funnel interest" },
  { label: "Valid demand", value: 620, detail: "Demand that meets qualification rules" },
  { label: "Proposals", value: 310, detail: "Commercial proposals submitted" },
  { label: "Closed deals", value: 128, detail: "Final completed transactions" },
] as const satisfies readonly FunnelDatum[]);

export const funnelEdgeCases = Object.freeze({
  empty: [] as readonly FunnelDatum[],
  single: [{ label: "Qualified", value: 25 }] as const satisfies readonly FunnelDatum[],
  missing: [{ label: "Visits", value: 100 }, { label: "Qualified", value: null }, { label: "Won", value: 20 }] as const satisfies readonly FunnelDatum[],
  zero: [{ label: "Visits", value: 100 }, { label: "Qualified", value: 18 }, { label: "Won", value: 0 }] as const satisfies readonly FunnelDatum[],
  flat: [{ label: "A", value: 40 }, { label: "B", value: 40 }, { label: "C", value: 40 }] as const satisfies readonly FunnelDatum[],
  ties: [{ label: "A", value: 100 }, { label: "B", value: 70 }, { label: "C", value: 40 }] as const satisfies readonly FunnelDatum[],
  extreme: [{ label: "Reach", value: 1_000_000_000 }, { label: "Intent", value: 2_500_000 }, { label: "Won", value: 12 }] as const satisfies readonly FunnelDatum[],
  longLabel: [{ label: "All visitors arriving from international campaign channels", value: 800 }, { label: "Visitors completing enterprise qualification requirements", value: 420 }, { label: "Accounts signing the annual commercial agreement", value: 90 }] as const satisfies readonly FunnelDatum[],
  negative: [{ label: "Visits", value: -1 }] as const satisfies readonly FunnelDatum[],
  increasing: [{ label: "Visits", value: 20 }, { label: "Qualified", value: 30 }] as const satisfies readonly FunnelDatum[],
  duplicate: [{ label: "Lead", value: 20 }, { label: "lead", value: 10 }] as const satisfies readonly FunnelDatum[],
  nonfinite: [{ label: "Visits", value: Number.POSITIVE_INFINITY }] as const satisfies readonly FunnelDatum[],
  blank: [{ label: "  ", value: 20 }] as const satisfies readonly FunnelDatum[],
});

