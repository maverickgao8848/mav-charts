# F05 Nested Treemap / 嵌套矩形树图

Use this chart for non-negative leaf values organized under at least two explicit hierarchy levels. Parent areas equal the sum of their reported positive descendants. / 用于至少两级明确层级下的非负叶节点；父级面积等于其已报告正值后代之和。

Do not use it for a flat composition (use F01), exact ranking (C05), negative values, or hierarchies so deep that labels become unreadable. / 单层构成请用 F01，精确排名请用 C05；不支持负值，也不适合标签无法阅读的过深层级。

```ts
type NestedTreemapDatum = {
  path: readonly string[]; // >= 2 non-blank segments; complete path unique
  value: number | null;    // finite and >= 0; null = Missing
  detail?: string;
};
```

Only positive leaves receive area. Missing leaves stay Missing and zero leaves stay Zero in status/table, but neither contributes to a parent total or receives a tile. The component never infers a missing child from its siblings. / 仅正值叶节点分配面积；缺失和零值都保留在状态与表格中，但不贡献父级总量且没有矩形。组件不会依据兄弟节点推断缺失值。

```tsx
<NestedTreemapChart data={nestedTreemapExample} visualSystem="signal" />
```

Mouse and keyboard access provide full paths, values, shares and parent totals; direct labels may truncate visually while the table preserves full text. Capture and reduced-motion modes render statically. / 鼠标与键盘提供完整路径、数值、占比和父级总量；直接标签可视觉截断，但表格保留全文；截图及减少动态模式为静态。

