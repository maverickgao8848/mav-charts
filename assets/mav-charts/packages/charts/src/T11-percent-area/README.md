# T11 Percent Area / 百分比面积图

Use this chart for two non-negative, same-unit parts when the question is how composition changes over equally spaced ordered observations. Each complete row is normalized to 100%; raw magnitude is retained in the tooltip and accessible table but never controls area height.

用于展示两个非负、同单位部分的构成比例如何随等距有序观察点变化。仅完整且总和大于零的行会归一化到 100%；Tooltip 与无障碍数据表保留原始值，但面积高度绝不按原始总量编码。

Missing either part creates a whole gap in both areas. `0 + positive` is valid; `0 + 0`, negative values, duplicate/blank labels and non-finite values are invalid. Display percentages are an integer complementary pair summing exactly to 100 while precise shares remain available.

任一部分缺失都会让两层面积同时断开。`0 + 正数` 合法；`0 + 0`、负数、重复或空标签、非有限值均无效。展示整数百分比始终互补为 100，同时保留精确份额。

Do not use T11 for absolute magnitude: use T08 Stacked Area. Do not use it for independent overlapping series or more than two parts.

不要用 T11 表达绝对规模（应使用 T08 Stacked Area），也不要用于独立重叠系列或超过两个部分的构成。

```tsx
<PercentAreaChart data={[{ label: "Q1", value: 32, comparison: 68 }]} unit="accounts" />
```
