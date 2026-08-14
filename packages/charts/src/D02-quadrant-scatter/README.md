# D02 Quadrant Scatter / 象限散点图

Use for items positioned by two numeric measures against explicit finite X/Y thresholds. Domains include every finite point and both thresholds with padding; they are not forced to zero. Equal-to-threshold points are reported as **On boundary**.

用于按两个数值指标和明确有限阈值定位对象。坐标域包含全部有限点和两个阈值并留出 padding，不强制包含零；等于任一阈值的点明确标为 **On boundary**。

`null` in either coordinate omits the whole point but remains visible as Missing in the accessible table. Labels may move to avoid collisions, but their scatter coordinates never change.

任一坐标为 `null` 时整点不绘制，但无障碍表格保留 Missing。标签可为避免碰撞而移动，散点真实坐标绝不改变。

Do not use D02 when bubble area must encode a third measure (use D03), when thresholds are not meaningful, or for categorical axes.

若需用气泡面积编码第三指标（应使用 D03）、阈值没有业务意义或坐标轴为分类变量，请勿使用 D02。

```tsx
<QuadrantScatterChart data={[{ label: "A", x: 62, y: 71 }]} thresholdX={50} thresholdY={50} />
```
