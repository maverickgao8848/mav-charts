// Recharts' JavaScript animations and the preview transport share scene time.
export function createChartPlayback() {
  let elapsedMs = 0;
  const listeners = new Set();
  const controller = (_timeout, animation, listener) => {
    animation.tick(0);
    const update = () => {
      if (animation.getState() === "completed") return;
      const begin = animation.getAnimationBegin();
      if (elapsedMs >= begin && animation.getState() === "pending") animation.tick(begin);
      animation.tick(elapsedMs);
      listener(animation.getInterpolated());
      if (animation.getProgress() === 1) animation.complete();
    };
    listeners.add(update);
    update();
    return () => listeners.delete(update);
  };
  return {
    controller,
    setTime(time) { elapsedMs = time; listeners.forEach((update) => update()); },
    reset(time = 0) { listeners.clear(); elapsedMs = time; },
  };
}
