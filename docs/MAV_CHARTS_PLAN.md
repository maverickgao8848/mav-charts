# MAV Charts：完整产品、模板、GitHub 与 Library 网站计划

更新日期：2026-08-14  
计划状态：视觉基准已确认，进入完整模板库开发规划  
产品名称：MAV Charts

## 0. 最终目标

MAV Charts 要成为一个面向真实客户问题的开源图表库，而不是 Recharts 示例的简单换肤集合。

最终交付物分为三个连续阶段，并严格按顺序推进：

1. **完成图表库本体**：开发 48 个完整图表模板，每个模板支持三套已确认视觉系统。
2. **完成并发布 GitHub 开源仓库**：代码、文档、测试、许可证、版本与在线示例全部就绪。
3. **基于 GitHub 仓库开发 Library 网站**：网站从同一份 catalog 元数据生成内容，每个图表都能回到对应 GitHub 源码。

禁止先做一个只有静态截图的网站，再反向补仓库。GitHub 仓库是产品本体，Library 网站是它的发现、筛选与展示层。

## 1. 三套正式视觉基准

V1 只保留三套已确认的视觉母版。消费品牌、金融、咨询等是可重叠的客户标签，不再额外创造彼此割裂的皮肤。

### 1.1 MAV Signal — Ying 模板体系

- 视觉基准：[`previews/mav-signal-ying.png`](previews/mav-signal-ying.png)
- 本地参考：`C:/Users/buend/Desktop/ying/.agents/skills/ying-horizontal-hyperframe/templates/`
- 核心语言：纯黑舞台、白色几何、Ying 红单点、大号编辑型斜体、透明容器、结论先行。
- 动效：快速进入、红色重点建立、数值或路径锁定；不使用弹跳和装饰性发光。
- 主要场景：商业汇报、咨询、战略、金融故事、视频图表。

### 1.2 MAV Editorial — BMW M 工程性能体系

- 视觉基准：[`previews/mav-editorial-bmw-m.png`](previews/mav-editorial-bmw-m.png)
- 本地参考：`C:/Users/buend/Desktop/video fac/educational video/assets/designs/bmw-m/`
- 核心语言：近黑碳纤维层级、零圆角硬边、冷白主层级、极少量蓝红强调、侧向力与机械锁定。
- 动效：横向释放、路径描绘、硬停、局部扫光；无回弹、无柔软漂浮。
- 主要场景：年度报告、研究、工程、汽车、性能产品、咨询出版物。

### 1.3 MAV Digital — xAI 研究 Mono 体系

- 视觉基准：[`previews/mav-digital-xai.png`](previews/mav-digital-xai.png)
- 本地参考：`C:/Users/buend/Desktop/video fac/educational video/assets/designs/xai/`
- 核心语言：近黑研究画布、白灰亮度阶梯、1px hairline、等宽技术标注、极少界面噪声。
- 动效：长静止、亮度显现、周围压暗、单一对象变化；不使用霓虹、多色渐变和密集快切。
- 主要场景：AI、SaaS、产品、运营、监控、量化研究和高密度数据界面。

### 1.4 三套系统的实现原则

- 每个图表只实现一份语义和几何组件，通过 visual-system tokens 生成三种视觉表现。
- 48 个模板对应 **48 个可维护组件、144 个视觉变体**，而不是复制出 144 份代码。
- 颜色、字体、线宽、容器、标签、Tooltip 和动效分别由 token 管理。
- 所有模板必须有无动画稳定帧，保证截图、视频、测试和静态文档一致。

## 2. 模板选型原则

Recharts 是实现基座，不是产品目录。官方示例中的圆角、虚线、Tooltip 位置、Legend 样式、响应式写法和单纯动画差异应合并为配置，只有回答不同客户问题的结构才成为独立 MAV 模板。

当前基线：

- 项目版本：Recharts `3.10.1`
- 官方示例索引：<https://recharts.github.io/examples/>
- 官方 API：<https://recharts.github.io/en-US/api/>
- 官方能力覆盖 Line、Area、Bar、Composed、Scatter、Pie、Radar、RadialBar、Treemap、Sunburst、Funnel 和 Sankey；Waterfall、Timeline、Box Plot、Candlestick、Heatmap 等使用 Recharts primitive 与 custom shape 组合完成。

模板保留条件：

