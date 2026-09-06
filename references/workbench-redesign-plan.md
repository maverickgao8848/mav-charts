# MAV Charts 浏览器式工作台改版计划

> 状态：待实施  
> 制定日期：2026-09-05  
> 适用仓库：`maverickgao8848/mav-charts`，基线提交 `6fa1879`  
> 首轮范围：单页图表浏览器、右侧使用面板、统一动效/时长契约

## 1. 改版目标

把网站从“先展示品牌、再进入图表库”的内容站，改为“打开即可选图、看图、判断是否适用、交给 Agent”的浏览器式工作台。

首轮完成后，用户应能在同一屏内完成这条主路径：

1. 按表达问题筛选或搜索 48 张图。
2. 在左侧胶片条中选择图表，不发生页面跳转。
3. 在中间查看所选图表的实时动态预览。
4. 原地切换 Signal、Editorial、Digital 三套视觉系统。
5. 在右侧判断适用性、确认数据字段和动效时长。
6. 一键复制给 Agent，或打开源码、分享详情页。

首轮不重做图表视觉、不更换 Recharts、不删除现有详情页、专题页、指南页与品牌内容。

## 2. 已确认的现状

### 2.1 仓库与运行时

- 仓库根目录是一个可安装 Skill，真正的网站和组件运行时位于 `assets/mav-charts`。
- `packages/catalog/src/catalog.ts` 是 48 张图的唯一目录数据源，当前 48 项均为 `stable`。
- 每张图都有 `index.tsx`、`schema.ts`、`example-data.ts`、`metadata.ts`、`motion.ts` 和 `README.md`。
- `public/catalog` 中已有 48 × 3 = 144 张视觉系统预览图，可直接用于胶片条。
- 构建基于 React 19、Vite 8、TypeScript 5.9、Recharts 3.10、Vitest 和 Playwright。

### 2.2 当前页面结构

- `src/library/LibraryApp.jsx` 同时承担首页、图表库、详情、专题、指南、关于和 404 路由。
- `/` 当前首先展示三套视觉系统和大字号品牌陈述。
- `/library` 使用卡片网格浏览 48 张图；点击卡片会跳到 `/charts/:id`。
- `/charts/:id` 的动态预览由 iframe 加载根预览路由。
- 详情页的适用性、数据字段、Agent prompt 和源码信息主要通过 catalog、源码正则解析及 `import.meta.glob` 得到。
- `src/main.jsx` 约 2200 行，包含 48 个 `?template=` 条件分支和大量预览数据分派，是后续接入统一播放参数的主要风险点。

### 2.3 当前动效结构

- `packages/motion/src/index.ts` 已定义视觉系统级进入时长：Signal 520ms、Editorial 720ms、Digital 1100ms。
- 48 张图都有自己的 `motion.ts`，但公共组件普遍只暴露 `animate?: boolean`。
- `resolveMotionPreferences()` 把 URL 中存在 `capture` 解释为 `animate: false`。
- 详情页在 `LibraryApp.jsx` 中固定给 iframe 添加 `capture`，所以详情页预览天然静态。
- 当前没有 `durationMs`、`progress`、暂停、重播、倍速或逐帧渲染协议。
- 部分图使用 Recharts 原生动画，部分图在自定义 SVG 中使用 `<animate>`；统一确定性时间轴不能只靠修改一个 CSS token 完成。

## 3. 产品与信息架构决策

### 3.1 路由

| URL | 首轮行为 |
| --- | --- |
| `/` | 新工作台，默认选中第一张匹配图表 |
| `/?chart=C01&question=compare&q=收入&system=signal` | 可恢复、可复制的工作台状态 |
| `/library` | 渲染同一个工作台；首次进入后规范化到 `/` 或保留兼容别名 |
| `/charts/C01?system=signal` | 保留完整、可分享的详情页 |
| `/collections/:audience` | 原样保留 |
| `/guides` | 原样保留，并补充动效接口说明 |
| `/about` | 保留品牌故事；承接当前首页中不再位于首屏的视觉系统内容 |
| `/?template=C01&theme=signal&embed=1` | 保留内部预览入口 |
| `/?template=C01&theme=signal&progress=0.42&embed=1` | 新增确定性预览/视频/截帧入口 |

工作台选图、筛选和切换视觉系统使用 `history.replaceState`，不刷新页面；监听 `popstate`，保证浏览器前进/后退能恢复状态。

### 3.2 桌面端布局

