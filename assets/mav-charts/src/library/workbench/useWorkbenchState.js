import React from "react";
import { chartWorkbenchItems, systems } from "../catalogPresentation";
import { readWorkbenchUrl, writeWorkbenchUrl } from "../routing";

const questions = ["all", "compare", "trend", "composition", "distribution", "relationship", "flow", "progress"];

function normalize(raw) {
  return {
    query: raw.query || "", question: questions.includes(raw.question) ? raw.question : "all",
    system: systems.includes(raw.system) ? raw.system : "signal", chart: raw.chart || "",
  };
}

export function useWorkbenchState() {
  const [state, setState] = React.useState(() => normalize(readWorkbenchUrl()));
  const items = React.useMemo(() => chartWorkbenchItems(state.system), [state.system]);
  const filtered = React.useMemo(() => {
    const needle = state.query.trim().toLowerCase();
    return items.filter((item) => (state.question === "all" || item.questions.includes(state.question))
      && (!needle || `${item.id} ${item.name} ${item.nameZh} ${item.description} ${item.descriptionZh}`.toLowerCase().includes(needle)));
  }, [items, state.query, state.question]);
  const selected = filtered.find((item) => item.id === state.chart) || filtered[0] || null;

  React.useEffect(() => {
    const next = { ...state, chart: selected?.id || "" };
    if (next.chart !== state.chart) setState(next);
    writeWorkbenchUrl(next);
  }, [state.query, state.question, state.system, state.chart, selected?.id]);

  React.useEffect(() => {
    const restore = () => setState(normalize(readWorkbenchUrl()));
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);

  const update = React.useCallback((patch) => setState((current) => ({ ...current, ...patch })), []);
  return { state, update, items, filtered, selected };
}