1. 能回答一个独立且常见的客户问题。
2. 数据契约与视觉编码明确，不靠装饰成立。
3. 在报告、网页、Dashboard 或视频中至少有一个高价值场景。
4. 能在三套视觉系统中保持同一语义。
5. 有明确的静态、交互或动效验收方式。

## 3. 完整 V1 图表目录：48 个模板

状态说明：

- `视觉原型`：现有三张视觉母版中已出现，但仍需抽成正式组件。
- `待开发`：尚未完成正式模板。

### 3.1 比较与排名 — 11 个

| ID | 模板 | 主要问题 | Recharts 实现 | 状态 |
|---|---|---|---|---|
| C01 | Simple Columns | 各类别谁高谁低 | `BarChart` + vertical `Bar` | 待开发 |
| C02 | Rounded Columns | 少类别指标对比 | `BarChart` + controlled radius | 待开发 |
| C03 | Grouped Columns | 多系列并列比较 | grouped `Bar` | 待开发 |
| C04 | Stacked Columns | 总量与构成共同变化 | stacked `Bar` | 待开发 |
| C05 | Horizontal Ranking | 长名称排名 | horizontal `BarChart` | 待开发 |
| C06 | Grouped Bars | 多系列横向比较 | grouped horizontal `Bar` | 待开发 |
| C07 | Stacked Bars | 分类构成横向比较 | stacked horizontal `Bar` | 待开发 |
| C08 | Diverging Bars | 正负、支持反对、盈亏 | signed `Bar` + zero reference | 待开发 |
| C09 | 100% Stacked | 各类别比例结构 | normalized stacked `Bar` | 待开发 |
| C10 | Profit Bridge / Waterfall | 哪些因素推动结果变化 | ranged `Bar` + custom labels | 视觉原型 |
| C11 | Dumbbell | 两个时点或方案差多少 | custom SVG / Scatter + connector | 视觉原型 |

### 3.2 趋势与时间 — 13 个

| ID | 模板 | 主要问题 | Recharts 实现 | 状态 |
|---|---|---|---|---|
| T01 | Trend Line | 一个指标如何变化 | `LineChart` | 待开发 |
| T02 | Multi-series Line | 多个对象趋势是否分化 | multiple `Line` | 待开发 |
| T03 | Step Line | 状态或价格何时跳变 | `Line` with step curve | 待开发 |
| T04 | Value Dot Line | 每个时间点的值是什么 | `Line` + custom dots/labels | 待开发 |
| T05 | Target Line | 实际值是否达到目标 | `Line` + `ReferenceLine` | 待开发 |
| T06 | Trend Area | 变化趋势与规模 | `AreaChart` | 待开发 |
| T07 | Multi-series Area | 多个规模趋势如何变化 | multiple `Area` | 待开发 |
| T08 | Stacked Area | 总量和组成如何演进 | stacked `Area` | 待开发 |
| T09 | Range Area | 中位值与不确定区间 | ranged `Area` + median `Line` | 视觉原型 |
| T10 | Indexed Event Trend | 事件前后变化与关键节点 | `Line` + reference annotations | 待开发 |
| T11 | Percent Area | 构成比例如何随时间变化 | normalized stacked `Area` | 待开发 |
| T12 | Synchronized Small Multiples | 多指标同时间窗口对照 | shared `syncId` charts | 待开发 |
| T13 | Brush / Zoom Time Series | 长时间序列局部查看 | `Area/Line` + `Brush` | 视觉原型 |

### 3.3 构成与进度 — 5 个

| ID | 模板 | 主要问题 | Recharts 实现 | 状态 |
|---|---|---|---|---|
| P01 | Pie | 少类别整体构成 | `PieChart` | 待开发 |
| P02 | Donut | 构成与中心 KPI | `Pie` with inner radius | 待开发 |
| P03 | Labelled Donut | 构成及直接标签 | custom `Label` / leader line | 待开发 |
| P04 | Radial Progress | 多个 KPI 完成度 | `RadialBarChart` | 视觉原型 |
| P05 | Needle Gauge | 单一指标处于什么区间 | `Pie` + custom needle | 待开发 |

### 3.4 分布与关系 — 8 个

