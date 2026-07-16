/** Minimal Telegram Mini App SDK types (injected by the Telegram WebView). */
type TelegramSafeAreaInset = { top: number; right: number; bottom: number; left: number };
type TelegramWebAppEvent = "safeAreaChanged" | "contentSafeAreaChanged" | "fullscreenChanged" | "viewportChanged" | "themeChanged" | "activated" | "backButtonClicked";

interface TelegramBackButton {
  isVisible: boolean;
  show: () => TelegramBackButton;
  hide: () => TelegramBackButton;
  onClick: (handler: () => void) => TelegramBackButton;
  offClick: (handler: () => void) => TelegramBackButton;
}

interface TelegramWebApp {
  initData: string;
  colorScheme?: "light" | "dark";
  platform?: string;
  version?: string;
  themeParams?: Record<string, string>;
  safeAreaInset?: TelegramSafeAreaInset;
  contentSafeAreaInset?: TelegramSafeAreaInset;
  isFullscreen?: boolean;
  headerColor?: string;
  backgroundColor?: string;
  bottomBarColor?: string;
  BackButton?: TelegramBackButton;
  isClosingConfirmationEnabled?: boolean;
  isVersionAtLeast?: (version: string) => boolean;
  enableClosingConfirmation?: () => void;
  disableClosingConfirmation?: () => void;
  setHeaderColor?: (color: "bg_color" | "secondary_bg_color" | `#${string}`) => void;
  setBackgroundColor?: (color: `#${string}`) => void;
  setBottomBarColor?: (color: "bg_color" | "secondary_bg_color" | `#${string}`) => void;
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
