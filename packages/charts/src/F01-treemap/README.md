# F01 Treemap / 矩形树图

Use this template to compare non-negative category magnitudes through area within one whole. It is best for a moderate number of categories when broad composition matters more than exact lookup. / 用面积比较同一整体内的非负类别规模；适合类别数量适中、重视整体构成而非精确查数的场景。

Do not use it for negative values, precise ranking, time trends, or more than one hierarchy level. Use C05 for exact ranking and F05 for nested hierarchy. Area is harder to compare than aligned length. / 不用于负值、精确排名、时间趋势或多层层级；精确排名请用 C05，多层层级请用 F05。面积比对齐长度更难比较。

## Data

```ts
type TreemapDatum = {
  label: string;       // unique, non-blank
  value: number|null;  // finite and >= 0; null means missing
  parent?: string;     // optional one-level context, not nested layout
  detail?: string;
};
```

Positive values receive area exactly proportional to `value / positive total`. `null` stays Missing and receives no tile; zero remains a Zero row and receives no visible area. The component never converts missing to zero. / 正值面积严格对应正值总和中的占比；`null` 保留为 Missing 且不分配矩形，零值保留为 Zero 行但没有可见面积，组件不会把缺失值当作零。

```tsx
<TreemapChart data={treemapExample} visualSystem="signal" />
```

Mouse hover shows value, share and optional parent; keyboard arrows expose the same status; the accessible table preserves every row and full label. Capture mode and reduced motion render the first frame statically. / 鼠标、键盘状态与无障碍表格均保留完整数值、占比、父级和长标签；截图模式与减少动态偏好保持静态首帧。