| ID | 模板 | 主要问题 | Recharts 实现 | 状态 |
|---|---|---|---|---|
| D01 | Scatter | 两变量是否相关 | `ScatterChart` | 待开发 |
| D02 | Quadrant Scatter | 对象分别处于哪个象限 | `Scatter` + reference axes | 待开发 |
| D03 | Bubble Quadrant | 位置、表现和规模的关系 | `Scatter` + `ZAxis` | 视觉原型 |
| D04 | Box Plot | 分布、中位数和异常值 | custom `Bar` shape | 待开发 |
| D05 | Regression | 散点关系与拟合趋势 | `ComposedChart` scatter + line | 待开发 |
| D06 | Error Bar | 估计值及误差范围 | `ErrorBar` | 待开发 |
| D07 | Histogram | 数值集中在哪些区间 | binned data + `BarChart` | 待开发 |
| D08 | Heatmap | 两个分类维度中的密度 | custom SVG / Scatter cells | 视觉原型 |

### 3.5 流程与层级 — 6 个

| ID | 模板 | 主要问题 | Recharts 实现 | 状态 |
|---|---|---|---|---|
| F01 | Treemap | 分类规模和层级结构 | `Treemap` | 待开发 |
| F02 | Sankey | 数量如何在节点间流动 | `Sankey` | 待开发 |
| F03 | Timeline | 阶段、项目或事件何时发生 | ranged custom `Bar` / SVG | 视觉原型 |
| F04 | Funnel | 每个阶段流失多少 | `FunnelChart` | 待开发 |
| F05 | Nested Treemap | 两级以上层级如何构成 | nested `Treemap` | 待开发 |
| F06 | Sunburst | 多层级构成与路径 | `SunburstChart` | 待开发 |

### 3.6 商业与金融 — 5 个

| ID | 模板 | 主要问题 | Recharts 实现 | 状态 |
|---|---|---|---|---|
| B01 | Column + Line | 规模与比率是否同步 | `ComposedChart` | 待开发 |
| B02 | Column + Target | 实际值与目标差多少 | `Bar` + target marker | 待开发 |
| B03 | Dual Axis | 两种不同单位如何共同变化 | `ComposedChart` + two axes | 视觉原型 |
| B04 | Radar Profile | 一个对象的多维特征 | `RadarChart` | 待开发 |
| B05 | OHLC Candlestick | 金融价格区间如何变化 | custom `Bar` shape | 待开发 |

总计：**48 个正式模板，其中 9 个已有视觉原型，39 个待完成正式开发。**

## 4. 每个模板的标准交付合同

48 个模板中的每一个都必须同时交付以下内容，缺少任何一项都不能标记完成：

1. 稳定 ID、英文名、中文说明和适用问题。
2. TypeScript 数据 schema、示例数据和异常数据用例。
3. 一份共享的语义/几何组件。
4. Signal、Editorial、Digital 三套 token 渲染结果。
5. 默认静态状态、入场动效和 `prefers-reduced-motion` 状态。
6. Tooltip、Legend、直接标签和键盘可访问性规则。
7. 16:9、4:3、桌面卡片和移动端四种布局验证。
8. 空数据、单点、负数、极大值、长标签和缺失值处理。
9. 单元测试、几何测试和视觉回归截图。
10. README：何时使用、何时不要使用、数据格式、代码示例。
11. catalog 元数据：客户标签、问题标签、场景标签、GitHub 路径和官方 Recharts 参考。

## 5. 客户分类与筛选原则

客户标签是多对多关系，同一个模板可以同时出现在多个客户集合中。例如 Waterfall、Bubble Quadrant、Treemap 和 Dual Axis 可以同时属于企业战略、咨询与金融投资。

### 客户集合

| 客户集合 | 重点需求 | 典型模板 |
|---|---|---|
| 企业战略与咨询 | 市场结构、增长驱动、竞争位置 | Waterfall、Bubble Quadrant、Treemap、Timeline、Dual Axis |
| 金融与投资 | 收益、风险、估值、同业比较 | Line、Waterfall、Box Plot、Error Bar、Candlestick、Dual Axis |
| 产品与增长 | KPI、留存、转化、目标完成 | Funnel、Target Line、Percent Area、Heatmap、Radial Progress |
| 市场与消费品牌 | 份额、受众、活动和品牌认知 | Grouped Bar、100% Stacked、Donut、Bubble、Sunburst、Radar |
| 运营与研究 | 容量、流程、分布和不确定性 | Timeline、Sankey、Histogram、Range Area、Heatmap、Error Bar |

### Library 网站只保留四组主筛选

1. **What to show**：Compare、Trend、Composition、Distribution、Relationship、Flow、Progress。
2. **Who it is for**：上述五个可重叠客户集合。
3. **Where to use it**：Report、Dashboard、Web、Video。
4. **Visual system**：Signal、Editorial、Digital。

