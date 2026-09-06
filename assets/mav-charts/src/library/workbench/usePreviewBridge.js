import React from "react";

export function usePreviewBridge(frameRef, durationMs) {
  const [playback, setPlayback] = React.useState({ ready: false, playing: true, progress: 0, rate: 1 });
  const pending = React.useRef(null);
  const send = React.useCallback((type, extra = {}) => {
    const message = { type: `mav:preview/${type}`, version: 1, ...extra };
    const target = frameRef.current?.contentWindow;
    if (target) target.postMessage(message, window.location.origin);
    if (!playback.ready) pending.current = message;
    setPlayback((value) => ({ ...value,
      ...(type === "play" ? { playing: true } : {}), ...(type === "pause" ? { playing: false } : {}),
      ...(type === "replay" ? { playing: true, progress: 0 } : {}), ...(type === "rate" ? { rate: extra.rate } : {}),
      ...(type === "seek" ? { progress: extra.progress } : {}),
    }));
  }, [frameRef, playback.ready]);

  React.useEffect(() => {
    setPlayback({ ready: false, playing: true, progress: 0, rate: 1 });
    pending.current = null;
  }, [durationMs]);

  React.useEffect(() => {
    const receive = (event) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow || event.data?.version !== 1) return;
      if (event.data.type === "mav:preview/ready") {
        setPlayback((value) => ({ ...value, ready: true }));
        if (pending.current) frameRef.current.contentWindow.postMessage(pending.current, window.location.origin);
      }
      if (event.data.type === "mav:preview/time") setPlayback((value) => ({ ...value, progress: event.data.progress, playing: event.data.playing }));
      if (event.data.type === "mav:preview/complete") setPlayback((value) => ({ ...value, progress: 1, playing: false }));
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [frameRef]);
  return { playback, send };
}
