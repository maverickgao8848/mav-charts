# T02 Multi-series Line / 多系列折线图

Use this chart to compare two **same-unit** series across ordered, equally spaced observations. Input order is preserved. Each missing value breaks only its own line; it is never treated as zero or bridged.

用于比较两个**同单位**序列在有序、等间距观察点上的变化。组件保留输入顺序；任一序列的缺失值只中断该序列，既不归零也不跨越连接。

Do not use it for irregular time intervals, unordered categories, more than a few series, or dual-unit measures. Use a true time scale for irregular dates and separate panels/indexed values for incompatible units.

不要用于不规则时间间隔、无序类别、过多序列或双单位指标。不规则日期应使用真实时间比例尺，不同单位应使用分面图或指数化方案。

```tsx
<MultiSeriesLineChart
  data={[{ label: "Q1", value: 28, comparison: 24 }]}
  primaryName="Current"
  comparisonName="Prior"
  unit="%"
/>
```

Data shape: `{ label: string; value: number | null; comparison: number | null; detail?: string }`. Labels must be non-blank and unique; numeric values must be finite.