工作台使用 `100dvh` 固定框架，第一屏立即出现图表：

```text
┌──────────────────────────────────────────────────────────────────┐
│ M/A/V │ 问题分类 │ 搜索                         │ S / E / D │
├──────────────┬───────────────────────────────┬───────────────────┤
│ 48 图胶片条   │ 当前图表实时预览                │ 这张图怎么用      │
│ 编号 + 中文名 │                               │ 适合 / 不适合     │
│ 可滚动、可筛选 │ 暂停 · 重播 · 0.5× · 1×       │ 数据字段 / 场景   │
│              │ 时间轴 / 当前时长               │ 时长 / Agent / 源码│
└──────────────┴───────────────────────────────┴───────────────────┘
```

建议尺寸：

- 顶栏：64px；在 1440px 宽度下保持单行。
- 左栏：240–276px，内部独立纵向滚动。
- 中栏：`minmax(520px, 1fr)`，预览保持 960:624 的设计比例并尽量放大。
- 右栏：320–368px，内部独立纵向滚动。
- 主区域高度：`calc(100dvh - 64px)`，禁止整个页面因为三栏内容而产生长滚动。
- 焦点红只用于当前选择、关键结论和主要动作；边界继续使用细灰线，保留 MAV 的编辑感与设备感。

### 3.3 移动端布局

- 小于 768px 时，三栏变为单列。
- 顶部保留 Logo、搜索入口和视觉系统切换；分类筛选放入横向滚动行。
- 左侧目录改成 104–120px 高的横向胶片条，卡片只显示缩略图、编号和中文名。
- 中间预览位于胶片条下方，使用 `standard` 或 `mobile` 视口策略，不强制桌面宽图缩小到不可读。
- 右侧说明改成底部抽屉：默认露出标题、适用问题和拖拽柄；支持半屏与全屏两档。
- 抽屉打开时锁定背景滚动，关闭后焦点返回触发按钮；支持 Escape、触屏拖动和点击遮罩关闭。
- 播放控制保持可见，但在窄屏合并为“播放/暂停、重播、速度”三个控件。

### 3.4 选中、筛选与空状态

- 初次进入：优先读取 URL 中的合法 `chart`；否则选择筛选结果中的第一项。
- 搜索范围：ID、中文名、英文名、中英文描述；后续可增加字段名与场景词，不在首轮做模糊语义搜索。
- 分类沿用 catalog 的七类问题：对比、趋势、构成、分布、关系、流向、进度。
- 筛选后当前图仍存在则保持选中；不存在则选择新的第一项。
- 无匹配结果时，中栏显示清晰空状态和“清空筛选”，右栏不保留过期图表信息。
- 左侧列表使用 roving tabindex 和上下方向键；移动端横向模式使用左右方向键。

## 4. 右侧“这张图怎么用”面板

信息顺序按决策效率排列，不把开发者信息放在最前面：

1. **身份**：ID、中文名、英文名、问题类型。
2. **适合回答**：基于 catalog 的 `descriptionZh` 与现有 `questionGuidance.fit`。
3. **不适合**：基于 `questionGuidance.avoid`；后续允许每图 metadata 覆盖通用文案。
4. **数据字段**：从 schema 提取字段名、类型、是否可选和中文解释；缺失值规则单独强调。
5. **推荐场景**：映射 `scenarios` 与 `audiences`。
6. **动效时长**：进入、停留、退出、默认场景总时长；显示当前自定义总时长。
7. **主动作**：“复制给 Agent”。复制结果包含图表 ID、视觉系统、字段、时长和详情 URL。
8. **次动作**：“分享详情”“查看源码”。详情页继续承担深度文档与外部分享，不再承担主浏览路径。

复制成功必须以按钮文字和 `aria-live` 同时反馈；剪贴板 API 失败时提供可选中的文本回退。

## 5. 前端组件拆分

把 `LibraryApp.jsx` 中的工作台逻辑拆成可测试单元，建议目标结构：

```text
src/library/
  LibraryApp.jsx                 # 仅保留路径分派
  catalogPresentation.js         # 标签、说明、源码/schema 派生
  routing.js                     # base path、URL 解析与序列化
  pages/
    WorkbenchPage.jsx
    DetailPage.jsx
    CollectionPage.jsx
    GuidesPage.jsx
    AboutPage.jsx
  workbench/
    WorkbenchHeader.jsx
    ChartFilmstrip.jsx
    ChartFilmstripItem.jsx
    ChartPreviewStage.jsx
    PlaybackControls.jsx
    ChartUsagePanel.jsx
    MobileUsageDrawer.jsx
    useWorkbenchState.js
    usePreviewBridge.js
  styles/
    foundation.css
    workbench.css
    detail.css
    content-pages.css
```

