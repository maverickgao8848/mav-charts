import React from "react";

const clock = (ms) => `${(ms / 1000).toFixed(1)}s`;
export function PlaybackControls({ playback, durationMs, send }) {
  const playbackDurationMs = durationMs / playback.rate;
  return <div className="wb-playback" aria-label="预览播放控制">
    <button type="button" onClick={() => send(playback.playing ? "pause" : "play")} aria-label={playback.playing ? "暂停" : "播放"}>{playback.playing ? "Ⅱ" : "▶"}<span>{playback.playing ? "暂停" : "播放"}</span></button>
    <button type="button" onClick={() => send("replay")} aria-label="重播">↺<span>重播</span></button>
    <div className="wb-timeline"><input aria-label="播放进度" type="range" min="0" max="1" step="0.01" value={playback.progress} onChange={(event) => send("seek", { progress: Number(event.target.value) })} style={{ "--progress": `${playback.progress * 100}%` }} /><small>{clock(playback.progress * playbackDurationMs)} / {clock(playbackDurationMs)}</small></div>
    <div className="wb-rate"><button type="button" aria-pressed={playback.rate === .5} onClick={() => send("rate", { rate: .5 })}>0.5×</button><button type="button" aria-pressed={playback.rate === 1} onClick={() => send("rate", { rate: 1 })}>1×</button></div>
  </div>;
}
