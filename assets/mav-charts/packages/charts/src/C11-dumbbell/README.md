# C11 Dumbbell

中文：哑铃图。用于回答“两个时间点或两个方案之间相差多少？”。

Use this template to compare two values for each category: before/after,
plan/actual, benchmark/company or two scenarios. The connecting line makes both
direction and distance explicit.

Do not use it for more than two series or for a continuous time series. Use a
grouped bar chart or multi-series line chart instead.

```ts
type DumbbellDatum = {
  label: string;
  before: number;
  after: number;
  beforeLabel?: string;
  afterLabel?: string;
};
```

```tsx
import { DumbbellChart, dumbbellExample } from "@mav-charts/charts/C11-dumbbell";

<DumbbellChart data={dumbbellExample} visualSystem="editorial" />
```

Rows are keyboard focusable and expose an on-focus tooltip, direct values and an
accessible data table. Empty, negative, equal, extreme and long-label fixtures
are included.
