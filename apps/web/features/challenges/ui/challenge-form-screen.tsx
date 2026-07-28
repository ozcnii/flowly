"use client";

import { Button, List, ListInput, ListItem, Preloader, Radio } from "konsta/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Icon } from "@flowly/ui";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { ApiError } from "@/lib/api/client";
import { useFriendsQuery } from "@/features/friends/model/friends-queries";
import { useCreateChallengeMutation } from "../model/challenges-queries";
import type { GoalType } from "@/lib/challenges/types";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";
const GOALS: Array<{ type: GoalType; label: string }> = [
  { type: "habit_count", label: "Выполнить привычку N раз" },
  { type: "workout_count", label: "N тренировок" },
  { type: "daily", label: "Заниматься N дней" },
  { type: "total_time", label: "N минут активности" },
];

const today = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
const plusDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

/** S-MA-086 — create challenge. */
export function ChallengeFormScreen() {
  const router = useRouter();
  const friends = useFriendsQuery();
  const create = useCreateChallengeMutation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("habit_count");
  const [goalValue, setGoalValue] = useState("7");
  const [startsOn, setStartsOn] = useState(today);
  const [endsOn, setEndsOn] = useState(() => plusDays(7));
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  const accepted = useMemo(
    () => (friends.data?.friends ?? []).filter((f) => f.status === "accepted" && f.peer),
    [friends.data],
  );

  const onSubmit = async () => {
    setError("");
    const value = Number(goalValue);
    if (!title.trim()) return setError("Укажите название.");
    if (!Number.isFinite(value) || value < 1) return setError("Цель ≥ 1.");
    try {
      const memberIds = Object.entries(picked)
        .filter(([, on]) => on)
        .map(([id]) => id);
      const res = await create.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        goalType,
        goalValue: value,
        startsOn,
        endsOn,
        memberIds,
      });
      router.replace(`/challenges/${encodeURIComponent(res.id)}` as never);
    } catch (e) {
      setError(e instanceof ApiError ? ((e.body as { message?: string })?.message ?? "Не удалось создать.") : "Ошибка сети.");
    }
  };

  return (
    <div className="min-h-dvh">
      <PrimaryNavbar title="Новый челлендж" />
      <main className="flow-screen gap-3 pb-safe-4">
        <List strong inset dividers>
          <ListInput title="" outline label="Название" value={title} onInput={(e) => setTitle(e.currentTarget.value)} />
          <ListInput
            title=""
            outline
            label="Описание"
            type="textarea"
            value={description}
            onInput={(e) => setDescription(e.currentTarget.value)}
          />
          <ListInput title="" outline label="Начало" type="date" value={startsOn} onInput={(e) => setStartsOn(e.currentTarget.value)} />
          <ListInput title="" outline label="Конец" type="date" value={endsOn} onInput={(e) => setEndsOn(e.currentTarget.value)} />
          <ListInput title="" outline label="Цель (число)" type="number" value={goalValue} onInput={(e) => setGoalValue(e.currentTarget.value)} />
        </List>

        <List strong inset dividers>
          {GOALS.map((g) => (
            <ListItem
              key={g.type}
              label
              title={g.label}
              after={<Radio component="div" name="goal" checked={goalType === g.type} onChange={() => setGoalType(g.type)} />}
            />
          ))}
        </List>

        {accepted.length > 0 ? (
          <List strong inset dividers>
            {accepted.map((f) => {
              const peer = f.peer!;
              const on = Boolean(picked[peer.id]);
              return (
                <ListItem
                  key={peer.id}
                  title={peer.username ? `${peer.firstName} (@${peer.username})` : peer.firstName}
                  subtitle={on ? "Приглашён" : "Не приглашён"}
                  after={
                    <Button
                      small
                      tonal
                      className={focusRing}
                      onClick={() => setPicked((p) => ({ ...p, [peer.id]: !p[peer.id] }))}
                    >
                      {on ? "Убрать" : "Пригласить"}
                    </Button>
                  }
                />
              );
            })}
          </List>
        ) : (
          <p className="m-0 px-4 text-sm text-text-muted">Нет друзей — челлендж можно создать только для себя, пригласить позже нельзя в v1 (добавьте друзей).</p>
        )}

        <p className="m-0 min-h-5 px-4 text-sm text-danger" aria-live="polite">
          {error}
        </p>
        <Button large rounded className={`w-full gap-2 ${focusRing}`} disabled={create.isPending} onClick={() => void onSubmit()}>
          {create.isPending ? <Preloader /> : <Icon name="flag" />}
          Создать
        </Button>
      </main>
    </div>
  );
}
