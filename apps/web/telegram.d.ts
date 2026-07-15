/** Minimal Telegram Mini App SDK types (injected by the Telegram WebView). */
type TelegramSafeAreaInset = { top: number; right: number; bottom: number; left: number };
type TelegramWebAppEvent = "safeAreaChanged" | "contentSafeAreaChanged" | "fullscreenChanged" | "viewportChanged" | "themeChanged" | "activated";

interface TelegramWebApp {
  initData: string;
  colorScheme?: "light" | "dark";
  platform?: string;
  version?: string;
  themeParams?: Record<string, string>;
  safeAreaInset?: TelegramSafeAreaInset;
  contentSafeAreaInset?: TelegramSafeAreaInset;
  isFullscreen?: boolean;
  isVersionAtLeast?: (version: string) => boolean;
  requestFullscreen?: () => void;
  ready?: () => void;
  expand?: () => void;
  onEvent?: (event: TelegramWebAppEvent, handler: () => void) => void;
  offEvent?: (event: TelegramWebAppEvent, handler: () => void) => void;
}

interface Telegram {
  WebApp: TelegramWebApp;
}

interface Window {
  Telegram?: Telegram;
}
