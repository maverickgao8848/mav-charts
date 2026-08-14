# T07 Multi-series Area / 多系列面积图

Use this chart for two same-unit, ordered series whose magnitudes have a meaningful zero baseline. The areas are **overlaid, not stacked**: both independently use `baseValue={0}` and share one zero-inclusive scale. Input categories are equally spaced and preserve their given order.

用于两个同单位、有序且零点具有真实意义的规模序列。两个面积是**覆盖（overlaid），不是堆叠（stacked）**：它们都独立使用 `baseValue={0}` 并共享包含零点的比例尺。类别等距且保留输入顺序。

Do not use for incompatible units, irregular dates, or additive composition. Missing values break only their own area and curve; they are never bridged or treated as zero.

不要用于不同单位、不规则日期或加总构成。缺失值只中断所属序列的面积和曲线，绝不跨越连接或归零。

```tsx
<MultiSeriesAreaChart
  data={[{ label: "Q1", value: 42, comparison: 31 }]}
  primaryName="Current"
  comparisonName="Prior"
/>
```

Data: `{ label: string; value: number | null; comparison: number | null; detail?: string }`. Labels must be non-blank and unique; present values must be finite.
