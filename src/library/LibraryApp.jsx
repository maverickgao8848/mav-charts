import React from "react";
import { prototypeCatalog } from "../../packages/catalog/src";
import "./library.css";

const VERSION = "0.1.0";
const COMMIT = import.meta.env.VITE_COMMIT_SHA?.slice(0, 7) || "main";
const REPOSITORY = "https://github.com/maverickgao8848/mav-charts";
const systems = ["signal", "editorial", "digital"];
const audiences = ["consulting", "finance", "product", "marketing", "operations"];

const questionLabels = {
  compare: "对比",
  trend: "趋势",
  composition: "构成",
  distribution: "分布",
  relationship: "关系",
  flow: "流向",
  progress: "进度",
};

const systemLabels = { signal: "信号", editorial: "编辑", digital: "数字" };
const audienceLabels = { consulting: "咨询", finance: "金融", product: "产品", marketing: "市场", operations: "运营" };

const sourceFiles = import.meta.glob("../../packages/charts/src/*/index.tsx", { query: "?raw", import: "default", eager: true });
const schemaFiles = import.meta.glob("../../packages/charts/src/*/schema.ts", { query: "?raw", import: "default", eager: true });
const exampleFiles = import.meta.glob("../../packages/charts/src/*/example-data.ts", { query: "?raw", import: "default", eager: true });
const readmeFiles = import.meta.glob("../../packages/charts/src/*/README.md", { query: "?raw", import: "default", eager: true });

function artifact(files, item) {
  const marker = `/${item.id}-${item.slug}/`;
  return Object.entries(files).find(([path]) => path.includes(marker))?.[1] || "";
}

