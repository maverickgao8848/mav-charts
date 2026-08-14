# B04 Radar Profile / 雷达能力画像

Use this chart to compare two profiles across the same ordered dimensions only after every measure has been normalized to a documented 0..100 score. Both series share the fixed scale. / 仅在所有指标都已按公开规则归一化为 0..100 分后，用本图比较两个画像；两系列共享固定刻度。

Do not pass raw revenue, percentages, latency, counts, or other mixed units. The component never normalizes inputs because silently choosing baselines would be misleading. Use grouped bars or small multiples for raw mixed measures. Radar shape and area are visual summaries, not additive totals. / 禁止混入收入、百分比、时延、计数等原始不同单位。组件不会自动归一化，因为暗中选择基线会误导；原始混合指标应使用分组条形图或小多图。雷达形状和面积不是可相加总量。

```ts
type RadarProfileDatum = {
  label: string;
  value: number | null;
  comparison: number | null;
  detail?: string;
};
```

Labels must be unique and non-blank; scores must be finite within 0..100 or `null`. Null is Missing, never zero. A series needs at least three reported axes for a profile polygon; fewer axes remain visible in the table/status with an explicit unavailable message. / 标签唯一且非空，分数必须是 0..100 内有限值或 `null`；缺失绝不归零。每系列至少三个已报告轴才形成画像多边形，较少时仍保留表格和状态并明确不可用。

```tsx
<RadarProfileChart
  data={radarProfileExample}
  primaryName="Current"
  comparisonName="Reference"
/>
```
