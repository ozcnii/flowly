declare namespace YT {
  type PlayerEvent = { target: Player };
  type OnStateChangeEvent = PlayerEvent & { data: number };
  type OnErrorEvent = PlayerEvent & { data: number };
  type PlayerOptions = { events?: { onReady?: (event: PlayerEvent) => void; onStateChange?: (event: OnStateChangeEvent) => void; onError?: (event: OnErrorEvent) => void } };
  class Player {
    constructor(element: string | HTMLElement, options?: PlayerOptions);
    playVideo(): void;
    pauseVideo(): void;
    getCurrentTime(): number;
    seekTo(seconds: number, allowSeekAhead?: boolean): void;
    destroy(): void;
  }
}

interface Window {
  YT?: { Player: typeof YT.Player };
  onYouTubeIframeAPIReady?: () => void;
}
