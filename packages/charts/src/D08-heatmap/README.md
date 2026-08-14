# D08 Heatmap

中文：热力图。用于回答“两个分类维度中的密度集中在哪里？”

Use this template to scan a complete row-by-column matrix for concentration,
gaps and outliers. Do not use it when exact values are the primary message, the
axes are continuous, or the color differences would imply an unsupported
ordering.

```ts
type HeatmapDatum = {
  row: string;
  column: string;
  value: number | null;
  detail?: string;
};
```

Finite values share one continuous domain. `null` is an explicit missing cell;
an omitted coordinate is an implicit missing cell after the geometry expands to
the complete `row × column` grid. Both use the missing pattern and are never
coerced to zero. Duplicate coordinates, blank categories and non-finite values
render an explicit invalid state. A constant matrix uses the midpoint of the
color scale rather than inventing a spread.

```tsx
import { HeatmapChart, heatmapExample } from "@mav-charts/charts/D08-heatmap";

<HeatmapChart data={heatmapExample} visualSystem="digital" />
```

The template includes a continuous HTML color-scale legend, direct peak label,
exact mouse tooltip, two-dimensional keyboard traversal with live status, an
accessible complete-grid table, responsive layouts, staggered cell entry,
reduced-motion handling, and deterministic capture mode.

