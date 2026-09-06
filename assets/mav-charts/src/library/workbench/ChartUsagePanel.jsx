import React from "react";
import { agentPrompt, audienceLabels, questionLabels, scenarioLabels, systemLabels } from "../catalogPresentation";
import { baseHref } from "../routing";

export function ChartUsagePanel({ item, system, drawer = false, open = false, onClose }) {
  const [copied, setCopied] = React.useState("");
  const [fallback, setFallback] = React.useState("");
  const closeRef = React.useRef(null);
  React.useEffect(() => {
    if (!drawer || !open) return undefined;
    closeRef.current?.focus();
    const escape = (event) => { if (event.key === "Escape") onClose(); };
    document.body.classList.add("wb-drawer-open"); window.addEventListener("keydown", escape);
    return () => { document.body.classList.remove("wb-drawer-open"); window.removeEventListener("keydown", escape); };
  }, [drawer, open, onClose]);
  if (!item) return <aside className={`wb-usage${drawer ? " wb-drawer" : ""}`} aria-hidden={drawer ? !open : undefined}><div className="wb-usage-empty">选择一张图后，这里会显示使用建议。</div></aside>;
  const detailUrl = new URL(baseHref(`/charts/${item.id}?system=${system}`), window.location.href).href;
  const prompt = agentPrompt(item, system, detailUrl, item.motion.defaultSceneMs);
  const copy = async () => {
    try { await navigator.clipboard.writeText(prompt); setCopied("已复制，可以交给 Agent"); }
    catch { setFallback(prompt); setCopied("请选择下方文字并复制"); }
    window.setTimeout(() => setCopied(""), 2600);
  };
  return <aside className={`wb-usage${drawer ? ` wb-drawer${open ? " is-open" : ""}` : ""}`} role={drawer ? "dialog" : undefined} aria-modal={drawer ? "true" : undefined} aria-label="这张图怎么用" aria-hidden={drawer ? !open : undefined} inert={drawer && !open ? true : undefined}>
    {drawer ? <button ref={closeRef} className="wb-drawer-close" type="button" onClick={onClose} aria-label="关闭使用说明">—</button> : null}
    <div className="wb-usage-head"><span>这张图怎么用</span><b>{item.id}</b></div>
    <section className="wb-identity"><div className="wb-number">{item.id}</div><span>{item.questions.map((q) => questionLabels[q]).join(" / ")}</span><h2>{item.nameZh}</h2><p>{item.name}</p><strong>{item.descriptionZh}</strong></section>
    <section className="wb-decision"><div className="is-fit"><span>适合</span><p>{item.guidance.fit}</p></div><div className="is-avoid"><span>不适合</span><p>{item.guidance.avoid}</p></div></section>
    <section className="wb-fields"><header><span>数据字段</span><small>缺失值保留为空</small></header><div className="wb-field-list">{item.fields.map((field) => <div key={field.key}><strong>{field.label}{field.optional ? <i>可选</i> : null}</strong><p>{field.description}</p><code>{field.key}: {field.type}</code></div>)}</div></section>
    <section className="wb-tags"><div><span>场景</span><p>{item.scenarios.map((x) => scenarioLabels[x] || x).join(" · ")}</p></div><div><span>对象</span><p>{item.audiences.map((x) => audienceLabels[x] || x).join(" · ")}</p></div></section>
    <section className="wb-duration"><div><span>默认场景</span><b>{(item.motion.defaultSceneMs / 1000).toFixed(1)} 秒</b></div><div className="wb-duration-track"><i style={{ flex: item.motion.enterMs }}>进入 {(item.motion.enterMs / 1000).toFixed(1)}s</i><i style={{ flex: item.motion.holdMs }}>停留 {(item.motion.holdMs / 1000).toFixed(1)}s</i><i style={{ flex: item.motion.exitMs }}>退出 {(item.motion.exitMs / 1000).toFixed(1)}s</i></div><small>推荐区间 {item.motion.minSceneMs / 1000}–{item.motion.maxSceneMs / 1000} 秒</small></section>
    <div className="wb-actions"><button type="button" onClick={copy}>{copied || "复制给 Agent"}<span>↗</span></button><div><a href={detailUrl}>分享详情</a><a href={item.sourceUrl}>查看源码</a></div>{fallback ? <textarea readOnly autoFocus value={fallback} aria-label="待复制的 Agent 提示词" onFocus={(event) => event.target.select()} /> : null}<p className="sr-only" aria-live="polite">{copied}</p></div>
    <footer>{systemLabels[system]}系统 · MAV CHARTS</footer>
  </aside>;
}
