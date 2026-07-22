"use client";

import { BlockTitle, Button, List, ListInput, ListItem, Navbar, Preloader, Radio, Segmented, SegmentedButton, Sheet, Toggle } from "konsta/react";
import { useMemo, useState } from "react";
import { Icon } from "@flowly/ui";
import { useCreateReminderPolicyMutation, useUpdateReminderPolicyMutation } from "../model/habits-queries";
import { reminderPolicyInputSchema, type ReminderPolicy, type ReminderPolicyInput, type ReminderPolicyStep } from "../model/reminder-policies";
import { policyStepDelayLabel, policyStepLabel } from "../model/reminder-policies";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

type Draft = ReminderPolicyInput & { id?: string };

const defaultDraft = (): Draft => ({
  name: "Моя политика",
  type: "custom",
  maxMessages: 3,
  lastMessageLocalTime: null,
  quietHoursBehavior: "defer",
  allowCustomSnooze: true,
  steps: [{ stepNumber: 1, delayMinutes: 0, messageType: "primary" }, { stepNumber: 2, delayMinutes: 30, messageType: "repeat" }],
});

const draftFromPolicy = (policy: ReminderPolicy): Draft => ({
  id: policy.isSystem ? undefined : policy.id,
  name: policy.isSystem ? `${policy.name} · моя` : policy.name,
  type: "custom",
  maxMessages: policy.maxMessages,
  lastMessageLocalTime: policy.lastMessageLocalTime,
  quietHoursBehavior: policy.quietHoursBehavior === "skip" ? "skip" : "defer",
  allowCustomSnooze: policy.allowCustomSnooze,
  steps: policy.steps.map((step) => ({ ...step })),
});

const summary = (policy: ReminderPolicy) => policy.steps.map((step) => `${policyStepLabel(step)} ${policyStepDelayLabel(step)}`).join(" · ");

