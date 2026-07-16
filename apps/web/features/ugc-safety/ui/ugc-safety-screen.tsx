"use client";

import { Button, Card, List, ListInput, ListItem } from "konsta/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@flowly/ui";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";

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
  const router = useRouter(), mode = safeAction(action), [reason, setReason] = useState(""), [touched, setTouched] = useState(false), [done, setDone] = useState<Action | null>(forced === "success" ? mode : null);
  const invalid = mode === "report" && touched && reason.trim().length < 8;
  const submit = () => { setTouched(true); if (mode !== "report" || reason.trim().length >= 8) setDone(mode); };

  return <div className="min-h-dvh">
    <PrimaryNavbar title={title[mode]} />
    <main className="flow-screen">
      <h1 className="sr-only">{title[mode]}</h1>
      <p className="m-0 text-sm leading-relaxed text-text-muted">{description[mode]}</p>

      {forced === "error" && <Card component="section" outline className="m-0" role="alert" contentWrapPadding="p-4 flex items-start gap-3"><Icon name="triangle-alert" className="text-danger" /><p className="m-0 text-sm"><strong className="block">Не удалось выполнить действие</strong>Проверьте соединение и попробуйте ещё раз. Введённая причина сохранена на экране.</p></Card>}
      {done && <Card component="section" outline className="m-0" role="status" contentWrapPadding="p-4 flex items-start gap-3"><Icon name="circle-check" className="text-accent" /><p className="m-0 text-sm"><strong className="block">Готово</strong>{success[done]}</p></Card>}

      {!done && <Card component="section" contentWrap={false} outline className="m-0">
        {mode === "report" ? <List strong inset className="m-0 py-2"><ListInput title="" outline type="textarea" inputClassName="min-h-24" label="Причина жалобы" value={reason} minLength={8} placeholder="Например: опасная инструкция, спам или неподходящий контент" error={invalid ? "Добавьте причину минимум из 8 символов." : undefined} onBlur={() => setTouched(true)} onInput={(event) => setReason(event.currentTarget.value)} /></List> : <p className="m-0 p-4 text-sm leading-relaxed">{mode === "hide" ? "Контент автора больше не будет попадаться в вашем каталоге." : "Автор не сможет взаимодействовать с вами через публичный контент Flowly."}</p>}
        <div className="grid gap-2 p-4 pt-2">
          <Button large rounded onClick={submit}>{mode === "report" ? "Отправить жалобу" : mode === "hide" ? "Скрыть" : "Заблокировать"}</Button>
          <Button component={NextLink} href="/catalog" large rounded clear>Отмена</Button>
        </div>
      </Card>}

      <nav aria-label="Другие действия"><List strong inset dividers className="m-0"><ListItem groupTitle title="Другие действия" />{(["report", "hide", "block"] as const).filter((item) => item !== mode).map((item) => <ListItem key={item} link linkComponent="button" contentClassName="w-full" innerClassName="text-left" linkProps={{ type: "button", onClick: () => router.push(`/safety/${item}` as never) }} title={title[item]} />)}</List></nav>
    </main>
  </div>;
}
