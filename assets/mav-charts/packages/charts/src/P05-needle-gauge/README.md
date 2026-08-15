# P05 Needle Gauge / 指针仪表

Use this chart for one value within an explicitly declared finite range. Input is `{ label, value, min, max, thresholds, detail? }`; `min < max`, the value must remain inside the range, threshold maxima must be strictly increasing, and the final threshold must equal `max`. Negative ranges are valid. The needle angle is strictly linear: `180° − (value − min) / (max − min) × 180°`. No clamping is performed, so missing, non-finite, or out-of-range values are invalid instead of being silently moved onto the scale.

用于展示一个数值在明确有限区间中的位置。输入为 `{ label, value, min, max, thresholds, detail? }`；必须满足 `min < max`，数值位于区间内，阈值上界严格递增，且最后一个阈值等于 `max`。负数区间合法。指针角度严格线性映射：`180° − (value − min) / (max − min) × 180°`。组件不会偷偷截断数值，缺失、非有限或越界输入均直接判为无效。

Do not use a gauge for trends, precise comparison across many metrics, or thresholds that do not share one unit. Use a line for change over time, bars for comparison, and P04 radial progress only for true 0–100 completion. Bands are contextual ranges; the single red needle is the decisive Signal mark.

不要用仪表图表达趋势、多指标精确比较或单位不一致的阈值。时间变化请用折线图，多指标比较请用条形图；只有真实 0–100 完成度才使用 P04。区间带仅提供上下文，唯一红色指针是 Signal 的决定性视觉信号。

```tsx
import { NeedleGaugeChart } from "@mav-charts/charts/P05-needle-gauge";

<NeedleGaugeChart data={{
  label: "Capacity", value: 72, min: 0, max: 100,
  thresholds: [{ label: "Low", max: 40 }, { label: "Balanced", max: 75 }, { label: "High", max: 100 }],
}} />
```

