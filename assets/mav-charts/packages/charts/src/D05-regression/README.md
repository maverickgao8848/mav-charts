# D05 Regression / 回归散点图

Use D05 when the question is whether two quantitative variables have a plausible linear association. The chart preserves every complete point, overlays the ordinary least-squares fit, and reports slope, intercept, R², predicted values, and residuals. Both axes use independent padded extents and do not force zero.

当问题是两个定量变量是否存在可能的线性关系时使用 D05。图表保留每个完整点，叠加普通最小二乘拟合，并报告斜率、截距、R²、预测值和残差。两轴使用独立留白范围，不强制包含零点。

## When not to use / 何时不要使用

- Do not use it to claim causation, forecast outside the observed x range, or hide influential outliers.
- Do not use it when the relationship is categorical, clearly nonlinear, time ordered, or based on fewer than two complete points with distinct x values.
- Use D01 Scatter when a fit would overstate the evidence, D04 Box Plot for distribution summaries, or a trend template such as T01 when order over time is the main question.

- 不要用它宣称因果关系、外推观测 x 范围之外的结果，或隐藏高影响离群点。
- 当关系是分类、明显非线性、具有时间顺序，或完整点少于两个且 x 没有变化时不要使用。
- 不应拟合时改用 D01 Scatter；比较分布摘要用 D04 Box Plot；主要问题是时间顺序时改用 T01 等趋势模板。

## Data contract / 数据格式

```ts
export type RegressionDatum = {
  label: string;
  value: number | null;       // x coordinate
  comparison: number | null;  // y coordinate
  detail?: string;
};
```

`label` must be non-empty and unique. `value` and `comparison` must each be finite numbers or `null`. If either coordinate is `null`, the whole point is missing: it is not drawn, fitted, or converted to zero, but remains available to the accessible table. A fit requires at least two complete points and nonzero x variance. Single-point and degenerate-x inputs explicitly report `Fit unavailable`; no line is fabricated.

`label` 必须非空且唯一。`value` 与 `comparison` 必须分别是有限数或 `null`。任一坐标为 `null` 时整点缺失：不绘制、不参与拟合、也不归零，但仍保留在无障碍表格中。拟合至少需要两个完整点且 x 方差非零；单点或 x 退化输入会明确显示 `Fit unavailable`，绝不伪造回归线。

## Example / 示例

```tsx
import { RegressionChart } from "@mav-charts/charts/D05-regression";

const data = [
  { label: "North", value: 42, comparison: 58, detail: "Established market" },
  { label: "West", value: 61, comparison: 73 },
  { label: "Unreported", value: null, comparison: null },
];

export function Example() {
  return (
    <RegressionChart
      data={data}
      visualSystem="signal"
      title="Higher adoption aligns with stronger retention"
      subtitle="ADOPTION × RETENTION · OLS FIT"
    />
  );
}
```

Association is not causation. Before interpreting the fit, check linearity, independence, measurement quality, residual structure, and influential observations.

相关不等于因果。解释拟合前，应检查线性、独立性、测量质量、残差结构与高影响观测。
