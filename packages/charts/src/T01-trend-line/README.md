# T01 Trend Line / 趋势折线图

Use for one metric across ordered observations whose spacing may be treated as equal. Input order is preserved and never auto-sorted. Do not use this categorical line when real time intervals are unequal; use a numeric/time axis template instead.

用于一个指标在可视为等距的有序观测中的变化。组件保留输入顺序且不自动排序；真实时间间隔不等时应使用数值或时间轴模板。

Data is `{ label: string; value: number | null; detail?: string }`. Labels must be unique/nonblank and values finite. `null` retains its axis/table position and breaks the path; it is never connected or treated as zero. The Y domain follows finite extent with padding and does not force zero; constant values receive a centered span.

```tsx
<TrendLineChart data={[{ label: "Q1", value: 28 }, { label: "Q2", value: 34 }]} unit="pts" />
```
