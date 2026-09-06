import React from "react";
import { WorkbenchHeader } from "./WorkbenchHeader";
import { ChartFilmstrip } from "./ChartFilmstrip";
import { ChartPreviewStage } from "./ChartPreviewStage";
import { ChartUsagePanel } from "./ChartUsagePanel";
import { useWorkbenchState } from "./useWorkbenchState";
import "../styles/workbench.css";

export function WorkbenchPage() {
  const { state, update, filtered, selected } = useWorkbenchState();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const drawerTrigger = React.useRef(null);
  const closeDrawer = React.useCallback(() => { drawerTrigger.current?.focus(); setDrawerOpen(false); }, []);
  return <main className="wb-shell" data-workbench>
    <WorkbenchHeader state={state} update={update} resultCount={filtered.length} />
    <div className="wb-body">
      <ChartFilmstrip items={filtered} selected={selected} system={state.system} onSelect={(chart) => update({ chart })} onClear={() => update({ query: "", question: "all" })} />
      <ChartPreviewStage item={selected} system={state.system} />
      <ChartUsagePanel item={selected} system={state.system} />
      <button ref={drawerTrigger} type="button" className="wb-drawer-trigger" onClick={() => setDrawerOpen(true)} aria-expanded={drawerOpen}><span>使用建议</span><b>{selected?.nameZh || "选择图表"}</b><i>上拉查看 ↑</i></button>
      <div className={`wb-scrim${drawerOpen ? " is-open" : ""}`} onClick={closeDrawer} aria-hidden="true" />
      <ChartUsagePanel drawer open={drawerOpen} onClose={closeDrawer} item={selected} system={state.system} />
    </div>
  </main>;
}
