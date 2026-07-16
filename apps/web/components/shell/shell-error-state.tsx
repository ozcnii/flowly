"use client";

import { BlockTitle, Button, Card } from "konsta/react";
import Link from "next/link";

export function ShellErrorState() {
  return <Card component="section" outline role="alert" className="m-auto max-w-md text-center" contentWrapPadding="grid gap-3 p-4"><BlockTitle component="h1" large className="!m-0 !p-0">Не удалось открыть Flowly</BlockTitle><p className="m-0 text-sm leading-relaxed text-text-muted">Повторите загрузку оболочки. Личные данные не отображаются до успешной проверки.</p><Button component={Link} large rounded href="/?scenario=ready" className="mx-auto">Повторить</Button></Card>;
}
