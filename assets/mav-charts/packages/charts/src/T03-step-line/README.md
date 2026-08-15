# T03 Step Line / 阶梯折线图

Use a step line for values that **hold until the next observation** and then change discretely, such as rates, policy states, inventory settings, or tariff bands. T03 uses `stepAfter`: the current value remains horizontal through the interval and jumps vertically at the next observation.

用于展示会**保持到下一个观察点**、随后离散变化的数值，例如费率、政策状态、库存设定或价格档位。T03 使用 `stepAfter`：当前值在区间内保持水平，并在下一个观察点垂直跳变。

Do not use it for continuously interpolated measurements, unordered categories, or irregular time intervals. Input order is preserved and category positions are equally spaced; irregular dates require a real time scale. Missing values break the path and are never bridged or treated as zero.

不要用于连续插值指标、无序类别或不规则时间间隔。组件保留输入顺序并等距放置类别；不规则日期必须使用真实时间比例尺。缺失值会中断路径，绝不跨越连接或归零。

```tsx
<StepLineChart
  data={[
    { label: "Policy A", value: 18 },
    { label: "Policy B", value: 32 },
  ]}
  unit="%"
/>
```

Data: `{ label: string; value: number | null; detail?: string }`. Labels must be non-blank and unique; values must be finite when present.
