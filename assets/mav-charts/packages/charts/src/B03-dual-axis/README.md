# B03 Dual Axis

中文：双轴组合图。用于回答“两个不同单位的指标如何共同变化？”

Use this template only when bar and line series have different units, share the
same ordered categories, and the reader needs a compact view of co-movement.
The left bar scale and right line scale are independent and must never imply
that equal vertical positions are equal values.

Prefer indexed series when relative change is the message. Prefer synchronized
small multiples when shape comparison matters or when either scale choice could
exaggerate correlation. Do not use dual axes to manufacture a visual match.

```ts
type DualAxisDatum = {
  label: string;
  barValue: number | null;
  lineValue: number | null;
  detail?: string;
};
```

Non-null values must be finite and labels must be unique and non-empty. A null
bar or line remains a true gap and is never coerced to zero. Positive-only bar
axes start at zero; negative bar data always includes zero. The line axis uses
its own honest padded extent and is not forced to zero.

```tsx
import { DualAxisChart, dualAxisExample } from "@mav-charts/charts/B03-dual-axis";

<DualAxisChart data={dualAxisExample} barUnit="$M" lineUnit="%" />
```

The template includes unit-bearing HTML legend labels, direct peak/latest
values, exact mouse tooltip, keyboard traversal with live status, an accessible
table, responsive layouts, separate bar and line entry motion, reduced-motion
handling, and deterministic capture mode.

