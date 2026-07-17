"use client";

import { BlockTitle, Button, Card, List, ListInput, ListItem, Navbar, Preloader, Radio, Sheet } from "konsta/react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { Icon } from "@flowly/ui";
import { ModalPortal } from "@/components/modal-portal";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { useModalFocus } from "@/components/use-modal-focus";
import { YoutubeIframePlayer, type YoutubePlayerHandle } from "@/components/youtube/youtube-iframe-player";
import { ApiError } from "@/lib/api/client";
import { advanceLocalCheckpoint, readLocalCheckpoint, rebaseLocalCheckpoint, removeLocalCheckpoint, replaceLocalCheckpoint, type LocalCheckpoint } from "../model/local-checkpoint";
import { FINAL_STATUSES, FINAL_STATUS_LABELS, formatSessionDuration, type CheckpointConflict, type FinalStatus, type WorkoutSession } from "../model/workout-session";
import { checkpointWorkoutSession, useCheckpointWorkoutSessionMutation, useFinishWorkoutSessionMutation, useWorkoutSessionQuery } from "../model/workout-session-queries";

type SyncConflict = { local: LocalCheckpoint; server: WorkoutSession };
const conflictBody = (error: unknown): CheckpointConflict | null => error instanceof ApiError && error.status === 409 && typeof error.body === "object" && error.body !== null && "error" in error.body && error.body.error === "checkpoint_conflict" ? error.body as CheckpointConflict : null;

