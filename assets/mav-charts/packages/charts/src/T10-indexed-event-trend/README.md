# T10 Indexed Event Trend / 指数化事件趋势

Use for two ordered, equally spaced, same-unit series that the caller has already indexed to a shared baseline of 100. The component preserves input values and order; it never rebases or normalizes them. Event strings become vertical annotations.

用于比较两个已由调用方按共同基期 `100` 指数化、顺序且等距的同单位序列。组件保持原值和输入顺序，不会重新归一化；事件字符串会成为垂直标注。

Do not use raw values with different baselines, irregular time intervals, or different units. Preprocess both series against the same baseline first; use a real time-series template for irregular intervals. Missing values create independent line gaps and are never converted to zero.

不要传入基期不同的原始值、非等距时间或不同单位。请先以同一基期预处理；非等距时间应改用真实时间序列模板。缺失值会让对应折线独立断开，绝不归零。

```ts
type IndexedEventDatum = {
  label: string;
  value: number | null;
  comparison: number | null;
  event?: string;
  detail?: string;
};
```

```tsx
<IndexedEventTrendChart
  data={[
    { label: "T0", value: 100, comparison: 100 },
    { label: "T+1", value: 118, comparison: 105, event: "Launch" },
  ]}
/>
```
