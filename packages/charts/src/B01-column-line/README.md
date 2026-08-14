# B01 Column + Line / 柱线组合图

Use this chart only for an ordered series where the columns are an absolute scale and the line is a bounded rate expressed on a true 0–100% axis. Both measurements belong to the same period or category. The left scale axis always includes zero; signed scale values extend honestly below zero. The right rate axis is fixed at 0–100%, so it cannot be tightened to manufacture apparent co-movement. `null` remains a real bar gap or line break.

仅用于同一有序时期或类别中的“绝对规模 + 0–100% 有界比率”。左侧规模轴始终包含零，负规模如实向零线以下延伸；右侧比率轴固定为 0–100%，不得收紧范围来制造同步趋势。`null` 始终是柱缺口或折线断点，不会被当作零。

Do not compare equal vertical positions as equal values, infer causality, or use an arbitrary second-unit metric here. Use B03 only when a genuinely different unbounded unit must share a compact view—with its stronger independent-scale warning. Prefer synchronized small multiples when shape comparison is the message, indexed lines for relative change, and a simple column chart when the rate is incidental.

不要把相同垂直位置解释为相同数值，不要推断因果，也不要在本模板中放入任意第二单位。只有确实需要在紧凑空间展示另一个无界单位时才考虑 B03，并保留其更强的独立轴警告。比较走势优先用同步小多图，比较相对变化优先用指数折线，比率不重要时只用基础柱状图。

```tsx
import { ColumnLineChart } from "@mav-charts/charts/B01-column-line";

<ColumnLineChart
  data={[
    { label: "Q1", scaleValue: 128, ratePercent: 28 },
    { label: "Q2", scaleValue: 143, ratePercent: 34 },
  ]}
  scaleName="Orders"
  scaleUnit="K"
  rateName="Conversion"
/>;
```
