import { useCallback, useRef } from "react";

/**
 * Web Audio cues for step session. Telegram iOS WebView often starts AudioContext
 * suspended and re-suspends it between ticks — so we:
 * 1) unlock once on the first real user gesture (silent buffer + await resume);
 * 2) re-resume before every blip (including setInterval countdown ticks);
 * 3) use louder gains so phone speakers hear the cue.
 * Missing/blocked audio never throws and never blocks the UI.
 * Optional Telegram HapticFeedback reinforces ticks when the ringer is muted.
 */
export function useStepSounds(enabled = true) {
  const ctxRef = useRef<AudioContext | null>(null);
  const unlockP = useRef<Promise<AudioContext | null> | null>(null);

  const haptic = useCallback((style: "light" | "medium" | "rigid" = "light") => {
    try {
      const hf = (window.Telegram?.WebApp as { HapticFeedback?: { impactOccurred?: (s: string) => void } } | undefined)?.HapticFeedback;
      hf?.impactOccurred?.(style);
    } catch { /* no-op */ }
  }, []);

  const ensure = useCallback(async () => {
    if (typeof window === "undefined" || !enabled) return null;
    if (!unlockP.current) {
      unlockP.current = (async () => {
        try {
          const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (!Ctor) return null;
          const ctx = ctxRef.current ?? new Ctor();
          ctxRef.current = ctx;
          if (ctx.state === "suspended") await ctx.resume();
          // Silent one-sample buffer: required iOS/Telegram unlock inside the user-gesture chain.
          const buf = ctx.createBuffer(1, 1, ctx.sampleRate || 22050);
          const src = ctx.createBufferSource();
          src.buffer = buf;
          src.connect(ctx.destination);
          src.start(0);
          if (ctx.state === "suspended") await ctx.resume();
          return ctx;
        } catch {
          ctxRef.current = null;
          return null;
        }
      })();
    }
    const ctx = await unlockP.current;
    if (ctx?.state === "suspended") {
      try { await ctx.resume(); } catch { /* no-op */ }
    }
    return ctx;
  }, [enabled]);

  const blip = useCallback((freq: number, dur = 0.12, gain = 0.18, type: OscillatorType = "sine", startAt = 0) => {
    if (!enabled) return;
    void ensure().then((ctx) => {
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + startAt;
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur + 0.03);
      } catch { /* no-op */ }
    });
  }, [enabled, ensure]);

  return {
    /** Call from the first Start/Продолжить click so Telegram/iOS unlocks audio. */
    unlock: useCallback(() => { void ensure(); }, [ensure]),
    start: useCallback(() => { void ensure(); blip(659, 0.18, 0.22); haptic("medium"); }, [blip, ensure, haptic]),
    pause: useCallback(() => { blip(311, 0.18, 0.2); haptic("light"); }, [blip, haptic]),
    resume: useCallback(() => { void ensure(); blip(523, 0.16, 0.2); haptic("medium"); }, [blip, ensure, haptic]),
    restStart: useCallback(() => { blip(392, 0.12, 0.18); blip(330, 0.14, 0.18, "sine", 0.12); haptic("light"); }, [blip, haptic]),
    nextExercise: useCallback(() => { blip(523, 0.12, 0.2); blip(659, 0.16, 0.2, "sine", 0.12); haptic("medium"); }, [blip, haptic]),
    countdownTick: useCallback((remainingSeconds: number) => {
      const n = Math.max(1, Math.min(5, Math.round(remainingSeconds)));
      const freq = 880 + (5 - n) * 110;
      if (n === 1) {
        blip(freq, 0.16, 0.24);
        blip(freq * 1.25, 0.2, 0.22, "sine", 0.12);
        haptic("rigid");
        return;
      }
      blip(freq, 0.11, 0.2);
      haptic("light");
    }, [blip, haptic]),
    celebrate: useCallback(() => {
      blip(523.25, 0.16, 0.22, "sine", 0);
      blip(659.25, 0.16, 0.22, "sine", 0.11);
      blip(783.99, 0.16, 0.24, "sine", 0.22);
      blip(1046.5, 0.34, 0.26, "sine", 0.34);
      blip(1318.5, 0.2, 0.14, "triangle", 0.52);
      blip(1568, 0.24, 0.12, "triangle", 0.62);
      haptic("medium");
    }, [blip, haptic]),
  };
}
