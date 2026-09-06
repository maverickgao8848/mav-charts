# MAV Charts 工作台改版基线

- 基线提交：`6fa1879`
- 记录日期：2026-09-05
- Node.js：24.14.0
- 初始环境：未安装 `node_modules`，首次 `npm run check` 因找不到 Vite 退出。
- 执行 `npm ci` 后基线：`build:packages`、TypeScript、149 个测试文件 / 642 项测试、Vite 生产构建全部通过。
- 已知非阻断警告：站点入口 bundle 约 2.13 MB（gzip 453 KB），超过 Vite 500 KB 提示阈值。
- 浏览器测试环境：Playwright Chromium 通道；测试配置使用完整 Chromium 的新无头模式。

改版对照入口：`/`、`/library`、`/charts/C01`、`/?template=C01&capture`。
