"use client";

import { Button, List, ListInput, ListItem, Navbar, Radio, Sheet } from "konsta/react";
import { useCallback, useState, type RefObject } from "react";
import { Icon } from "@flowly/ui";
import { ModalPortal } from "@/components/modal-portal";
import { useModalFocus } from "@/components/use-modal-focus";
import { FINAL_STATUSES, FINAL_STATUS_LABELS, formatSessionDuration, type FinalStatus } from "../model/workout-session";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

/** Shared S-MA-033 final-status confirmation sheet (DEC-062). Owns its own status/comment draft state. */
export function FinishSessionSheet({ opened, sheetRef, backgroundRef, defaultStatus = "completed", finishPending, checkpointPending, finishError, onClose, onSubmit }: {
  opened: boolean;
  sheetRef: RefObject<HTMLElement | null>;
  backgroundRef: RefObject<HTMLElement | null>;
  defaultStatus?: FinalStatus;
  finishPending: boolean;
  checkpointPending: boolean;
  finishError: boolean;
  onClose: () => void;
  onSubmit: (status: FinalStatus, comment: string) => Promise<void> | void;
}) {
  const [status, setStatus] = useState<FinalStatus>(defaultStatus);
  const [comment, setComment] = useState("");
  const [commentOpened, setCommentOpened] = useState(false);
  const close = useCallback(() => { if (finishPending) return; setStatus(defaultStatus); setComment(""); setCommentOpened(false); onClose(); }, [defaultStatus, finishPending, onClose]);
  useModalFocus(opened, sheetRef, backgroundRef, close);
  return <ModalPortal>{opened && <Sheet ref={sheetRef} opened backdrop onBackdropClick={close} className="flex max-h-[88dvh] max-w-full flex-col" role="dialog" aria-modal="true" aria-labelledby="finish-session-title">
    <Navbar title={<span id="finish-session-title">Завершить тренировку</span>} />
    <div className="min-h-0 min-w-0 overflow-x-hidden overflow-y-auto py-2">
      <List strong dividers className="!m-0">{FINAL_STATUSES.map((item) => <ListItem key={item} label title={FINAL_STATUS_LABELS[item]} after={<Radio component="div" name="final-status" checked={status === item} onChange={() => setStatus(item)} />} />)}</List>
      {!commentOpened ? <Button clear rounded className={`mx-4 mt-2 w-[calc(100%_-_2rem)] min-w-0 gap-2 whitespace-normal ${focusRing}`} onClick={() => setCommentOpened(true)}><Icon name="plus" />Добавить комментарий</Button> : <List strong inset className="!my-2"><ListInput title="" outline type="text" label="Комментарий (необязательно)" value={comment} maxLength={1000} onInput={(event) => setComment(event.currentTarget.value)} /></List>}
      {finishError && <p className="m-4 text-sm text-danger" role="alert">Не удалось сохранить результат. Выбор и комментарий не потеряны.</p>}
    </div>
    <div className="grid grid-cols-2 gap-2 border-t border-border p-4 pb-safe-6"><Button clear rounded className={focusRing} disabled={finishPending} onClick={close}>Отмена</Button><Button large rounded disabled={!status || finishPending || checkpointPending} onClick={() => onSubmit(status, comment.trim() || "")}>{finishPending ? "Сохраняем…" : "Готово"}</Button></div>
  </Sheet>}</ModalPortal>;
}

/** Shared S-MA-034 server/device sync-conflict sheet (DEC-062). */
export function SyncConflictSheet({ conflict, sheetRef, backgroundRef, pending, onUseServer, onSelectDevice }: {
  conflict: { localSeconds: number; serverSeconds: number } | null;
  sheetRef: RefObject<HTMLElement | null>;
  backgroundRef: RefObject<HTMLElement | null>;
  pending: boolean;
  onUseServer: () => void;
  onSelectDevice: () => Promise<void> | void;
}) {
  useModalFocus(Boolean(conflict), sheetRef, backgroundRef, () => undefined);
  return <ModalPortal>{conflict && <Sheet ref={sheetRef} opened backdrop className="flex max-h-[80dvh] max-w-full flex-col" role="dialog" aria-modal="true" aria-labelledby="sync-conflict-title">
    <Navbar title={<span id="sync-conflict-title">Где продолжить?</span>} />
    <div className="grid gap-4 p-4">
      <p className="m-0 text-sm leading-relaxed text-text-muted">Есть два разных сохранения тренировки. Выберите нужное — автоматически объединять их небезопасно.</p>
      <List strong inset dividers className="!m-0"><ListItem title="На сервере" after={formatSessionDuration(conflict.serverSeconds)} /><ListItem title="На этом устройстве" after={formatSessionDuration(conflict.localSeconds)} /></List>
      <Button large rounded tonal className={focusRing} disabled={pending} onClick={onUseServer}>Продолжить с сервера</Button>
      <Button large rounded className={focusRing} disabled={pending} onClick={() => onSelectDevice()}>Продолжить с этого устройства</Button>
    </div>
  </Sheet>}</ModalPortal>;
}