方向、堆叠方式、Tooltip 模式、Legend 位置、紧凑尺寸等技术选项只放在图表详情页，不放进首页筛选栏。

## 6. GitHub 仓库架构

建议使用单仓库结构，让组件、catalog、文档和网站共享类型：

```text
mav-charts/
├─ apps/
│  └─ library/                  # GitHub 发布后再开发的网站
├─ packages/
│  ├─ charts/                   # 48 个语义图表组件
│  ├─ themes/                   # Signal / Editorial / Digital tokens
│  ├─ motion/                   # 三套动效策略与 reduced-motion
│  ├─ catalog/                  # 网站和文档共用元数据
│  └─ examples/                 # 确定性演示数据
├─ docs/
│  ├─ previews/
│  ├─ usage/
│  └─ decisions/
├─ tests/
│  ├─ unit/
│  ├─ accessibility/
│  └─ visual/
├─ README.md
├─ CONTRIBUTING.md
├─ CHANGELOG.md
├─ LICENSE
└─ package.json
```

每个模板目录至少包含：

```text
C10-profit-bridge/
├─ index.tsx
├─ schema.ts
├─ example-data.ts
├─ metadata.ts
├─ motion.ts
├─ README.md
└─ __tests__/
```

## 7. 开发阶段与里程碑

### 阶段 A：基础架构与设计系统

- 将当前单页原型拆成 `charts`、`themes`、`motion` 和 `catalog` 包。
- 固化三套字体、颜色、线宽、容器、标签、Tooltip、Legend 和动效 token。
- 建立模板数据 schema、统一 ChartShell、截图模式和确定性示例数据。
- 建立测试、Story/demo、visual regression 与 accessibility 基础设施。

完成标准：三套系统可以用同一个测试图表完成切换，且无复制业务逻辑。

### 阶段 B：抽取 9 个已有视觉原型

- C10 Profit Bridge
- C11 Dumbbell
- T09 Range Area
- T13 Brush / Zoom Time Series
- P04 Radial Progress
- D03 Bubble Quadrant
- D08 Heatmap
- F03 Timeline
- B03 Dual Axis

完成标准：9 个模板全部达到第 4 节交付合同，不再只是画板里的展示代码。

### 阶段 C：完成剩余比较与排名模板

- C01–C09，共 9 个。

完成标准：Compare / Rank 集合全部可用，长标签、正负值和 100% 数据验证通过。

### 阶段 D：完成剩余趋势与时间模板

- T01–T08、T10–T12，共 11 个。

完成标准：同步、区间、目标、事件和缺失时间点全部通过测试。

### 阶段 E：完成构成、进度、分布与关系模板

- P01–P03、P05，共 4 个。
- D01–D02、D04–D07，共 6 个。

完成标准：角度、面积、误差、直方分箱和回归编码诚实；移动端标签可读。

### 阶段 F：完成流程、层级、商业与金融模板

- F01–F02、F04–F06，共 5 个。
- B01–B02、B04–B05，共 4 个。

完成标准：大数据量、深层层级、流向、双轴和金融自定义 shape 通过几何测试。

### 阶段 G：全库冻结

- 完成 48 × 3 的视觉回归图。
- 清除模板间重复语义与重复外形。
- 完成性能、Tree-shaking、SSR、响应式和无障碍审计。
- 锁定 V1 catalog schema 和公开 API。

完成标准：48 个模板全部达到第 4 节交付合同，才允许进入 GitHub 发布阶段。

## 8. GitHub 开源发布阶段 — 必须先于网站

### 8.1 开源准备

- 确认仓库名：建议 `mav-charts`。
- 选择许可证：默认建议 MIT，同时保留第三方字体与 Recharts 的许可证说明。
- 完成 README、安装方法、快速开始、目录截图和三套视觉系统说明。
- 完成 CONTRIBUTING、CODE_OF_CONDUCT、SECURITY、Issue 和 PR 模板。
- 为每个模板提供固定 GitHub 源码路径。

### 8.2 自动化

- GitHub Actions：lint、typecheck、unit、accessibility、build、visual regression。
- Dependabot 或等价依赖更新机制。
- Changesets 或等价版本管理。
- Release tag、CHANGELOG 和 npm package 预发布流程。

### 8.3 首个公开版本

- 发布 GitHub 仓库。
- 发布 `v0.1.0` prerelease，收集 API 与模板反馈。
- 修复后发布 `v1.0.0`，冻结 48 个模板的稳定 ID。
- catalog 中的 `githubPath` 必须全部可点击且不会 404。

