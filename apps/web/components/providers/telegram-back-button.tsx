"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

const HISTORY_STATE_KEY = "__flowlyHistory";
const HISTORY_SESSION_KEY = "flowly-history-session";
const RAPID_BACK_LOCK_MS = 700;
/** Commit back after this drag distance (or velocity). */
const COMMIT_PX = 72;
const MAX_DRAG_RATIO = 0.5;
/**
 * Left edge zone for starting swipe-back. Wider than stock iOS (~20pt) because
 * Telegram Mini App + phone bezel/safe-area make a thin strip unusable.
 * ~12–18% of width, floor 64px, ceiling 100px, plus left safe inset.
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

export function useTelegramBackOverride(handler: () => void, active: boolean) {
  const register = useContext(BackOverrideContext);
  useEffect(() => (active && register ? register(handler) : undefined), [active, handler, register]);
}

export function TelegramBackButton({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const indexRef = useRef(0);
  const lockedRef = useRef(false);
  const pathnameRef = useRef(pathname);
  const unlockTimerRef = useRef<number | undefined>(undefined);
  const backRef = useRef<() => void>(() => undefined);
  const canGoBackRef = useRef(false);
  const dragXRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [overrides, setOverrides] = useState<BackOverride[]>([]);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
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
      pathnameRef.current = pathname;
      lockedRef.current = false;
      if (unlockTimerRef.current) window.clearTimeout(unlockTimerRef.current);
      dragXRef.current = 0;
      setDragX(0);
      setDragging(false);
    }
    const fallback = fallbackFor(pathname);
    const canGoBack = Boolean(override) || index > 0 || Boolean(fallback);
    canGoBackRef.current = canGoBack;
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
        if (canGoBack) webApp.disableClosingConfirmation?.();
        else webApp.enableClosingConfirmation?.();
      }
    }
    return () => {
      backButton?.offClick(back);
    };
  }, [index, initialized, override, pathname, router]);

  // iOS-style left-edge swipe → same back path as Telegram BackButton.
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
      if (!canGoBackRef.current || lockedRef.current || event.touches.length !== 1) return;
      const touch = event.touches[0];
      if (!touch) return;
      // clientX is viewport-relative; include safe-area so bezels don't kill the gesture
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
        // Prefer horizontal-right; allow slight diagonal (iOS-like)
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
          backRef.current();
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
  }, [initialized]);

  const style: CSSProperties = {
    transform: dragX > 0 ? `translate3d(${dragX}px,0,0)` : undefined,
    transition: dragging ? "none" : "transform 180ms ease-out",
    willChange: dragging ? "transform" : undefined,
    minHeight: "100%",
  };

  return (
    <BackOverrideContext.Provider value={registerOverride}>
      <div className="flowly-swipe-shell" style={style}>
        {children}
      </div>
    </BackOverrideContext.Provider>
  );
}
