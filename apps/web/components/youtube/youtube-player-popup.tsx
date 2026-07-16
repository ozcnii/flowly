"use client";

import { Button, Navbar, Popup, Preloader } from "konsta/react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Icon } from "@flowly/ui";

export type YoutubePlayerVideo = { videoId: string; title: string; trigger: HTMLElement };

type Props = { video: YoutubePlayerVideo | null; backgroundRef: RefObject<HTMLElement | null>; onClose: () => void };
const focusableSelector = "button:not([disabled]), a[href], iframe, input:not([disabled]), [tabindex]:not([tabindex='-1'])";

function YoutubeFrame({ video }: { video: YoutubePlayerVideo }) {
  const [loaded, setLoaded] = useState(false);
  return <main className="flex min-h-0 flex-1 flex-col justify-center bg-black">
    <div className="relative aspect-video w-full bg-black">
      {!loaded && <div className="absolute inset-0 grid place-items-center" role="status" aria-live="polite"><Preloader className="text-white" /><span className="sr-only">Загружаем видео</span></div>}
      {/* DEC-053: Konsta has no video player; this approved raw iframe is the minimal YouTube media exception. */}
      <iframe
        className="relative size-full border-0"
        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.videoId)}?autoplay=1&playsinline=1&rel=0`}
        title={video.title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => setLoaded(true)}
      />
    </div>
  </main>;
}

export function YoutubePlayerPopup({ video, backgroundRef, onClose }: Props) {
  const popupRef = useRef<HTMLElement>(null), closeRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!video) return;
    const popup = popupRef.current, background = backgroundRef.current;
    if (!popup || !background) return;
    const previousOverflow = document.documentElement.style.overflow, previousAria = background.getAttribute("aria-hidden");
    background.inert = true;
    background.setAttribute("aria-hidden", "true");
    document.documentElement.style.overflow = "hidden";
    requestAnimationFrame(() => closeRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab") return;
      const focusable = [...popup.querySelectorAll<HTMLElement>(focusableSelector)].filter((element) => element.offsetParent !== null);
      if (!focusable.length) { event.preventDefault(); return; }
      const first = focusable[0]!, last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = previousOverflow;
      background.inert = false;
      if (previousAria == null) background.removeAttribute("aria-hidden"); else background.setAttribute("aria-hidden", previousAria);
      requestAnimationFrame(() => video.trigger.focus());
    };
  }, [backgroundRef, onClose, video]);

  return <Popup ref={popupRef} opened={Boolean(video)} onBackdropClick={onClose} className="flex flex-col" role={video ? "dialog" : undefined} aria-modal={video ? "true" : undefined} aria-hidden={video ? undefined : "true"} inert={video ? undefined : true} aria-label={video ? `Видео «${video.title}»` : undefined}>
    {video && <>
      <Navbar title="Видео" right={<Button ref={closeRef} inline clear rounded className="h-11 w-11 min-w-11 p-0" aria-label="Закрыть видео" onClick={onClose}><Icon name="x" /></Button>} />
      <YoutubeFrame key={video.videoId} video={video} />
    </>}
  </Popup>;
}
