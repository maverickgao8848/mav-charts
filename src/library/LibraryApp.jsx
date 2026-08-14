import React from "react";
import { prototypeCatalog } from "../../packages/catalog/src";
import "./library.css";

const VERSION = "0.1.0";
const COMMIT = import.meta.env.VITE_COMMIT_SHA?.slice(0, 7) || "main";
const REPOSITORY = "https://github.com/maverickgao8848/mav-charts";
const systems = ["signal", "editorial", "digital"];
const audiences = ["consulting", "finance", "product", "marketing", "operations"];

const questionLabels = {
  compare: "Compare",
  trend: "Trend",
  composition: "Composition",
  distribution: "Distribution",
  relationship: "Relationship",
  flow: "Flow",
  progress: "Progress",
};

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
    <nav className={`site-nav${compact ? " is-compact" : ""}`} aria-label="Primary navigation">
      <a className="library-brand" href={href("/")}><span className="library-brand-mark">M/A/V</span><span>CHART LIBRARY</span></a>
      <div className="site-nav-links">
        <a href={href("/library")}>Library</a>
        <a href={href("/collections/consulting")}>Collections</a>
        <a href={href("/guides")}>Guides</a>
        <a href={href("/about")}>About</a>
        <a href={REPOSITORY}>GitHub ↗</a>
      </div>
    </nav>
  );
}

function SystemSwitch({ value, onChange, label = "Visual system" }) {
  return (
    <fieldset className="system-switch site-system-switch">
      <legend>{label}</legend>
      {systems.map((system) => <button key={system} type="button" aria-pressed={value === system} onClick={() => onChange(system)}>{system}</button>)}
    </fieldset>
  );
}

function ChartCard({ item, system = "signal", index = 0 }) {
  const sourceUrl = `${REPOSITORY}/blob/main/${item.githubPath}`;
  return (
    <article className="library-card" data-chart-card={item.id} style={{ "--order": index }}>
      <div className="library-card-top"><span>{item.id}</span><span>{item.questions.map((entry) => questionLabels[entry]).join(" / ")}</span></div>
      <a className="library-thumbnail" href={href(`/charts/${item.id}?system=${system}`)} aria-label={`View chart ${item.name}`}>
        <img src={`${import.meta.env.BASE_URL}catalog/${item.id}-${system}.png`} alt={`${item.name}, ${system} visual system`} loading="lazy" />
        <span className="library-open">VIEW CHART ↗</span>
      </a>
      <div className="library-card-copy">
        <p className="library-card-headline">{defaultHeadline(item)}</p>
        <h2>{item.name}</h2>
        <h3>{item.nameZh} · {item.id}</h3>
        <p>{item.description}</p>
      </div>
      <div className="library-card-taxonomy" aria-label="Chart tags">
        <span><b>WHAT</b>{item.questions.join(" · ")}</span>
        <span><b>WHO</b>{item.audiences.slice(0, 3).join(" · ")}</span>
        <span><b>WHERE</b>{item.scenarios.join(" · ")}</span>
      </div>
      <footer><a href={href(`/charts/${item.id}?system=${system}`)}>VIEW CHART</a><a href={sourceUrl}>GITHUB SOURCE</a></footer>
    </article>
  );
}

function SiteFooter() {
  return <footer className="library-footer"><span>MAV CHARTS / {VERSION} PRERELEASE</span><span>CATALOG + SOURCE · COMMIT {COMMIT}</span></footer>;
}

