# D04 Box Plot / 箱线图

Use to compare precomputed five-number summaries and optional outliers across categories. The input contract is `{ label, min, q1, median, q3, max, outliers? }` with `min ≤ q1 ≤ median ≤ q3 ≤ max`. Outliers must be finite and strictly outside `[min, max]`. A missing category must set all five summary fields to `null`; it retains its category slot but renders no statistical mark.

用于比较不同类别已经计算完成的五数概括与离群值。缺失类别必须把五个概括字段全部设为 `null`，保留类别位置但不渲染箱体、须线或中位线。

This component deliberately does not calculate quartiles. The caller owns the quartile algorithm, interpolation convention, whisker definition and outlier rule. Do not mix summaries produced by different algorithms in one chart. Keep raw samples and algorithm metadata upstream when auditability matters.

```tsx
<BoxPlotChart data={[
  { label: "Core", min: 18, q1: 26, median: 34, q3: 43, max: 52, outliers: [9, 61] },
]} unit=" pts" />
```
