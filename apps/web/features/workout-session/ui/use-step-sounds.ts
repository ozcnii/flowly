import { useCallback, useRef } from "react";

/**
 * Step session cues for Telegram iOS.
 * Prefer speech for meaning; soft WAV + haptic as secondary layer.
 * Speech unlocks on first user tap (Начать / Продолжить).
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

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

export function useStepSounds(enabled = true) {
  const ready = useRef(false);
  const pool = useRef<Partial<Record<SoundId, HTMLAudioElement>>>({});
  const keepAlive = useRef<HTMLAudioElement | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

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
    const line = clean(text);
    if (!line) return false;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(line);
      u.lang = "ru-RU";
      u.rate = opts?.rate ?? 1.0;
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
    try {
      voiceRef.current = pickRuVoice();
      if (typeof speechSynthesis !== "undefined") {
        speechSynthesis.getVoices();
        speechSynthesis.onvoiceschanged = () => { voiceRef.current = pickRuVoice(); };
        const warm = new SpeechSynthesisUtterance(" ");
        warm.volume = 0;
        warm.lang = "ru-RU";
        speechSynthesis.speak(warm);
        speechSynthesis.cancel();
      }
    } catch { /* no-op */ }

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

  /** Soft chime only — no speech (skip / next tap must not spam «Следующее»). */
  const softCue = useCallback(() => {
    play("next");
    haptic("light");
  }, [play, haptic]);

  const speakLine = useCallback((text: string, opts?: { rate?: number }) => {
    if (!enabled || typeof window === "undefined" || typeof speechSynthesis === "undefined") return false;
    const line = clean(text);
    if (!line) return false;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(line);
      u.lang = "ru-RU";
      u.rate = opts?.rate ?? 1.05;
      u.pitch = 1;
      u.volume = 1;
      const v = voiceRef.current ?? pickRuVoice();
      if (v) { voiceRef.current = v; u.voice = v; }
      speechSynthesis.speak(u);
      return true;
    } catch {
      return false;
    }
  }, [enabled]);

  /** After pause / short cue — only «Начинайте», not full exercise re-read. */
  const sayStart = useCallback(() => {
    unlock();
    speakLine("Начинайте", { rate: 1.05 });
    play("start");
    haptic("medium");
  }, [unlock, speakLine, play, haptic]);

  /** Intro (once per step): title + description, then «Начинайте». */
  const announceExercise = useCallback((title: string, description?: string | null) => {
    if (!enabled || typeof window === "undefined" || typeof speechSynthesis === "undefined") {
      unlock();
      play("start");
      haptic("medium");
      return;
    }
    unlock();
    const t = clean(title);
    const d = clean(description ?? "");
    const line = d ? `${t}. ${d}` : t;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(line || "Упражнение");
      u.lang = "ru-RU";
      u.rate = 0.98;
      u.pitch = 1;
      u.volume = 1;
      const v = voiceRef.current ?? pickRuVoice();
      if (v) { voiceRef.current = v; u.voice = v; }
      u.onend = () => { speakLine("Начинайте", { rate: 1.05 }); };
      speechSynthesis.speak(u);
    } catch { /* no-op */ }
    play("start");
    haptic("medium");
  }, [enabled, unlock, play, haptic, speakLine]);

  /** Rest: announce what comes next (title + description). */
  const restStart = useCallback((nextTitle?: string | null, nextDescription?: string | null) => {
    unlock();
    const t = clean(nextTitle ?? "");
    const d = clean(nextDescription ?? "");
    const line = t
      ? (d ? `Отдых. Дальше: ${t}. ${d}` : `Отдых. Дальше: ${t}`)
      : "Отдых";
    speak(line, { rate: 0.98 });
    play("rest");
    haptic("light");
  }, [unlock, speak, play, haptic]);

  return {
    unlock,
    softCue,
    sayStart,
    announceExercise,
    restStart,
    start: useCallback(() => {
      unlock();
      play("start");
      haptic("medium");
    }, [unlock, play, haptic]),
    pause: useCallback(() => {
      speak("Пауза");
      play("pause");
      haptic("light");
    }, [speak, play, haptic]),
    resume: useCallback(() => {
      unlock();
      play("start");
      haptic("medium");
    }, [unlock, play, haptic]),
    /** @deprecated use softCue — kept name for fewer call-site renames where only chime needed */
    nextExercise: useCallback(() => {
      play("next");
      haptic("light");
    }, [play, haptic]),
    countdownTick: useCallback((remainingSeconds: number) => {
      const n = Math.max(1, Math.min(5, Math.round(remainingSeconds)));
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
