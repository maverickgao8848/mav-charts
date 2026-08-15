# C08 Diverging Bars / 发散条形图

Use for one signed metric around a meaningful zero baseline. Input order is preserved; use C05 for ranking. Do not use color alone to encode direction: sign, position and the shared zero line carry the meaning.

用于围绕有意义零基线的一组正负指标，保留输入顺序；排名请使用 C05。方向由符号、位置和零线共同表达，不依赖新增红蓝颜色语法。

Data is `{ label: string; value: number | null; detail?: string }`. Labels are nonblank and unique; values are finite. `null` remains a Missing row without a bar and is never zero. Zero is retained with zero length. All values share one unbroken linear domain containing zero.

```tsx
<DivergingBarChart data={[{ label: "Gain", value: 35 }, { label: "Loss", value: -18 }]} unit="pts" />
```
