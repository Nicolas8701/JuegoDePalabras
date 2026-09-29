import { useCallback, useMemo } from 'react';

type Tone = 'tap' | 'accept' | 'error' | 'win';

function beep(tone: Tone) {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const config = {
    tap: [320, 0.025, 0.025], accept: [520, 0.055, 0.04], error: [145, 0.08, 0.045], win: [720, 0.16, 0.055]
  }[tone];
  osc.frequency.value = config[0];
  osc.type = tone === 'error' ? 'square' : 'sine';
  gain.gain.setValueAtTime(config[2], ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + config[1]);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + config[1]);
  osc.addEventListener('ended', () => void ctx.close(), { once: true });
}

export function useFeedback() {
  const reducedMotion = useMemo(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false, []);
  const play = useCallback((tone: Tone) => {
    const muted = localStorage.getItem('palabra:muted') === '1';
    if (!muted) beep(tone);
    if (tone !== 'tap' && navigator.vibrate && localStorage.getItem('palabra:haptics') !== '0') {
      navigator.vibrate(tone === 'win' ? [20, 35, 30] : tone === 'error' ? 35 : 15);
    }
  }, []);
  return { play, reducedMotion };
}
