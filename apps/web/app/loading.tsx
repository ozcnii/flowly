"use client";

import { Preloader } from "konsta/react";

export default function Loading() {
  return <main className="safe-shell grid min-h-dvh place-items-center bg-canvas" role="status" aria-live="polite"><Preloader /><span className="sr-only">Загружаем Flowly</span></main>;
}
