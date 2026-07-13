import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@flowly/ui/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flowly",
  description: "Telegram Mini App для практик, привычек и прогресса",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
};

const themeBootstrap = `(() => {
  const telegram = window.Telegram?.WebApp;
  const forced = ${process.env.NODE_ENV !== "production" ? "new URLSearchParams(location.search).get(\"theme\")" : "null"};
  const theme = forced === "light" || forced === "dark" ? forced : telegram?.colorScheme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.dataset.theme = theme;
  if (telegram) document.documentElement.dataset.telegram = "connected";
})();`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootstrap }} /></head>
      <body>{children}</body>
    </html>
  );
}
