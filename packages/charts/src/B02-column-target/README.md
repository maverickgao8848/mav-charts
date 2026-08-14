# B02 Column + Target / 柱形目标图

Use this chart to compare an actual value with a target in the same unit for each ordered category. Actual columns and target markers share one unbroken, zero-inclusive axis. Positive-only values start at zero; negative-only and signed values still include zero. `null` actual and `null` target are independent missing measurements. Delta is `actual − target` and is only computed when both values exist.

用于比较每个有序类别中同单位的实际值与目标值。Actual 柱和 Target marker 共享同一个未断轴、始终包含零的坐标域。全正值从零开始，负值或正负混合也必须包含零。`null` actual 与 `null` target 是彼此独立的缺失测量。Delta 定义为 `actual − target`，只有两者均存在时才计算。

The first category with the largest absolute non-zero delta is the focus; ties keep input order. A zero delta does not invent a focus. The marker encodes the exact target position, not an error range. Do not use this chart when targets have another unit, represent a confidence interval, or are incomparable across categories. Use B01 for a bounded percentage rate, an error-bar chart for uncertainty, or small multiples for incompatible units.

第一个绝对非零 delta 最大的类别是焦点，并列时保留输入顺序；全部刚好达标时不虚构焦点。Marker 表示精确目标位置，不是误差范围。目标若使用另一单位、表示置信区间或类别间不可比，请不要使用本图；有界百分比请选择 B01，不确定性请选择误差棒，不同单位请选择小多图。

```tsx
import { ColumnTargetChart } from "@mav-charts/charts/B02-column-target";

<ColumnTargetChart
  data={[
    { label: "Team one", actual: 68, target: 80 },
    { label: "Team two", actual: 82, target: 80 },
  ]}
  unit="K"
/>;
```
