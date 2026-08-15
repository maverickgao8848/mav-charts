# MAV Charts

MAV Charts 是一个可独立安装的图表制作 Skill，内置基于 React、Recharts 和 TypeScript 的完整 MAV Charts 运行时，以及 **48 个可直接使用的图表模板**。

它不是让用户先研究“有哪些图形”，也不会套用外部或旧版模板。用户只要说明想表达什么，`mav-chart-maker` 就会从当前仓库内置模板中推荐合适的图表，要求用户选择 **Signal / Editorial / Digital** 风格，继续索取该模板真正需要的数据和交付形式，最后把图表做出来。

这个仓库本身就是一个完整 Skill 文件夹。复制到其他仓库或用户 Skill 目录后即可独立工作，不依赖原始 MAV Charts 项目，也不会去宿主仓库寻找模板源码。

## 先看一下效果

同一个模板可以切换三套视觉系统，数据结构和图表含义不会改变：

| Signal | Editorial | Digital |
|---|---|---|
| ![Signal 风格](assets/mav-charts/public/catalog/C01-signal.png) | ![Editorial 风格](assets/mav-charts/public/catalog/C01-editorial.png) | ![Digital 风格](assets/mav-charts/public/catalog/C01-digital.png) |
| 黑底、高对比、一个明确的红色信号，适合汇报、咨询和视频画面 | 硬朗、克制、精确，适合报告、研究和工程内容 | 深色、精细、技术感，适合 AI、SaaS 和监控面板 |

## 这个 Skill 适合谁

- 不确定“这组数据该用什么图”的产品经理、设计师或数据分析师
- 想快速制作经营看板、数据报告、研究页面或视频数据画面的用户
- 需要在 PowerPoint、图片、网页、React 项目或视频中交付 MAV 图表的团队
- 想统一图表视觉风格，同时保留真实数据、响应式布局和无障碍能力的开发者

你不需要先知道图表名称。可以只说“我想比较各地区本月销售额”或“我想说明过去 12 个月的增长趋势”。

## 安装

### 方法一：让 Skill Installer 安装

在 Codex 中调用内置安装器，并把本仓库地址交给它：

```text
请使用 $skill-installer 安装这个 Skill：
https://github.com/maverickgao8848/mav-charts
```

### 方法二：安装到当前项目

把仓库克隆到项目的 `.agents/skills` 目录：

```bash
git clone https://github.com/maverickgao8848/mav-charts.git .agents/skills/mav-chart-maker
```

适合把 Skill 与项目一起提交，让团队成员在这个项目中共同使用。

### 方法三：安装到用户目录

把仓库克隆到用户级 Skill 目录后，可以在不同项目中使用：

```bash
git clone https://github.com/maverickgao8848/mav-charts.git ~/.agents/skills/mav-chart-maker
```

Codex 通常会自动发现新安装的 Skill；如果没有出现，重启 Codex。

## 最省事的用法：直接调用 Skill

在 Codex CLI 或 IDE 中输入 `$mav-chart-maker`，再用自然语言描述需求：

```text
$mav-chart-maker

我有按月份统计的品牌销售数据，想看增长趋势。
请先推荐合适的 MAV 模板，再让我选择 Signal、Editorial 或 Digital，
然后告诉我需要提供哪些字段，最后做成一页 PowerPoint。
```

在支持 Skill 选择器的 ChatGPT 桌面端，也可以从 Skill 列表中选择 **MAV Chart Maker**。即使不显式点名，只要请求与“选图、数据可视化、制作图表”匹配，Codex 也可以根据描述自动调用它。

### 也可以只给一句模糊需求

```text
$mav-chart-maker 帮我做一个图，想说明不同渠道的收入贡献，最后要放进汇报 PPT。
```

Skill 会主动完成下面的对话流程：

1. 理解要表达的问题、受众和使用场景。
2. 从内置 48 个 MAV 模板中推荐 1 个首选，必要时给出最多 2 个备选。
3. 要求用户明确选择 `Signal`、`Editorial` 或 `Digital`，不会静默代选。
4. 读取所选模板的真实 schema，只询问该模板缺少的数据、字段含义、单位和标题等信息。
5. 询问最终要做成 PNG/SVG、PowerPoint、React 组件、网页看板、视频画面或其他形式。
6. 使用真实 MAV 组件生成并验证交付物。

## 给它什么信息，结果会更可靠

一开始不必把所有信息准备齐，Skill 会主动追问。若已经有这些内容，可以直接一起提供：

- 想回答的业务问题，而不只是数据列名
- 一小段脱敏后的真实数据，或 CSV / Excel / 文档附件
- 每个字段的含义、单位和时间范围
- 图表给谁看，会放在汇报、网页、手机页面还是视频中
- 期望的输出格式和画面比例
- 是否有不能修改的数据接口、页面结构或品牌要求

