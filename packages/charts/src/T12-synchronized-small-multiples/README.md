# T12 Synchronized Small Multiples / 同步小多图

Use for two to four metrics that share the same ordered observation labels but require independent units and honest per-panel domains. Every panel uses the same categorical x positions and `syncId`, so hovering one observation synchronizes the cursor and Tooltip across panels.

用于两到四个共享同一组有序观测标签、但单位或数量级不同的指标。每个面板保留自己的单位和真实范围，同时通过共同的横轴位置与 `syncId` 同步读取。

Prefer this template over a dual-axis chart when metrics have different units: separated panels avoid implying that values on unlike scales are directly comparable. Do not use it when observations differ between panels or when real time intervals are unequal.

Data is `{ id, title, unit, data: [{ label, value: number | null, detail? }] }`. Supply 2–4 panels with exactly the same labels in the same input order. `null` retains its observation slot and breaks only that panel's line; it is never zero or connected across.

```tsx
<SynchronizedSmallMultiplesChart data={[
  { id: "revenue", title: "Revenue", unit: "$M", data: [{ label: "Q1", value: 118 }, { label: "Q2", value: 132 }] },
  { id: "margin", title: "Margin", unit: "%", data: [{ label: "Q1", value: 18 }, { label: "Q2", value: 20 }] },
]} />
```
