"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { useTelegramBackOverride } from "@/components/providers/telegram-back-button";

const selector = "button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])";

export function useModalFocus(opened: boolean, modalRef: RefObject<HTMLElement | null>, backgroundRef: RefObject<HTMLElement | null>, onClose: () => void) {
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  const close = useCallback(() => closeRef.current(), []);
  useTelegramBackOverride(close, opened);
  useEffect(() => {
    if (!opened) return;
    const modal = modalRef.current, background = backgroundRef.current;
    if (!modal || !background) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null, previousAria = background.getAttribute("aria-hidden");
    background.inert = true; background.setAttribute("aria-hidden", "true");
    requestAnimationFrame(() => modal.querySelector<HTMLElement>(selector)?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (event.key !== "Tab") return;
      const focusable = [...modal.querySelectorAll<HTMLElement>(selector)].filter((element) => element.offsetParent !== null);
      if (!focusable.length) { event.preventDefault(); return; }
      const first = focusable[0]!, last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown); background.inert = false;
      if (previousAria == null) background.removeAttribute("aria-hidden"); else background.setAttribute("aria-hidden", previousAria);
      requestAnimationFrame(() => previous?.focus());
    };
  }, [backgroundRef, close, modalRef, opened]);
}
