import { useCallback, useRef } from "react";

/**
 * Step session cues for Telegram iOS.
 * Beeps alone sound cheap; prefer Web Speech API (ru-RU) for meaning:
 * «Отдых», «5»…«1», «Готово» — plus soft WAV as secondary layer.
 * Speech + HTMLAudio must unlock on the first user tap (Начать).
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
  try { a.load(); } catch { /* no-op */ }
  return a;
}

function pickRuVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === "undefined") return null;
  const voices = speechSynthesis.getVoices();
  return (
    voices.find((v) => /^ru/i.test(v.lang) && /milena|katya|yuri|irina|elena|paulina/i.test(v.name)) ||
    voices.find((v) => v.lang?.toLowerCase().startsWith("ru")) ||
    null
  );
}

export function useStepSounds(enabled = true) {
  const ready = useRef(false);
  const pool = useRef<Partial<Record<SoundId, HTMLAudioElement>>>({});
  const keepAlive = useRef<HTMLAudioElement | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const speechOk = useRef(false);

  const haptic = useCallback((style: "light" | "medium" | "rigid" | "success" = "light") => {
    try {
      const hf = (window.Telegram?.WebApp as {
        HapticFeedback?: { impactOccurred?: (s: string) => void; notificationOccurred?: (s: string) => void };
      } | undefined)?.HapticFeedback;
      if (style === "success") hf?.notificationOccurred?.("success");
      else hf?.impactOccurred?.(style);
    } catch { /* no-op */ }
  }, []);

  const speak = useCallback((text: string, opts?: { rate?: number; pitch?: number }) => {
    if (!enabled || typeof window === "undefined" || typeof speechSynthesis === "undefined") return false;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ru-RU";
      u.rate = opts?.rate ?? 1.05;
      u.pitch = opts?.pitch ?? 1;
      u.volume = 1;
      const v = voiceRef.current ?? pickRuVoice();
      if (v) { voiceRef.current = v; u.voice = v; }
      speechSynthesis.speak(u);
      return true;
    } catch {
      return false;
    }
  }, [enabled]);

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
    // Warm voices list (iOS often populates only after interaction)
    try {
      voiceRef.current = pickRuVoice();
      if (typeof speechSynthesis !== "undefined") {
        speechSynthesis.getVoices();
        speechSynthesis.onvoiceschanged = () => { voiceRef.current = pickRuVoice(); };
        // silent warm-up utterance cancelled immediately (gesture unlock)
        const warm = new SpeechSynthesisUtterance(" ");
        warm.volume = 0;
        warm.lang = "ru-RU";
        speechSynthesis.speak(warm);
        speechSynthesis.cancel();
        speechOk.current = true;
      }
    } catch { speechOk.current = false; }

    const silent = keepAlive.current;
    if (silent) {
      silent.volume = 0.01;
      silent.loop = true;
      silent.currentTime = 0;
      void silent.play().catch(() => undefined);
    }
  }, [enabled]);

  const play = useCallback((id: SoundId, whenMs = 0) => {
    if (!enabled || typeof window === "undefined") return;
    const run = () => {
      if (!ready.current) unlock();
      const a = pool.current[id];
      if (!a) return;
      try {
        a.pause();
        a.currentTime = 0;
        a.volume = id === "silent" ? 0.01 : 0.85;
        void a.play().catch(() => undefined);
      } catch { /* no-op */ }
    };
    if (whenMs > 0) window.setTimeout(run, whenMs);
    else run();
  }, [enabled, unlock]);

  return {
    unlock,
    start: useCallback(() => {
      unlock();
      const said = speak("Начинаем");
      if (!said) play("start");
      else play("start"); // soft underlay
      haptic("medium");
    }, [unlock, speak, play, haptic]),
    pause: useCallback(() => {
      speak("Пауза");
      play("pause");
      haptic("light");
    }, [speak, play, haptic]),
    resume: useCallback(() => {
      unlock();
      speak("Продолжаем");
      play("start");
      haptic("medium");
    }, [unlock, speak, play, haptic]),
    restStart: useCallback(() => {
      speak("Отдых");
      play("rest");
      haptic("light");
    }, [speak, play, haptic]),
    nextExercise: useCallback(() => {
      speak("Следующее");
      play("next");
      play("next2", 100);
      haptic("medium");
    }, [speak, play, haptic]),
    countdownTick: useCallback((remainingSeconds: number) => {
      const n = Math.max(1, Math.min(5, Math.round(remainingSeconds)));
      // Voice: «пять»…«один» — clearer than ugly beeps for last 5s
      const words = ["", "один", "два", "три", "четыре", "пять"] as const;
      speak(words[n] ?? String(n), { rate: 1.15 });
      if (n === 1) {
        play("tickEnd");
        haptic("rigid");
      } else {
        play("tick");
        haptic("light");
      }
    }, [speak, play, haptic]),
    celebrate: useCallback(() => {
      speak("Отлично, готово");
      play("fanfare1");
      play("fanfare2", 120);
      play("fanfare3", 240);
      play("fanfare4", 400);
      haptic("success");
    }, [speak, play, haptic]),
  };
}