function HomePage() {
  const featuredIds = ["C10", "T12", "D03", "F02", "P03", "B01"];
  const featured = featuredIds.map((id) => prototypeCatalog.find((item) => item.id === id)).filter(Boolean);
  return (
    <main className="library-shell home-page">
      <header className="library-hero">
        <SiteNav />
        <div className="library-hero-grid">
          <div className="library-kicker">OPEN SOURCE / RECHARTS 3 / 48 STABLE IDS</div>
          <h1>Find the chart<br />that tells the truth.</h1>
          <p>Production React charts organized by the business question—not by a gallery of technical primitives.</p>
          <div className="library-proof" aria-label="Library facts"><span><strong>48</strong> templates</span><span><strong>03</strong> visual systems</span><span><strong>641</strong> automated checks</span></div>
          <a className="site-primary-cta" href={href("/library")}>EXPLORE THE LIBRARY <span>↗</span></a>
        </div>
        <div className="library-redline" aria-hidden="true"><span>SEMANTIC FIRST</span><span>HONEST GEOMETRY</span><span>REAL COMPONENTS</span></div>
      </header>

      <section className="system-manifesto" aria-labelledby="systems-heading">
        <div className="section-index">01 / VISUAL SYSTEMS</div>
        <h2 id="systems-heading">One meaning.<br />Three voices.</h2>
        <div className="system-manifesto-grid">
          <article className="system-tile is-signal"><span>01</span><h3>Signal</h3><p>Ying-informed editorial force. Black field, Chiron display, one decisive red focus.</p></article>
          <article className="system-tile is-editorial"><span>02</span><h3>Editorial</h3><p>Hard-edged, directional and mechanically locked for reports and presentations.</p></article>
          <article className="system-tile is-digital"><span>03</span><h3>Digital</h3><p>Near-black research instrumentation: white, grey, hairlines and disciplined density.</p></article>
        </div>
      </section>

      <section className="featured-section">
        <div className="section-heading"><div><span>02 / SELECTED WORK</span><h2>Six ways to make<br />the point visible.</h2></div><a href={href("/library")}>VIEW ALL 48 ↗</a></div>
        <div className="library-grid featured-grid">{featured.map((item, index) => <ChartCard key={item.id} item={item} index={index} />)}</div>
      </section>

      <section className="audience-strip" aria-label="Audience collections">
        <div><span>03 / COLLECTIONS</span><h2>Start with the room<br />you need to convince.</h2></div>
        <div>{audiences.map((audience) => <a key={audience} href={href(`/collections/${audience}`)}><strong>{audience}</strong><span>{prototypeCatalog.filter((item) => item.audiences.includes(audience)).length} charts</span></a>)}</div>
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
      <header className="page-masthead"><span>THE COMPLETE INDEX / 48</span><h1>Chart<br />Library.</h1><p>Search by stable ID, meaning or audience. Change the visual system without changing the data story.</p></header>
      <section className="library-controls" aria-label="Catalog filters">
        <label className="library-search"><span>SEARCH / 搜索</span><input value={query} onChange={(event) => change("query", event.target.value)} placeholder="ID, name, business question…" /></label>
        <label><span>QUESTION</span><select value={question} onChange={(event) => change("question", event.target.value)}><option value="all">All questions</option>{Object.entries(questionLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <SystemSwitch value={system} onChange={(value) => change("system", value)} />
        <div className="library-result-count"><strong>{String(filtered.length).padStart(2, "0")}</strong><span>results</span></div>
      </section>
      <section className="library-grid" aria-live="polite">{filtered.map((item, index) => <ChartCard key={item.id} item={item} system={system} index={index} />)}</section>
      {!filtered.length ? <div className="library-empty"><strong>NO MATCH</strong><span>Try an ID, a question, or another visual system.</span></div> : null}
      <SiteFooter />
    </main>
  );
}

function DetailPage({ id }) {
  const item = prototypeCatalog.find((entry) => entry.id.toLowerCase() === id.toLowerCase());
  const initialSystem = new URLSearchParams(window.location.search).get("system") || "signal";
  const [system, setSystem] = React.useState(systems.includes(initialSystem) ? initialSystem : "signal");
  const [copied, setCopied] = React.useState(false);
  if (!item) return <NotFound />;
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
        <div className="detail-version"><span>RELEASE</span><strong>v{VERSION}</strong><small>COMMIT {COMMIT}</small></div>
      </header>
      <section className="detail-stage">
        <div className="detail-toolbar"><SystemSwitch value={system} onChange={setVisualSystem} /><a href={sourceUrl}>OPEN SOURCE ↗</a></div>
        <iframe title={`${item.name} live ${system} preview`} src={`${import.meta.env.BASE_URL}?template=${item.id}&theme=${system}&capture&embed=1`} loading="eager" />
      </section>
      <section className="detail-facts">
        <div><span>WHAT TO SHOW</span><strong>{item.questions.join(" · ")}</strong></div>
        <div><span>WHO FOR</span><strong>{item.audiences.join(" · ")}</strong></div>
        <div><span>WHERE TO USE</span><strong>{item.scenarios.join(" · ")}</strong></div>
        <div><span>ENGINE</span><strong>{item.primitive.join(" + ")}</strong></div>
      </section>
      <section className="detail-documentation">
        <article><div className="doc-label">01 / DATA SCHEMA</div><h2>The contract.</h2><p>The source schema is shown directly from this template—no website copy.</p><pre tabIndex={0}><code>{artifact(schemaFiles, item)}</code></pre></article>
        <article><div className="doc-label">02 / EXAMPLE DATA</div><h2>A working input.</h2><pre tabIndex={0}><code>{artifact(exampleFiles, item)}</code></pre></article>
        <article className="code-example"><div className="doc-label">03 / REACT + TYPESCRIPT</div><h2>Use the component.</h2><button type="button" onClick={copy}>{copied ? "COPIED" : "COPY CODE"}</button><pre tabIndex={0}><code>{code}</code></pre></article>
        <article><div className="doc-label">04 / USE WITH CARE</div><h2>Misuse warnings.</h2>{warnings.length ? <ul>{warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : <p>Read the template guide before choosing this encoding; missing values, units and scale boundaries remain explicit.</p>}<details><summary>READ THE COMPLETE BILINGUAL TEMPLATE GUIDE</summary><pre tabIndex={0}><code>{artifact(readmeFiles, item)}</code></pre></details></article>
      </section>
      <section className="alternative-section"><div><span>05 / ADJACENT OPTIONS</span><h2>Maybe this chart.<br />Maybe one next door.</h2></div><div>{alternatives.map((candidate) => <a key={candidate.id} href={href(`/charts/${candidate.id}`)}><span>{candidate.id}</span><strong>{candidate.name}</strong><small>{candidate.description}</small></a>)}</div></section>
      <section className="detail-actions"><a href={sourceUrl}>OPEN GITHUB SOURCE</a><button type="button" onClick={copy}>{copied ? "COPIED" : "COPY CODE"}</button><a href={issueUrl}>REPORT AN ISSUE</a></section>
      <SiteFooter />
    </main>
  );
}

function CollectionPage({ audience }) {
  if (!audiences.includes(audience)) return <NotFound />;
  const items = prototypeCatalog.filter((item) => item.audiences.includes(audience));
  return (
    <main className="library-shell collection-page">
      <SiteNav compact />
      <header className="page-masthead"><span>COLLECTION / {audience.toUpperCase()}</span><h1>Built for<br />{audience}.</h1><p>{items.length} overlapping templates selected from the same catalog. Collections never duplicate or fork chart metadata.</p></header>
      <nav className="collection-tabs" aria-label="Audience collections">{audiences.map((entry) => <a key={entry} aria-current={entry === audience ? "page" : undefined} href={href(`/collections/${entry}`)}>{entry}</a>)}</nav>
      <section className="library-grid">{items.map((item, index) => <ChartCard key={item.id} item={item} index={index} />)}</section>
      <SiteFooter />
    </main>
  );
}

function GuidesPage() {
  const guides = [
    ["01", "Choose by question", "Start with compare, trend, composition, distribution, relationship, flow or progress. Choose geometry only after the business question is explicit."],
    ["02", "Data honesty", "Lengths, positions, areas and angles remain proportional. Missing values stay missing. Negative values use a real zero reference. Axes never conceal a column baseline."],
    ["03", "Accessibility", "Every template pairs pointer interaction with keyboard status, a screen-reader table, contrast checks and a readable reduced-motion state."],
    ["04", "Motion", "Motion explains entry and change; it never alters the encoded value. Capture mode and prefers-reduced-motion render the complete first frame."],
  ];
  return <main className="library-shell guide-page"><SiteNav compact /><header className="page-masthead"><span>FIELD MANUAL / 04 PRINCIPLES</span><h1>Choose well.<br />Show honestly.</h1><p>A compact operating guide for teams selecting, reviewing and shipping data graphics.</p></header><section className="guide-grid">{guides.map(([index, title, copy]) => <article key={index}><span>{index}</span><h2>{title}</h2><p>{copy}</p>{index === "01" ? <div className="guide-links">{Object.entries(questionLabels).map(([key, value]) => <a key={key} href={href(`/library?question=${key}`)}>{value} ↗</a>)}</div> : null}</article>)}</section><SiteFooter /></main>;
}

function AboutPage() {
  return <main className="library-shell about-page"><SiteNav compact /><header className="page-masthead"><span>OPEN SOURCE / MIT</span><h1>Charts are<br />public infrastructure.</h1><p>MAV Charts is a typed Recharts library, a tested visual system and a catalog-driven website maintained as one product.</p></header><section className="about-grid"><article><span>01 / REPOSITORY</span><h2>Inspect every decision.</h2><p>All 48 stable IDs, schemas, examples, tests, visual baselines and documentation live in the public repository.</p><a href={REPOSITORY}>OPEN GITHUB ↗</a></article><article><span>02 / LICENSES</span><h2>Clear provenance.</h2><p>The project is MIT licensed. Recharts, bundled fonts and other third-party notices remain documented alongside the source.</p><a href={`${REPOSITORY}/blob/main/THIRD_PARTY_LICENSES.md`}>THIRD-PARTY LICENSES ↗</a></article><article><span>03 / CONTRIBUTE</span><h2>Make the contract stronger.</h2><p>Contributions start with truthful geometry, accessible interaction and visual evidence—not a screenshot alone.</p><a href={`${REPOSITORY}/blob/main/CONTRIBUTING.md`}>CONTRIBUTING GUIDE ↗</a></article></section><SiteFooter /></main>;
}

function NotFound() {
  return <main className="library-shell not-found"><SiteNav compact /><section><span>404 / OUTSIDE THE DOMAIN</span><h1>No chart<br />at this coordinate.</h1><a href={href("/library")}>RETURN TO LIBRARY ↗</a></section><SiteFooter /></main>;
}

export function LibraryApp() {
  const route = useRoute();
  if (route === "/") return <HomePage />;
  if (route === "/library") return <CatalogPage />;
  if (route === "/guides") return <GuidesPage />;
  if (route === "/about") return <AboutPage />;
  const chartMatch = route.match(/^\/charts\/([A-Za-z]\d{2})$/);
  if (chartMatch) return <DetailPage id={chartMatch[1]} />;
  const collectionMatch = route.match(/^\/collections\/([a-z-]+)$/);
  if (collectionMatch) return <CollectionPage audience={collectionMatch[1]} />;
  return <NotFound />;
}
