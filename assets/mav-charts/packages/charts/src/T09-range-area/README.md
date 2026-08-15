# T09 Range Area

中文：区间面积图。用于回答“中位趋势与不确定性区间如何变化？”。

Use this template when every period has a defensible lower bound, median and
upper bound, such as forecast intervals, scenario envelopes or measurement
uncertainty. Do not use it to decorate a single line or when the band has no
statistical or business meaning.

```ts
type RangeAreaDatum = {
  label: string;
  low: number | null;
  median: number | null;
  high: number | null;
  detail?: string;
};
```

Every valid row must satisfy `low ≤ median ≤ high`. A `null` value renders the
explicit invalid state and is never interpolated or treated as zero.

```tsx
import { RangeAreaChart, rangeAreaExample } from "@mav-charts/charts/T09-range-area";

<RangeAreaChart data={rangeAreaExample} visualSystem="digital" />
```

The template includes direct median labels, a semantic legend, mouse and
keyboard tooltips, an accessible data table, automatic reduced-motion handling,
deterministic capture mode and responsive delivery layouts.
