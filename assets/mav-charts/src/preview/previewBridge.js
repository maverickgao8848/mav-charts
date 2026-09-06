const VERSION = 1;
const clamp = (value) => Math.min(1, Math.max(0, value));

export function parsePreviewOptions(search = window.location.search) {
  const params = new URLSearchParams(search);
  const duration = Number(params.get("durationMs"));
  const progress = Number(params.get("progress"));
  return {
    durationMs: Number.isFinite(duration) && duration > 0 ? duration : 3000,
    progress: params.has("progress") && Number.isFinite(progress) ? clamp(progress) : null,
    autoplay: params.get("autoplay") !== "0",
    capture: params.has("capture"),
  };
}

export function initPreviewBridge(options = parsePreviewOptions(), chartPlayback, remount = () => {}) {
  if (!new URLSearchParams(window.location.search).has("template") || window.parent === window) return () => {};
  let progress = options.progress ?? 0;
  let playing = options.progress === null && options.autoplay && !options.capture;
  let rate = 1;
  let lastTime = performance.now();
  let frame = 0;
  let disposed = false;
  const animations = () => document.getAnimations?.() || [];
  const emit = (type, extra = {}) => window.parent.postMessage({ type, version: VERSION, ...extra }, window.location.origin);
  const advance = (now) => {
    if (playing) progress = clamp(progress + (now - lastTime) * rate / options.durationMs);
    lastTime = now;
  };
  const apply = () => {
    chartPlayback?.setTime(progress * options.durationMs);
    animations().forEach((animation) => {
      animation.pause();
      animation.currentTime = progress * options.durationMs;
    });
  };
  const report = () => emit("mav:preview/time", { progress, playing });
  const tick = (now) => {
    if (disposed) return;
    advance(now);
    apply();
    if (progress >= 1 && playing) { playing = false; emit("mav:preview/complete"); }
    report();
    frame = requestAnimationFrame(tick);
  };
  const reset = () => {
    chartPlayback?.reset(progress * options.durationMs);
    remount();
  };
  const receive = (event) => {
    if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.version !== VERSION) return;
    advance(performance.now());
    const command = event.data.type;
    if (command === "mav:preview/play") {
      if (progress >= 1) { progress = 0; reset(); }
      playing = true;
    }
    if (command === "mav:preview/pause") playing = false;
    if (command === "mav:preview/replay") { progress = 0; playing = true; reset(); }
    if (command === "mav:preview/seek") { progress = clamp(Number(event.data.progress) || 0); playing = false; reset(); }
    if (command === "mav:preview/rate" && [0.5, 1].includes(event.data.rate)) rate = event.data.rate;
    apply(); report();
  };
  window.addEventListener("message", receive);
  frame = requestAnimationFrame(() => {
    if (disposed) return;
    lastTime = performance.now();
    apply(); emit("mav:preview/ready", { durationMs: options.durationMs });
    frame = requestAnimationFrame(tick);
  });
  return () => { disposed = true; cancelAnimationFrame(frame); window.removeEventListener("message", receive); };
}