首轮不要求把所有旧 CSS 一次性重写；先把新增工作台样式隔离到 `workbench.css`，避免 1545 行全局 `styles.css` 和现有详情样式互相覆盖。

### 5.1 目录展示模型

新增一个从 `ChartCatalogItem` 派生的站点展示模型，不复制维护第二份 48 图清单：

```ts
type ChartWorkbenchItem = {
  id: ChartId;
  name: string;
  nameZh: string;
  questions: readonly ChartQuestion[];
  audiences: readonly ChartAudience[];
  scenarios: readonly ChartScenario[];
  descriptionZh: string;
  sourceUrl: string;
  detailUrl: string;
  previewUrls: Record<VisualSystemId, string>;
  fields: readonly ChartFieldPresentation[];
  motion: ChartMotionSpec;
};
```

`import.meta.glob` 继续作为首轮的 README/schema/source 读取机制，但解析逻辑从页面组件移到 `catalogPresentation.js`，加单元测试。后续再评估把字段和适用性正式加入 metadata，首轮不强制改 48 份 metadata。

## 6. 实时预览与父子页面协议

首轮保留 iframe 隔离，以避免图表内部样式、键盘交互和工作台 CSS 相互污染；关键变化是去掉工作台/详情实时预览中的 `capture`。

### 6.1 iframe 初始参数

```text
?template=C01
&theme=signal
&embed=1
&durationMs=3000
&autoplay=1
```

静态与视频工具可改用：

```text
?template=C01&theme=signal&embed=1&progress=0.42&durationMs=3000
```

### 6.2 `postMessage` 播放协议

为了暂停、重播和调速时不反复刷新 iframe，新增带版本号的同源协议：

```ts
type PreviewCommand =
  | { type: "mav:preview/play"; version: 1 }
  | { type: "mav:preview/pause"; version: 1 }
  | { type: "mav:preview/replay"; version: 1 }
  | { type: "mav:preview/seek"; version: 1; progress: number }
  | { type: "mav:preview/rate"; version: 1; rate: 0.5 | 1 };

type PreviewEvent =
  | { type: "mav:preview/ready"; version: 1; durationMs: number }
  | { type: "mav:preview/time"; version: 1; progress: number; playing: boolean }
  | { type: "mav:preview/complete"; version: 1 };
```

- 父页面校验 `event.origin` 和 iframe `contentWindow`。
- iframe 只接受同源消息。
- 切图或切视觉系统时允许 iframe 重建并从 0 自动播放，这是可预期的“新场景进入”。
- 用户手动暂停后切换视觉系统，首轮仍从 0 开始；不跨主题保留帧位置。

## 7. 统一动效与时长契约

### 7.1 公共类型

在 `packages/motion` 定义规范，在 `packages/charts/src/core/types.ts` 复用：

```ts
export type ChartMotionSpec = {
  enterMs: number;
  holdMs: number;
  exitMs: number;
  defaultSceneMs: number;
  minSceneMs: number;
  maxSceneMs: number;
};

export type ChartMotionProps = {
  animate?: boolean;
  durationMs?: number;
  progress?: number;
};
```

所有 48 个公共 `*ChartProps` 最终都扩展 `ChartMotionProps`，同时保留现有 `animate`，避免破坏调用方。

### 7.2 参数优先级和精确定义

| 输入 | 行为 |
| --- | --- |
| `progress` 是有限数字 | 进入确定性模式；钳制到 0–1；不启动内部时钟，不使用 Recharts/CSS/SMIL 自带计时器 |
| 无 `progress` 且 `animate={false}` | 直接绘制最终可读状态，等价于 `progress={1}` |
| 无 `progress`、允许动画 | 使用内部时钟播放；`durationMs` 覆盖默认场景时长 |
| 未传 `durationMs` | 使用当前图表/视觉系统解析后的 `defaultSceneMs` |
| `prefers-reduced-motion: reduce` | 普通网页播放退化为最终状态；显式 `progress` 仍被尊重，保证视频工具可逐帧渲染 |

