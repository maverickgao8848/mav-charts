# C03 Grouped Columns / 分组柱状图

中文：用于在同一类别内并列比较两个同单位系列。每组共享一个 y 轴，缺失系列保留空位而不补零。

Use Grouped Columns when each category needs a side-by-side comparison of two series measured in the same unit. Do not confuse it with stacked columns: adjacent bars compare individual magnitudes, while a stack encodes a total and its composition. For more than three series, dense labels, or many categories, prefer small multiples or another comparison template.

```ts
type GroupedColumnDatum = {
  label: string;
  value: number | null;
  comparison: number | null;
  detail?: string;
};
```

Labels must be unique and non-empty. Non-null values must be finite. Each series has an independent nullable gap; neither missing value is converted to zero. Positive data starts at zero and signed data includes an explicit zero line. Both series share one honest y scale and therefore must use the same unit.

```tsx
import { GroupedColumnChart, groupedColumnExample } from "@mav-charts/charts/C03-grouped-columns";

<GroupedColumnChart
  data={groupedColumnExample}
  visualSystem="signal"
  primaryName="Current"
  comparisonName="Prior"
  unit="pts"
/>
```

The template provides a two-series mouse tooltip, HTML legend, compact direct labels, category-level keyboard status, accessible data table, real staggered series entry, internal reduced-motion handling, and deterministic capture mode.
