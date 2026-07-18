import { useCallback, useRef } from "react";

/**
 * Lightweight Web Audio cues for the step session (UX-05). No audio assets — pure oscillator blips.
 * AudioContext is created lazily on the first user gesture (start button) to satisfy autoplay policies.
 * All calls are guarded: missing/blocked audio never throws and never blocks the UI.
 *
 * Countdown: last 5 seconds of exercise/rest countdown tick with rising pitch; final second is longer.
 */
export function useStepSounds(enabled = true) {
  const ctxRef = useRef<AudioContext | null>(null);
  const ensure = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctor) { try { ctxRef.current = new Ctor(); } catch { ctxRef.current = null; } }
    }
    if (ctxRef.current?.state === "suspended") { try { void ctxRef.current.resume(); } catch {} }
    return ctxRef.current;
  }, []);
  const blip = useCallback((freq: number, dur = 0.12, gain = 0.05, type: OscillatorType = "sine", startAt = 0) => {
    if (!enabled) return;
    const ctx = ensure();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + startAt;
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    } catch { /* no-op */ }
  }, [enabled, ensure]);
  return {
    start: useCallback(() => blip(659, 0.16), [blip]),
    pause: useCallback(() => blip(311, 0.16), [blip]),
    resume: useCallback(() => blip(523, 0.14), [blip]),
    restStart: useCallback(() => { blip(392, 0.1); blip(330, 0.12, 0.05, "sine", 0.11); }, [blip]),
    nextExercise: useCallback(() => { blip(523, 0.1); blip(659, 0.14, 0.05, "sine", 0.11); }, [blip]),
    /**
     * Per-second tick for remaining 5…1 on a countdown.
     * Pitch rises toward zero; final second is a slightly longer double-beep so the end is obvious.
     */
    countdownTick: useCallback((remainingSeconds: number) => {
      const n = Math.max(1, Math.min(5, Math.round(remainingSeconds)));
      // 5→880Hz … 1→1320Hz — clear “hurry” without being harsh
      const freq = 880 + (5 - n) * 110;
      if (n === 1) {
        blip(freq, 0.14, 0.07, "sine");
        blip(freq * 1.25, 0.18, 0.06, "sine", 0.12);
        return;
      }
      blip(freq, 0.1, 0.055, "sine");
    }, [blip]),
    /**
     * Full-session complete fanfare (only when the user finished every step).
     * Bright major arpeggio + short sparkle — “ура / молодцы” without asset files.
     */
    celebrate: useCallback(() => {
      // C5 → E5 → G5 → C6, then a soft sparkle
      blip(523.25, 0.14, 0.06, "sine", 0);
      blip(659.25, 0.14, 0.06, "sine", 0.11);
      blip(783.99, 0.14, 0.065, "sine", 0.22);
      blip(1046.5, 0.32, 0.075, "sine", 0.34);
      blip(1318.5, 0.18, 0.04, "triangle", 0.52);
      blip(1568, 0.22, 0.035, "triangle", 0.62);
    }, [blip]),
  };
}
