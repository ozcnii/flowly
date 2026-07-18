"use client";

import { Button, Card, Preloader } from "konsta/react";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Icon } from "@flowly/ui";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { ApiError } from "@/lib/api/client";
import { IMAGE_BLUR_DATA_URL } from "@/lib/image";
import { advanceLocalCheckpoint, readLocalCheckpoint, rebaseLocalCheckpoint, removeLocalCheckpoint, replaceLocalCheckpoint, type LocalCheckpoint } from "../model/local-checkpoint";
import { FINAL_STATUS_LABELS, formatSessionDuration, type CheckpointConflict, type FinalStatus, type SessionExercise, type WorkoutSession } from "../model/workout-session";
import { checkpointWorkoutSession, useCheckpointWorkoutSessionMutation, useFinishWorkoutSessionMutation, useWorkoutSessionQuery } from "../model/workout-session-queries";
import { FinishSessionSheet, SyncConflictSheet } from "./session-sheets";
import { useStepSounds } from "./use-step-sounds";

type Phase = "exercise" | "rest" | "done";
type SyncConflict = { local: LocalCheckpoint; server: WorkoutSession };
const conflictBody = (error: unknown): CheckpointConflict | null => error instanceof ApiError && error.status === 409 && typeof error.body === "object" && error.body !== null && "error" in error.body && error.body.error === "checkpoint_conflict" ? error.body as CheckpointConflict : null;
const exerciseDuration = (e: SessionExercise) => e.plannedDurationSeconds ?? e.durationSeconds ?? 0;
const exerciseReps = (e: SessionExercise) => e.repetitions ?? null;
const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

