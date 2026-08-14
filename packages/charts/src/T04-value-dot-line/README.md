# T04 Value Dot Line / 数值点折线图

Use this chart when the audience must read the value at **every ordered, equally spaced observation**, not only the overall trend. Every finite point receives a dot and a direct value label. Nearby labels alternate above and below the line; first and last labels align inward to stay inside narrow canvases.

当读者必须直接读取**每一个有序、等距观察点**的数值，而不只是判断总体趋势时使用。每个有效点均显示圆点和直接数值标签；相邻近值标签会上下错层，首尾标签向画布内侧对齐，以适应移动端。

## Do not use / 不适用场景

Do not use for irregular time intervals, dense series, or many observations: equal horizontal spacing would misrepresent time and direct labels would become noise. Use a true time scale, tooltip-first trend line, or small multiples instead.

不要用于不规则时间间隔、密集序列或大量观察点：等距横轴会误导时间跨度，逐点标签也会形成噪声。应改用真实时间轴、以 Tooltip 为主的趋势线或小多图。

## Data contract / 数据格式

```ts
type ValueDotLineDatum = {
  label: string;
  value: number | null; // null breaks the line; it is never zero or bridged
  detail?: string;
};
```

- Input order is preserved; labels must be non-empty and unique.
- Values must be finite numbers or `null`.
- The y-domain is the padded finite extent and does not force zero. Constant, signed, and extreme values remain honest.
- Full labels and values remain available through Tooltip, keyboard status, and the accessible table.

- 保留输入顺序；标签必须非空且唯一。
- 数值只能是有限数或 `null`。
- Y 域采用有效值真实范围并留白，不强制包含零；常量、正负值和极值不会被歪曲。
- Tooltip、键盘状态和无障碍表格保留完整标签与数值。

## Example / 示例

```tsx
<ValueDotLineChart
  data={[
    { label: "Week 1", value: 128 },
    { label: "Week 2", value: 143 },
    { label: "Week 3", value: null },
    { label: "Week 4", value: 173 },
  ]}
  visualSystem="signal"
  unit="k"
/>
```
