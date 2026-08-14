# T13 Brush / Zoom Time Series

中文：刷选／缩放时间序列。用于回答“长时间序列中的哪一段需要局部检查？”

Use this template for a dense, ordered time series whose reader needs to drag
the brush to focus on a smaller interval without losing the full-series
context. Do not use it for a handful of categories, unordered observations, or
when a static line chart can answer the question more directly.

```ts
type BrushTimeSeriesDatum = {
  label: string;
  value: number | null;
  detail?: string;
};
```

Labels must be non-empty and values must be finite. A `null` value renders an
explicit invalid state; missing observations are never silently interpolated or
coerced to zero.

```tsx
import {
  BrushTimeSeriesChart,
  brushTimeSeriesExample,
} from "@mav-charts/charts/T13-brush-time-series";

<BrushTimeSeriesChart data={brushTimeSeriesExample} visualSystem="digital" />
```

The template includes a draggable Recharts brush, exact mouse tooltip, semantic
HTML legend, direct latest-value label, keyboard point traversal with a live
status tooltip, accessible data table, responsive layouts, automatic
reduced-motion handling, and deterministic capture mode.

