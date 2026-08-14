# F03 Timeline

中文：时间线。用于回答“阶段、项目或事件分别在何时发生？”

Use this template when interval timing, overlap and zero-duration milestones
matter on one continuous scale. Do not use it for unordered steps, durations
without meaningful dates, or when a dependency network is the primary message.

```ts
type TimelineDatum = {
  label: string;
  start: number | null;
  end: number | null;
  detail?: string;
};
```

Times must be finite and `end >= start`. Negative values are valid for relative
time before a baseline. Missing, non-finite, blank or inverted intervals render
an explicit invalid state. The shared geometry uses one unbroken linear domain;
bar length is strictly proportional to duration. Overlaps are assigned to the
first available lane without changing their true start or end. A zero-duration
item is drawn as a milestone point rather than an invented interval.

```tsx
import { TimelineChart, timelineExample } from "@mav-charts/charts/F03-timeline";

<TimelineChart data={timelineExample} visualSystem="editorial" />
```

The template includes direct labels, an HTML interval/milestone legend, exact
mouse tooltip, keyboard traversal with live status, an accessible data table,
responsive layouts, staggered entry, reduced-motion handling, and deterministic
capture mode.