`minSceneMs` 和 `maxSceneMs` 是 Agent、网站控件和推荐系统的安全区间，不在底层组件中偷偷改写调用方显式传入的 `durationMs`。开发环境对非有限值、负值或超出建议范围的值给出明确警告；非法值回退到默认值。

### 7.3 时间轴解析

新增纯函数 `resolveMotionFrame(spec, { durationMs, progress })`，返回：

```ts
type ResolvedMotionFrame = {
  sceneProgress: number;
  elapsedMs: number;
  enterProgress: number;
  holdProgress: number;
  exitProgress: number;
  phase: "enter" | "hold" | "exit" | "complete";
};
```

- `defaultSceneMs` 默认等于 `enterMs + holdMs + exitMs`。
- 自定义 `durationMs` 按三段原始占比缩放，而不是只拉长进入动画。
- 各图 `motion.ts` 只负责把 `ResolvedMotionFrame` 映射成图形属性，不自己读取时间或 URL。
- easing 通过共享纯函数作用于阶段 progress，保证浏览器实时播放和逐帧渲染得到同一结果。

### 7.4 确定性迁移策略

48 张图按实现原语分批迁移：

1. **柱/条/面积类**：关闭 Recharts 原生动画；通过自定义 shape、基线插值和 clip path 使用 `enterProgress`。
2. **折线/散点类**：使用稳定 path length、点半径/透明度或几何插值；不能依赖挂载时间。
3. **饼/环/仪表类**：显式插值起止角度和标注显隐阈值。
4. **自定义 SVG 类**（Sankey、树图、时间线等）：移除或绕开 SMIL `<animate>`，直接从 progress 计算 opacity、位置、尺寸和路径揭示。
5. **交互类**（brush、tooltip、keyboard focus）：播放只控制入场；用户交互状态不写入确定性帧，截图模式默认无 hover/focus。

每图迁移完成后，`motion.ts` 必须保持纯函数；组件不得在渲染路径读取 `Date.now()`、`performance.now()` 或随机数。

### 7.5 推荐默认值

第一版以视觉系统 token 为进入段基线，并给每图 motion 文件覆盖权：

| 系统 | `enterMs` | `holdMs` | `exitMs` | `defaultSceneMs` |
| --- | ---: | ---: | ---: | ---: |
| Signal | 700–900 | 1800 | 300 | 2800–3000 |
| Editorial | 850–1100 | 1800 | 300 | 2950–3200 |
| Digital | 1000–1300 | 1900 | 300 | 3200–3500 |

通用推荐区间为 2200–6000ms。复杂图（Sankey、嵌套树图、小多图）可在自己的 `motion.ts` 中提高默认值，但右侧面板必须显示真实解析结果，不能写死“3 秒”。

## 8. 预览路由重构

在接入 48 图播放参数前，先把 `src/main.jsx` 的模板分支抽成注册表：

```text
src/preview/
  PreviewApp.jsx
  previewRoute.js
  previewRegistry.jsx
  previewBridge.js
  edgeCaseRegistry.js
```

注册表至少提供：

```ts
type PreviewDefinition = {
  id: ChartId;
  render: (options: PreviewRenderOptions) => ReactNode;
  edgeCases: Record<string, unknown>;
};
```

目标不是在首轮把站点迁移到 React Router，而是消除 48 个互相独立的 URL 参数分支，让 `theme`、`animate`、`durationMs`、`progress`、标题覆盖和 embed 行为只解析一次。

## 9. 分阶段实施计划

### Sprint 0：建立基线与保护网

改动目标：只补测试与结构清单，不改变页面视觉。

- 安装依赖并运行 `npm run check`，记录基线失败项。
- 为 `/`、`/library`、`/charts/C01`、`?template=C01` 增加路由烟雾测试。
- 为 48 个目录、144 张主题预览和公共 `animate` API 建立清单测试。
- 保存当前首页、目录、详情的桌面与移动截图，作为有意改版前的对照，不把新界面强行匹配旧快照。

完成标准：基线结果可重复，已知失败单独记录，后续失败可判断是否由改版引入。

### Sprint 1：抽离预览注册表

改动目标：降低 `main.jsx` 风险，不改变现有公开 URL。

- 新建 `src/preview`，集中解析 template/theme/case/embed/capture。
- 把 48 个分支迁入 registry；保持现有 edge case 数据映射。
- `main.jsx` 只负责初始化 motion preferences、挂载根组件和选择 PreviewApp/LibraryApp。
- 为全部 48 个 `?template=<ID>&capture` 做自动烟雾检查。

