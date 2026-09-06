import React from "react";
import { questionLabels, systemLabels } from "../catalogPresentation";

export function ChartFilmstrip({ items, selected, system, onSelect, onClear }) {
  const refs = React.useRef([]);
  const move = (event, index) => {
    const horizontal = window.matchMedia("(max-width: 767px)").matches;
    const delta = (horizontal && event.key === "ArrowRight") || (!horizontal && event.key === "ArrowDown") ? 1
      : (horizontal && event.key === "ArrowLeft") || (!horizontal && event.key === "ArrowUp") ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + items.length) % items.length;
    onSelect(items[next].id); refs.current[next]?.focus();
  };
  return <aside className="wb-filmstrip" aria-label="图表目录">
    <div className="wb-rail-head"><span>图表索引</span><b>{String(items.length).padStart(2, "0")}</b></div>
    {items.length ? <div className="wb-rail-list" role="listbox" aria-label="选择图表">{items.map((item, index) => <button
      ref={(node) => { refs.current[index] = node; }} type="button" role="option" aria-selected={selected?.id === item.id}
      tabIndex={selected?.id === item.id ? 0 : -1} className="wb-film-item" key={item.id} onClick={() => onSelect(item.id)} onKeyDown={(event) => move(event, index)}>
      <img src={`${import.meta.env.BASE_URL}catalog/${item.id}-${system}.png`} alt="" loading={selected?.id === item.id ? "eager" : "lazy"} decoding="async" />
      <span><b>{item.id}</b><strong>{item.nameZh}</strong><small>{item.questions.map((q) => questionLabels[q]).join(" · ")}</small></span>
      <i aria-hidden="true">↗</i>
    </button>)}</div> : <div className="wb-rail-empty"><b>没有匹配图表</b><p>换一个关键词或清除筛选。</p><button type="button" onClick={onClear}>清空筛选</button></div>}
    <div className="wb-rail-foot">{systemLabels[system]}系统 · 48 个稳定模板</div>
  </aside>;
}
