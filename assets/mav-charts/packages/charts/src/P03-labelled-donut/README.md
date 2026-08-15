# P03 Labelled Donut / 直接标签环形图

Use this chart for a small non-negative composition when every reported slice needs an external direct label and leader line. Slice angle is strictly `value / reported positive total`; ring radius and thickness carry no value. / 用于少量非负构成，且每个已报告扇区都需要外部直接标签和引线。扇区角度严格等于 `value / 已报告正值总和`；环半径与厚度不编码数值。

Do not use it for precise ranking, negative values, many tiny slices, or nested hierarchy. Use C05 for exact ranking, F01 for rectangular area comparison, and F06 for hierarchy. Long labels are shortened only on the SVG; Tooltip, keyboard status, and table retain full text. / 不用于精确排名、负值、过多极小扇区或嵌套层级；精确排名用 C05，矩形面积比较用 F01，层级构成用 F06。长标签仅在 SVG 中缩写，Tooltip、键盘状态和表格保留全文。

```ts
type LabelledDonutDatum = {
  label: string;       // unique and non-blank
  value: number|null;  // finite and >= 0; null = Missing
  detail?: string;
};
```

Positive values receive proportional angle. `null` remains Missing and zero remains Zero in the accessible table, but neither receives a sector or a quantitative leader label. Labels are split to the left and right and collision-adjusted without changing the sector geometry. / 正值按比例分配角度；`null` 保留为 Missing，零保留为 Zero，但两者都不绘制扇区或定量引线标签。标签按左右两侧分流并避碰，不修改扇区几何。

```tsx
<LabelledDonutChart data={labelledDonutExample} visualSystem="signal" />
```

Mouse Tooltip, keyboard status, HTML legend and the table expose exact values and shares. Capture mode and `prefers-reduced-motion` render a complete static first frame. / 鼠标 Tooltip、键盘状态、HTML Legend 和表格提供精确值与占比；截图模式和减少动态偏好渲染完整静态首帧。
