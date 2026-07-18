import { useCallback, useRef } from "react";

/**
 * Telegram iOS Mini App audio.
 * Haptics work; raw Web Audio / new Audio() per beep often stay silent.
 *
 * Working pattern for iOS WebView:
 * - create + play real file URLs on the first user gesture (sync)
 * - keep a near-silent looping Audio alive (audio session keepalive)
 * - reuse the same HTMLAudioElement pool (currentTime=0; play())
 * - never rely on setTimeout-only plays without a prior unlock
 */
const FILES = {
  silent: "/sounds/silent.wav",
  start: "/sounds/start.wav",
  pause: "/sounds/pause.wav",
  tick: "/sounds/tick.wav",
  tickEnd: "/sounds/tick-end.wav",
  rest: "/sounds/rest.wav",
  next: "/sounds/next.wav",
  next2: "/sounds/next2.wav",
  fanfare1: "/sounds/fanfare1.wav",
  fanfare2: "/sounds/fanfare2.wav",
  fanfare3: "/sounds/fanfare3.wav",
  fanfare4: "/sounds/fanfare4.wav",
} as const;

type SoundId = keyof typeof FILES;

function makeEl(src: string, loop = false): HTMLAudioElement {
  const a = new Audio(src);
  a.preload = "auto";
  a.loop = loop;
  a.setAttribute("playsinline", "true");
  a.setAttribute("webkit-playsinline", "true");
  // iOS: load early so first play after gesture is more reliable
  try { a.load(); } catch { /* no-op */ }
  return a;
}

export function useStepSounds(enabled = true) {
  const ready = useRef(false);
  const pool = useRef<Partial<Record<SoundId, HTMLAudioElement>>>({});
  const keepAlive = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const lastError = useRef<string | null>(null);

  const haptic = useCallback((style: "light" | "medium" | "rigid" | "success" = "light") => {
    try {
      const hf = (window.Telegram?.WebApp as {
        HapticFeedback?: { impactOccurred?: (s: string) => void; notificationOccurred?: (s: string) => void };
      } | undefined)?.HapticFeedback;
      if (style === "success") hf?.notificationOccurred?.("success");
      else hf?.impactOccurred?.(style);
    } catch { /* no-op */ }
  }, []);

  /** Must be called synchronously from a click/tap handler. */
  const unlock = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;
    if (!ready.current) {
      const map = pool.current;
      (Object.keys(FILES) as SoundId[]).forEach((id) => {
        if (!map[id]) map[id] = makeEl(FILES[id], id === "silent");
      });
      keepAlive.current = map.silent ?? null;
      ready.current = true;
    }

    // 1) Keepalive silent loop — holds iOS media session open.
    const silent = keepAlive.current;
    if (silent) {
      silent.volume = 0.01;
      silent.loop = true;
      silent.currentTime = 0;
      void silent.play().then(() => { lastError.current = null; }).catch((e: unknown) => {
        lastError.current = e instanceof Error ? e.message : "silent_play_failed";
      });
    }

    // 2) Web Audio unlock in the same turn (secondary path).
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctor) {
        const ctx = ctxRef.current ?? new Ctor();
        ctxRef.current = ctx;
        void ctx.resume();
        const buf = ctx.createBuffer(1, 1, ctx.sampleRate || 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
      }
    } catch { /* no-op */ }
  }, [enabled]);

  const play = useCallback((id: SoundId, whenMs = 0) => {
    if (!enabled || typeof window === "undefined") return;
    const run = () => {
      // Lazy unlock if someone forgot — may still fail outside gesture.
      if (!ready.current) unlock();
      const a = pool.current[id];
      if (!a) return;
      try {
        a.pause();
        a.currentTime = 0;
        a.volume = 1;
        const p = a.play();
        if (p && typeof p.catch === "function") {
          p.catch((e: unknown) => {
            lastError.current = e instanceof Error ? e.message : "play_failed";
            // One retry after re-resume
            void ctxRef.current?.resume().then(() => {
              a.currentTime = 0;
              void a.play().catch(() => undefined);
            });
          });
        }
      } catch (e) {
        lastError.current = e instanceof Error ? e.message : "play_throw";
      }
    };
    if (whenMs > 0) window.setTimeout(run, whenMs);
    else run();
  }, [enabled, unlock]);

  return {
    unlock,
    /** Debug: last HTMLAudio play error message (if any). */
    getLastError: () => lastError.current,
    start: useCallback(() => { unlock(); play("start"); haptic("medium"); }, [unlock, play, haptic]),
    pause: useCallback(() => { play("pause"); haptic("light"); }, [play, haptic]),
    resume: useCallback(() => { unlock(); play("start"); haptic("medium"); }, [unlock, play, haptic]),
    restStart: useCallback(() => { play("rest"); play("next", 120); haptic("light"); }, [play, haptic]),
    nextExercise: useCallback(() => { play("next"); play("next2", 110); haptic("medium"); }, [play, haptic]),
    countdownTick: useCallback((remainingSeconds: number) => {
      const n = Math.max(1, Math.min(5, Math.round(remainingSeconds)));
      if (n === 1) {
        play("tickEnd");
        play("tick", 120);
        haptic("rigid");
        return;
      }
      play("tick");
      haptic("light");
    }, [play, haptic]),
    celebrate: useCallback(() => {
      play("fanfare1");
      play("fanfare2", 120);
      play("fanfare3", 240);
      play("fanfare4", 400);
      haptic("success");
    }, [play, haptic]),
  };
}
