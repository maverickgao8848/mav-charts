# C02 Rounded Columns / 圆角柱状图

中文：适合少量类别、希望传达友好完成度或进展感的垂直比较。圆角只改变柱顶轮廓，不改变长度编码。

Use Rounded Columns for a small set of approachable KPI, completion, or adoption comparisons. Use C01 Simple Columns instead for many categories, dense analytical work, or precise engineering reports where restrained square geometry is clearer. Rounded styling is not a license to exaggerate short values.

```ts
type RoundedColumnDatum = {
  label: string;
  value: number | null;
  detail?: string;
};
```

Labels must be unique and non-empty; non-null values must be finite. `null` remains a visible category gap and is never converted to zero. Positive data starts at zero, while signed data includes an explicit zero baseline. The controlled radius is capped at `min(width / 2, height / 2)`, so zero, tiny, and negative values cannot become oversized pills or distort bar length.

```tsx
import { RoundedColumnChart, roundedColumnExample } from "@mav-charts/charts/C02-rounded-columns";

<RoundedColumnChart data={roundedColumnExample} visualSystem="signal" cornerRadius={18} unit="%" />
```

The template includes an exact mouse tooltip, HTML legend, direct value labels, keyboard traversal with live status, a screen-reader table, deterministic capture mode, real entry motion, and internal reduced-motion handling.
