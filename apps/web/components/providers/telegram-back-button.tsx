"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Block, Button, Navbar, Page, Sheet } from "konsta/react";

const HISTORY_STATE_KEY = "__flowlyHistory";
const HISTORY_SESSION_KEY = "flowly-history-session";
const RAPID_BACK_LOCK_MS = 700;
const COMMIT_PX = 72;
const MAX_DRAG_RATIO = 0.5;

/**
 * Left edge zone for starting swipe-back. Wider than stock iOS (~20pt) because
 * Telegram Mini App + phone bezel/safe-area make a thin strip unusable.
 */
const edgeStartPx = () => {
  const w = window.innerWidth || 390;
  const css = getComputedStyle(document.documentElement);
  const safe =
    Number.parseFloat(css.getPropertyValue("--component-safe-area-left")) ||
    Number.parseFloat(css.getPropertyValue("--tg-safe-area-inset-left")) ||
    0;
  return Math.min(100, Math.max(64, w * 0.16, safe + 48));
};

type BackOverride = { id: symbol; handler: () => void };
type RegisterBackOverride = (handler: () => void) => () => void;
type SwipeMode = "back" | "exit";
const BackOverrideContext = createContext<RegisterBackOverride | null>(null);

type FlowlyHistoryState = { session: string; index: number; url: string };
type HistoryData = Record<string, unknown> & { [HISTORY_STATE_KEY]?: FlowlyHistoryState };