完成标准：现有视觉测试不产生非预期差异；所有旧预览链接仍能打开。

### Sprint 2：桌面工作台骨架

改动目标：让 `/` 第一屏成为可用的三栏浏览器。

- 新建 WorkbenchPage、Header、Filmstrip、PreviewStage、UsagePanel。
- 复用 catalog 和 144 张静态预览；胶片条仅显示编号与中文名。
- 实现搜索、问题筛选、视觉系统切换、结果数、选中状态和 URL 同步。
- 中栏先通过 iframe 使用现有实时动画，工作台 URL 不加 `capture`。
- `/library` 使用同一工作台；详情、专题、指南、关于仍可访问。

完成标准：选择任意图不发生顶层页面导航；三套视觉系统原地切换；第一屏无需滚动即可看到图表主体。

### Sprint 3：使用面板与移动端

改动目标：完成主要决策流和响应式交互。

- 抽离 catalogPresentation，复用详情页已有适用性、字段和 Agent prompt 生成逻辑。
- 实现“复制给 Agent、分享详情、查看源码”。
- 添加移动端横向胶片条和底部抽屉。
- 完成键盘、焦点管理、语义标签、空状态和剪贴板失败回退。

完成标准：桌面和手机都能在不离开工作台的情况下完成选图、判断、复制。

### Sprint 4：动效核心契约与播放桥

改动目标：先建立可复用、可测试的时间系统。

- 在 `packages/motion` 增加 spec、输入解析、阶段 progress、easing 和开发警告。
- 在 chart core 增加 `ChartMotionProps`、`useChartPlayback` 与稳定 data attributes。
- PreviewApp 支持 `durationMs`、`progress`、`autoplay` 和 postMessage。
- 工作台加入暂停、重播、0.5×/1×、时间轴；右栏显示时长。
- 保留 `capture` 兼容：旧 `capture` 继续等价于最终帧，但新静态调用推荐 `progress=1`。

完成标准：同一代表图在实时播放和显式 progress 下，0、0.42、1 三个状态可重复；暂停后 DOM 不继续变化。

### Sprint 5：48 图确定性迁移

按原语分四批，每批单独合并和回归：

- 5A：C01–C11，柱、条、排名、瀑布、哑铃。
- 5B：T01–T13，折线、面积、事件、small multiples、brush。
- 5C：P01–P05 与 B01–B05，饼环、进度、仪表、复合图、雷达、K 线。
- 5D：D01–D08 与 F01–F06，分布、关系、热力、Sankey、树图、漏斗、时间线、旭日图。

每批要求：

- 公共 props 扩展 `ChartMotionProps`。
- `animate` 旧行为兼容。
- `progress=0`、中间帧、`progress=1` 均为确定性输出。
- reduced motion、SSR、空数据、非法数据、键盘访问不退化。
- 对应视觉快照只更新有意发生的动画终帧差异。

完成标准：48/48 组件通过统一契约测试；同一 progress 重渲染截图像素稳定。

### Sprint 6：整体验收、文档与发布

- 更新 `/guides`、根 README、Skill 说明中的静态捕获和视频用法。
- 更新 Agent prompt，使其包含 `durationMs`，视频/截图场景包含 `progress`。
- 运行 typecheck、unit、build、Playwright、axe 和 portability 检查。
- 在 GitHub Pages 预览环境验证 base path、fallback、刷新详情 URL 和 iframe 同源消息。
- 对照核心任务指标与验收矩阵完成发布前检查。

完成标准：构建产物、Skill 内嵌运行时、公开网站入口和文档保持一致。

## 10. 测试与验收矩阵

### 10.1 功能测试

- 48 个胶片条项目均来自 catalog，顺序稳定，无手写重复清单。
- 搜索 ID、中文名、英文名和业务描述均可命中。
- 七类问题筛选结果与 catalog 一致。
- 切图不刷新顶层页面；URL、预览、右栏内容同步更新。
- Signal/Editorial/Digital 切换后缩略图、实时预览、复制 prompt 和 URL 一致。
- 详情链接可以直接打开、刷新和分享。
- 暂停、重播、倍速和 seek 指令在 iframe ready 前后都不会丢失。

### 10.2 动效测试

