import { Children, cloneElement, isValidElement, useEffect, useRef } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { toCssVariables } from "@mav-charts/themes";
import type { ChartShellProps } from "./types";

const previewTranslations: Record<string, string> = {
  "Focus": "重点", "Value": "数值", "Missing": "缺失", "Missing = gap": "缺失值 = 留空",
  "Category": "类别", "Detail": "说明", "Target": "目标", "Actual": "实际", "Change": "变化",
  "Primary": "主要系列", "Secondary": "对比系列", "Upper": "上层", "Core": "核心", "Expansion": "扩展",
  "North": "华北", "South": "华南", "East": "华东", "West": "西部", "Central": "中部",
  "Largest region": "当前最高", "Not reported": "暂未报告", "No data available": "暂无数据",
  "The supplied data is invalid": "提供的数据不符合要求", "Simple column values": "基础柱状图数据",
  "Jan": "一月", "Feb": "二月", "Mar": "三月", "Apr": "四月", "May": "五月", "Jun": "六月",
  "Jul": "七月", "Aug": "八月", "Sep": "九月", "Oct": "十月", "Nov": "十一月", "Dec": "十二月",
};

const localizableKeys = new Set(["label", "name", "detail", "category", "group", "series", "source", "target", "event", "annotation", "path"]);

function translatedPreviewString(value: string, key: string, names: Map<string, string>) {
  if (previewTranslations[value]) return previewTranslations[value];
  if (!localizableKeys.has(key) || !/[a-z]/i.test(value) || /^\d{4}|^Q[1-4]$|^\d{4}-\d{2}/i.test(value)) return value;
  if (names.has(value)) return names.get(value)!;
  const prefix = key === "detail" ? "示例说明" : key === "event" || key === "annotation" ? "事件" : key === "source" || key === "target" ? "节点" : "项目";
  const translated = `${prefix} ${names.size + 1}`;
  names.set(value, translated);
  return translated;
}

function localizePreviewData(value: unknown, key = "", names = new Map<string, string>()): unknown {
  if (typeof value === "string") return translatedPreviewString(value, key, names);
  if (Array.isArray(value)) return value.map((entry) => localizePreviewData(entry, key, names));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([entryKey, entryValue]) => [entryKey, localizePreviewData(entryValue, entryKey, names)]));
}

function localizePreviewChildren(children: ReactNode) {
  const names = new Map<string, string>();
  return Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const element = child as ReactElement<Record<string, unknown>>;
    const nextProps: Record<string, unknown> = {};
    if ("data" in element.props) nextProps.data = localizePreviewData(element.props.data, "data", names);
    for (const key of ["seriesName", "primaryName", "comparisonName", "baseName", "upperName", "xName", "yName"]) {
      if (typeof element.props[key] === "string") nextProps[key] = previewTranslations[element.props[key] as string] || element.props[key];
    }
    return Object.keys(nextProps).length ? cloneElement(element, nextProps) : element;
  });
}

function translateRenderedText(root: HTMLElement, chartTitle: string) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const raw = node.textContent || "";
    const trimmed = raw.trim();
    if (previewTranslations[trimmed]) node.textContent = raw.replace(trimmed, previewTranslations[trimmed]);
    node = walker.nextNode();
  }
  root.querySelectorAll<HTMLElement>("[aria-label]").forEach((element) => {
    const label = element.getAttribute("aria-label") || "";
    if (/interactive chart/i.test(label)) element.setAttribute("aria-label", `${chartTitle}交互式图表`);
    else if (/legend/i.test(label)) element.setAttribute("aria-label", "图例");
  });
}

export function ChartShell({
  code,
  title,
  subtitle,
  source,
  theme,
  children,
  description,
  state = "ready",
}: ChartShellProps) {
  const titleId = `chart-${code.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-title`;
  const shellRef = useRef<HTMLElement>(null);
  const params = typeof window === "undefined" ? null : new URLSearchParams(window.location.search);
  const isChinesePreview = params?.get("lang") === "zh";
  const displayTitle = isChinesePreview ? params?.get("chartTitle") || title : title;
  const displaySubtitle = isChinesePreview ? params?.get("chartSubtitle") || subtitle : subtitle;
  const displayDescription = isChinesePreview ? params?.get("chartDescription") || description : description;
  const displaySource = isChinesePreview ? params?.get("chartSource") || source : source;
  const displayChildren = isChinesePreview ? localizePreviewChildren(children) : children;

  useEffect(() => {
    if (!isChinesePreview || !shellRef.current) return;
    const root = shellRef.current;
    translateRenderedText(root, displayTitle);
    const observer = new MutationObserver(() => translateRenderedText(root, displayTitle));
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [isChinesePreview, displayChildren, displayTitle]);

  return (
    <article
      ref={shellRef}
      className="chart-card"
      data-chart-id={code}
      data-state={state}
      data-visual-system={theme.key}
      aria-labelledby={titleId}
      style={toCssVariables(theme) as CSSProperties}
    >
      <header className="chart-header">
        <div className="chart-code" aria-hidden="true">{code}</div>
        <div>
          <h2 id={titleId}>{displayTitle}</h2>
          <p>{displaySubtitle}</p>
        </div>
      </header>
      <div className="chart-stage">
        {state === "ready" ? displayChildren : (
          <div className="chart-state" role="status">
            {state === "empty" ? (isChinesePreview ? "暂无数据" : "No data available") : (isChinesePreview ? "提供的数据不符合要求" : "The supplied data is invalid")}
          </div>
        )}
      </div>
      {displayDescription ? <p className="sr-only">{displayDescription}</p> : null}
      <footer>{displaySource}</footer>
    </article>
  );
}