export function StepSessionScreen({ id }: { id: string }) {
  const router = useRouter(), query = useWorkoutSessionQuery(id), checkpoint = useCheckpointWorkoutSessionMutation(id), finish = useFinishWorkoutSessionMutation(id);
  const backgroundRef = useRef<HTMLDivElement>(null), finishSheetRef = useRef<HTMLElement>(null), conflictSheetRef = useRef<HTMLElement>(null);
  const sounds = useStepSounds();
  const initialized = useRef(""), tokenRef = useRef(""), accumulatedRef = useRef(0), positionRef = useRef(0), remainingRef = useRef(0), segmentUpRef = useRef(0), syncingRef = useRef(false), finishingRef = useRef(false), mountedRef = useRef(true);
  const runningRef = useRef(false);
  const [accumulated, setAccumulated] = useState(0);
  const [position, setPosition] = useState(0);
  const [phase, setPhase] = useState<Phase>("exercise");
  const [remaining, setRemaining] = useState(0);
  const [segmentUp, setSegmentUp] = useState(0);
  const [running, setRunning] = useState(false);
  const [finishOpened, setFinishOpened] = useState(false);
  const [conflict, setConflict] = useState<SyncConflict | null>(null);
  const [syncState, setSyncState] = useState<"synced" | "offline" | "storage-error">("synced");
  /** True only after the user just finished the last step (not on resume-into-done). */
  const [celebrating, setCelebrating] = useState(false);
  const exercises = useMemo(() => query.data?.session ? [...query.data.session.workout.exercises].sort((a, b) => a.position - b.position) : [], [query.data]);

  const setRunningSync = useCallback((value: boolean) => {
    // Keep interval in sync immediately — React state alone can miss the next 1s tick on auto-advance.
    runningRef.current = value;
    setRunning(value);
  }, []);

  const persist = useCallback((value: number, pos: number, paused: boolean, baseUpdatedAt = tokenRef.current) => { const snapshot = advanceLocalCheckpoint(id, value, 0, paused, baseUpdatedAt, pos); if (!snapshot && mountedRef.current) setSyncState("storage-error"); return snapshot; }, [id]);
  /**
   * Move to exercise index `pos` (or done when pos >= total).
   * `autoContinue`: keep the timer running so exercise→rest→exercise flows without extra taps
   * (real workout-app behavior once the user has pressed Продолжить once).
   */
  const applyPhase = useCallback((pos: number, total: number, opts?: { autoContinue?: boolean }) => {
    const next = Math.min(Math.max(0, pos), total);
    const done = total > 0 && next >= total;
    positionRef.current = next;
    setPosition(next);
    setPhase(done ? "done" : "exercise");
    segmentUpRef.current = 0;
    setSegmentUp(0);
    if (done) {
      remainingRef.current = 0;
      setRemaining(0);
      setRunningSync(false);
      return next;
    }
    if (mountedRef.current) setCelebrating(false);
    const ex = exercises[next];
    const dur = ex ? exerciseDuration(ex) : 0;
    remainingRef.current = dur > 0 ? dur : 0;
    setRemaining(remainingRef.current);
    // Auto-flow keeps running; manual nav (back / resume) pauses for intentional start.
    setRunningSync(Boolean(opts?.autoContinue));
    return next;
  }, [exercises, setRunningSync]);

  const applyServer = useCallback((session: WorkoutSession) => {
    const total = session.workout.exercises.length;
    const pos = session.currentExercisePosition ?? 0;
    tokenRef.current = session.updatedAt;
    accumulatedRef.current = session.accumulatedSeconds;
    replaceLocalCheckpoint(id, session.accumulatedSeconds, 0, true, session.updatedAt, pos);
    if (mountedRef.current) {
      setAccumulated(session.accumulatedSeconds);
      applyPhase(pos, total);
      setConflict(null);
      setSyncState("synced");
    }
  }, [applyPhase, id]);

  const sync = useCallback(async (paused: boolean, force = false, override?: { seconds: number; position: number; baseUpdatedAt: string }) => {
    if (!tokenRef.current) return;
    const value = override?.seconds ?? accumulatedRef.current, pos = override?.position ?? positionRef.current, baseUpdatedAt = override?.baseUpdatedAt ?? tokenRef.current, snapshot = persist(value, pos, paused, baseUpdatedAt);
    if (!snapshot || syncingRef.current) return;
    syncingRef.current = true;
    try { const data = await checkpoint.mutateAsync({ input: { accumulatedSeconds: snapshot.accumulatedSeconds, currentExercisePosition: snapshot.currentExercisePosition ?? undefined, paused: snapshot.paused, baseUpdatedAt, force } }); tokenRef.current = data.session.updatedAt; rebaseLocalCheckpoint(id, snapshot.revision, data.session); if (mountedRef.current) { setSyncState("synced"); setConflict(null); } }
    catch (error) {
      const body = conflictBody(error);
      if (body && mountedRef.current) {
        const local = readLocalCheckpoint(id) ?? snapshot;
        setRunningSync(false);
        // DEC-062 / video parity: elapsed delta <1s → auto-server, no sheet (same as YouTube sessions).
        // Do not force a chooser on position-only noise when times match.
        if (Math.abs(local.accumulatedSeconds - body.session.accumulatedSeconds) < 1) applyServer(body.session);
        else setConflict({ local, server: body.session });
      } else if (mountedRef.current && readLocalCheckpoint(id)) setSyncState("offline");
    }
    finally { syncingRef.current = false; }
  }, [applyServer, checkpoint, id, persist, setRunningSync]);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);
  useEffect(() => {
    const session = query.data?.session; if (!session || query.isFetching || initialized.current) return;
    tokenRef.current = session.updatedAt;
    const local = readLocalCheckpoint(session.id), sameToken = local?.baseUpdatedAt === session.updatedAt;
    // Video/YouTube parity (DEC-062): only real elapsed divergence (>=1s) opens S-MA-034.
    const realConflict = Boolean(local && !sameToken && Math.abs(local.accumulatedSeconds - session.accumulatedSeconds) >= 1);
    const frame = requestAnimationFrame(() => {
      initialized.current = "ready";
      if (local && realConflict) {
        setConflict({ local, server: session });
        accumulatedRef.current = session.accumulatedSeconds;
        setAccumulated(session.accumulatedSeconds);
        applyPhase(session.currentExercisePosition ?? 0, exercises.length);
        return;
      }
      // Stale token + trivial elapsed → take server (same as VideoSessionScreen).
      if (local && !sameToken) {
        applyServer(session);
        return;
      }
      const value = local ? Math.max(local.accumulatedSeconds, session.accumulatedSeconds) : session.accumulatedSeconds;
      const pos = local?.currentExercisePosition ?? session.currentExercisePosition ?? 0;
      accumulatedRef.current = value;
      setAccumulated(value);
      applyPhase(pos, exercises.length);
      replaceLocalCheckpoint(session.id, value, 0, true, session.updatedAt, pos);
      // Local ahead or needs pause rebase → silent force-sync, no sheet.
      if (local && (local.accumulatedSeconds > session.accumulatedSeconds || (local.currentExercisePosition ?? 0) !== (session.currentExercisePosition ?? 0))) {
        void sync(true);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [applyPhase, applyServer, exercises.length, query.data?.session, query.isFetching, sync]);

  const current = exercises[position], duration = current ? exerciseDuration(current) : 0, isCountdown = current ? duration > 0 : false;
  const canPlus30 = phase === "rest" || (phase === "exercise" && isCountdown);
  const gotoExercise = useCallback((pos: number, opts?: { autoContinue?: boolean }) => {
    const from = positionRef.current;
    const next = applyPhase(pos, exercises.length, opts);
    // Celebrate only when the user just crossed the last step (auto-advance / next / skip).
    if (exercises.length > 0 && from < exercises.length && next >= exercises.length) {
      sounds.celebrate();
      if (mountedRef.current) setCelebrating(true);
    }
    // autoContinue → not paused; manual jump → paused until user taps Продолжить
    persist(accumulatedRef.current, next, !opts?.autoContinue);
    if (opts?.autoContinue && next < exercises.length) void sync(false);
  }, [applyPhase, exercises.length, persist, sounds, sync]);
  const advancePhase = useCallback((from: Phase) => {
    // Auto pipeline: exercise countdown → rest countdown (if restSeconds>0) → next exercise, timer stays on.
    if (from === "exercise") {
      const ex = exercises[positionRef.current];
      const rest = ex?.restSeconds ?? 0;
      if (rest > 0) {
        setPhase("rest");
        remainingRef.current = rest;
        setRemaining(rest);
        setRunningSync(true);
        persist(accumulatedRef.current, positionRef.current, false);
        sounds.restStart();
        return;
      }
    }
    sounds.nextExercise();
    gotoExercise(positionRef.current + 1, { autoContinue: true });
  }, [exercises, gotoExercise, persist, setRunningSync, sounds]);
  const latest = useRef({ phase, isCountdown, advancePhase, persist, sync, running, countdownTick: sounds.countdownTick });
  useEffect(() => { latest.current = { phase, isCountdown, advancePhase, persist, sync, running, countdownTick: sounds.countdownTick }; runningRef.current = running; });
  useEffect(() => {
    const interval = setInterval(() => {
      if (!runningRef.current) return;
      const { phase: p, isCountdown: cd, advancePhase: advance, persist: per, countdownTick } = latest.current;
      if (p === "done") return;
      accumulatedRef.current += 1; setAccumulated(accumulatedRef.current);
      if ((cd && p === "exercise") || p === "rest") {
        remainingRef.current -= 1;
        setRemaining(remainingRef.current);
        // Last 5 seconds: audible countdown tick (quality cue that time is nearly up).
        if (remainingRef.current >= 1 && remainingRef.current <= 5) countdownTick(remainingRef.current);
        if (remainingRef.current <= 0) { advance(p); return; }
      } else {
        segmentUpRef.current += 1;
        setSegmentUp(segmentUpRef.current);
      }
      per(accumulatedRef.current, positionRef.current, false);
    }, 1_000);
    const server = setInterval(() => { if (runningRef.current) void latest.current.sync(false); }, 15_000);
    return () => { clearInterval(interval); clearInterval(server); };
  }, []);

  const toggleRun = () => {
    if (phase === "done") return;
    // First gesture unlocks Web Audio inside Telegram iOS WebView (autoplay policy).
    sounds.unlock();
    if (running) {
      setRunningSync(false);
      sounds.pause();
      void sync(true);
    } else {
      setRunningSync(true);
      sounds.start();
      void sync(false);
    }
  };
  const plus30 = () => { if (!canPlus30) return; remainingRef.current += 30; setRemaining(remainingRef.current); };
  /** Next keeps rest phase then auto-runs; Skip jumps past exercise+rest and auto-runs. */
  const nextAction = () => {
    sounds.unlock();
    if (phase === "rest") {
      sounds.nextExercise();
      gotoExercise(positionRef.current + 1, { autoContinue: true });
      return;
    }
    advancePhase("exercise");
  };
  const back = () => {
    if (phase === "rest") {
      // Return into the current exercise instead of dead-ending on rest; pause for intentional resume.
      const ex = exercises[positionRef.current];
      const dur = ex ? exerciseDuration(ex) : 0;
      setPhase("exercise");
      setRunningSync(false);
      segmentUpRef.current = 0;
      setSegmentUp(0);
      remainingRef.current = dur > 0 ? dur : 0;
      setRemaining(remainingRef.current);
      persist(accumulatedRef.current, positionRef.current, true);
      return;
    }
    if (positionRef.current > 0) gotoExercise(positionRef.current - 1);
  };
  const skip = () => { sounds.unlock(); sounds.nextExercise(); gotoExercise(positionRef.current + 1, { autoContinue: true }); };
  const resumeExercises = () => { if (exercises.length === 0) return; gotoExercise(Math.max(0, exercises.length - 1)); };
  /** Mid-session finish still needs status chooser; full pipeline done already implies completed. */
  const openFinish = () => { finishingRef.current = true; setRunningSync(false); persist(accumulatedRef.current, positionRef.current, true); setFinishOpened(true); };
  const submitFinish = async (status: FinalStatus, comment: string) => { if (checkpoint.isPending || finish.isPending) return; try { await finish.mutateAsync({ accumulatedSeconds: accumulatedRef.current, playbackPositionSeconds: 0, finalStatus: status, comment: comment || undefined, baseUpdatedAt: tokenRef.current }); removeLocalCheckpoint(id); setFinishOpened(false); router.push(`/calendar` as never); } catch (error) { const body = conflictBody(error); if (body) { const local = readLocalCheckpoint(id) ?? persist(accumulatedRef.current, positionRef.current, true); if (local) { setFinishOpened(false); setConflict({ local, server: body.session }); } } } };
  /** Done screen: all steps already finished → save as completed without re-asking status. */
  const finishCompletedDirect = () => { finishingRef.current = true; setRunningSync(false); persist(accumulatedRef.current, positionRef.current, true); void submitFinish("completed", ""); };
  const finishClose = useCallback(() => { finishingRef.current = false; setFinishOpened(false); void sync(true); }, [sync]);
  const useServer = () => { if (conflict) applyServer(conflict.server); };
  const selectDevice = async () => {
    if (!conflict) return;
    const selected = conflict;
    const total = selected.server.workout.exercises.length;
    const pos = selected.local.currentExercisePosition ?? 0;
    tokenRef.current = selected.server.updatedAt;
    accumulatedRef.current = selected.local.accumulatedSeconds;
    setAccumulated(selected.local.accumulatedSeconds);
    applyPhase(pos, total);
    replaceLocalCheckpoint(id, selected.local.accumulatedSeconds, 0, selected.local.paused, selected.server.updatedAt, pos);
    await sync(selected.local.paused, true, { seconds: selected.local.accumulatedSeconds, position: pos, baseUpdatedAt: selected.server.updatedAt });
  };

  const flush = useCallback(() => { if (!tokenRef.current) return; const snapshot = advanceLocalCheckpoint(id, accumulatedRef.current, 0, true, tokenRef.current, positionRef.current); if (!snapshot) return; void checkpointWorkoutSession(id, { accumulatedSeconds: snapshot.accumulatedSeconds, currentExercisePosition: snapshot.currentExercisePosition ?? undefined, paused: true, baseUpdatedAt: snapshot.baseUpdatedAt }, true).then(({ session }) => rebaseLocalCheckpoint(id, snapshot.revision, session)).catch(() => undefined); }, [id]);
  useEffect(() => { addEventListener("pagehide", flush); return () => removeEventListener("pagehide", flush); }, [flush]);
  useEffect(() => { let armed = false; const frame = requestAnimationFrame(() => { armed = true; }); return () => { cancelAnimationFrame(frame); if (armed) flush(); }; }, [flush]);
  useEffect(() => { const retry = () => void sync(true); addEventListener("online", retry); return () => removeEventListener("online", retry); }, [sync]);

  if (query.isPending) return <Shell><div className="grid min-h-64 place-items-center" role="status"><Preloader /><span className="sr-only">Загружаем сессию</span></div></Shell>;
  if (query.isError || !query.data?.session) return <Shell><Card component="section" outline role="alert" contentWrapPadding="grid justify-items-center gap-3 p-6 text-center"><Icon name="triangle-alert" /><h1 className="m-0 text-lg font-semibold">Сессия недоступна</h1><Button component={NextLink} href="/catalog" rounded>Открыть каталог</Button></Card></Shell>;
  const session = query.data.session;
  if (session.state === "closed") return <Shell><Card component="section" outline contentWrapPadding="grid justify-items-center gap-3 p-6 text-center"><Icon name="circle-check" /><h1 className="m-0 text-lg font-semibold">Сессия завершена</h1><p className="m-0 text-sm text-text-muted">{session.finalStatus ? FINAL_STATUS_LABELS[session.finalStatus] : "Результат сохранён"}</p><Button component={NextLink} href="/calendar" rounded>Открыть календарь</Button></Card></Shell>;

  const statusText = syncState === "storage-error" ? "Не удалось сохранить прогресс на устройстве. Не закрывайте тренировку" : syncState === "offline" ? "Нет связи · прогресс сохранён" : phase === "done" ? "Все упражнения пройдены" : phase === "rest" ? "Отдых" : running ? "Идёт тренировка" : "Пауза";
  const mainTimer = phase === "done" ? formatSessionDuration(accumulated) : phase === "rest" || (isCountdown && phase === "exercise") ? formatSessionDuration(remaining) : formatSessionDuration(segmentUp);
  const progressTotal = exercises.length;
  const isLastExercise = progressTotal > 0 && position === progressTotal - 1;
  const hasRestAfterCurrent = Boolean(current?.restSeconds && current.restSeconds > 0);
  // On the last step, «›» / «Пропустить» finish the pipeline — not another exercise.
  // Exception: last exercise still has a rest segment ahead → › still means «to rest».
  const nextCompletesSteps = isLastExercise && (phase === "rest" || !hasRestAfterCurrent);
  const skipCompletesSteps = isLastExercise; // skip always jumps past rest → done on last
  const progressBadge = phase === "rest"
    ? (isLastExercise ? "Отдых · последний" : "Отдых")
    : isLastExercise
      ? `Последнее · ${position + 1} / ${progressTotal}`
      : `Упражнение ${position + 1} / ${progressTotal}`;
  const skipLabel = phase === "rest"
    ? (skipCompletesSteps ? "К итогу" : "Пропустить отдых")
    : skipCompletesSteps
      ? "К итогу"
      : "Пропустить";
  const nextAriaLabel = phase === "rest"
    ? (nextCompletesSteps ? "Завершить упражнения" : "К следующему упражнению")
    : nextCompletesSteps
      ? "Завершить упражнения"
      : "Следующее упражнение";

  return <>
    <Shell rootRef={backgroundRef}>
      {/* Workout name lives on detail/start; during step runtime primary = current exercise (navbar stays «Тренировка»). */}
      <Card component="section" contentWrap={false} outline className="m-0 overflow-hidden">
        {phase === "done" ? <div className="relative grid gap-3 overflow-hidden p-4">
          <CelebrationBurst active={celebrating} />
          <div className={`grid place-items-center gap-2 py-6 text-center ${celebrating ? "step-celebrate-pop" : ""}`}>
            <span className={`grid size-16 place-items-center rounded-full bg-accent-soft text-accent ${celebrating ? "step-celebrate-badge" : ""}`} aria-hidden>
              <Icon name="circle-check" className="size-10" />
            </span>
            <p className="m-0 text-xl font-semibold">{celebrating ? "Ура! Молодцы!" : "Все упражнения пройдены"}</p>
            {celebrating && <p className="m-0 text-base font-medium text-accent">Тренировка пройдена до конца</p>}
            <p className="m-0 text-sm text-text-muted">Итог: {formatSessionDuration(accumulated)}</p>
            <p className="m-0 max-w-xs text-sm leading-relaxed text-text-muted">Сохраним как выполненную. Можно вернуться к шагам — сессия ещё открыта.</p>
          </div>
          {/* Full pipeline done → completed directly (no redundant status sheet). Mid-session «Завершить» still opens sheet. */}
          <Button large rounded className={`w-full gap-2 ${focusRing}`} disabled={Boolean(conflict) || finish.isPending || checkpoint.isPending} onClick={finishCompletedDirect}><Icon name="circle-check" />{finish.isPending ? "Сохраняем…" : "Сохранить результат"}</Button>
          <Button large rounded tonal className={`w-full gap-2 ${focusRing}`} disabled={finish.isPending} onClick={resumeExercises}><Icon name="chevron-left" />Вернуться к упражнениям</Button>
          <Button clear rounded component={NextLink} href="/" className={focusRing}>На главную</Button>
        </div> : <>
          {(() => {
            const nextEx = exercises[position + 1];
            const media = phase === "rest" ? (nextEx ?? null) : current;
            const mediaKey = media?.mediaObjectKey ?? null;
            const isGif = Boolean(media && (media.mediaType === "gif" || mediaKey?.endsWith(".gif")));
            return <div className="relative aspect-video bg-accent-soft">
              {mediaKey ? (
                isGif
                  ? <img src={`/media/${mediaKey}`} alt={media?.title ?? ""} className={`absolute inset-0 size-full object-cover ${phase === "rest" ? "opacity-45" : ""}`} decoding="async" />
                  : <Image src={`/media/${mediaKey}`} alt={media?.title ?? ""} fill sizes="(max-width: 430px) calc(100vw - 40px), 640px" className={`object-cover ${phase === "rest" ? "opacity-45" : ""}`} placeholder="blur" blurDataURL={IMAGE_BLUR_DATA_URL} decoding="async" />
              ) : (
                <div className="absolute inset-0 grid place-items-center"><Icon name="dumbbell" className="size-10 text-text-muted" /></div>
              )}
              {phase === "rest" && (
                <div className="absolute inset-0 grid place-items-center bg-gradient-to-t from-black/55 via-black/25 to-black/15 p-4 text-center">
                  <div className="grid max-w-[18rem] justify-items-center gap-1.5">
                    <span className="grid size-12 place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm" aria-hidden><Icon name="timer" className="size-6" /></span>
                    <p className="m-0 text-lg font-semibold text-white">Отдых</p>
                    <p className="m-0 text-sm font-medium text-white/90">{nextCompletesSteps ? "Дальше — итог" : nextEx ? `Далее: ${nextEx.title}` : "Перерыв"}</p>
                  </div>
                </div>
              )}
              <div className="absolute left-4 top-4"><span className="rounded-full bg-black/55 px-3 py-1 text-sm font-medium text-white">{progressBadge}</span></div>
            </div>;
          })()}
          <div className="grid gap-3 p-4">
            <p className="m-0 min-h-[2.25rem] text-center text-2xl font-semibold leading-tight line-clamp-2" title={phase === "rest" ? "Отдых" : current?.title}>{phase === "rest" ? "Отдых" : current?.title ?? ""}</p>
            <p className="m-0 min-h-[1.25rem] text-center text-sm text-text-muted">{phase === "exercise" && current && exerciseReps(current) != null ? `${exerciseReps(current)} повторений` : phase === "rest" && !nextCompletesSteps && exercises[position + 1] ? `Готовимся к «${exercises[position + 1]?.title ?? ""}»` : ""}</p>
            <p className="m-0 text-center text-5xl font-semibold tabular-nums" aria-live="off">{mainTimer}</p>
            <p className="m-0 min-h-[1.25rem] text-center text-sm text-text-muted" role="status" aria-live="polite">{statusText}</p>
            <p className="m-0 min-h-[3.75rem] text-center text-sm leading-relaxed text-text-muted [overflow-wrap:anywhere] line-clamp-3">{phase === "rest" ? (nextCompletesSteps ? "Отдышитесь — затем сохраним результат." : `Спокойно подышите. Следующее: ${exercises[position + 1]?.title ?? "завершение"}.`) : current?.description ?? ""}</p>
            <Button large rounded className={`w-full gap-2 ${focusRing}`} onClick={toggleRun}><Icon name={running ? "pause" : "play"} />{running ? "Пауза" : "Продолжить"}</Button>
            {/*
              Transport: ‹ · Skip · › on normal steps.
              On the last step that finishes the pipeline: Skip → «К итогу», › → check (not another chevron).
            */}
            <div className="flex items-center gap-2">
              <Button large rounded tonal aria-label={phase === "rest" ? "Вернуться к упражнению" : "Предыдущее упражнение"} className={focusRing} disabled={phase === "exercise" && position === 0} onClick={back}><Icon name="chevron-left" className="size-5" /></Button>
              <Button large rounded tonal className={`min-h-11 flex-1 whitespace-nowrap ${focusRing}`} onClick={skip}>{skipLabel}</Button>
              <Button large rounded tonal className={focusRing} aria-label={nextAriaLabel} onClick={nextAction}>
                <Icon name={nextCompletesSteps ? "circle-check" : "chevron-right"} className="size-5" />
              </Button>
            </div>
            <div className="grid min-h-[3rem] place-items-center">{canPlus30 && <Button large rounded outline className={`min-h-11 w-full gap-2 whitespace-nowrap ${focusRing}`} disabled={!running} onClick={plus30}>+30 секунд</Button>}</div>
            <Button large rounded outline colors={{ textIos: "text-danger", outlineBorderIos: "border-danger" }} className={`w-full gap-2 ${focusRing}`} disabled={Boolean(conflict)} onClick={openFinish}><Icon name="square" />Завершить</Button>
          </div>
        </>}
      </Card>
    </Shell>

    <FinishSessionSheet opened={finishOpened} sheetRef={finishSheetRef} backgroundRef={backgroundRef} finishPending={finish.isPending} checkpointPending={checkpoint.isPending} finishError={finish.isError} onClose={finishClose} onSubmit={(status, comment) => void submitFinish(status, comment)} />
    <SyncConflictSheet conflict={conflict ? { localSeconds: conflict.local.accumulatedSeconds, serverSeconds: conflict.server.accumulatedSeconds } : null} sheetRef={conflictSheetRef} backgroundRef={backgroundRef} pending={checkpoint.isPending} onUseServer={useServer} onSelectDevice={selectDevice} />
  </>;
}

function Shell({ children, rootRef }: { children: React.ReactNode; rootRef?: RefObject<HTMLDivElement | null> }) { return <div ref={rootRef} className="min-h-dvh"><PrimaryNavbar title="Тренировка" /><main className="flow-screen">{children}</main></div>; }

/** Lightweight CSS confetti + pop — no assets, no layout shift (absolute overlay). */
const CONFETTI = [
  { left: "8%", delay: "0ms", dx: "-18px", dy: "110px", rot: "-40deg", color: "var(--color-accent, #7eb8a2)" },
  { left: "22%", delay: "40ms", dx: "12px", dy: "130px", rot: "55deg", color: "#f5c16c" },
  { left: "38%", delay: "80ms", dx: "-8px", dy: "120px", rot: "20deg", color: "#e8a0bf" },
  { left: "52%", delay: "30ms", dx: "20px", dy: "140px", rot: "-70deg", color: "var(--color-accent, #7eb8a2)" },
  { left: "66%", delay: "90ms", dx: "-14px", dy: "115px", rot: "35deg", color: "#8ec5e8" },
  { left: "78%", delay: "50ms", dx: "10px", dy: "125px", rot: "-25deg", color: "#f5c16c" },
  { left: "90%", delay: "70ms", dx: "-6px", dy: "135px", rot: "48deg", color: "#e8a0bf" },
  { left: "15%", delay: "110ms", dx: "16px", dy: "100px", rot: "-55deg", color: "#8ec5e8" },
  { left: "45%", delay: "20ms", dx: "-22px", dy: "145px", rot: "62deg", color: "var(--color-accent, #7eb8a2)" },
  { left: "72%", delay: "100ms", dx: "8px", dy: "105px", rot: "-18deg", color: "#f5c16c" },
  { left: "30%", delay: "60ms", dx: "4px", dy: "150px", rot: "30deg", color: "#e8a0bf" },
  { left: "58%", delay: "0ms", dx: "-12px", dy: "118px", rot: "-45deg", color: "#8ec5e8" },
] as const;

function CelebrationBurst({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
      <style>{`
        @keyframes step-celebrate-pop {
          0% { transform: scale(0.82); opacity: 0; }
          55% { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes step-celebrate-badge {
          0% { transform: scale(0.5) rotate(-12deg); }
          60% { transform: scale(1.12) rotate(6deg); }
          100% { transform: scale(1) rotate(0); }
        }
        @keyframes step-celebrate-confetti {
          0% { transform: translate3d(0, -8px, 0) rotate(0deg); opacity: 0; }
          12% { opacity: 1; }
          100% { transform: translate3d(var(--dx), var(--dy), 0) rotate(var(--rot)); opacity: 0; }
        }
        .step-celebrate-pop { animation: step-celebrate-pop 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .step-celebrate-badge { animation: step-celebrate-badge 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .step-celebrate-piece {
          position: absolute;
          top: 12%;
          width: 8px;
          height: 12px;
          border-radius: 2px;
          opacity: 0;
          animation: step-celebrate-confetti 1.15s cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
        }
      `}</style>
      {CONFETTI.map((piece, index) => (
        <span
          key={index}
          className="step-celebrate-piece"
          style={{
            left: piece.left,
            background: piece.color,
            animationDelay: piece.delay,
            // CSS custom props for keyframes
            ["--dx" as string]: piece.dx,
            ["--dy" as string]: piece.dy,
            ["--rot" as string]: piece.rot,
          }}
        />
      ))}
    </div>
  );
}
