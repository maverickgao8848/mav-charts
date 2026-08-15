# P01 Pie / 饼图

Use this chart for a small number of mutually exclusive parts of one whole. Input is `{ label, value, detail? }`; labels are unique and values are finite, non-negative, or `null`. The known total must be greater than zero. Every visible angle is exactly `value / known total × 360°`. A zero value has zero angle. `null` is reported as Missing in the legend, Tooltip/status, and table and never receives a fabricated angle.

用于展示一个整体中少量、互斥的构成部分。输入格式为 `{ label, value, detail? }`；标签必须唯一，数值必须是有限非负数或 `null`，且已知总计必须大于零。每个可见扇区的角度严格等于 `value / 已知总计 × 360°`。零值角度为零；`null` 会在图例、Tooltip/键盘状态和表格中标为 Missing，绝不伪造角度。

Do not use a pie for signed values, overlapping categories, more than about six slices, precise close comparisons, or a total whose missing share makes the known composition misleading. Use bars for precise comparison, a 100% stacked chart for repeated wholes, or a treemap for many parts. The first positive slice is the Signal focus; input order is preserved.

不要用于正负值、类别重叠、约六个以上扇区、非常接近的精确比较，或缺失部分会让“已知构成”产生误导的情形。精确比较请用条形图，多个整体请用 100% 堆叠图，较多构成请用矩形树图。Signal 聚焦输入顺序中的首个正值扇区，且组件不会重排数据。

```tsx
import { PieCompositionChart } from "@mav-charts/charts/P01-pie";

<PieCompositionChart data={[
  { label: "Core", value: 42 },
  { label: "Services", value: 33 },
  { label: "Partners", value: 25 },
]} />
```

