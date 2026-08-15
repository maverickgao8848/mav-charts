# P04 Radial Progress

中文：径向进度图。用于回答“多个 KPI 分别完成了多少？”

Use this template for a small set of progress measures that share a genuine
percentage denominator. Do not use it for unrelated units, precise ranking, or
more than a handful of KPIs; a bar chart is clearer in those cases.

```ts
type RadialProgressDatum = {
  label: string;
  value: number | null;
  detail?: string;
};
```

The scale is always `0..100`, inclusive. Values below zero or above 100,
`null`, blank labels and non-finite values render an explicit invalid state.
The chart never clamps invalid percentages for display or implies that 112% is
ordinary completion. Zero and 100 are valid boundary states.

```tsx
import {
  RadialProgressChart,
  radialProgressExample,
} from "@mav-charts/charts/P04-radial-progress";

<RadialProgressChart data={radialProgressExample} visualSystem="signal" />
```

The template includes direct values, an HTML legend, exact mouse tooltip,
keyboard KPI traversal with live status, an accessible data table, responsive
delivery layouts, real radial entry motion, automatic reduced-motion handling,
and deterministic capture mode.

