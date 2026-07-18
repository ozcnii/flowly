import { useCallback, useRef } from "react";

/**
 * Step audio for Telegram iOS: haptics work; Web Audio alone is often muted.
 * Dual path: HTMLAudio WAV data-URIs + Web Audio, both unlocked on first gesture.
 */
const cache = new Map<string, string>();

function toneUri(freq: number, ms: number, vol = 0.5): string {
  const key = `${freq}:${ms}:${vol}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const sr = 22050, n = Math.max(1, Math.floor((sr * ms) / 1000));
  const samples = new Int16Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const env = Math.min(1, i / 180) * Math.min(1, (n - i) / 500);
    samples[i] = (Math.sin(2 * Math.PI * freq * t) * vol * env * 32767) | 0;
  }
  const bytes = samples.length * 2;
  const buf = new ArrayBuffer(44 + bytes);
  const v = new DataView(buf);
  const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + bytes, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, "data"); v.setUint32(40, bytes, true);
  new Uint8Array(buf, 44).set(new Uint8Array(samples.buffer));
  let bin = "";
  const u8 = new Uint8Array(buf);
  for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]!);
  const url = `data:audio/wav;base64,${btoa(bin)}`;
  cache.set(key, url);
  return url;
}

export function useStepSounds(enabled = true) {
  const unlocked = useRef(false);
  const ctxRef = useRef<AudioContext | null>(null);

  const haptic = useCallback((style: "light" | "medium" | "rigid" | "success" = "light") => {
    try {
      const hf = (window.Telegram?.WebApp as {
        HapticFeedback?: { impactOccurred?: (s: string) => void; notificationOccurred?: (s: string) => void };
      } | undefined)?.HapticFeedback;
      if (style === "success") hf?.notificationOccurred?.("success");
      else hf?.impactOccurred?.(style);
    } catch { /* no-op */ }
  }, []);

  const playHtml = useCallback((freq: number, ms: number, when = 0, vol = 0.55) => {
    if (!enabled || typeof window === "undefined") return;
    const run = () => {
      try {
        const a = new Audio(toneUri(freq, ms, vol));
        a.volume = 1;
        void a.play().catch(() => undefined);
      } catch { /* no-op */ }
    };
    if (when > 0) window.setTimeout(run, Math.round(when * 1000));
    else run();
  }, [enabled]);

  const ensureWeb = useCallback(async () => {
    if (typeof window === "undefined" || !enabled) return null;
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      const ctx = ctxRef.current ?? new Ctor();
      ctxRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();
      const buf = ctx.createBuffer(1, 1, ctx.sampleRate || 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
      return ctx;
    } catch { return null; }
  }, [enabled]);

  const blip = useCallback((freq: number, dur = 0.12, gain = 0.3, type: OscillatorType = "sine", startAt = 0) => {
    if (!enabled) return;
    void ensureWeb().then((ctx) => {
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + startAt;
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(t); osc.stop(t + dur + 0.03);
      } catch { /* no-op */ }
    });
  }, [enabled, ensureWeb]);

  const unlock = useCallback(() => {
    if (!enabled) return;
    // Stay inside the user-gesture stack: play HTML audio synchronously first.
    playHtml(659, 40, 0, 0.01);
    void ensureWeb();
    unlocked.current = true;
  }, [enabled, ensureWeb, playHtml]);

  return {
    unlock,
    start: useCallback(() => { unlock(); playHtml(659, 130); blip(659, 0.18, 0.32); haptic("medium"); }, [unlock, playHtml, blip, haptic]),
    pause: useCallback(() => { playHtml(311, 130); blip(311, 0.18, 0.3); haptic("light"); }, [playHtml, blip, haptic]),
    resume: useCallback(() => { unlock(); playHtml(523, 120); blip(523, 0.16, 0.3); haptic("medium"); }, [unlock, playHtml, blip, haptic]),
    restStart: useCallback(() => { playHtml(392, 100); playHtml(330, 120, 0.12); blip(392, 0.12, 0.28); blip(330, 0.14, 0.28, "sine", 0.12); haptic("light"); }, [playHtml, blip, haptic]),
    nextExercise: useCallback(() => { playHtml(523, 100); playHtml(659, 120, 0.1); blip(523, 0.12, 0.3); blip(659, 0.16, 0.3, "sine", 0.12); haptic("medium"); }, [playHtml, blip, haptic]),
    countdownTick: useCallback((remainingSeconds: number) => {
      const n = Math.max(1, Math.min(5, Math.round(remainingSeconds)));
      const freq = 880 + (5 - n) * 110;
      if (n === 1) {
        playHtml(freq, 140, 0, 0.6);
        playHtml(freq * 1.25, 160, 0.12, 0.55);
        blip(freq, 0.16, 0.34);
        blip(freq * 1.25, 0.2, 0.3, "sine", 0.12);
        haptic("rigid");
        return;
      }
      playHtml(freq, 70, 0, 0.55);
      blip(freq, 0.11, 0.3);
      haptic("light");
    }, [playHtml, blip, haptic]),
    celebrate: useCallback(() => {
      playHtml(523, 140);
      playHtml(659, 140, 0.12);
      playHtml(784, 140, 0.24);
      playHtml(1046, 220, 0.4);
      playHtml(1318, 180, 0.55);
      blip(523.25, 0.16, 0.32, "sine", 0);
      blip(659.25, 0.16, 0.32, "sine", 0.11);
      blip(783.99, 0.16, 0.34, "sine", 0.22);
      blip(1046.5, 0.34, 0.36, "sine", 0.34);
      blip(1318.5, 0.2, 0.2, "triangle", 0.52);
      blip(1568, 0.24, 0.18, "triangle", 0.62);
      haptic("success");
    }, [playHtml, blip, haptic]),
  };
}
