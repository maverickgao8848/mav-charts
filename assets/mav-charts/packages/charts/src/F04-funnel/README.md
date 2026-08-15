# F04 Funnel / 漏斗图

Use this chart for a genuinely ordered process in which every downstream stage is a subset of the stages before it. The input is `{ label, value, detail? }`; labels are unique and values are finite, non-negative, and non-increasing. `null` means an explicitly missing measurement: it keeps a categorical stage row as a fixed non-quantitative break, never receives an interpolated width or area, and is never presented as zero. Known-stage width is proportional to its value, and conversion/loss is calculated only between adjacent known stages.

适用于每个下游阶段都是上游阶段子集的有序流程。输入格式为 `{ label, value, detail? }`；阶段名必须唯一，数值必须有限、非负且不可向下游增长。`null` 表示明确缺失，保留阶段位置但绝不冒充零。阶段宽度严格对应数值，转化率和流失量只在相邻已知阶段之间计算。

Do not use a funnel for unordered categories, values that can increase, balances, or independent cohorts. Use bars for category comparison, Sankey for branching flow, and a retention curve for time-indexed cohorts. The first largest absolute adjacent loss is the focus when losses tie.

不要把漏斗图用于无序类别、可能增长的数值、余额或彼此独立的 cohort。类别比较请选择条形图，分支流向请选择 Sankey，按时间追踪 cohort 请选择留存曲线。若最大相邻流失并列，只突出第一个。

```tsx
import { FunnelStageChart } from "@mav-charts/charts/F04-funnel";

<FunnelStageChart data={[
  { label: "Leads", value: 1000 },
  { label: "Qualified", value: 620 },
  { label: "Won", value: 128 },
]} />
```
