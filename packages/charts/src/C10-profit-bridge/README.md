# C10 Profit Bridge / Waterfall

中文：利润桥／瀑布图。用于回答“哪些因素推动了结果从期初值变化到期末值？”。

Use this template to explain how signed drivers move an opening value to a
closing value. It is appropriate for profit bridges, budget variance, headcount
movement and other additive reconciliations.

Do not use it for unrelated category ranking or when intermediate values are not
additive. Use a simple column chart instead.

## Data

```ts
type ProfitBridgeDatum = {
  label: string;
  value: number | null;
  kind: "opening" | "change" | "closing";
  detail?: string;
};
```

The first datum must be `opening`, the last must be `closing`, and every datum
between them must be `change`. Changes may be positive, negative or zero.
An explicit `null` represents a missing value and renders the template's invalid
state rather than silently treating missing data as zero.

## Example

```tsx
import { ProfitBridgeChart, profitBridgeExample } from "@mav-charts/charts";

<ProfitBridgeChart
  data={profitBridgeExample}
  visualSystem="editorial"
  animate={!window.matchMedia("(prefers-reduced-motion: reduce)").matches}
/>
```

The chart includes a semantic legend, direct value labels, keyboard traversal
with on-focus tooltips, an accessible data table, automatic reduced-motion
handling, deterministic no-animation mode, and explicit empty/invalid states.