不会把缺失值擅自当作 `0`，不会编造生产数据，也不会为了“好看”而修改真实数值。只有用户明确同意做 mockup 时，才会使用并标注占位数据。

## 它会怎样帮你选图

Skill 会读取内置实时目录，结合模板的适用问题、受众、场景和状态来推荐，而不是依赖一份写死在提示词里的名单。

| 你想回答的问题 | 可能优先考虑的方向 |
|---|---|
| 哪个地区的销售额最高？ | 基础柱状图、横向排名图 |
| 最近 12 个月增长了吗？ | 趋势折线图、趋势面积图 |
| 各渠道贡献占比是多少？ | 饼图、环形图、百分比堆叠图 |
| 两个指标之间有关联吗？ | 散点图、回归图 |
| 当前完成进度是多少？ | 径向进度图、仪表盘 |
| 资金或用户如何流转？ | 桑基图、漏斗图或层级图 |

最终推荐只会来自仓库中真实存在的 MAV 模板。Skill 会优先使用稳定模板；如果建议使用原型或规划中的模板，会先说明并征得同意。

## 三种风格必须由用户选择

这是工作流中的固定步骤，而不是可跳过的默认设置：

- `signal`：黑色舞台、强烈的编辑对比和一个明确红色信号
- `editorial`：硬边、精确的分析呈现，使用克制的蓝色和红色强调
- `digital`：近黑色的研究仪器感、细线和安静的对比

Skill 可以结合场景推荐某一种，但仍会要求用户亲自确认。选择后，它会把精确的 `signal`、`editorial` 或 `digital` 值传给 MAV 组件。

## 支持哪些交付形式

- PNG 或 SVG 图片
- 一页或多页 PowerPoint
- React / TypeScript 图表组件或页面
- Dashboard / Web 嵌入
- 视频静帧或动态图表
- 用户明确指定的其他格式

制作 PowerPoint 时，默认把真实 MAV 组件渲染成 SVG 或高分辨率图片放入幻灯片，以保留模板视觉；不会悄悄换成普通 PowerPoint 图表。若用户更重视原生可编辑性，Skill 会先说明视觉一致性的取舍。

## 仓库结构

```text
mav-charts/
├── SKILL.md                     # Skill 的核心调用与执行规则
├── agents/openai.yaml           # 显示名称、简介和默认调用提示
├── references/                  # 数据收集、交付和仓库定位说明
├── scripts/
│   ├── materialize-runtime.mjs  # 将内置运行时复制到可写工作目录
│   └── check-portability.mjs    # 检查模板、预览和路径完整性
└── assets/mav-charts/           # 完整的 MAV Charts 模板运行时
    ├── packages/charts/         # 48 个图表组件和公开类型
    ├── packages/themes/         # Signal / Editorial / Digital
    ├── packages/motion/         # 动效、截图模式和减少动效支持
    ├── packages/catalog/        # 图表编号、分类和目录元数据
    ├── packages/examples/       # 可复用、可测试的示例数据
    └── public/catalog/          # 模板和三种风格的真实预览
```

运行时始终通过 `SKILL.md` 所在位置解析，因此整个 Skill 文件夹可以搬到另一个仓库或用户目录中继续工作。生成图表时，它会先把内置运行时复制到独立工作目录，不会把用户数据或产物写回已安装的 Skill。

## 开发与验证

验证 Skill 的完整性和可移植性：

```bash
node scripts/check-portability.mjs
```

如果要单独调试内置 MAV Charts 运行时，先复制到一个空目录：

```bash
node scripts/materialize-runtime.mjs --output /absolute/path/to/empty-directory
cd /absolute/path/to/empty-directory
npm ci
npm run check
```

完整检查会构建所有包、执行 TypeScript 类型检查和单元测试，并构建预览网站。

## 为什么可以放心用于真实项目

- 内置 48 个固定编号、带 TypeScript 类型的真实 MAV 模板
- 每个模板都提供 schema、验证规则、示例数据和源组件
- 支持宽屏、标准、卡片、移动端和缩略图尺寸
- 支持键盘操作、屏幕阅读器数据表和减少动效偏好
- 覆盖缺失值、负数、极端值、长标签和无效数据等常见情况
- 模板、三种风格预览、字体和运行依赖都随 Skill 一起携带
- 不依赖宿主仓库，也不使用通用、旧版或临时仿制的图表模板

工作流细节见 [`SKILL.md`](SKILL.md)，数据收集和交付规则见 [`references/intake-and-delivery.md`](references/intake-and-delivery.md)。

## License

MAV Charts 使用 [MIT License](LICENSE)。
