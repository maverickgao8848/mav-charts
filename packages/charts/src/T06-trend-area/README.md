# T06 Trend Area / 趋势面积图

Use this chart for one ordered, equally spaced series when the filled distance from a **meaningful zero baseline** communicates scale as well as trend. Positive, negative, and signed data always include zero in the y-domain; the domain is never truncated to exaggerate change.

当单一有序等距序列需要同时表达趋势与相对**真实零基线**的规模时使用。正值、负值和跨零数据的 Y 域始终包含零，绝不以截断坐标轴夸大变化。

Do not use when zero has no semantic meaning, dates are irregularly spaced, or the purpose is only small relative variation; use a line chart or true time scale instead.

若零没有业务意义、日期间隔不规则，或只需比较微小相对变化，请改用折线图或真实时间轴。

```ts
type TrendAreaDatum={label:string;value:number|null;detail?:string};
```

Input order is preserved. Labels must be non-empty and unique; values must be finite or `null`. `null` breaks both the area and outline and is never bridged or converted to zero. Full values and labels remain in Tooltip, keyboard status, and the accessible table.

保留输入顺序。标签必须非空且唯一；数值必须为有限数或 `null`。`null` 会同时切断面积和轮廓，绝不桥接或转换为零。Tooltip、键盘状态和无障碍表格保留完整值与标签。

```tsx
<TrendAreaChart data={[{label:"Q1",value:84},{label:"Q2",value:null},{label:"Q3",value:128}]} visualSystem="signal" />
```
