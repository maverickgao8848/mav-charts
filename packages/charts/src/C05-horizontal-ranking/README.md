# C05 Horizontal Ranking / 横向排名图

中文：用于按数值从高到低排列类别，特别适合长名称。缺失项保留在末尾并明确标记为 Missing，不参与排名。

Use Horizontal Ranking when the primary question is “who ranks first, next, and last?”, especially when category names are too long for a vertical axis. Do not use it when input order carries time or process meaning, or when composition rather than order is the analytical task.

```ts
type HorizontalRankingDatum = {
  label: string;
  value: number | null;
  detail?: string;
};
```

Finite values are sorted descending with a stable input-order tie break. Equal values receive competition ranks (`1, 1, 3`) while preserving their original order. Null values remain explicit Missing rows at the bottom and never become zero. Positive data starts at zero; signed data uses one unbroken x scale containing zero so negative values extend left. Display labels may truncate on compact layouts, while tooltip, keyboard status, and the accessible table preserve full names.

```tsx
import { HorizontalRankingChart, horizontalRankingExample } from "@mav-charts/charts/C05-horizontal-ranking";

<HorizontalRankingChart data={horizontalRankingExample} visualSystem="signal" seriesName="Contribution" unit="pts" />
```

The template includes exact mouse tooltip, HTML legend, direct rank/value labels, keyboard traversal in sorted order, accessible table, real horizontal entry motion, deterministic capture mode, and internal reduced-motion handling.
