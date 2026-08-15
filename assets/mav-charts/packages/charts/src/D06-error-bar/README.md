# D06 Error Bar / 误差棒

Use for category estimates with explicit absolute lower and upper bounds in the same unit. Each complete row must satisfy `lower <= estimate <= upper`; negative values and zero-width intervals are valid. Domains include every bound with padding and are not forced to zero.

用于展示各类别的估计值及同单位的明确绝对下界和上界。完整行必须满足 `lower <= estimate <= upper`；负值和零宽区间合法。坐标域包含所有上下界并留出 padding，不强制包含零。

All three numeric fields must be finite or all three must be `null`. A fully null row is a missing whole mark and remains in the accessible table. Tooltip reports the estimate, absolute bounds, and asymmetric `+/-` distances.

三个数值字段必须全部有限，或全部为 `null`。全空行表示整点缺失，但仍保留在无障碍表格中。Tooltip 展示估计值、绝对上下界和不对称的 `+/-` 距离。

Bounds are supplied facts. This component does not infer confidence level, sample size, standard error, probability, or statistical significance. Do not label an interval “95% CI” unless the caller's data actually represents that.

上下界是调用方提供的事实。本组件不会推断置信水平、样本量、标准误、概率或统计显著性；除非数据确实如此，否则不要把区间标成“95% CI”。

```tsx
<ErrorBarChart
  data={[{ label: "A", estimate: 12, lower: 9, upper: 18 }]}
  unit=" pts"
/>
```