GitHub 完成门槛：仓库公开、CI 全绿、48 个模板文档齐全、三套视觉截图齐全、许可证齐全、稳定 release 可下载。

## 9. Library 网站开发阶段 — GitHub 完成后开始

网站性质对标 Video Shotcraft Library：它不是另一个独立内容库，而是 GitHub catalog 的可视化入口。

### 9.1 网站信息架构

- `/`：产品定位、三套视觉系统、客户集合和精选模板。
- `/library`：48 个模板的搜索与筛选网格。
- `/charts/:id`：实时预览、三套视觉切换、数据 schema、代码和 GitHub 链接。
- `/collections/:audience`：咨询、金融、产品、营销、运营等可重叠集合。
- `/guides`：选图指南、可访问性、动效与数据诚实原则。
- `/about`：开源信息、许可证与贡献入口。

### 9.2 图表卡片

每张卡片必须展示：

- 结论式演示标题，而不只是图型名。
- 图表名称和稳定 ID。
- What to show、Who for、Where to use 标签。
- Signal / Editorial / Digital 视觉切换。
- `View chart` 和 `GitHub source` 两个明确入口。

### 9.3 详情页

- 可交互真实 Recharts 预览。
- 三套视觉系统切换。
- 示例数据与数据 schema。
- React/TypeScript 代码示例。
- 使用场景、误用警告和相邻替代模板。
- 复制代码、打开 GitHub、报告问题。
- 显示仓库版本或 commit 信息，避免网站示例与源码不一致。

### 9.4 技术原则

- 网站直接消费 `packages/catalog`，禁止维护第二份手写目录。
- GitHub URL 由 `githubPath` 和 release/branch 配置生成。
- 首版可通过 GitHub Actions 部署 GitHub Pages；稳定后再接自定义域名。
- 搜索、筛选和页面路由必须支持 URL 状态，方便客户分享筛选结果。
- 图片只是 social/README 资产，详情页必须运行真实组件。

## 10. Catalog 单一数据源

网站、README、筛选器和 GitHub 文档共用同一条记录：

```ts
type ChartCatalogItem = {
  id: "D03";
  slug: "bubble-quadrant";
  name: "Bubble Quadrant";
  questions: ["compare", "relationship"];
  audiences: ["consulting", "finance", "product", "marketing"];
  scenarios: ["report", "dashboard", "web", "video"];
  visualSystems: ["signal", "editorial", "digital"];
  engine: "recharts";
  primitive: ["ScatterChart", "Scatter", "ZAxis", "ReferenceLine"];
  githubPath: "packages/charts/src/D03-bubble-quadrant/index.tsx";
  rechartsReferences: ["https://recharts.github.io/en-US/examples/BubbleChart/"];
  status: "stable";
};
```

## 11. 全项目质量门槛

### 图表质量

- 数值与长度、位置、面积、角度严格对应。
- 柱状图不断轴，面积编码使用平方根比例。
- 标签不重叠，长文本有明确处理策略。
- 缺失值、负值和异常值不会导致误读。

### 工程质量

- TypeScript 严格模式。
- 单模板可独立 Tree-shake。
- SSR 和响应式环境不报错。
- 键盘、屏幕阅读器、色彩对比和 reduced-motion 可用。
- 正常浏览器控制台无 error/warning。

### 视觉质量

- 同一模板的三套系统保持相同数据语义。
- Signal 像 Ying 模板家族，而不只是红黑。
- Editorial 具有 BMW M 式硬边、方向性与机械锁定。
- Digital 具有 xAI 式近黑、白灰、hairline 与克制研究感。
- 每张图在 25% 缩略图下仍能识别主结论。

### 发布质量

- 网站卡片、详情页和 GitHub 源码一一对应。
- catalog 不存在重复 ID、失效路径或孤立模板。
- 所有依赖、字体、Recharts 与素材许可证明确。
- GitHub release、npm 包和网站显示同一版本。

## 12. 总体顺序

```text
三套视觉基准确认
  → 图表架构与 token
  → 9 个视觉原型正式组件化
  → 完成其余 39 个模板
  → 48 × 3 全库测试与冻结
  → GitHub 开源整理与发布
  → v0.1.0 / v1.0.0
  → Library 网站开发
  → GitHub Pages / 自定义域名上线
```

下一步应从“阶段 A：基础架构与设计系统”开始，不应直接进入网站开发。
