# C09 100% Stacked / 百分比堆叠图

Use to compare a two-part composition across categories after normalization to 100%. Do not use when absolute totals matter; use C04 or C07 instead. The component accepts raw non-negative values and performs the normalization.

用于比较各类别归一化到 100% 后的两部分构成。需要表达绝对总量时应使用 C04 或 C07。组件接收非负原始值并负责归一化。

Data is `{ label, value: number | null, comparison: number | null, detail? }`. Both finite, non-negative segments must exist and total more than zero. If either is `null`, the entire column is a gap; a visible segment is never stretched to 100%. `0 + 0` is invalid because its proportions are undefined.

Direct integer percentage pairs use deterministic complementary rounding, so they always add to exactly 100. Tooltip and table retain raw values and precise shares.

```tsx
<PercentStackedChart data={[{ label: "2025", value: 57, comparison: 43 }]} primaryName="Primary" comparisonName="Comparison" />
```