export function ReminderPolicySheet({ opened, policies, selectedId, onSelect, onClose }: { opened: boolean; policies: ReminderPolicy[]; selectedId: string; onSelect: (id: string) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const create = useCreateReminderPolicyMutation();
  const update = useUpdateReminderPolicyMutation();
  const selectedCustom = policies.find((policy) => policy.id === selectedId && !policy.isSystem);
  const busy = create.isPending || update.isPending;
  const available = useMemo(() => policies.filter((policy) => policy.isSystem || policy.ownerId), [policies]);

  const edit = (policy: ReminderPolicy) => { setError(""); setDraft(draftFromPolicy(policy)); };
  const setStep = (index: number, patch: Partial<ReminderPolicyStep>) => setDraft((current) => current ? { ...current, steps: current.steps.map((step, i) => i === index ? { ...step, ...patch } : step) } : current);
  const addRepeat = () => setDraft((current) => {
    if (!current || current.steps.length >= current.maxMessages) return current;
    const timed = current.steps.filter((step) => step.delayMinutes !== null).map((step) => step.delayMinutes as number);
    const delayMinutes = (timed[timed.length - 1] ?? 0) + 30;
    const finalIndex = current.steps.findIndex((step) => step.messageType === "final");
    const steps = [...current.steps];
    const next = { stepNumber: steps.length + 1, delayMinutes, messageType: "repeat" as const };
    if (finalIndex >= 0) steps.splice(finalIndex, 0, next); else steps.push(next);
    return { ...current, steps: steps.map((step, index) => ({ ...step, stepNumber: index + 1 })) };
  });
  const addFinal = () => setDraft((current) => {
    if (!current || current.steps.some((step) => step.messageType === "final") || current.steps.length >= current.maxMessages) return current;
    return { ...current, steps: [...current.steps, { stepNumber: current.steps.length + 1, delayMinutes: null, messageType: "final" }] };
  });
  const removeStep = (index: number) => setDraft((current) => current ? { ...current, steps: current.steps.filter((_, i) => i !== index).map((step, i) => ({ ...step, stepNumber: i + 1 })) } : current);
  const save = () => {
    if (!draft) return;
    const parsed = reminderPolicyInputSchema.safeParse({ ...draft, maxMessages: Number(draft.maxMessages) });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Проверьте параметры политики."); return; }
    const onSuccess = (policy: ReminderPolicy) => { onSelect(policy.id); setDraft(null); setError(""); };
    if (draft.id) update.mutate({ id: draft.id, input: parsed.data }, { onSuccess: ({ policy }) => onSuccess(policy), onError: () => setError("Не удалось сохранить политику. Проверьте связь и попробуйте ещё раз.") });
    else create.mutate(parsed.data, { onSuccess: ({ policy }) => onSuccess(policy), onError: () => setError("Не удалось сохранить политику. Проверьте связь и попробуйте ещё раз.") });
  };

  return (
    <Sheet opened={opened} backdrop onBackdropClick={onClose} className="flex h-[min(90dvh,44rem)] flex-col" role="dialog" aria-modal="true" aria-labelledby="reminder-policy-title">
      <Navbar
        title={draft ? "Своя политика" : "Напоминания"}
        left={draft ? <Button inline clear rounded={false} className={focusRing} onClick={() => setDraft(null)}>Назад</Button> : undefined}
        right={!draft ? <Button inline clear rounded={false} className={focusRing} onClick={onClose}>Готово</Button> : undefined}
      />
      {!draft ? (
        <div className="min-h-0 overflow-auto px-0 py-3 pb-[calc(var(--component-safe-area-bottom)+1rem)]">
          <h2 id="reminder-policy-title" className="sr-only">Политика напоминаний</h2>
          {!policies.length ? <div className="grid min-h-32 place-items-center" role="status"><Preloader /><span className="sr-only">Загружаем политики</span></div> : null}
          <List className="!my-0" strong inset dividers>
            {available.map((policy) => (
              <ListItem key={policy.id} link linkComponent="button" contentClassName="w-full" innerClassName="text-left" linkProps={{ type: "button", onClick: () => policy.type === "persistent" ? edit(policy) : onSelect(policy.id) }} title={policy.name} subtitle={summary(policy)} after={<Radio checked={selectedId === policy.id} readOnly aria-label={`Выбрать ${policy.name}`} />} aria-label={`${policy.name}. ${summary(policy)}`} />
            ))}
          </List>
          <div className="grid gap-2 px-4 pt-3">
            {selectedCustom ? <Button outline rounded className={`w-full ${focusRing}`} onClick={() => edit(selectedCustom)}>Изменить выбранную политику</Button> : null}
            <Button rounded className={`w-full ${focusRing}`} onClick={() => { setError(""); setDraft(defaultDraft()); }}>Создать свою политику</Button>
          </div>
          <p className="m-0 px-4 pt-3 text-sm leading-5 text-text-muted">Период тишины задаётся отдельно в настройках уведомлений. Изменение своей политики затронет привычки, которые её используют.</p>
        </div>
      ) : (
        <div className="min-h-0 overflow-auto px-0 py-3 pb-[calc(var(--component-safe-area-bottom)+1rem)]">
          <BlockTitle component="h2" className="!m-0 !p-0 !px-4">Основное</BlockTitle>
          <List className="!my-0" strong inset dividers>
            <ListInput title="Название" type="text" value={draft.name} onInput={(e) => setDraft({ ...draft, name: (e.currentTarget as HTMLInputElement).value })} aria-label="Название политики" inputClassName="!min-h-11" />
            <ListInput title="Лимит сообщений" type="number" min={1} max={10} value={String(draft.maxMessages)} onInput={(e) => setDraft({ ...draft, maxMessages: Number((e.currentTarget as HTMLInputElement).value) })} aria-label="Лимит сообщений" inputClassName="!min-h-11" />
          </List>
          <BlockTitle component="h3" className="!m-0 !mt-4 !p-0 !px-4">Шаги</BlockTitle>
          <List className="!my-0" strong inset dividers>
            {draft.steps.map((step, index) => step.messageType === "primary" ? (
              <ListItem key={`${step.stepNumber}-${step.messageType}`} title="1. Основное" subtitle="Сразу после времени" />
            ) : (
              <ListItem
                key={`${step.stepNumber}-${step.messageType}`}
                title={step.messageType === "final" ? "Финальное сообщение" : `Повтор ${step.stepNumber - 1}`}
                subtitle={step.messageType === "final" ? "Локальное время пользователя" : "Минут после основного"}
                after={<div className="flex items-center gap-1">
                  <ListInput
                    component="div"
                    title=""
                    type={step.messageType === "final" ? "time" : "number"}
                    min={step.messageType === "final" ? undefined : 10}
                    value={step.messageType === "final" ? draft.lastMessageLocalTime ?? "" : String(step.delayMinutes ?? "")}
                    placeholder={step.messageType === "final" ? "--:--" : undefined}
                    onInput={(e) => step.messageType === "final" ? setDraft({ ...draft, lastMessageLocalTime: (e.currentTarget as HTMLInputElement).value || null }) : setStep(index, { delayMinutes: Number((e.currentTarget as HTMLInputElement).value) })}
                    aria-label={step.messageType === "final" ? "Время финального сообщения" : `Повтор ${step.stepNumber - 1}, минут после основного`}
                    className="!m-0 !w-20 !min-w-0"
                    inputClassName="!min-h-11 !w-20 text-right"
                  />
                  <Button clear rounded type="button" className="!size-11 !min-w-11 !p-0 text-danger" aria-label={step.messageType === "final" ? "Удалить финальное сообщение" : `Удалить повтор ${step.stepNumber - 1}`} onClick={() => removeStep(index)}>
                    <Icon name="trash-2" className="size-5" />
                  </Button>
                </div>}
              />
            ))}
          </List>
          {draft.steps.length < draft.maxMessages ? <div className="grid gap-2 px-4 pt-3 sm:grid-cols-2">
            <Button clear rounded type="button" className={focusRing} onClick={addRepeat}>Добавить повтор</Button>
            {!draft.steps.some((step) => step.messageType === "final") ? <Button clear rounded type="button" className={focusRing} onClick={addFinal}>Добавить финал</Button> : null}
          </div> : null}
          <BlockTitle component="h3" className="!m-0 !mt-4 !p-0 !px-4">Дополнительно</BlockTitle>
          <List className="!my-0" strong inset dividers>
            <ListItem title="Разрешить пользовательское откладывание" after={<Toggle checked={draft.allowCustomSnooze} onChange={() => setDraft({ ...draft, allowCustomSnooze: !draft.allowCustomSnooze })} aria-label="Разрешить пользовательское откладывание" />} />
          </List>
          <div className="grid gap-2 px-4 pt-4"><p className="m-0 text-sm text-text-muted">Период тишины</p><Segmented strong rounded role="radiogroup" aria-label="Поведение в период тишины"><SegmentedButton type="button" active={draft.quietHoursBehavior === "defer"} aria-pressed={draft.quietHoursBehavior === "defer"} onClick={() => setDraft({ ...draft, quietHoursBehavior: "defer" })}>Перенести</SegmentedButton><SegmentedButton type="button" active={draft.quietHoursBehavior === "skip"} aria-pressed={draft.quietHoursBehavior === "skip"} onClick={() => setDraft({ ...draft, quietHoursBehavior: "skip" })}>Пропустить</SegmentedButton></Segmented></div>
          <p className={`m-0 min-h-5 px-4 pt-3 text-sm text-danger ${error ? "" : "invisible"}`} role={error ? "alert" : undefined}>{error || "\u00a0"}</p>
          <Button rounded large disabled={busy} className={`mx-4 mt-3 w-[calc(100%_-_2rem)] ${focusRing}`} onClick={save}>{busy ? "Сохраняем…" : "Сохранить политику"}</Button>
        </div>
      )}
    </Sheet>
  );
}
