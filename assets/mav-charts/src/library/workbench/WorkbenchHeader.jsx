import React from "react";
import { questionLabels, systems, systemLabels } from "../catalogPresentation";

export function WorkbenchHeader({ state, update, resultCount }) {
  return <header className="wb-header">
    <a className="wb-brand" href={import.meta.env.BASE_URL} aria-label="MAV Charts 工作台"><b>M/A/V</b><span>CHART WORKBENCH</span></a>
    <nav className="wb-questions" aria-label="按表达问题筛选">
      <button type="button" aria-pressed={state.question === "all"} onClick={() => update({ question: "all" })}>全部</button>
      {Object.entries(questionLabels).map(([value, label]) => <button key={value} type="button" aria-pressed={state.question === value} onClick={() => update({ question: value })}>{label}</button>)}
    </nav>
    <label className="wb-search"><span className="sr-only">搜索图表</span><i aria-hidden="true">⌕</i><input value={state.query} onChange={(event) => update({ query: event.target.value })} placeholder="搜索编号、图表或业务问题" /><small aria-live="polite">{resultCount}</small></label>
    <fieldset className="wb-systems"><legend className="sr-only">视觉系统</legend>{systems.map((system) => <button key={system} type="button" aria-label={systemLabels[system]} title={systemLabels[system]} aria-pressed={state.system === system} onClick={() => update({ system })}>{system[0].toUpperCase()}</button>)}</fieldset>
    <a className="wb-info" href={`${import.meta.env.BASE_URL}about`} aria-label="关于 MAV Charts">i</a>
  </header>;
}
