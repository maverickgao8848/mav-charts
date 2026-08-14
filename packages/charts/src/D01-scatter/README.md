# D01 Scatter / 散点图

Use to inspect the relationship between two quantitative variables. `value` is x and `comparison` is y; both axes use independent, honest padded domains and never force zero. Input order is preserved. The first complete point is the Signal focus.

用于观察两个定量变量的关系。`value` 为 x，`comparison` 为 y；两轴独立采用真实范围加留白，不强制包含零。保持输入顺序，Signal 聚焦第一个坐标完整的点。

Do not use for categorical rankings or imply causation. If either coordinate is `null`, the whole point is missing: it is retained in Tooltip/status/table but not drawn and never converted to zero. Overlapping points retain identical coordinates; only direct-label offsets change.

不要用于类别排名，也不要暗示因果。任一坐标为 `null` 时整点缺失：表格和键盘状态保留，但不绘制且绝不归零。重合点保持相同坐标，仅错开直接标签。

```ts
type ScatterDatum = {
  label: string;
  value: number | null;
  comparison: number | null;
  detail?: string;
};
```
