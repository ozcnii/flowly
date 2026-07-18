"use client";

import { BlockTitle, Card } from "konsta/react";
import { Icon } from "@flowly/ui";

const icons = ["house", "heart", "calendar-days", "chart-no-axes-column", "user-round", "search", "chevron-left", "chevron-right", "chevron-down", "plus", "x", "check", "circle-check", "triangle-alert", "info", "refresh-cw", "wifi-off", "loader-circle", "play", "pause", "square", "timer", "ellipsis", "settings", "bell", "sun", "moon", "lock", "shield", "share-2", "copy", "download", "trash-2", "flag", "eye-off", "ban", "users", "bot", "external-link", "upload", "clock-3", "circle-help", "sparkles", "dumbbell", "leaf", "funnel", "bookmark", "bookmark-fill", "circle", "glass-water", "sunrise", "menu"] as const;

export function UIKitClient() {
  return <main className="safe-shell flow-screen flow-screen--wide">
    <section aria-labelledby="ui-kit-title">
      <BlockTitle component="h1" large id="ui-kit-title" className="!m-0 !p-0">Flowly UI Kit</BlockTitle>
      <p className="mt-2 mb-0 text-sm leading-relaxed text-text-muted">Только approved Flowly-specific composite DEC-037: локальный Lucide artwork для прямых Konsta controls. Стандартные controls предоставляет Konsta UI 5.2.0.</p>
    </section>
    <Card component="section" outline className="m-0" header={<h2 className="m-0 font-semibold">Lucide artwork</h2>} contentWrap={false}>
      <ul className="m-0 grid list-none grid-cols-2 gap-px bg-border p-px sm:grid-cols-3 md:grid-cols-4">
        {icons.map((name) => <li key={name} className="flex min-h-16 items-center gap-3 bg-surface p-3"><Icon name={name} /><code className="min-w-0 break-all text-xs text-text-muted">{name}</code></li>)}
      </ul>
    </Card>
  </main>;
}
