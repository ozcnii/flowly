"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";

export type YoutubePlayerHandle = { play: () => void; pause: () => void; currentTime: () => number; seekTo: (seconds: number) => void };
type Props = { videoId: string; title: string; className?: string; autoplay?: boolean; onReady?: () => void; onStateChange?: (state: number) => void; onError?: (code: number) => void };

let apiPromise: Promise<void> | null = null;
function loadYoutubeApi() {
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<void>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { previous?.(); resolve(); };
    const existing = document.querySelector<HTMLScriptElement>('script[data-flowly-youtube-api]');
    if (existing) { existing.addEventListener("error", () => reject(new Error("youtube_api_failed")), { once: true }); return; }
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.dataset.flowlyYoutubeApi = "true";
    script.addEventListener("error", () => reject(new Error("youtube_api_failed")), { once: true });
    document.head.append(script);
  });
  return apiPromise;
}

export const YoutubeIframePlayer = forwardRef<YoutubePlayerHandle, Props>(function YoutubeIframePlayer({ videoId, title, className = "", autoplay = true, onReady, onStateChange, onError }, ref) {
  const reactId = useId(), iframeRef = useRef<HTMLIFrameElement>(null), playerRef = useRef<YT.Player | null>(null), readyRef = useRef(onReady), stateRef = useRef(onStateChange), errorRef = useRef(onError), [origin, setOrigin] = useState("");
  readyRef.current = onReady; stateRef.current = onStateChange; errorRef.current = onError;
  useImperativeHandle(ref, () => ({ play: () => playerRef.current?.playVideo(), pause: () => playerRef.current?.pauseVideo(), currentTime: () => playerRef.current?.getCurrentTime() ?? 0, seekTo: (seconds) => playerRef.current?.seekTo(Math.max(0, seconds), true) }), []);
  useEffect(() => setOrigin(location.origin), []);
  useEffect(() => {
    if (!origin || !iframeRef.current) return;
    let cancelled = false;
    loadYoutubeApi().then(() => {
      if (cancelled || !iframeRef.current || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(iframeRef.current, { events: { onReady: () => readyRef.current?.(), onStateChange: (event) => stateRef.current?.(event.data), onError: (event) => errorRef.current?.(event.data) } });
    }).catch(() => errorRef.current?.(-1));
    return () => { cancelled = true; playerRef.current?.destroy(); playerRef.current = null; };
  }, [autoplay, origin, videoId]);
  if (!origin) return null;
  const id = `youtube-${reactId.replaceAll(":", "")}`;
  // DEC-053: the shared player family owns the sole approved raw YouTube iframe.
  return <iframe ref={iframeRef} id={id} className={className} src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=${autoplay ? 1 : 0}&playsinline=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(origin)}`} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />;
});
