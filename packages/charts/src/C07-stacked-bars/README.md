# C07 Stacked Bars / 堆叠条形图

Use for two same-unit segments when both absolute total and composition matter and horizontal labels need room. Do not use for unrelated units or when precise segment comparison matters more than totals.

用于两个同单位分段的绝对总量与构成对比，适合长类别名称。不同单位不得堆叠；重视分段精确比较时应使用 C06。

The component never normalizes values. The example happens to total 100, but arbitrary totals such as 125 remain 125. Use C09 100% Stacked only for normalized share comparisons.

组件绝不自动归一化。示例恰好总计 100，但 125 等任意总量仍显示为 125；比较比例结构时使用 C09 100% Stacked。

Data: `{ label, value: number | null, comparison: number | null, detail? }`. Labels are unique/nonblank and values finite. `null` is an independent gap, never zero; incomplete rows show a `Visible` extent instead of pretending to have a complete total. Signed segments accumulate separately on either side of a shared zero baseline.

```tsx
<StackedBarChart data={[{ label: "North", value: 80, comparison: 45 }]} baseName="Core" upperName="Expansion" unit="pts" />
```
