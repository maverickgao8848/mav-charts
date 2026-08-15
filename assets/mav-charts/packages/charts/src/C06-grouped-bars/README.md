# C06 Grouped Bars / 分组条形图

Use this horizontal paired comparison when category order is meaningful and labels are too long for columns. Each category keeps its input position; C06 does not rank automatically. Use C05 when descending rank is the story, or small multiples when more than two series compete.

适用于类别顺序有意义、名称较长的两组同单位指标对比。组件保留输入顺序，不自动排序；需要排名时使用 C05，系列超过两组时优先使用 small multiples。

## Data contract

`{ label: string; value: number | null; comparison: number | null; detail?: string }`. Labels must be non-blank and unique. Numbers must be finite. `null` creates an independent gap and is never converted to zero. Both series share one unbroken domain; positive-only data starts at zero and signed data includes a zero reference.

```tsx
<GroupedBarChart
  data={[{ label: "North America", value: 84, comparison: 62 }]}
  primaryName="Current"
  comparisonName="Prior"
  unit="pts"
/>
```

Direct labels may be compacted visually, while tooltip, keyboard status and the accessible table retain the complete label and value.
