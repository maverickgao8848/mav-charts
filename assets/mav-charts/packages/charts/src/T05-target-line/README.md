# T05 Target Line / 目标线图

Use T05 when actual performance and a target share one unit and the question is whether each ordered observation is below, at, or above target. The target may vary by observation. Both series define one padded y-domain, so an out-of-range target is never clipped and zero is not forced.

当实际表现与目标使用同一单位，并需要判断各观察点低于、达到或高于目标时使用。目标可以随观察点变化；两条序列共同决定留白后的 Y 域，因此目标不会被裁剪，也不会强制包含零。

Do not use for different units, irregular time spacing, or unrelated benchmarks. Use a dual-axis chart only when units truly differ, and a true time scale for irregular dates.

不要用于不同单位、不规则时间间隔或无关基准；单位确实不同时才使用双轴，不规则日期应使用真实时间轴。

```ts
type TargetLineDatum = {
  label: string;
  actual: number | null; // null breaks actual only
  target: number;        // finite, same unit as actual
  detail?: string;
};
```

Input order is preserved. Labels must be non-empty and unique; actual must be finite or `null`; target must always be finite. Tooltip, keyboard status, and the accessible table retain actual, target, signed delta, status, and full labels.

保留输入顺序。标签必须非空且唯一；实际值只能是有限数或 `null`；目标必须始终为有限数。Tooltip、键盘状态和无障碍表格保留实际值、目标、带符号差值、状态及完整标签。

```tsx
<TargetLineChart data={[
  { label: "Q1", actual: 62, target: 75 },
  { label: "Q2", actual: null, target: 75 },
  { label: "Q3", actual: 83, target: 75 },
]} visualSystem="signal" unit="%" />
```
