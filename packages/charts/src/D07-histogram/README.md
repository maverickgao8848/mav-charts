# D07 Histogram / 直方图

Use for an already binned frequency distribution. Input bins are `{ start, end, count, label? }`: boundaries must be finite, strictly ordered, continuous without gaps or overlaps, and equal-width within numeric tolerance. Counts must be non-negative integers or `null`. A `null` count preserves the bin position as an explicit dashed missing gap; it is never treated as zero.

用于展示已经完成分箱的频数分布。区间必须有限、严格升序、首尾连续且等宽；`null` 频数保留区间位置并显示缺失间隙，不会被解释成零频数。

This component does not choose bins or count raw samples. The caller owns the binning algorithm and boundary convention. The default interval notation is `[start, end)`. Do not use this equal-width BarChart template for unequal-width bins: equal visual bar widths would make density comparisons dishonest. Use a variable-width density histogram instead.

```tsx
<HistogramChart data={[
  { start: 0, end: 10, count: 4 },
  { start: 10, end: 20, count: 11 },
]} />
```
