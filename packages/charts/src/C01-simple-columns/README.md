# C01 Simple Columns

中文：基础柱状图。用于回答“不同类别中谁更高、谁更低？”

Use this template for a direct comparison of a modest number of categorical
values. Do not use it for a long time series, part-to-whole composition, or when
dozens of long labels would be clearer in horizontal bars.

```ts
type SimpleColumnDatum = {
  label: string;
  value: number | null;
  detail?: string;
};
```

Non-null values must be finite and labels must be unique and non-empty. A null
value remains a missing category and is never rendered as a zero-height bar.
Positive-only data always starts at zero. Signed and negative data includes an
explicit zero baseline; the scale is never broken. Long display labels are
truncated while mouse tooltip, keyboard status and the accessible table retain
the full category text.

```tsx
import { SimpleColumnChart, simpleColumnExample } from "@mav-charts/charts/C01-simple-columns";

<SimpleColumnChart data={simpleColumnExample} visualSystem="signal" unit="%" />
```

The template includes direct value labels, a unit-bearing HTML legend, exact
mouse tooltip, keyboard traversal with live status, an accessible data table,
responsive delivery layouts, real column entry motion, reduced-motion handling,
and deterministic capture mode.