function defaultHeadline(item) {
  const source = artifact(sourceFiles, item);
  return source.match(/title\s*=\s*["'`]([^"'`]+)["'`]/)?.[1] || item.description;
}

function componentName(item) {
  const source = artifact(sourceFiles, item);
  return source.match(/export function\s+(\w+Chart)\b/)?.[1]
    || source.match(/export const\s+(\w+Chart)\b/)?.[1]
    || `${item.name.replace(/[^a-z0-9]/gi, "")}Chart`;
}

function exampleName(item) {
  const source = artifact(exampleFiles, item);
  return source.match(/export const\s+(\w*[Ee]xample)\b/)?.[1] || "exampleData";
}

function misuseLines(item) {
  const readme = artifact(readmeFiles, item);
  const matches = readme.split(/\r?\n/).filter((line) => /do not|don.t use|avoid|instead|不要|不适合|避免|替代|误用/i.test(line));
  return matches.slice(0, 6).map((line) => line.replace(/^[-#*\s]+/, "")).filter(Boolean);
}

function useRoute() {
  const base = import.meta.env.BASE_URL;
  const prefix = base === "/" ? "" : base.replace(/\/$/, "");
  let route = window.location.pathname;
  if (prefix && route.startsWith(prefix)) route = route.slice(prefix.length);
  return route.replace(/\/$/, "") || "/";
}

function href(route) {
  const base = import.meta.env.BASE_URL;
  if (route === "/") return base;
  return `${base}${route.replace(/^\//, "")}`;
}

function SiteNav({ compact = false }) {
  return (
    <nav className={`site-nav${compact ? " is-compact" : ""}`} aria-label="主导航">
      <a className="library-brand" href={href("/")}><span className="library-brand-mark">M/A/V</span><span>图表库</span></a>
      <div className="site-nav-links">
        <a href={href("/library")}>图表库</a>
        <a href={href("/collections/consulting")}>专题集合</a>
        <a href={href("/guides")}>使用指南</a>
        <a href={href("/about")}>关于</a>
        <a href={REPOSITORY}>GitHub ↗</a>
      </div>
    </nav>
  );
}

function SystemSwitch({ value, onChange, label = "视觉系统" }) {
  return (
    <fieldset className="system-switch site-system-switch">
      <legend>{label}</legend>
      {systems.map((system) => <button key={system} type="button" aria-pressed={value === system} onClick={() => onChange(system)}><span>{system}</span>{systemLabels[system]}</button>)}
    </fieldset>
  );
}

function ChartCard({ item, system = "signal", index = 0 }) {
  const sourceUrl = `${REPOSITORY}/blob/main/${item.githubPath}`;
  return (
    <article className="library-card" data-chart-card={item.id} style={{ "--order": index }}>
      <div className="library-card-top"><span>{item.id}</span><span>{item.questions.map((entry) => questionLabels[entry]).join(" / ")}</span></div>
      <a className="library-thumbnail" href={href(`/charts/${item.id}?system=${system}`)} aria-label={`查看图表：${item.nameZh}`}>
        <img src={`${import.meta.env.BASE_URL}catalog/${item.id}-${system}.png`} alt={`${item.nameZh}，${systemLabels[system]}视觉系统`} loading="lazy" decoding="async" />
        <span className="library-open">查看图表 ↗</span>
      </a>
      <div className="library-card-copy">
        <p className="library-card-headline">{item.descriptionZh || defaultHeadline(item)}</p>
        <h2>{item.nameZh}</h2>
        <h3>{item.name} · {item.id}</h3>
        <p>{item.descriptionZh || item.description}</p>
      </div>
      <div className="library-card-taxonomy" aria-label="Chart tags">
        <span><b>问题</b>{item.questions.map((entry) => questionLabels[entry]).join(" · ")}</span>
        <span><b>对象</b>{item.audiences.slice(0, 3).map((entry) => audienceLabels[entry] || entry).join(" · ")}</span>
        <span><b>场景</b>{item.scenarios.join(" · ")}</span>
      </div>
      <footer><a href={href(`/charts/${item.id}?system=${system}`)}>查看图表</a><a href={sourceUrl}>GitHub 源码</a></footer>
    </article>
  );
}

function SiteFooter() {
  return <footer className="library-footer"><span>MAV CHARTS / {VERSION} 预览版</span><span>图表目录与源码同步 · COMMIT {COMMIT}</span></footer>;
}

function HeatmapCrystal({ className = "" }) {
  return (
    <div className={`heatmap-crystal ${className}`.trim()} aria-hidden="true">
      <img src={`${import.meta.env.BASE_URL}catalog/D08-signal.png`} alt="" />
    </div>
  );
}

function PageMasthead({ eyebrow, title, copy }) {
  return (
    <header className="page-masthead">
      <span>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{copy}</p>
      <HeatmapCrystal className="masthead-crystal" />
    </header>
  );
}

function HomePage() {
  const featuredIds = ["C10", "T12", "D03", "F02", "P03", "B01"];
  const featured = featuredIds.map((id) => prototypeCatalog.find((item) => item.id === id)).filter(Boolean);
  return (
    <main className="library-shell home-page">
      <SiteNav />
      <section className="system-manifesto home-system-manifesto" aria-labelledby="systems-heading">
        <div className="system-intro-heading">
          <div><div className="section-index">01 / 视觉系统</div><h2 id="systems-heading">MAV<br />数据图表库。</h2></div>
          <div className="library-proof" aria-label="图表库概况"><span><strong>48</strong> 个稳定模板</span><span><strong>3</strong> 套视觉系统</span><span><strong>5</strong> 大专题</span></div>
        </div>
        <div className="system-manifesto-grid">
          <article className="system-tile is-signal"><span>01 / 信号</span><img className="system-preview" src={`${import.meta.env.BASE_URL}catalog/C11-signal.png`} alt="Signal 风格哑铃图" /><h3>Signal</h3><p>哑铃图 / 黑色场域、强烈红色与斜体结论，让差距第一时间被看见。</p></article>
          <article className="system-tile is-editorial"><span>02 / 编辑</span><img className="system-preview" src={`${import.meta.env.BASE_URL}catalog/D08-editorial.png`} alt="Editorial 风格热力图" /><h3>Editorial</h3><p>热力图 / 清晰网格、硬朗边界与纸面层级，适合报告、出版与正式演示。</p></article>
          <article className="system-tile is-digital"><span>03 / 数字</span><img className="system-preview" src={`${import.meta.env.BASE_URL}catalog/F05-digital.png`} alt="Digital 风格嵌套矩形树图" /><h3>Digital</h3><p>嵌套矩形树图 / 近黑仪表界面与冷静信息密度，适合实时产品与研究场景。</p></article>
        </div>
      </section>

      <section className="featured-section">
        <div className="section-heading"><div><span>02 / SELECTED WORK</span><h2>Six ways to make<br />the point visible.</h2></div><a className="library-browse-cta" href={href("/library")}>浏览图表库 <span>→</span></a></div>
        <div className="library-grid featured-grid">{featured.map((item, index) => <ChartCard key={item.id} item={item} index={index} />)}</div>
      </section>

      <section className="audience-strip" aria-label="Audience collections">
        <div><span>03 / 场景集合</span><h2>从你要说服的<br />那群人开始。</h2></div>
        <div>{audiences.map((audience) => <a key={audience} href={href(`/collections/${audience}`)}><strong>{audienceLabels[audience]}</strong><span>{prototypeCatalog.filter((item) => item.audiences.includes(audience)).length} 个图表</span></a>)}</div>
      </section>
      <SiteFooter />
    </main>
  );
}

function HomePageZh() {
  const featuredIds = ["C10", "T12", "D03", "F02", "P03", "B01"];
  const featured = featuredIds.map((id) => prototypeCatalog.find((item) => item.id === id)).filter(Boolean);
  return (
    <main className="library-shell home-page">
      <SiteNav />
      <section className="system-manifesto home-system-manifesto" aria-labelledby="systems-heading-zh">
        <div className="system-intro-heading">
          <div><div className="section-index">01 / 视觉系统</div><h2 id="systems-heading-zh">MAV<br />数据图表库。</h2></div>
          <div className="library-proof" aria-label="图表库概况"><span><strong>48</strong> 个稳定模板</span><span><strong>3</strong> 套视觉系统</span><span><strong>5</strong> 大专题</span></div>
        </div>
        <div className="system-manifesto-grid">
          <article className="system-tile is-signal"><span>01 / 信号</span><img className="system-preview" src={`${import.meta.env.BASE_URL}catalog/C11-signal.png`} alt="Signal 风格哑铃图" /><h3>Signal</h3><p>哑铃图 / 黑色场域、强烈红色与斜体结论，让差距第一时间被看见。</p></article>
          <article className="system-tile is-editorial"><span>02 / 编辑</span><img className="system-preview" src={`${import.meta.env.BASE_URL}catalog/D08-editorial.png`} alt="Editorial 风格热力图" /><h3>Editorial</h3><p>热力图 / 清晰网格、硬朗边界与纸面层级，适合报告、出版与正式演示。</p></article>
          <article className="system-tile is-digital"><span>03 / 数字</span><img className="system-preview" src={`${import.meta.env.BASE_URL}catalog/F05-digital.png`} alt="Digital 风格嵌套矩形树图" /><h3>Digital</h3><p>嵌套矩形树图 / 近黑仪表界面与冷静信息密度，适合实时产品与研究场景。</p></article>
        </div>
      </section>

      <section className="featured-section">
        <div className="section-heading"><div><span>02 / 精选图表</span><h2>六种方式，<br />让观点被看见。</h2></div><a className="library-browse-cta" href={href("/library")}>浏览图表库 <span>→</span></a></div>
        <div className="library-grid featured-grid">{featured.map((item, index) => <ChartCard key={item.id} item={item} index={index} />)}</div>
      </section>

      <section className="audience-strip" aria-label="使用对象集合">
        <div><span>03 / 场景集合</span><h2>从你要说服的<br />那群人开始。</h2></div>
        <div>{audiences.map((audience) => <a key={audience} href={href(`/collections/${audience}`)}><strong>{audienceLabels[audience]}</strong><span>{prototypeCatalog.filter((item) => item.audiences.includes(audience)).length} 个图表</span></a>)}</div>
      </section>
      <SiteFooter />
    </main>
  );
}

function CatalogPage() {
  const initial = new URLSearchParams(window.location.search);
  const [query, setQuery] = React.useState(initial.get("q") || "");
  const [question, setQuestion] = React.useState(initial.get("question") || "all");
  const [system, setSystem] = React.useState(initial.get("system") || "signal");
  const filtered = prototypeCatalog.filter((item) => {
    const haystack = `${item.id} ${item.name} ${item.nameZh} ${item.description} ${item.descriptionZh}`.toLowerCase();
    return (question === "all" || item.questions.includes(question)) && (!query.trim() || haystack.includes(query.trim().toLowerCase()));
  });
  const update = (nextQuery, nextQuestion, nextSystem) => {
    const params = new URLSearchParams();
    if (nextQuery) params.set("q", nextQuery);
    if (nextQuestion !== "all") params.set("question", nextQuestion);
    if (nextSystem !== "signal") params.set("system", nextSystem);
    window.history.replaceState(null, "", `${href("/library")}${params.size ? `?${params}` : ""}`);
  };
  const change = (kind, value) => {
    const values = { query, question, system, [kind]: value };
    setQuery(values.query); setQuestion(values.question); setSystem(values.system);
    update(values.query, values.question, values.system);
  };
  return (
    <main className="library-shell catalog-page">
      <SiteNav compact />
      <PageMasthead eyebrow="完整索引 / 48" title={<>图表<br />资料库。</>} copy="按稳定编号、表达目的或使用对象搜索。切换视觉系统，不改变数据本身的叙事。" />
      <section className="library-controls" aria-label="图表筛选">
        <label className="library-search"><span>搜索</span><input value={query} onChange={(event) => change("query", event.target.value)} placeholder="图表编号、名称或业务问题…" /></label>
        <label><span>表达目的</span><select value={question} onChange={(event) => change("question", event.target.value)}><option value="all">全部问题</option>{Object.entries(questionLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <SystemSwitch value={system} onChange={(value) => change("system", value)} />
        <div className="library-result-count"><strong>{String(filtered.length).padStart(2, "0")}</strong><span>项结果</span></div>
      </section>
      <section className="library-grid" aria-live="polite">{filtered.map((item, index) => <ChartCard key={item.id} item={item} system={system} index={index} />)}</section>
      {!filtered.length ? <div className="library-empty"><strong>没有结果</strong><span>试试图表编号、其他问题类型或视觉系统。</span></div> : null}
      <SiteFooter />
    </main>
  );
}

function DetailPage({ id }) {
  const item = prototypeCatalog.find((entry) => entry.id.toLowerCase() === id.toLowerCase());
  const initialSystem = new URLSearchParams(window.location.search).get("system") || "signal";
  const [system, setSystem] = React.useState(systems.includes(initialSystem) ? initialSystem : "signal");
  const [copied, setCopied] = React.useState(false);
  if (!item) return <NotFoundZh />;
  const directory = item.githubPath.split("/").at(-2);
  const chartComponent = componentName(item);
  const dataExport = exampleName(item);
  const code = `import { ${chartComponent}, ${dataExport} } from "@mav-charts/charts/${directory}";\n\nexport function Example() {\n  return (\n    <${chartComponent}\n      data={${dataExport}}\n      visualSystem="${system}"\n    />\n  );\n}`;
  const sourceUrl = `${REPOSITORY}/blob/main/${item.githubPath}`;
  const issueUrl = `${REPOSITORY}/issues/new?title=${encodeURIComponent(`[${item.id}] `)}`;
  const alternatives = prototypeCatalog.filter((candidate) => candidate.id !== item.id && candidate.questions.some((question) => item.questions.includes(question))).slice(0, 3);
  const warnings = misuseLines(item);
  const setVisualSystem = (next) => {
    setSystem(next);
    window.history.replaceState(null, "", `${href(`/charts/${item.id}`)}?system=${next}`);
  };
  const copy = async () => { await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  return (
    <main className="library-shell detail-page" data-library-detail={item.id}>
      <SiteNav compact />
      <header className="detail-header">
        <div className="detail-id">{item.id}</div>
        <div><span>{item.questions.map((question) => questionLabels[question]).join(" / ")}</span><h1>{defaultHeadline(item)}</h1><p>{item.name} · {item.nameZh}</p></div>
        <div className="detail-version"><span>版本</span><strong>v{VERSION}</strong><small>提交 {COMMIT}</small></div>
      </header>
      <section className="detail-stage">
        <div className="detail-toolbar"><SystemSwitch value={system} onChange={setVisualSystem} /><a href={sourceUrl}>OPEN SOURCE ↗</a></div>
        <iframe title={`${item.name} live ${system} preview`} src={`${import.meta.env.BASE_URL}?template=${item.id}&theme=${system}&capture&embed=1`} loading="eager" />
      </section>
      <section className="detail-facts">
        <div><span>表达什么</span><strong>{item.questions.map((entry) => questionLabels[entry]).join(" · ")}</strong></div>
        <div><span>适合谁</span><strong>{item.audiences.map((entry) => audienceLabels[entry] || entry).join(" · ")}</strong></div>
        <div><span>使用场景</span><strong>{item.scenarios.join(" · ")}</strong></div>
        <div><span>图形引擎</span><strong>{item.primitive.join(" + ")}</strong></div>
      </section>
      <section className="detail-documentation">
        <article><div className="doc-label">01 / 数据结构</div><h2>数据约定。</h2><p>这里直接展示模板的源数据结构，不维护另一份网站文案。</p><pre tabIndex={0}><code>{artifact(schemaFiles, item)}</code></pre></article>
        <article><div className="doc-label">02 / 示例数据</div><h2>可运行的输入。</h2><pre tabIndex={0}><code>{artifact(exampleFiles, item)}</code></pre></article>
        <article className="code-example"><div className="doc-label">03 / REACT + TYPESCRIPT</div><h2>使用这个组件。</h2><button type="button" onClick={copy}>{copied ? "已复制" : "复制代码"}</button><pre tabIndex={0}><code>{code}</code></pre></article>
        <article><div className="doc-label">04 / 谨慎使用</div><h2>避免误用。</h2>{warnings.length ? <ul>{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : <p>选用这种编码前请阅读模板指南；缺失值、单位和比例尺边界都必须明确表达。</p>}<details><summary>阅读完整双语模板指南</summary><pre tabIndex={0}><code>{artifact(readmeFiles, item)}</code></pre></details></article>
      </section>
      <section className="alternative-section"><div><span>05 / 相邻选择</span><h2>也许是这张，<br />也许是旁边那张。</h2></div><div>{alternatives.map((candidate) => <a key={candidate.id} href={href(`/charts/${candidate.id}`)}><span>{candidate.id}</span><strong>{candidate.nameZh}</strong><small>{candidate.descriptionZh || candidate.description}</small></a>)}</div></section>
      <section className="detail-actions"><a href={sourceUrl}>OPEN GITHUB SOURCE</a><button type="button" onClick={copy}>{copied ? "COPIED" : "COPY CODE"}</button><a href={issueUrl}>REPORT AN ISSUE</a></section>
      <SiteFooter />
    </main>
  );
}

function CollectionPage({ audience }) {
  if (!audiences.includes(audience)) return <NotFoundZh />;
  const items = prototypeCatalog.filter((item) => item.audiences.includes(audience));
  return (
    <main className="library-shell collection-page">
      <SiteNav compact />
      <PageMasthead eyebrow={<>场景集合 / {audienceLabels[audience]}</>} title={<>为{audienceLabels[audience]}<br />而选。</>} copy={<>从同一份目录中筛选出 {items.length} 个相关模板。集合只做筛选，不复制或分叉图表元数据。</>} />
      <nav className="collection-tabs" aria-label="使用对象集合">{audiences.map((entry) => <a key={entry} aria-current={entry === audience ? "page" : undefined} href={href(`/collections/${entry}`)}>{audienceLabels[entry]}</a>)}</nav>
      <section className="library-grid">{items.map((item, index) => <ChartCard key={item.id} item={item} index={index} />)}</section>
      <SiteFooter />
    </main>
  );
}

function GuidesPage() {
  const guides = [
    ["01", "从问题出发", "先判断你要表达的是对比、趋势、构成、分布、关系、流向还是进度。明确业务问题后，再选择图形。"],
    ["02", "忠实于数据", "长度、位置、面积与角度必须保持比例。缺失值仍是缺失值；负数保留真实零点；坐标轴不能隐藏柱形基线。"],
    ["03", "无障碍可用", "每个模板同时支持指针与键盘交互，并提供屏幕阅读器表格、对比度检查和清晰的减弱动效状态。"],
    ["04", "有意义的动效", "动效只解释进入与变化，绝不改变编码值。截图模式和减弱动效偏好都会直接呈现完整首帧。"],
  ];
  return <main className="library-shell guide-page"><SiteNav compact /><PageMasthead eyebrow="FIELD MANUAL / 04 PRINCIPLES" title={<>Choose well.<br />Show honestly.</>} copy="A compact operating guide for teams selecting, reviewing and shipping data graphics." /><section className="guide-grid">{guides.map(([index, title, copy]) => <article key={index}><span>{index}</span><h2>{title}</h2><p>{copy}</p>{index === "01" ? <div className="guide-links">{Object.entries(questionLabels).map(([key, value]) => <a key={key} href={href(`/library?question=${key}`)}>{value} ↗</a>)}</div> : null}</article>)}</section><SiteFooter /></main>;
}

function AboutPage() {
  return <main className="library-shell about-page"><SiteNav compact /><PageMasthead eyebrow="OPEN SOURCE / MIT" title={<>Charts are<br />public infrastructure.</>} copy="MAV Charts is a typed Recharts library, a tested visual system and a catalog-driven website maintained as one product." /><section className="about-grid"><article><span>01 / REPOSITORY</span><h2>Inspect every decision.</h2><p>All 48 stable IDs, schemas, examples, tests, visual baselines and documentation live in the public repository.</p><a href={REPOSITORY}>OPEN GITHUB ↗</a></article><article><span>02 / LICENSES</span><h2>Clear provenance.</h2><p>The project is MIT licensed. Recharts, bundled fonts and other third-party notices remain documented alongside the source.</p><a href={`${REPOSITORY}/blob/main/THIRD_PARTY_LICENSES.md`}>THIRD-PARTY LICENSES ↗</a></article><article><span>03 / CONTRIBUTE</span><h2>Make the contract stronger.</h2><p>Contributions start with truthful geometry, accessible interaction and visual evidence—not a screenshot alone.</p><a href={`${REPOSITORY}/blob/main/CONTRIBUTING.md`}>CONTRIBUTING GUIDE ↗</a></article></section><SiteFooter /></main>;
}

function GuidesPageZh() {
  const guides = [
    ["01", "从问题出发", "先判断你要表达的是对比、趋势、构成、分布、关系、流向还是进度。明确业务问题后，再选择图形。"],
    ["02", "忠实于数据", "长度、位置、面积与角度必须保持比例。缺失值仍是缺失值；负数保留真实零点；坐标轴不能隐藏柱形基线。"],
    ["03", "无障碍可用", "每个模板同时支持指针与键盘交互，并提供屏幕阅读器表格、对比度检查和清晰的减弱动效状态。"],
    ["04", "有意义的动效", "动效只解释进入与变化，绝不改变编码值。截图模式和减弱动效偏好都会直接呈现完整首帧。"],
  ];
  return <main className="library-shell guide-page"><SiteNav compact /><PageMasthead eyebrow="使用手册 / 04 条原则" title={<>选得准确。<br />表达诚实。</>} copy="一份简明操作指南，帮助团队选择、审阅并发布数据图形。" /><section className="guide-grid">{guides.map(([index, title, copy]) => <article key={index}><span>{index}</span><h2>{title}</h2><p>{copy}</p>{index === "01" ? <div className="guide-links">{Object.entries(questionLabels).map(([key, value]) => <a key={key} href={href(`/library?question=${key}`)}>{value} →</a>)}</div> : null}</article>)}</section><SiteFooter /></main>;
}

function AboutPageZh() {
  return <main className="library-shell about-page"><SiteNav compact /><PageMasthead eyebrow="开源项目 / MIT" title={<>图表也是<br />公共基础设施。</>} copy="MAV Charts 把类型化 Recharts 组件、经过验证的视觉系统和目录驱动网站维护为同一个产品。" /><section className="about-grid"><article><span>01 / 代码仓库</span><h2>查看每一个决定。</h2><p>48 个稳定编号、数据结构、示例、测试、视觉基线和文档都在公开仓库中。</p><a href={REPOSITORY}>打开 GitHub ↗</a></article><article><span>02 / 开源许可</span><h2>来源清晰。</h2><p>项目采用 MIT 许可证。Recharts、内置字体和其他第三方声明均与源码一起记录。</p><a href={`${REPOSITORY}/blob/main/THIRD_PARTY_LICENSES.md`}>查看第三方许可 ↗</a></article><article><span>03 / 参与贡献</span><h2>让约定更可靠。</h2><p>贡献从真实比例、无障碍交互和可验证的视觉证据开始，而不只是一张截图。</p><a href={`${REPOSITORY}/blob/main/CONTRIBUTING.md`}>阅读贡献指南 ↗</a></article></section><SiteFooter /></main>;
}

function NotFoundZh() {
  return <main className="library-shell not-found"><SiteNav compact /><section><span>404 / 超出图表范围</span><h1>这个坐标上<br />没有图表。</h1><a href={href("/library")}>返回图表库 →</a></section><SiteFooter /></main>;
}

function NotFound() {
  return <main className="library-shell not-found"><SiteNav compact /><section><span>404 / OUTSIDE THE DOMAIN</span><h1>No chart<br />at this coordinate.</h1><a href={href("/library")}>RETURN TO LIBRARY ↗</a></section><SiteFooter /></main>;
}

export function LibraryApp() {
  const route = useRoute();
  if (route === "/") return <HomePageZh />;
  if (route === "/library") return <CatalogPage />;
  if (route === "/guides") return <GuidesPageZh />;
  if (route === "/about") return <AboutPageZh />;
  const chartMatch = route.match(/^\/charts\/([A-Za-z]\d{2})$/);
  if (chartMatch) return <DetailPage id={chartMatch[1]} />;
  const collectionMatch = route.match(/^\/collections\/([a-z-]+)$/);
  if (collectionMatch) return <CollectionPage audience={collectionMatch[1]} />;
  return <NotFoundZh />;
}
