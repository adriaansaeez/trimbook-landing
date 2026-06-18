const PLAYBACK_SPEED = 0.5;

export function initPingPongVideo(vid: HTMLVideoElement) {
  if (vid.dataset.pingPongInit === 'true') return;
  vid.dataset.pingPongInit = 'true';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    vid.pause();
    return;
  }

  let rafId: number | null = null;
  let reversing = false;
  let lastTs: number | null = null;

  function reverseStep(ts: number) {
    if (!reversing) return;

    if (lastTs !== null) {
      const delta = (ts - lastTs) / 1000;
      const next = vid.currentTime - PLAYBACK_SPEED * delta;

      if (next <= 0) {
        vid.currentTime = 0;
        reversing = false;
        lastTs = null;
        vid.playbackRate = PLAYBACK_SPEED;
        vid.play().catch(() => {});
        return;
      }

      vid.currentTime = next;
    }

    lastTs = ts;
    rafId = requestAnimationFrame(reverseStep);
  }

  function onEnded() {
    reversing = true;
    lastTs = null;
    rafId = requestAnimationFrame(reverseStep);
  }

  vid.playbackRate = PLAYBACK_SPEED;
  vid.play().catch(() => {});
  vid.addEventListener('ended', onEnded);

  return () => {
    vid.removeEventListener('ended', onEnded);
    if (rafId !== null) cancelAnimationFrame(rafId);
  };
}