const stateData = (value: unknown): HistoryData => (value && typeof value === "object" && !Array.isArray(value) ? (value as HistoryData) : {});
const markerFrom = (value: unknown, session: string) => {
  const marker = stateData(value)[HISTORY_STATE_KEY];
  return marker?.session === session && Number.isInteger(marker.index) && marker.index >= 0 ? marker : null;
};
const currentUrl = () => `${location.pathname}${location.search}${location.hash}`;
const sessionId = () => {
  try {
    const stored = sessionStorage.getItem(HISTORY_SESSION_KEY);
    if (stored) return stored;
    const value = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(HISTORY_SESSION_KEY, value);
    return value;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
};
const fallbackFor = (pathname: string) => {
  if (pathname === "/") return null;
  if (pathname === "/settings" || pathname === "/favorites" || pathname === "/profile/data") return "/profile";
  if (pathname === "/profile") return "/";
  if (pathname === "/catalog" || pathname === "/programs" || pathname === "/rhythm" || pathname === "/calendar") return "/";
  if (
    pathname.startsWith("/youtube") ||
    pathname.startsWith("/workouts") ||
    pathname.startsWith("/sessions") ||
    pathname.startsWith("/sources") ||
    pathname.startsWith("/authors") ||
    pathname.startsWith("/safety")
  )
    return "/catalog";
  if (pathname.startsWith("/programs/enrollments/")) return "/programs";
  if (pathname.startsWith("/programs/")) return "/programs";
  if (pathname.startsWith("/rhythm/")) return "/rhythm";
  if (pathname.startsWith("/calendar/")) return "/calendar";
  return "/";
};

const titleForPath = (path: string) => {
  const p = path.split("?")[0] || "/";
  if (p === "/") return "Главная";
  if (p === "/catalog") return "Йога";
  if (p === "/programs") return "Программы";
  if (p === "/rhythm") return "Ритм";
  if (p === "/calendar") return "Дневник";
  if (p === "/profile") return "Профиль";
  if (p === "/settings") return "Настройки";
  if (p === "/profile/data") return "Данные";
  if (p === "/favorites") return "Избранное";
  if (p === "/sources") return "Источники";
  if (p === "/youtube") return "YouTube";
  if (p.startsWith("/workouts/")) return "Тренировка";
  if (p.startsWith("/sessions/")) return "Сессия";
  if (p.startsWith("/programs/enrollments/")) return "Программа";
  if (p.startsWith("/programs/")) return "Программа";
  if (p.startsWith("/rhythm/")) return "Привычка";
  if (p.startsWith("/calendar/")) return "Календарь";
  return "Назад";
};

export function useTelegramBackOverride(handler: () => void, active: boolean) {
  const register = useContext(BackOverrideContext);
  useEffect(() => (active && register ? register(handler) : undefined), [active, handler, register]);
}

const closeMiniApp = () => {
  const webApp = window.Telegram?.WebApp;
  // Keep confirmation on so Telegram may still ask; close() is the intentional exit.
  webApp?.enableClosingConfirmation?.();
  webApp?.close?.();
};

export function TelegramBackButton({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const indexRef = useRef(0);
  const lockedRef = useRef(false);
  const pathnameRef = useRef(pathname);
  const unlockTimerRef = useRef<number | undefined>(undefined);
  const backRef = useRef<() => void>(() => undefined);
  /** Always allow edge swipe: either navigate back or offer exit. */
  const swipeModeRef = useRef<SwipeMode>("back");
  const dragXRef = useRef(0);
  const prevPathRef = useRef("/");
  const [index, setIndex] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [overrides, setOverrides] = useState<BackOverride[]>([]);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [peekLabel, setPeekLabel] = useState("Назад");
  const [peekHint, setPeekHint] = useState("Назад");
  const [exitOpen, setExitOpen] = useState(false);
  const registerOverride = useCallback<RegisterBackOverride>((handler) => {
    const override = { id: Symbol(), handler };
    setOverrides((current) => [...current, override]);
    return () => setOverrides((current) => current.filter(({ id }) => id !== override.id));
  }, []);
  const override = overrides.at(-1)?.handler;

  useEffect(() => {
    const session = sessionId();
    const originalPush = history.pushState;
    const originalReplace = history.replaceState;
    const initial = markerFrom(history.state, session);
    indexRef.current = initial?.index ?? 0;
    if (!initial) originalReplace.call(history, { ...stateData(history.state), [HISTORY_STATE_KEY]: { session, index: 0, url: currentUrl() } }, "");
    setIndex(indexRef.current);
    setInitialized(true);

    history.pushState = function pushState(data: unknown, unused: string, url?: string | URL | null) {
      const next = indexRef.current + 1;
      const result = originalPush.call(
        history,
        { ...stateData(data), [HISTORY_STATE_KEY]: { session, index: next, url: url == null ? currentUrl() : String(url) } },
        unused,
        url,
      );
      indexRef.current = next;
      queueMicrotask(() => setIndex(next));
      return result;
    };
    history.replaceState = function replaceState(data: unknown, unused: string, url?: string | URL | null) {
      return originalReplace.call(
        history,
        { ...stateData(data), [HISTORY_STATE_KEY]: { session, index: indexRef.current, url: url == null ? currentUrl() : String(url) } },
        unused,
        url,
      );
    };
    const onPopState = (event: PopStateEvent) => {
      const marker = markerFrom(event.state, session);
      if (!marker) return;
      indexRef.current = marker.index;
      originalReplace.call(history, { ...stateData(history.state), [HISTORY_STATE_KEY]: { session, index: marker.index, url: currentUrl() } }, "");
      lockedRef.current = false;
      if (unlockTimerRef.current) window.clearTimeout(unlockTimerRef.current);
      setIndex(marker.index);
    };
    addEventListener("popstate", onPopState);
    return () => {
      removeEventListener("popstate", onPopState);
      history.pushState = originalPush;
      history.replaceState = originalReplace;
      if (unlockTimerRef.current) window.clearTimeout(unlockTimerRef.current);
      const webApp = window.Telegram?.WebApp;
      webApp?.BackButton?.hide();
      webApp?.disableClosingConfirmation?.();
    };
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (pathnameRef.current !== pathname) {
      prevPathRef.current = pathnameRef.current || "/";
      pathnameRef.current = pathname;
      lockedRef.current = false;
      if (unlockTimerRef.current) window.clearTimeout(unlockTimerRef.current);
      dragXRef.current = 0;
      setDragX(0);
      setDragging(false);
      setExitOpen(false);
    }
    const fallback = fallbackFor(pathname);
    const canGoBack = Boolean(override) || index > 0 || Boolean(fallback);
    // Home boundary (DEC-052 index 0, no fallback): swipe becomes “exit?” instead of dead edge.
    const mode: SwipeMode = canGoBack ? "back" : "exit";
    swipeModeRef.current = mode;
    // Peek labels: queue to avoid setState-in-effect lint (visual only).
    queueMicrotask(() => {
      if (mode === "exit") {
        setPeekHint("Уже уходишь?");
        setPeekLabel("Выйти из Flowly");
      } else {
        const peekPath = index > 0 ? prevPathRef.current : fallback || prevPathRef.current || "/";
        setPeekHint("Назад");
        setPeekLabel(titleForPath(peekPath));
      }
    });
    const back = () => {
      if (override) {
        override();
        return;
      }
      if (lockedRef.current) return;
      lockedRef.current = true;
      if (unlockTimerRef.current) window.clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = window.setTimeout(() => {
        lockedRef.current = false;
      }, RAPID_BACK_LOCK_MS);
      if (indexRef.current > 0) router.back();
      else if (fallback) router.replace(fallback as never);
      else setExitOpen(true);
    };
    backRef.current = back;

    const webApp = window.Telegram?.WebApp;
    const backButton = webApp?.BackButton;
    if (backButton) {
      backButton.onClick(back);
      if (canGoBack) backButton.show();
      else backButton.hide();
      const supportsConfirmation =
        typeof webApp.enableClosingConfirmation === "function" &&
        typeof webApp.disableClosingConfirmation === "function" &&
        webApp.isVersionAtLeast?.("6.2") !== false;
      if (supportsConfirmation) {
        // At home boundary keep Telegram native close confirmation as safety net.
        if (canGoBack) webApp.disableClosingConfirmation?.();
        else webApp.enableClosingConfirmation?.();
      }
    }
    return () => {
      backButton?.offClick(back);
    };
  }, [index, initialized, override, pathname, router]);

  // Edge swipe: navigate back OR open exit sheet when at stack root.
  useEffect(() => {
    if (!initialized) return;
    let startX = 0;
    let startY = 0;
    let tracking = false;
    let decided = false;
    let active = false;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;

    const onStart = (event: TouchEvent) => {
      if (lockedRef.current || event.touches.length !== 1 || exitOpen) return;
      const touch = event.touches[0];
      if (!touch) return;
      if (touch.clientX > edgeStartPx()) return;
      const target = event.target as Element | null;
      if (target?.closest?.("input, textarea, select, [contenteditable='true'], [data-no-swipe-back]")) return;
      startX = touch.clientX;
      startY = touch.clientY;
      lastX = touch.clientX;
      lastT = performance.now();
      velocity = 0;
      tracking = true;
      decided = false;
      active = false;
    };

    const onMove = (event: TouchEvent) => {
      if (!tracking || event.touches.length !== 1) return;
      const touch = event.touches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (!decided) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        decided = true;
        if (dx <= 0 || Math.abs(dy) > Math.abs(dx) * 1.35) {
          tracking = false;
          return;
        }
        active = true;
        setDragging(true);
      }
      if (!active) return;
      event.preventDefault();
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      velocity = (touch.clientX - lastX) / dt;
      lastX = touch.clientX;
      lastT = now;
      const max = window.innerWidth * MAX_DRAG_RATIO;
      const x = Math.max(0, Math.min(max, dx));
      dragXRef.current = x;
      setDragX(x);
    };

    const onEnd = () => {
      if (!tracking) return;
      tracking = false;
      if (!active) {
        setDragging(false);
        dragXRef.current = 0;
        setDragX(0);
        return;
      }
      const distance = dragXRef.current;
      const shouldCommit = distance >= COMMIT_PX || velocity > 0.35;
      active = false;
      if (shouldCommit) {
        setDragX(Math.min(window.innerWidth, Math.max(distance, COMMIT_PX * 1.2)));
        window.setTimeout(() => {
          setDragging(false);
          dragXRef.current = 0;
          setDragX(0);
          if (swipeModeRef.current === "exit") setExitOpen(true);
          else backRef.current();
        }, 160);
      } else {
        setDragging(false);
        dragXRef.current = 0;
        setDragX(0);
      }
    };

    document.addEventListener("touchstart", onStart, { passive: true, capture: true });
    document.addEventListener("touchmove", onMove, { passive: false, capture: true });
    document.addEventListener("touchend", onEnd, { capture: true });
    document.addEventListener("touchcancel", onEnd, { capture: true });
    return () => {
      document.removeEventListener("touchstart", onStart, true);
      document.removeEventListener("touchmove", onMove, true);
      document.removeEventListener("touchend", onEnd, true);
      document.removeEventListener("touchcancel", onEnd, true);
    };
  }, [initialized, exitOpen]);

  const progress = Math.min(1, dragX / Math.max(1, 390 * MAX_DRAG_RATIO));
  const underScale = 0.92 + 0.08 * progress;
  const scrim = 0.38 * (1 - progress);
  const peeking = dragX > 0 || dragging;
  const frontStyle: CSSProperties = {
    position: "relative",
    zIndex: 2,
    transform: dragX > 0 ? `translate3d(${dragX}px,0,0)` : undefined,
    transition: dragging ? "none" : "transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)",
    willChange: dragging ? "transform" : undefined,
    minHeight: "100%",
    boxShadow: dragX > 0 ? "-12px 0 32px rgba(0,0,0,0.18)" : undefined,
    background: "var(--color-canvas)",
  };

  const underStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 1,
    pointerEvents: "none",
    display: peeking ? "grid" : "none",
    placeItems: "center",
    background: exitMode ? "var(--color-accent-soft, var(--color-canvas))" : "var(--color-canvas)",
    transform: `scale(${underScale})`,
    transition: dragging ? "none" : "transform 200ms ease-out",
  };

  const scrimStyle: CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 1,
    pointerEvents: "none",
    background: `rgba(0,0,0,${scrim})`,
    opacity: peeking ? 1 : 0,
    transition: dragging ? "none" : "opacity 160ms ease-out",
  };

  return (
    <BackOverrideContext.Provider value={registerOverride}>
      <div className="flowly-swipe-under" style={underStyle} aria-hidden="true">
        <div className="grid max-w-[18rem] gap-2 px-6 text-center">
          <p className="m-0 text-xs uppercase tracking-wide text-text-muted">{peekHint}</p>
          <p className="m-0 text-2xl font-semibold leading-tight text-text">{peekLabel}</p>
          {exitMode ? <p className="m-0 text-sm leading-snug text-text-muted">Потяни сильнее — спросим наверняка</p> : null}
        </div>
      </div>
      <div className="flowly-swipe-scrim" style={scrimStyle} aria-hidden="true" />
      <div className="flowly-swipe-shell" style={frontStyle}>
        {children}
      </div>

      <Sheet opened={exitOpen} onBackdropClick={() => setExitOpen(false)}>
        <Page>
          <Navbar title="Уже уходишь?" />
          <Block className="space-y-3">
            <p className="m-0 text-[15px] leading-snug text-text-muted">
              Дальше назад некуда — это край Flowly. Можно остаться или закрыть мини-приложение.
            </p>
            <Button large rounded onClick={() => setExitOpen(false)}>
              Остаться
            </Button>
            <Button
              large
              rounded
              outline
              onClick={() => {
                setExitOpen(false);
                closeMiniApp();
              }}
            >
              Выйти
            </Button>
          </Block>
        </Page>
      </Sheet>
    </BackOverrideContext.Provider>
  );
}
