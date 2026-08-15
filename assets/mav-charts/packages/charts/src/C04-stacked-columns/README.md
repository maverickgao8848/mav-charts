# C04 Stacked Columns / 堆叠柱状图

中文：用于比较各类别的总量及其两个同单位组成部分。正负贡献分别从零线向两侧诚实堆叠，缺失段不会被当作零。

Use Stacked Columns when both the category total and a two-part composition matter. Use C03 Grouped Columns when the main question is a direct series-to-series comparison. Do not use a stack for unrelated units, and prefer small multiples when many segments make composition unreadable. The bundled reference rows happen to total 100 to match the original Signal example, but this component never normalizes input; use C09 100% Stacked when the question is proportional composition rather than absolute totals.

The example happens to total 100 in every category, but this component never normalizes values. Use C09 100% Stacked when every category must encode proportional shares summing to 100%.

```ts
type StackedColumnDatum = {
  label: string;
  value: number | null;
  comparison: number | null;
  detail?: string;
};
```

Labels must be unique and non-empty; non-null values must be finite. Both segments share one unit and one unbroken y scale. Positive and negative contributions accumulate independently from zero. A category total is reported only when both segments are present; `null` remains an explicit missing gap and is never silently replaced with zero. For mixed-sign data, positive and negative extents are labelled separately because netting would hide the encoded stack length.

```tsx
import { StackedColumnChart, stackedColumnExample } from "@mav-charts/charts/C04-stacked-columns";

<StackedColumnChart data={stackedColumnExample} visualSystem="signal" baseName="Core" upperName="Expansion" unit="pts" />
```

The template includes exact two-segment mouse tooltip and total semantics, HTML legend, segment and extent labels, category keyboard status, accessible table, deterministic capture mode, real staggered Recharts entry motion, and internal reduced-motion handling.
