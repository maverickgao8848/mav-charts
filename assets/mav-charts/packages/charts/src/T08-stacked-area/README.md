# T08 Stacked Area / 堆叠面积图

Use for the **absolute total and composition** of two non-negative, same-unit parts across ordered, equally spaced observations. Values are stacked as raw magnitudes and are never normalized. Arbitrary totals remain arbitrary.

用于展示两个非负、同单位部分在有序等距观察点上的**绝对总量与构成**。组件堆叠原始数值，绝不归一化，任意总量都会保持原值。

This is not T11 100% Stacked Area: choose T11 only for percentage composition. Do not use T08 for incompatible units, negative values, irregular dates, or when zero lacks meaning.

这不是 T11 百分比堆叠面积图；只有比较比例构成时才选择 T11。不同单位、负值、不规则日期或无意义零点不应使用 T08。

If either part is `null`, the whole category is missing: both areas break because the total is unknown. A remaining part is never shown as a fabricated total. Zero is valid.

任一部分为 `null` 时，整列都视为缺失并同时中断两个面积，因为总量未知；绝不以剩余部分伪造总量。零值合法。

```tsx
<StackedAreaChart
  data={[{ label: "Q1", value: 38, comparison: 24 }]}
  baseName="Core"
  upperName="Expansion"
/>
```
