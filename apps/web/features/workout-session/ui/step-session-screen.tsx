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

type Phase = "intro" | "exercise" | "rest" | "done";
type SyncConflict = { local: LocalCheckpoint; server: WorkoutSession };
const conflictBody = (error: unknown): CheckpointConflict | null => error instanceof ApiError && error.status === 409 && typeof error.body === "object" && error.body !== null && "error" in error.body && error.body.error === "checkpoint_conflict" ? error.body as CheckpointConflict : null;
const exerciseDuration = (e: SessionExercise) => e.plannedDurationSeconds ?? e.durationSeconds ?? 0;
const exerciseReps = (e: SessionExercise) => e.repetitions ?? null;
const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";
/** Pre-exercise VO window: announce title + description before work timer. */
const INTRO_SECONDS = 5;

export function StepSessionScreen({ id }: { id: string }) {
  const router = useRouter(), query = useWorkoutSessionQuery(id), checkpoint = useCheckpointWorkoutSessionMutation(id), finish = useFinishWorkoutSessionMutation(id);
  const backgroundRef = useRef<HTMLDivElement>(null), finishSheetRef = useRef<HTMLElement>(null), conflictSheetRef = useRef<HTMLElement>(null);
  const sounds = useStepSounds();
  const initialized = useRef(""), tokenRef = useRef(""), accumulatedRef = useRef(0), positionRef = useRef(0), remainingRef = useRef(0), segmentUpRef = useRef(0), syncingRef = useRef(false), finishingRef = useRef(false), mountedRef = useRef(true);
  const runningRef = useRef(false);
  /** Position for which full intro VO already played — resume says only «Начинайте». */
  const introAnnouncedRef = useRef(-1);
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
   * Default: **intro** 5s + full VO (first start / skip to new step).
   * After rest: `skipIntro` → work timer immediately + only «Начинайте» (rest already named the next).
   */
  const applyPhase = useCallback((pos: number, total: number, opts?: { autoContinue?: boolean; announce?: boolean; skipIntro?: boolean }) => {
    const next = Math.min(Math.max(0, pos), total);
    const done = total > 0 && next >= total;
    // Set phase before position so we never paint exercise chrome with past-end index (done flash).
    if (done) {
      setPhase("done");
      positionRef.current = next;
      setPosition(next);
      segmentUpRef.current = 0;
      setSegmentUp(0);
      remainingRef.current = 0;
      setRemaining(0);
      setRunningSync(false);
      return next;
    }
    if (mountedRef.current) setCelebrating(false);
    const ex = exercises[next];
    const auto = Boolean(opts?.autoContinue);
    positionRef.current = next;
    setPosition(next);
    segmentUpRef.current = 0;
    setSegmentUp(0);
    // After rest: no second 5s prep — exercise already announced during rest.
    if (opts?.skipIntro) {
      const dur = ex ? exerciseDuration(ex) : 0;
      setPhase("exercise");
      remainingRef.current = dur > 0 ? dur : 0;
      setRemaining(remainingRef.current);
      setRunningSync(auto);
      introAnnouncedRef.current = next;
      if (auto || opts?.announce) {
        sounds.unlock();
        sounds.sayStart();
      }
      return next;
    }
    setPhase("intro");
    remainingRef.current = INTRO_SECONDS;
    setRemaining(INTRO_SECONDS);
    setRunningSync(auto);
    if (opts?.announce || auto) {
      sounds.unlock();
      introAnnouncedRef.current = next;
      sounds.announceExercise(ex?.title ?? "Упражнение", ex?.description);
    } else {
      introAnnouncedRef.current = -1;
    }
    return next;
  }, [exercises, setRunningSync, sounds]);

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
  const gotoExercise = useCallback((pos: number, opts?: { autoContinue?: boolean; announce?: boolean; skipIntro?: boolean }) => {
    const from = positionRef.current;
    const next = applyPhase(pos, exercises.length, opts);
    // Celebrate only when the user just crossed the last step (auto-advance / next / skip).
    if (exercises.length > 0 && from < exercises.length && next >= exercises.length) {
      sounds.celebrate();
      if (mountedRef.current) {
        setCelebrating(true);
        // Keep confetti/pop visible ~2.6s (was ~1s and felt too short).
        window.setTimeout(() => { if (mountedRef.current) setCelebrating(false); }, 2_600);
      }
    }
    // autoContinue → not paused; manual jump → paused until user taps Продолжить
    persist(accumulatedRef.current, next, !opts?.autoContinue);
    if (opts?.autoContinue && next < exercises.length) void sync(false);
  }, [applyPhase, exercises.length, persist, sounds, sync]);
  const advancePhase = useCallback((from: Phase) => {
    // Pipeline: intro → exercise → rest (if restSeconds>0) → intro(next)…, timer stays on after first Продолжить.
    if (from === "intro") {
      const ex = exercises[positionRef.current];
      const dur = ex ? exerciseDuration(ex) : 0;
      setPhase("exercise");
      segmentUpRef.current = 0;
      setSegmentUp(0);
      remainingRef.current = dur > 0 ? dur : 0;
      setRemaining(remainingRef.current);
      setRunningSync(true);
      persist(accumulatedRef.current, positionRef.current, false);
      sounds.softCue();
      return;
    }
    if (from === "exercise") {
      const ex = exercises[positionRef.current];
      const rest = ex?.restSeconds ?? 0;
      if (rest > 0) {
        const nextEx = exercises[positionRef.current + 1];
        setPhase("rest");
        remainingRef.current = rest;
        setRemaining(rest);
        setRunningSync(true);
        persist(accumulatedRef.current, positionRef.current, false);
        sounds.restStart(nextEx?.title, nextEx?.description);
        return;
      }
      // No rest: intro + full VO for next exercise.
      sounds.softCue();
      gotoExercise(positionRef.current + 1, { autoContinue: true, announce: true });
      return;
    }
    if (from === "rest") {
      // Rest already named the next exercise — work timer + «Начинайте» only.
      sounds.softCue();
      gotoExercise(positionRef.current + 1, { autoContinue: true, skipIntro: true });
    }
  }, [exercises, gotoExercise, persist, setRunningSync, sounds]);
  const latest = useRef({ phase, isCountdown, advancePhase, persist, sync, running, countdownTick: sounds.countdownTick });
  useEffect(() => { latest.current = { phase, isCountdown, advancePhase, persist, sync, running, countdownTick: sounds.countdownTick }; runningRef.current = running; });
  useEffect(() => {
    const interval = setInterval(() => {
      if (!runningRef.current) return;
      const { phase: p, isCountdown: cd, advancePhase: advance, persist: per, countdownTick } = latest.current;
      if (p === "done") return;
      accumulatedRef.current += 1; setAccumulated(accumulatedRef.current);
      if (p === "intro" || p === "rest" || (cd && p === "exercise")) {
        remainingRef.current -= 1;
        setRemaining(remainingRef.current);
        // Tick only on work countdown — not during intro VO or rest VO (would fight speech).
        if (p === "exercise" && remainingRef.current >= 1 && remainingRef.current <= 5) countdownTick(remainingRef.current);
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
      if (phase === "intro") {
        // First start of this step → full VO; after pause → only «Начинайте».
        if (introAnnouncedRef.current === position) sounds.sayStart();
        else {
          introAnnouncedRef.current = position;
          sounds.announceExercise(current?.title ?? "Упражнение", current?.description);
        }
      } else {
        sounds.sayStart();
      }
      void sync(false);
    }
  };
  const plus30 = () => { if (!canPlus30) return; remainingRef.current += 30; setRemaining(remainingRef.current); };
  /** › advances pipeline; Skip jumps to next exercise intro. Soft chime only — no «Следующее» spam. */
  const nextAction = () => {
    sounds.unlock();
    if (phase === "intro") { advancePhase("intro"); return; }
    if (phase === "rest") {
      // Rest already VO'd next exercise — jump straight into work + «Начинайте».
      sounds.softCue();
      gotoExercise(positionRef.current + 1, { autoContinue: true, skipIntro: true });
      return;
    }
    advancePhase("exercise");
  };
  const back = () => {
    if (phase === "rest" || phase === "intro") {
      // Re-enter intro of current exercise paused (intentional resume).
      const ex = exercises[positionRef.current];
      setPhase("intro");
      setRunningSync(false);
      segmentUpRef.current = 0;
      setSegmentUp(0);
      remainingRef.current = INTRO_SECONDS;
      setRemaining(INTRO_SECONDS);
      persist(accumulatedRef.current, positionRef.current, true);
      return;
    }
    if (positionRef.current > 0) gotoExercise(positionRef.current - 1);
  };
  const skip = () => {
    sounds.unlock();
    sounds.softCue();
    // From rest: next already VO'd → no second prep. Else: intro + full VO for the new step.
    if (phase === "rest") gotoExercise(positionRef.current + 1, { autoContinue: true, skipIntro: true });
    else gotoExercise(positionRef.current + 1, { autoContinue: true, announce: true });
  };
  /** Repeat workout in the same open session: reset timer + intro of first exercise. */
  const restartWorkout = () => {
    if (exercises.length === 0) return;
    sounds.unlock();
    setCelebrating(false);
    finishingRef.current = false;
    setFinishOpened(false);
    introAnnouncedRef.current = -1;
    accumulatedRef.current = 0;
    setAccumulated(0);
    applyPhase(0, exercises.length, { autoContinue: false, announce: false });
    persist(0, 0, true);
    void sync(true, true, { seconds: 0, position: 0, baseUpdatedAt: tokenRef.current });
  };
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

  // Guard against one-frame flash: past-end position always shows done UI.
  const showDone = phase === "done" || (exercises.length > 0 && position >= exercises.length);
  const notStarted = !running && accumulated === 0 && position === 0 && (phase === "intro" || phase === "exercise");
  const runLabel = running ? "Пауза" : notStarted ? "Начать" : "Продолжить";
  const statusText = syncState === "storage-error" ? "Не удалось сохранить прогресс на устройстве. Не закрывайте тренировку" : syncState === "offline" ? "Нет связи · прогресс сохранён" : phase === "done" ? "Все упражнения пройдены" : phase === "intro" ? (running ? "Подготовка" : "Готово к старту") : phase === "rest" ? "Отдых" : running ? "Идёт тренировка" : notStarted ? "Готово к старту" : "Пауза";
  const mainTimer = phase === "done" ? formatSessionDuration(accumulated) : phase === "intro" || phase === "rest" || (isCountdown && phase === "exercise") ? formatSessionDuration(remaining) : formatSessionDuration(segmentUp);
  const progressTotal = exercises.length;
  const isLastExercise = progressTotal > 0 && position === progressTotal - 1;
  const hasRestAfterCurrent = Boolean(current?.restSeconds && current.restSeconds > 0);
  // On the last step, «›» / «Пропустить» finish the pipeline — not another exercise.
  // Exception: last exercise still has a rest segment ahead → › still means «to rest».
  // › finishes pipeline only on last rest, or last exercise without rest (not during intro).
  const nextCompletesSteps = isLastExercise && (phase === "rest" || (phase === "exercise" && !hasRestAfterCurrent));
  // Skip jumps past current step; on last intro/exercise/rest → done.
  const skipCompletesSteps = isLastExercise;
  const progressBadge = phase === "rest"
    ? (isLastExercise ? "Отдых · последний" : "Отдых")
    : phase === "intro"
      ? `Подготовка · ${position + 1} / ${progressTotal}`
      : isLastExercise
        ? `Последнее · ${position + 1} / ${progressTotal}`
        : `Упражнение ${position + 1} / ${progressTotal}`;
  const skipLabel = phase === "rest"
    ? (skipCompletesSteps ? "К итогу" : "Пропустить отдых")
    : phase === "intro"
      ? (skipCompletesSteps ? "К итогу" : "Пропустить")
      : skipCompletesSteps
        ? "К итогу"
        : "Пропустить";
  const nextAriaLabel = phase === "intro"
    ? "Начать упражнение"
    : phase === "rest"
      ? (nextCompletesSteps ? "Завершить упражнения" : "К следующему упражнению")
      : nextCompletesSteps
        ? "Завершить упражнения"
        : "Следующее упражнение";

  return <>
    <Shell rootRef={backgroundRef}>
      {/* Workout name lives on detail/start; during step runtime primary = current exercise (navbar stays «Тренировка»). */}
      <Card component="section" contentWrap={false} outline className="m-0 overflow-hidden">
        {showDone ? <div className="relative grid gap-3 overflow-hidden p-4">
          <CelebrationBurst active={celebrating} />
          {/* Static copy only — no title swap / reserved ghost lines (layout gap). Confetti is overlay-only. */}
          <div className={`grid place-items-center gap-2 py-4 text-center ${celebrating ? "step-celebrate-pop" : ""}`}>
            <span className={`grid size-16 place-items-center rounded-full bg-accent-soft text-accent ${celebrating ? "step-celebrate-badge" : ""}`} aria-hidden>
              <Icon name="circle-check" className="size-10" />
            </span>
            <p className="m-0 text-xl font-semibold leading-snug">Все упражнения пройдены</p>
            <p className="m-0 text-sm tabular-nums text-text-muted">Итог: {formatSessionDuration(accumulated)}</p>
            <p className="m-0 max-w-xs text-sm leading-relaxed text-text-muted">Сохраните результат или начните сначала.</p>
          </div>
          <Button large rounded className={`w-full gap-2 ${focusRing}`} disabled={Boolean(conflict) || finish.isPending || checkpoint.isPending} onClick={finishCompletedDirect}><Icon name="circle-check" />{finish.isPending ? "Сохраняем…" : "Сохранить результат"}</Button>
          <Button large rounded tonal className={`w-full gap-2 ${focusRing}`} disabled={finish.isPending || Boolean(conflict)} onClick={restartWorkout}><Icon name="play" />Начать сначала</Button>
          <Button large rounded outline component={NextLink} href={`/workouts/${session.workout.id}` as never} className={`w-full gap-2 ${focusRing}`} disabled={finish.isPending}><Icon name="chevron-left" />К тренировке</Button>
          <Button large rounded outline component={NextLink} href="/catalog" className={`w-full gap-2 ${focusRing}`} disabled={finish.isPending}>В каталог</Button>
          <Button clear rounded component={NextLink} href="/" className={focusRing}>На главную</Button>
        </div> : <>
          {(() => {
            const nextEx = exercises[position + 1];
            // Rest preview = next; intro/work = current.
            const media = phase === "rest" ? (nextEx ?? null) : current;
            const mediaKey = media?.mediaObjectKey ?? null;
            const key = mediaKey ?? "";
            const isVideo = Boolean(media && (media.mediaType === "video" || /\.mp4($|\?)/i.test(key)));
            const isGif = Boolean(media && (media.mediaType === "gif" || key.endsWith(".gif")));
            // Square assets (1:1, white bg) sit in 16:9 frame: white letterbox + object-contain full height.
            return <div className="relative aspect-video bg-white">
              {mediaKey ? (
                isVideo
                  ? <video key={mediaKey} src={`/media/${mediaKey}`} className={`absolute inset-0 size-full object-contain ${phase === "rest" ? "opacity-45" : ""}`} autoPlay loop muted playsInline preload="auto" aria-label={media?.title ?? ""} />
                  : isGif
                    ? <img src={`/media/${mediaKey}`} alt={media?.title ?? ""} className={`absolute inset-0 size-full object-contain ${phase === "rest" ? "opacity-45" : ""}`} decoding="async" />
                    : <Image src={`/media/${mediaKey}`} alt={media?.title ?? ""} fill sizes="(max-width: 430px) calc(100vw - 40px), 640px" className={`object-contain ${phase === "rest" ? "opacity-45" : ""}`} placeholder="blur" blurDataURL={IMAGE_BLUR_DATA_URL} decoding="async" />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-accent-soft"><Icon name="dumbbell" className="size-10 text-text-muted" /></div>
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
              {phase === "intro" && (
                <div className="absolute inset-0 grid place-items-center bg-gradient-to-t from-black/40 via-black/15 to-transparent p-4 text-center pointer-events-none">
                  <div className="grid max-w-[18rem] justify-items-center gap-1.5">
                    <span className="grid size-12 place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm" aria-hidden><Icon name="play" className="size-6" /></span>
                    <p className="m-0 text-lg font-semibold text-white">Подготовка</p>
                    <p className="m-0 text-sm font-medium text-white/90">{current?.title ?? ""}</p>
                  </div>
                </div>
              )}
              <div className="absolute left-4 top-4"><span className="rounded-full bg-black/55 px-3 py-1 text-sm font-medium text-white">{progressBadge}</span></div>
            </div>;
          })()}
          <div className="grid gap-3 p-4">
            {/* Always reserve 2 lines of text-2xl/leading-tight — long titles must not push timer/controls. */}
            <p className="m-0 flex min-h-[3.75rem] items-center justify-center text-center text-2xl font-semibold leading-tight line-clamp-2 [overflow-wrap:anywhere]" title={phase === "rest" ? "Отдых" : current?.title}>{phase === "rest" ? "Отдых" : current?.title ?? ""}</p>
            <p className="m-0 min-h-5 text-center text-sm leading-5 text-text-muted">{phase === "intro" ? "Сейчас начнём" : phase === "exercise" && current && exerciseReps(current) != null ? `${exerciseReps(current)} повторений` : phase === "rest" && !nextCompletesSteps && exercises[position + 1] ? `Готовимся к «${exercises[position + 1]?.title ?? ""}»` : "\u00a0"}</p>
            <p className="m-0 text-center text-5xl font-semibold tabular-nums" aria-live="off">{mainTimer}</p>
            <p className="m-0 min-h-5 text-center text-sm leading-5 text-text-muted" role="status" aria-live="polite">{statusText}</p>
            <p className="m-0 min-h-[3.75rem] text-center text-sm leading-relaxed text-text-muted [overflow-wrap:anywhere] line-clamp-3">{phase === "rest" ? (nextCompletesSteps ? "Отдышитесь — затем сохраним результат." : `Спокойно подышите. Следующее: ${exercises[position + 1]?.title ?? "завершение"}. ${exercises[position + 1]?.description ?? ""}`.trim()) : current?.description ?? ""}</p>
            <Button large rounded className={`w-full gap-2 ${focusRing}`} onClick={toggleRun}><Icon name={running ? "pause" : "play"} />{runLabel}</Button>
            {/*
              Transport: ‹ · Skip · › on normal steps.
              On the last step that finishes the pipeline: Skip → «К итогу», › → check (not another chevron).
            */}
            <div className="flex items-center gap-2">
              <Button large rounded tonal aria-label={phase === "rest" || phase === "intro" ? "К подготовке упражнения" : "Предыдущее упражнение"} className={focusRing} disabled={phase === "exercise" && position === 0} onClick={back}><Icon name="chevron-left" className="size-5" /></Button>
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
  { left: "8%", delay: "0ms", dx: "-18px", dy: "165px", rot: "-40deg", color: "var(--color-accent, #7eb8a2)" },
  { left: "22%", delay: "40ms", dx: "12px", dy: "195px", rot: "55deg", color: "#f5c16c" },
  { left: "38%", delay: "80ms", dx: "-8px", dy: "180px", rot: "20deg", color: "#e8a0bf" },
  { left: "52%", delay: "30ms", dx: "20px", dy: "210px", rot: "-70deg", color: "var(--color-accent, #7eb8a2)" },
  { left: "66%", delay: "90ms", dx: "-14px", dy: "172px", rot: "35deg", color: "#8ec5e8" },
  { left: "78%", delay: "50ms", dx: "10px", dy: "187px", rot: "-25deg", color: "#f5c16c" },
  { left: "90%", delay: "70ms", dx: "-6px", dy: "202px", rot: "48deg", color: "#e8a0bf" },
  { left: "15%", delay: "110ms", dx: "16px", dy: "150px", rot: "-55deg", color: "#8ec5e8" },
  { left: "45%", delay: "20ms", dx: "-22px", dy: "217px", rot: "62deg", color: "var(--color-accent, #7eb8a2)" },
  { left: "72%", delay: "100ms", dx: "8px", dy: "157px", rot: "-18deg", color: "#f5c16c" },
  { left: "30%", delay: "60ms", dx: "4px", dy: "225px", rot: "30deg", color: "#e8a0bf" },
  { left: "58%", delay: "0ms", dx: "-12px", dy: "177px", rot: "-45deg", color: "#8ec5e8" },
] as const;

function CelebrationBurst({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
      <style>{`
        @keyframes step-celebrate-pop {
          0% { transform: scale(0.82); opacity: 0; }
          20% { transform: scale(1.06); opacity: 1; }
          70% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes step-celebrate-badge {
          0% { transform: scale(0.5) rotate(-12deg); }
          25% { transform: scale(1.12) rotate(6deg); }
          55% { transform: scale(1) rotate(0); }
          100% { transform: scale(1) rotate(0); }
        }
        @keyframes step-celebrate-confetti {
          0% { transform: translate3d(0, -8px, 0) rotate(0deg); opacity: 0; }
          8% { opacity: 1; }
          75% { opacity: 1; }
          100% { transform: translate3d(var(--dx), var(--dy), 0) rotate(var(--rot)); opacity: 0; }
        }
        .step-celebrate-pop { animation: step-celebrate-pop 2.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .step-celebrate-badge { animation: step-celebrate-badge 2.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .step-celebrate-piece {
          position: absolute;
          top: 12%;
          width: 8px;
          height: 12px;
          border-radius: 2px;
          opacity: 0;
          animation: step-celebrate-confetti 2.5s cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
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
