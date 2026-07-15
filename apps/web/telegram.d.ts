/** Minimal Telegram Mini App SDK types (injected by the Telegram WebView). */
interface TelegramWebApp {
  initData: string;
  colorScheme?: "light" | "dark";
  platform?: string;
  version?: string;
  themeParams?: Record<string, string>;
  ready?: () => void;
  expand?: () => void;
}

interface Telegram {
  WebApp: TelegramWebApp;
}

interface Window {
  Telegram?: Telegram;
}
