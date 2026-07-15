"use client";

import { Button, Card } from "konsta/react";
import Link from "next/link";

export function ShellErrorState() {
  return <Card component="section" contentWrap={false} outline role="alert" className="flow-card m-auto max-w-md text-center"><h1 className="flow-title">Не удалось открыть Flowly</h1><p className="flow-subtitle">Повторите загрузку оболочки. Личные данные не отображаются до успешной проверки.</p><Button component={Link} large rounded href="/?scenario=ready" className="mx-auto">Повторить</Button></Card>;
}
