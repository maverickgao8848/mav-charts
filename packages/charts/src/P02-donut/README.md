# P02 Donut / 环形图

Use this template when a small number of non-negative categories divide one meaningful positive total and a compact center KPI helps readers retain that total. / 当少量非负类别共同构成一个有意义的正总量，并且中心 KPI 有助于读者记住该总量时使用。

Do not use it for negative values, precise ranking, many categories, independent percentages, or time trends. Use C05 for precise ranking and C09 for normalized rows. / 不用于负值、精确排名、过多类别、彼此独立的百分比或时间趋势；精确排名使用 C05，标准化行使用 C09。

```ts
type DonutDatum = { label: string; value: number | null; detail?: string };
```

Only finite positive values receive angle, exactly proportional to `value / positive reported total`. Zero and `null` remain distinct rows but receive no arc. At least one positive value is required for visible area. / 只有有限正值获得角度，且严格等于其占正值总量的比例；零与 `null` 保持不同语义但都不获得弧段。可见环形至少需要一个正值。

The center shows the real positive reported total by default. Hover or keyboard selection may replace it only with the selected category's real value and share; it never invents an average or completion rate. / 中心默认显示真实正值总量；悬停或键盘选择时只能替换为真实选中项的数值和占比，不会虚构平均值或完成率。

```tsx
<DonutChart data={donutExample} visualSystem="signal" unit=" customers" />
```

Tooltip, legend, keyboard status and the accessible table retain full labels, raw values, zero and missing rows. Signal uses a red focus slice with restrained light context slices, following the Ying donut plate. / Tooltip、图例、键盘状态和无障碍表格保留完整标签、原始值、零值和缺失行；Signal 以红色主弧和克制的浅色背景弧对齐 Ying 环形语法。
