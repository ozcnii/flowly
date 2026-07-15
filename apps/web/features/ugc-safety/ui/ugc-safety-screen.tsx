"use client";

import { Button, Card } from "konsta/react";
import Link from "next/link";
import { useState } from "react";
import { Icon, TextField } from "@flowly/ui";
import styles from "./ugc-safety-screen.module.css";

type Action = "report" | "hide" | "block";
type Forced = "error" | "success" | null;
type Props = { action?: string; forced?: Forced };

const safeAction = (action?: string): Action => action === "hide" || action === "block" ? action : "report";
const title: Record<Action, string> = { report: "Пожаловаться", hide: "Скрыть автора", block: "Заблокировать автора" };
const description: Record<Action, string> = {
  report: "Расскажите, что не так с пользовательской тренировкой. Причина обязательна.",
  hide: "Скрытие убирает контент автора только из вашего просмотра.",
  block: "Блокировка отключает будущие взаимодействия с автором. Это отдельное действие, не жалоба.",
};
const success: Record<Action, string> = {
  report: "Жалоба подготовлена. После подключения пользовательского контента она будет отправляться на проверку.",
  hide: "Автор скрыт для вашего просмотра.",
  block: "Автор заблокирован. Разблокирование будет доступно в профиле автора.",
};

export function UgcSafetyScreen({ action, forced = null }: Props) {
  const mode = safeAction(action);
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState<Action | null>(forced === "success" ? mode : null);
  const invalid = mode === "report" && touched && reason.trim().length < 8;
  const submit = () => {
    setTouched(true);
    if (mode === "report" && reason.trim().length < 8) return;
    setDone(mode);
  };

  return <div className={`flow-screen ${styles.screen}`}>
    <Link className={`flow-back ${styles.back}`} href={"/authors/user" as never}><Icon name="chevron-left" />Автор</Link>
    <header className={`flow-top ${styles.header}`}>
      <p className="flow-eyebrow">Безопасность</p>
      <h1 className="flow-title">{title[mode]}</h1>
      <span className="flow-subtitle">{description[mode]}</span>
    </header>

    {forced === "error" && <section className={styles.error} role="alert"><Icon name="triangle-alert" /><div><strong>Не удалось выполнить действие</strong><p>Проверьте соединение и попробуйте ещё раз. Введённая причина сохранена на экране.</p></div></section>}
    {done && <section className={styles.success} role="status"><Icon name="circle-check" /><div><strong>Готово</strong><p>{success[done]}</p></div></section>}

    {!done && <Card contentWrap={false} outline className={styles.card}>
      {mode === "report" ? <TextField multiline label="Причина жалобы" value={reason} onBlur={() => setTouched(true)} onChange={(e) => setReason(e.target.value)} placeholder="Например: опасная инструкция, спам или неподходящий контент" aria-invalid={invalid || undefined} /> : <p>{mode === "hide" ? "Контент автора больше не будет попадаться в вашем каталоге." : "Автор не сможет взаимодействовать с вами через публичный контент Flowly."}</p>}
      {invalid && <p className={styles.validation}>Добавьте причину минимум из 8 символов.</p>}
      <div className={styles.actions}>
        <Button large rounded onClick={submit}>{mode === "report" ? "Отправить жалобу" : mode === "hide" ? "Скрыть" : "Заблокировать"}</Button>
        <Link className={styles.secondary} href={"/authors/user" as never}>Отмена</Link>
      </div>
    </Card>}

    <nav className={styles.switcher} aria-label="Другие действия">
      {(["report", "hide", "block"] as const).filter((x) => x !== mode).map((x) => <Link key={x} className={styles[`${x}Link`]} href={`/safety/${x}` as never}>{title[x]}</Link>)}
    </nav>
  </div>;
}
