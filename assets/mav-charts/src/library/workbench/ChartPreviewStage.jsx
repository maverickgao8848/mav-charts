import React from "react";
import { systemLabels } from "../catalogPresentation";
import { PlaybackControls } from "./PlaybackControls";
import { usePreviewBridge } from "./usePreviewBridge";

export function ChartPreviewStage({ item, system }) {
  const frameRef = React.useRef(null);
  const durationMs = item?.motion.defaultSceneMs || 3000;
  const { playback, send } = usePreviewBridge(frameRef, `${item?.id}-${system}-${durationMs}`);
  if (!item) return <section className="wb-stage wb-stage-empty"><div><span>NO MATCH / 00</span><h1>没有匹配的图表。</h1><p>调整左上方的表达问题或搜索词。</p></div></section>;
  const params = new URLSearchParams({ template: item.id, theme: system, embed: "1", autoplay: "1", durationMs: String(durationMs), lang: "zh", chartTitle: item.descriptionZh, chartSubtitle: item.nameZh });
  return <section className="wb-stage" aria-label={`${item.nameZh}实时预览`}>
    <div className="wb-stage-meta"><div><span>{item.id} / LIVE PREVIEW</span><h1>{item.descriptionZh}</h1></div><div><small>视觉系统</small><b>{systemLabels[system]} / {system}</b></div></div>
    <div className="wb-frame-wrap" data-loading={!playback.ready}><iframe ref={frameRef} key={`${item.id}-${system}`} title={`${item.nameZh}，${systemLabels[system]}实时预览`} src={`${import.meta.env.BASE_URL}?${params}`} loading="eager" tabIndex="-1" /></div>
    <PlaybackControls playback={playback} durationMs={durationMs} send={send} />
  </section>;
}