- 纯函数：时间轴边界、非法输入、阶段切换、自定义 duration 比例缩放。
- 组件：`animate=false`、reduced motion、显式 `progress` 的优先级。
- 确定性：同一图、同一数据、同一主题、同一 progress 连续渲染两次得到相同几何和截图。
- 终帧兼容：`capture` 与 `progress=1` 的可见结果一致。
- 视频映射：`progress = clamp(frame / (fps * durationSeconds), 0, 1)`，首帧和末帧无漂移。

### 10.3 响应式与视觉测试

建议新增工作台视口：

- 1600×1000：完整三栏。
- 1280×800：紧凑三栏，无横向溢出。
- 900×900：中间态，右栏可折叠。
- 390×844：横向胶片条 + 底部抽屉。
- 320×700：最小支持宽度，无不可达操作。

对 C01、T02、P03、D08、F02、B04 六张代表图执行三主题矩阵；其余 42 张执行可见性、无报错和终帧截图检查。

### 10.4 无障碍

- 搜索框、分类、系统开关、列表、播放控制和抽屉均有可读名称。
- 当前图使用 `aria-selected`；筛选结果数和复制状态使用适度的 `aria-live`。
- 胶片条可完全键盘操作，焦点样式不只依赖颜色。
- 抽屉具有 dialog 语义、焦点圈定和可靠的返回焦点。
- `prefers-reduced-motion` 下不自动播放，控制仍可理解。
- iframe 有随选中图更新的 title，不产生重复无意义 tab stop。

## 11. 性能预算

- 首屏只 eager 加载当前图缩略图与 iframe；其余胶片缩略图 `loading=lazy`。
- 视觉系统切换只请求当前可见缩略图，不一次预取 144 张图。
- 搜索输入不触发 iframe 重载，只有选中 ID 或视觉系统变化才重建预览。
- 播放进度通过 postMessage 传递，不每帧改 URL 或 React 顶层状态。
- 工作台交互目标：普通桌面设备筛选反馈 <100ms；切图后 200ms 内出现稳定占位状态。
- 在完成 preview registry 后记录 Vite bundle 基线；新增工作台代码不得无意引入第二套图表引擎或大型状态库。

## 12. 主要风险与处理

| 风险 | 处理方式 |
| --- | --- |
| 48 个组件动画实现不一致 | 按图形原语分批迁移；共享纯函数，不做一次性正则替换 |
| Recharts 原生动画无法逐帧控制 | 确定性模式关闭原生动画，使用自定义 shape/clip/几何插值 |
| SMIL `<animate>` 依赖挂载时钟 | 显式 progress 模式直接计算属性；普通模式也逐步统一到共享时钟 |
| `main.jsx` 继续膨胀 | 动效改造前先完成 preview registry |
| iframe 控制消息错发或丢失 | 同源校验、版本字段、ready 握手、父端保存最后命令并在 ready 后重放 |
| 首页改版损失品牌内容 | 内容迁入 About/Guides，专题与详情 URL 保留，不直接删除 |
| GitHub Pages 子路径刷新失败 | 保留并测试 `BASE_URL` 与 pages fallback；所有 URL 通过统一 helper 生成 |
| Skill 与公开站点源码不同步 | 所有修改以 `assets/mav-charts` 为真源，发布前执行 portability 检查 |

## 13. 首轮明确不做

- 不重新设计 48 张图的颜色、排版和数据语义。
- 不增加第四套视觉系统。
- 不引入后端、登录、收藏、云端数据保存或用户上传数据编辑器。
- 不用 Canvas/WebGL 替换 Recharts/SVG。
- 不删除详情、专题、指南和关于页面。
- 不在首轮实现任意播放速度；只提供 0.5× 和 1×。
- 不把 Agent prompt 做成聊天机器人；先保持可靠复制。

## 14. 最终完成定义

只有同时满足以下条件，首轮改造才算完成：

- `/` 第一屏直接显示可操作图表工作台。
- 48 张图可在左侧/移动胶片条中原地切换。
- 搜索、分类和三套视觉系统切换可被 URL 恢复。
- 中栏是可暂停、重播、调速的动态预览，不再被 `capture` 静态化。
- 右栏/底部抽屉包含适用性、禁用场景、字段、推荐场景、真实时长、Agent 和源码动作。
- 详情页继续是稳定的分享 URL。
- 48 个公共组件接受 `animate`、`durationMs`、`progress`，并保持向后兼容。
- `progress` 渲染不依赖墙上时钟，可用于视频逐帧、暂停、截帧和重渲染。
- 桌面、移动、键盘、reduced motion、SSR、build、unit、visual 和 portability 检查通过。

