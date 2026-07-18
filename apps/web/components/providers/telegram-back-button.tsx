"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

const HISTORY_STATE_KEY = "__flowlyHistory";
const HISTORY_SESSION_KEY = "flowly-history-session";
const RAPID_BACK_LOCK_MS = 700;

type BackOverride = { id: symbol; handler: () => void };
type RegisterBackOverride = (handler: () => void) => () => void;
const BackOverrideContext = createContext<RegisterBackOverride | null>(null);

type FlowlyHistoryState = { session: string; index: number; url: string };
type HistoryData = Record<string, unknown> & { [HISTORY_STATE_KEY]?: FlowlyHistoryState };

const stateData = (value: unknown): HistoryData => value && typeof value === "object" && !Array.isArray(value) ? value as HistoryData : {};
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
  if (pathname === "/settings" || pathname === "/favorites") return "/profile";
  if (pathname === "/profile") return "/";
  if (pathname === "/catalog" || pathname === "/programs" || pathname === "/rhythm" || pathname === "/calendar") return "/";
  if (pathname.startsWith("/youtube") || pathname.startsWith("/workouts") || pathname.startsWith("/sessions") || pathname.startsWith("/sources") || pathname.startsWith("/authors") || pathname.startsWith("/safety")) return "/catalog";
  if (pathname.startsWith("/programs/")) return "/programs";
  if (pathname.startsWith("/rhythm/")) return "/rhythm";
  if (pathname.startsWith("/calendar/")) return "/calendar";
  return "/";
};

export function useTelegramBackOverride(handler: () => void, active: boolean) {
  const register = useContext(BackOverrideContext);
  useEffect(() => active && register ? register(handler) : undefined, [active, handler, register]);
}

export function TelegramBackButton({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const indexRef = useRef(0);
  const lockedRef = useRef(false);
  const pathnameRef = useRef(pathname);
  const unlockTimerRef = useRef<number | undefined>(undefined);
  const [index, setIndex] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [overrides, setOverrides] = useState<BackOverride[]>([]);
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
      const result = originalPush.call(history, { ...stateData(data), [HISTORY_STATE_KEY]: { session, index: next, url: url == null ? currentUrl() : String(url) } }, unused, url);
      indexRef.current = next;
      queueMicrotask(() => setIndex(next));
      return result;
    };
    history.replaceState = function replaceState(data: unknown, unused: string, url?: string | URL | null) {
      return originalReplace.call(history, { ...stateData(data), [HISTORY_STATE_KEY]: { session, index: indexRef.current, url: url == null ? currentUrl() : String(url) } }, unused, url);
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
    }
    const webApp = window.Telegram?.WebApp;
    const backButton = webApp?.BackButton;
    if (!backButton) return;
    const fallback = fallbackFor(pathname);
    const canGoBack = Boolean(override) || index > 0 || Boolean(fallback);
    const back = () => {
      if (override) { override(); return; }
      if (lockedRef.current) return;
      lockedRef.current = true;
      if (unlockTimerRef.current) window.clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = window.setTimeout(() => { lockedRef.current = false; }, RAPID_BACK_LOCK_MS);
      if (indexRef.current > 0) router.back();
      else if (fallback) router.replace(fallback as never);
    };
    backButton.onClick(back);
    if (canGoBack) backButton.show(); else backButton.hide();
    const supportsConfirmation = typeof webApp.enableClosingConfirmation === "function" && typeof webApp.disableClosingConfirmation === "function" && webApp.isVersionAtLeast?.("6.2") !== false;
    if (supportsConfirmation) {
      if (canGoBack) webApp.disableClosingConfirmation?.(); else webApp.enableClosingConfirmation?.();
    }
    return () => { backButton.offClick(back); };
  }, [index, initialized, override, pathname, router]);

  return <BackOverrideContext.Provider value={registerOverride}>{children}</BackOverrideContext.Provider>;
}
