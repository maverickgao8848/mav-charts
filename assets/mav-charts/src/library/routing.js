export function baseHref(route = "/") {
  const base = import.meta.env.BASE_URL;
  return route === "/" ? base : `${base}${route.replace(/^\//, "")}`;
}

export function readWorkbenchUrl(search = window.location.search) {
  const params = new URLSearchParams(search);
  return {
    chart: params.get("chart") || "",
    query: params.get("q") || "",
    question: params.get("question") || "all",
    system: params.get("system") || "signal",
  };
}

export function writeWorkbenchUrl(state) {
  const params = new URLSearchParams();
  if (state.chart) params.set("chart", state.chart);
  if (state.question && state.question !== "all") params.set("question", state.question);
  if (state.query) params.set("q", state.query);
  if (state.system && state.system !== "signal") params.set("system", state.system);
  window.history.replaceState({ mavWorkbench: true }, "", `${baseHref("/")}${params.size ? `?${params}` : ""}`);
}
