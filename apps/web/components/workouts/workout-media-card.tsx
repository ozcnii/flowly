import { Badge, Button, Card } from "konsta/react";
import Image from "next/image";
import { Icon } from "@flowly/ui";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

export const workoutTimecode = (seconds: number) => {
  const total = Math.max(0, Math.round(seconds)), hours = Math.floor(total / 3600), minutes = Math.floor(total % 3600 / 60), rest = total % 60;
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}` : `${minutes}:${String(rest).padStart(2, "0")}`;
};

type Props = {
  title: string;
  coverSrc: string;
  durationSeconds: number;
  source: string;
  format: string;
  metadata: string;
  marker?: string;
  eager?: boolean;
  unoptimized?: boolean;
  onOpen?: () => void;
  onPlay?: (trigger: HTMLElement) => void;
  actions?: React.ReactNode;
};

// DEC-053: Konsta has no domain workout-card component; this approved composite only arranges direct Konsta primitives.
export function WorkoutMediaCard({ title, coverSrc, durationSeconds, source, format, metadata, marker, eager, unoptimized, onOpen, onPlay, actions }: Props) {
  return <Card component="article" contentWrap={false} outline className="relative m-0 overflow-hidden">
    {onOpen && <Button clear className={`absolute inset-0 z-10 !h-auto !w-auto rounded-3xl p-0 ${focusRing}`} onClick={onOpen} aria-label={`Открыть ${title}`} />}
    <div className="relative aspect-video bg-accent-soft">
      {coverSrc && <Image src={coverSrc} alt="" fill sizes="(max-width: 430px) calc(100vw - 40px), 640px" loading={eager ? "eager" : "lazy"} unoptimized={unoptimized} className="object-cover" />}
      {onPlay && <Button clear className={`absolute inset-0 z-10 !h-auto !w-auto rounded-none p-0 ${focusRing}`} onClick={(event) => onPlay(event.currentTarget)} aria-label={`Воспроизвести «${title}»`}><Icon name="play" className="size-10 text-white drop-shadow-lg" /></Button>}
      <Badge className="pointer-events-none absolute bottom-3 right-3 z-20">{workoutTimecode(durationSeconds)}</Badge>
    </div>
    <div className="grid min-w-0 gap-2 p-4 [&>*]:min-w-0">
      <div className="flex flex-wrap gap-2"><Badge>{source}</Badge><Badge>{format}</Badge>{marker && <Badge>{marker}</Badge>}</div>
      <h2 className="m-0 break-words text-lg font-semibold leading-tight">{title}</h2>
      <p className="m-0 truncate text-sm leading-snug text-text-muted">{metadata}</p>
      {actions && <div className="relative z-20 flex min-h-11 flex-wrap items-center justify-end gap-2">{actions}</div>}
    </div>
  </Card>;
}
