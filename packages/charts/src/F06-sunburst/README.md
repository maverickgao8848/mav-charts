# F06 Sunburst / 旭日图

Use this chart for non-negative leaf values across at least two hierarchy levels when paths and branching matter. Each sector angle equals its reported positive descendant value divided by the global reported total; radius encodes depth only. / 用于至少两级层级中的非负叶节点，强调路径与分支。每个扇区角度等于其已报告正值后代占全局已报告总量的比例；半径只编码层级。

Do not compare sector area across different rings as if it were value: outer rings have more area for the same angle. Use F05 when rectangular area comparison is the priority, F01 for a flat whole, or C05 for precise ranking. / 不要把不同圆环的扇区面积直接当作数值比较：同角度在外环面积更大。重视矩形面积比较用 F05，单层整体用 F01，精确排名用 C05。

```ts
type SunburstDatum = { path: readonly string[]; value: number|null; detail?: string };
```

`path` needs two or more non-blank segments and must be unique. Values are finite and non-negative. Missing and zero leaves remain available to keyboard and table users but receive no angle and do not inflate parent totals. / `path` 至少含两个非空层级且完整路径唯一；数值必须有限且非负。缺失与零值保留在键盘状态和表格中，但不分配角度、不抬高父级总量。

```tsx
<SunburstHierarchyChart data={sunburstExample} visualSystem="signal" />
```

Mouse Tooltip and keyboard status expose full paths, exact values and shares. The center callout directly labels the focus leaf; the accessible table preserves every complete path. / 鼠标 Tooltip 与键盘状态提供完整路径、精确数值和占比；中心标注直指焦点叶节点，无障碍表格保留全部路径。

