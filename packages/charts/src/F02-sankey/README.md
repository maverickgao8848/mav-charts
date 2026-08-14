# F02 Sankey / 桑基流向图

Use this template when link width must encode a positive quantity moving through a directed, acyclic value chain. Nodes are stages; every ribbon is one caller-supplied flow in a shared unit. Missing (`null`) links remain in the accessible table but are not drawn.

当需要用连带宽度表示一个正数量如何经过有向、无环的价值链时使用。节点代表阶段，每条流带都是调用方提供的同单位流量；`null` 链路保留在无障碍表格中，但不会绘制。

Do not use it for negative values, cycles, unrelated pairwise relationships, or when inflow/outflow reconciliation is being inferred rather than supplied. A Sankey shows the provided links; it does not invent balancing flows or prove conservation.

不要用于负数、循环关系、无关的两两联系，也不要让图表推断未提供的流入流出平衡。桑基图只展示输入链路，不会虚构平衡流，也不能自动证明守恒。

```tsx
<SankeyChart
  data={[{ source: "Input", target: "Output", value: 42 }]}
  unit="t"
/>
```

Data rules: non-empty node labels, unique directed source-target pairs, finite values greater than zero or `null`, and no directed cycles. Long labels are shortened only in the SVG; tooltip, status and table preserve the full text.

数据规则：节点标签非空、有向起终点组合唯一、数值为大于零的有限数或 `null`，且不存在有向环。长标签只在 SVG 中缩写，Tooltip、状态文本和表格保留全文。
