# D03 Bubble Quadrant

中文：气泡象限图。用于回答“位置、表现和规模之间有什么关系？”

Use this template when two quantitative coordinates, a non-negative magnitude,
and explicit decision thresholds must be read together. Do not use it when size
is unavailable, precise ranking matters more than pattern, or overlapping points
would hide important categories without disclosure.

```ts
type BubbleQuadrantDatum = {
  label: string;
  x: number | null;
  y: number | null;
  size: number | null;
  detail?: string;
};
```

`x` and `y` may be negative, but every value must be finite and `size` must be
non-negative. Bubble **area**, not radius, represents size: the shared geometry
uses `radius = sqrt(size / maximumSize) * maximumRadius`. A zero-size item has
zero radius and remains available in the table and keyboard reading order.
Missing values and negative sizes render an explicit invalid state.

```tsx
import { BubbleQuadrantChart, bubbleQuadrantExample } from "@mav-charts/charts/D03-bubble-quadrant";

<BubbleQuadrantChart data={bubbleQuadrantExample} thresholds={{ x: 50, y: 50 }} />
```

Overlapping coordinates are not displaced (which would falsify position).
Instead, translucent stroked bubbles and deterministic staggered labels expose
the overlap. Mouse and keyboard tooltips, direct labels, an HTML quadrant and
size legend, an accessible table, responsive layouts, real entry motion,
reduced-motion handling, and deterministic capture mode are included.