export function VideoSessionScreen({ id }: { id: string }) {
  const router = useRouter(), query = useWorkoutSessionQuery(id), checkpoint = useCheckpointWorkoutSessionMutation(id), finish = useFinishWorkoutSessionMutation(id), backgroundRef = useRef<HTMLDivElement>(null), playerRef = useRef<YoutubePlayerHandle>(null), finishSheetRef = useRef<HTMLElement>(null), conflictSheetRef = useRef<HTMLElement>(null), initialized = useRef(""), tokenRef = useRef(""), secondsRef = useRef(0), playbackRef = useRef(0), segmentRef = useRef<number | null>(null), playingRef = useRef(false), playerReadyRef = useRef(false), syncingRef = useRef(false), finishingRef = useRef(false), mountedRef = useRef(true);
  const [seconds, setSeconds] = useState(0), [playing, setPlaying] = useState(false), [ready, setReady] = useState(false), [playerError, setPlayerError] = useState(false), [syncState, setSyncState] = useState<"synced" | "offline" | "storage-error">("synced"), [finishOpened, setFinishOpened] = useState(false), [commentOpened, setCommentOpened] = useState(false), [status, setStatus] = useState<FinalStatus | null>("completed"), [comment, setComment] = useState(""), [conflict, setConflict] = useState<SyncConflict | null>(null);
  const currentSeconds = useCallback(() => Math.max(0, Math.round(secondsRef.current + (segmentRef.current == null ? 0 : (performance.now() - segmentRef.current) / 1000))), []);
  const currentPlayback = useCallback(() => Math.max(0, Math.round(playerReadyRef.current ? playerRef.current?.currentTime() ?? playbackRef.current : playbackRef.current)), []);
  const restorePlayback = useCallback((value: number) => { playbackRef.current = Math.max(0, Math.round(value)); if (playerReadyRef.current) playerRef.current?.seekTo(playbackRef.current); }, []);
  const persist = useCallback((value: number, paused: boolean, baseUpdatedAt = tokenRef.current, playbackPositionSeconds = currentPlayback()) => {
    playbackRef.current = playbackPositionSeconds;
    const snapshot = advanceLocalCheckpoint(id, value, playbackPositionSeconds, paused, baseUpdatedAt);
    if (!snapshot && mountedRef.current) setSyncState("storage-error");
    return snapshot;
  }, [currentPlayback, id]);
  const stopClock = useCallback(() => { const value = currentSeconds(); secondsRef.current = value; segmentRef.current = null; playingRef.current = false; if (mountedRef.current) { setPlaying(false); setSeconds(value); } return value; }, [currentSeconds]);
  const startClock = useCallback(() => { if (segmentRef.current == null) segmentRef.current = performance.now(); playingRef.current = true; setPlaying(true); }, []);
  const applyServer = useCallback((session: WorkoutSession) => { tokenRef.current = session.updatedAt; secondsRef.current = session.accumulatedSeconds; restorePlayback(session.playbackPositionSeconds); replaceLocalCheckpoint(id, session.accumulatedSeconds, session.playbackPositionSeconds, true, session.updatedAt); if (mountedRef.current) { setSeconds(session.accumulatedSeconds); setConflict(null); setSyncState("synced"); } }, [id, restorePlayback]);

  const sync = useCallback(async (paused: boolean, force = false, override?: { seconds: number; playbackPositionSeconds: number; baseUpdatedAt: string }) => {
    if (!tokenRef.current) return;
    const value = override?.seconds ?? currentSeconds(), playbackPositionSeconds = override?.playbackPositionSeconds ?? currentPlayback(), baseUpdatedAt = override?.baseUpdatedAt ?? tokenRef.current, snapshot = persist(value, paused, baseUpdatedAt, playbackPositionSeconds);
    if (!snapshot || syncingRef.current) return;
    syncingRef.current = true;
    try {
      let pending = snapshot, pendingBase = baseUpdatedAt, pendingForce = force;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const data = await checkpoint.mutateAsync({ input: { accumulatedSeconds: pending.accumulatedSeconds, playbackPositionSeconds: pending.playbackPositionSeconds, paused: pending.paused, baseUpdatedAt: pendingBase, force: pendingForce } });
        tokenRef.current = data.session.updatedAt;
        const local = rebaseLocalCheckpoint(id, pending.revision, data.session), needsRetry = !playingRef.current && local && (local.accumulatedSeconds > data.session.accumulatedSeconds || local.playbackPositionSeconds !== data.session.playbackPositionSeconds || local.paused !== Boolean(data.session.pausedAt));
        if (!playingRef.current && local) { secondsRef.current = local.accumulatedSeconds; restorePlayback(local.playbackPositionSeconds); if (mountedRef.current) setSeconds(local.accumulatedSeconds); }
        if (needsRetry && attempt === 0) { const next = advanceLocalCheckpoint(id, local.accumulatedSeconds, local.playbackPositionSeconds, local.paused, data.session.updatedAt); if (next) { pending = next; pendingBase = data.session.updatedAt; pendingForce = false; continue; } }
        if (mountedRef.current) { setSyncState("synced"); setConflict(null); }
        break;
      }
    } catch (error) {
      const body = conflictBody(error);
      if (body && mountedRef.current) { const local = readLocalCheckpoint(id) ?? snapshot; playerRef.current?.pause(); stopClock(); if (Math.abs(local.accumulatedSeconds - body.session.accumulatedSeconds) < 1) applyServer(body.session); else setConflict({ local, server: body.session }); }
      else if (mountedRef.current && readLocalCheckpoint(id)) setSyncState("offline");
    } finally { syncingRef.current = false; }
  }, [applyServer, checkpoint, currentPlayback, currentSeconds, id, persist, restorePlayback, stopClock]);
  const closeFinish = useCallback(() => { if (finish.isPending) return; finishingRef.current = false; setFinishOpened(false); setCommentOpened(false); setStatus("completed"); setComment(""); void sync(true); }, [finish.isPending, sync]);
  const keepConflictOpen = useCallback(() => undefined, []);
  useModalFocus(finishOpened, finishSheetRef, backgroundRef, closeFinish);
  useModalFocus(Boolean(conflict), conflictSheetRef, backgroundRef, keepConflictOpen);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);
  useEffect(() => {
    const session = query.data?.session; if (!session || query.isFetching || initialized.current) return;
    tokenRef.current = session.updatedAt;
    const local = readLocalCheckpoint(session.id), serverPaused = Boolean(session.pausedAt), sameToken = local?.baseUpdatedAt === session.updatedAt, realConflict = local && !sameToken && Math.abs(local.accumulatedSeconds - session.accumulatedSeconds) >= 1;
    const frame = requestAnimationFrame(() => {
      initialized.current = "ready";
      if (local && realConflict) { setConflict({ local, server: session }); secondsRef.current = session.accumulatedSeconds; restorePlayback(session.playbackPositionSeconds); setSeconds(session.accumulatedSeconds); return; }
      if (local && !sameToken) { applyServer(session); return; }
      const value = local ? Math.max(local.accumulatedSeconds, session.accumulatedSeconds) : session.accumulatedSeconds, playbackPositionSeconds = local?.playbackPositionSeconds ?? session.playbackPositionSeconds;
      secondsRef.current = value; restorePlayback(playbackPositionSeconds); setSeconds(value); replaceLocalCheckpoint(session.id, value, playbackPositionSeconds, true, session.updatedAt);
      if (local && (local.accumulatedSeconds > session.accumulatedSeconds || local.playbackPositionSeconds !== session.playbackPositionSeconds || !serverPaused)) void sync(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [applyServer, query.data?.session, query.isFetching, restorePlayback, sync]);

  useEffect(() => {
    if (!playing) return;
    const display = setInterval(() => { const value = currentSeconds(); setSeconds(value); persist(value, false); }, 1_000), server = setInterval(() => void sync(false), 15_000);
    return () => { clearInterval(display); clearInterval(server); };
  }, [currentSeconds, persist, playing, sync]);

  const flush = useCallback(() => {
    if (!tokenRef.current) return;
    const snapshot = advanceLocalCheckpoint(id, currentSeconds(), currentPlayback(), true, tokenRef.current); if (!snapshot) return;
    void checkpointWorkoutSession(id, { accumulatedSeconds: snapshot.accumulatedSeconds, playbackPositionSeconds: snapshot.playbackPositionSeconds, paused: true, baseUpdatedAt: snapshot.baseUpdatedAt }, true).then(({ session }) => rebaseLocalCheckpoint(id, snapshot.revision, session)).catch(() => undefined);
  }, [currentPlayback, currentSeconds, id]);
  useEffect(() => { addEventListener("pagehide", flush); return () => removeEventListener("pagehide", flush); }, [flush]);
  useEffect(() => { let armed = false; const frame = requestAnimationFrame(() => { armed = true; }); return () => { cancelAnimationFrame(frame); if (armed) flush(); }; }, [flush]);
  useEffect(() => { const retry = () => void sync(!playingRef.current); addEventListener("online", retry); return () => removeEventListener("online", retry); }, [sync]);

  const onPlayerReady = () => { playerReadyRef.current = true; if (playbackRef.current > 0) playerRef.current?.seekTo(playbackRef.current); setReady(true); };
  const onPlayerState = (state: number) => {
    if (conflict) { playerRef.current?.pause(); return; }
    if (state === 1) { startClock(); void sync(false); return; }
    if (playingRef.current) stopClock();
    if (!finishingRef.current && (state === 0 || state === 2)) void sync(true);
  };
  const openFinish = () => { finishingRef.current = true; playerRef.current?.pause(); persist(stopClock(), true); setStatus("completed"); setComment(""); setCommentOpened(false); setFinishOpened(true); };
  const submitFinish = async () => {
    if (!status || checkpoint.isPending) return;
    try { await finish.mutateAsync({ accumulatedSeconds: currentSeconds(), playbackPositionSeconds: currentPlayback(), finalStatus: status, comment: comment.trim() || undefined, baseUpdatedAt: tokenRef.current }); removeLocalCheckpoint(id); setFinishOpened(false); router.push(`/calendar` as never); }
    catch (error) { const body = conflictBody(error); if (body) { const local = readLocalCheckpoint(id) ?? persist(currentSeconds(), true); if (local) { setFinishOpened(false); setConflict({ local, server: body.session }); } } }
  };
  const useServer = () => { if (conflict) applyServer(conflict.server); };
  const selectDevice = async () => { if (!conflict) return; const selected = conflict; tokenRef.current = selected.server.updatedAt; secondsRef.current = selected.local.accumulatedSeconds; setSeconds(selected.local.accumulatedSeconds); replaceLocalCheckpoint(id, selected.local.accumulatedSeconds, selected.local.playbackPositionSeconds, selected.local.paused, selected.server.updatedAt); restorePlayback(selected.local.playbackPositionSeconds); await sync(selected.local.paused, true, { seconds: selected.local.accumulatedSeconds, playbackPositionSeconds: selected.local.playbackPositionSeconds, baseUpdatedAt: selected.server.updatedAt }); };

  if (query.isPending) return <Shell><div className="grid min-h-64 place-items-center" role="status"><Preloader /><span className="sr-only">Загружаем сессию</span></div></Shell>;
  if (query.isError || !query.data?.session) return <Shell><Card component="section" outline role="alert" contentWrapPadding="grid justify-items-center gap-3 p-6 text-center"><Icon name="triangle-alert" /><h1 className="m-0 text-lg font-semibold">Сессия недоступна</h1><Button component={NextLink} href="/catalog" rounded>Открыть каталог</Button></Card></Shell>;
  const session = query.data.session;
  if (session.state === "closed") return <Shell><Card component="section" outline contentWrapPadding="grid justify-items-center gap-3 p-6 text-center"><Icon name="circle-check" /><h1 className="m-0 text-lg font-semibold">Сессия завершена</h1><p className="m-0 text-sm text-text-muted">{session.finalStatus ? FINAL_STATUS_LABELS[session.finalStatus] : "Результат сохранён"}</p><Button component={NextLink} href="/calendar" rounded>Открыть календарь</Button></Card></Shell>;
  const statusText = playerError ? "Видео не загрузилось — тренировка останется открытой" : syncState === "storage-error" ? "Не удалось сохранить прогресс на устройстве. Не закрывайте тренировку" : syncState === "offline" ? "Нет связи · прогресс сохранён" : playing ? "Идёт тренировка" : ready ? "Пауза" : "Подключаем видео";

  return <>
    <Shell rootRef={backgroundRef}>
      <BlockTitle component="h1" large className="!m-0 !p-0">{session.workout.title}</BlockTitle>
      <Card component="section" contentWrap={false} outline className="m-0 overflow-hidden">
        <div className="relative aspect-video bg-black">
          {!ready && !playerError && <div className="absolute inset-0 grid place-items-center text-white" role="status"><Preloader /><span className="sr-only">Загружаем видео</span></div>}
          <YoutubeIframePlayer ref={playerRef} className="relative size-full border-0" videoId={session.workout.youtubeVideoId} title={session.workout.title} autoplay={false} onReady={onPlayerReady} onStateChange={onPlayerState} onError={() => { setReady(true); setPlayerError(true); stopClock(); }} />
        </div>
        <div className="grid gap-3 p-4">
          <p className="m-0 text-center text-3xl font-semibold tabular-nums" aria-live="off">{formatSessionDuration(seconds)}</p>
          <p className="m-0 min-h-5 text-center text-sm text-text-muted" role="status" aria-live="polite">{statusText}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button large rounded tonal className="gap-2" disabled={!ready || playerError || Boolean(conflict)} onClick={playing ? () => playerRef.current?.pause() : () => playerRef.current?.play()}><Icon name={playing ? "pause" : "play"} />{playing ? "Пауза" : "Продолжить"}</Button>
            <Button large rounded className="gap-2" disabled={Boolean(conflict)} onClick={openFinish}><Icon name="square" />Завершить</Button>
          </div>
        </div>
      </Card>
    </Shell>

    <ModalPortal>
      {finishOpened && <Sheet ref={finishSheetRef} opened backdrop onBackdropClick={closeFinish} className="flex max-h-[88dvh] max-w-full flex-col" role="dialog" aria-modal="true" aria-labelledby="finish-session-title">
        <Navbar title={<span id="finish-session-title">Завершить тренировку</span>} />
        <div className="min-h-0 min-w-0 overflow-x-hidden overflow-y-auto py-2">
          <List strong dividers className="!m-0">{FINAL_STATUSES.map((item) => <ListItem key={item} label title={FINAL_STATUS_LABELS[item]} after={<Radio component="div" name="final-status" checked={status === item} onChange={() => setStatus(item)} />} />)}</List>
          {!commentOpened ? <Button clear rounded className="mx-4 mt-2 w-[calc(100%_-_2rem)] min-w-0 gap-2 whitespace-normal" onClick={() => setCommentOpened(true)}><Icon name="plus" />Добавить комментарий</Button> : <List strong inset className="!my-2"><ListInput title="" outline type="text" label="Комментарий (необязательно)" value={comment} maxLength={1000} onInput={(event) => setComment(event.currentTarget.value)} /></List>}
          {finish.isError && <p className="m-4 text-sm text-danger" role="alert">Не удалось сохранить результат. Выбор и комментарий не потеряны.</p>}
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-border p-4 pb-safe-6"><Button clear rounded disabled={finish.isPending} onClick={closeFinish}>Отмена</Button><Button large rounded disabled={!status || finish.isPending || checkpoint.isPending} onClick={() => void submitFinish()}>{finish.isPending ? "Сохраняем…" : "Готово"}</Button></div>
      </Sheet>}
      {conflict && <Sheet ref={conflictSheetRef} opened backdrop className="flex max-h-[80dvh] max-w-full flex-col" role="dialog" aria-modal="true" aria-labelledby="sync-conflict-title">
        <Navbar title={<span id="sync-conflict-title">Где продолжить?</span>} />
        <div className="grid gap-4 p-4">
          <p className="m-0 text-sm leading-relaxed text-text-muted">Есть два разных сохранения тренировки. Выберите нужное — автоматически объединять их небезопасно.</p>
          <List strong inset dividers className="!m-0"><ListItem title="На сервере" after={formatSessionDuration(conflict.server.accumulatedSeconds)} /><ListItem title="На этом устройстве" after={formatSessionDuration(conflict.local.accumulatedSeconds)} /></List>
          <Button large rounded tonal disabled={checkpoint.isPending} onClick={useServer}>Продолжить с сервера</Button>
          <Button large rounded disabled={checkpoint.isPending} onClick={() => void selectDevice()}>Продолжить с этого устройства</Button>
        </div>
      </Sheet>}
    </ModalPortal>
  </>;
}

function Shell({ children, rootRef }: { children: React.ReactNode; rootRef?: RefObject<HTMLDivElement | null> }) { return <div ref={rootRef} className="min-h-dvh"><PrimaryNavbar title="Тренировка" /><main className="flow-screen">{children}</main></div>; }
