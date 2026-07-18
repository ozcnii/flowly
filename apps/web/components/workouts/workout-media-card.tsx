import { Badge, Button, Card, Preloader } from "konsta/react";
import Image from "next/image";
import { YoutubePlayButton } from "@/components/youtube/youtube-play-button";
import { IMAGE_BLUR_DATA_URL } from "@/lib/image";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

export const workoutTimecode = (seconds: number) => {
  const total = Math.max(0, Math.round(seconds)), hours = Math.floor(total / 3600), minutes = Math.floor(total % 3600 / 60), rest = total % 60;
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}` : `${minutes}:${String(rest).padStart(2, "0")}`;
};

type Props = {
  title: string;
  coverSrc: string;
  durationSeconds: number;
  metadata: string;
  eager?: boolean;
  unoptimized?: boolean;
  onOpen?: () => void;
  onPlay?: (trigger: HTMLElement) => void;
  actions?: React.ReactNode;
  status?: React.ReactNode;
  pending?: boolean;
  error?: string;
  className?: string;
  headingLevel?: "h2" | "h3";
};

// DEC-053: Konsta has no domain workout-card component; this approved composite only arranges direct Konsta primitives.
export function WorkoutMediaCard({ title, coverSrc, durationSeconds, metadata, eager, unoptimized, onOpen, onPlay, actions, status, pending, error, className = "", headingLevel = "h2" }: Props) {
  const Heading = headingLevel;
  return <Card component="article" contentWrap={false} outline className={`relative m-0 overflow-hidden ${className}`}>
    {onOpen && !pending && <Button clear className={`absolute inset-0 z-10 !h-auto !w-auto rounded-3xl p-0 ${focusRing}`} onClick={onOpen} aria-label={`Открыть ${title}`} aria-busy={pending || undefined} />}
    <div className="relative aspect-video bg-accent-soft">
      {coverSrc && <Image src={coverSrc} alt="" fill sizes="(max-width: 430px) calc(100vw - 40px), 640px" loading={eager ? "eager" : "lazy"} decoding="sync" placeholder="blur" blurDataURL={IMAGE_BLUR_DATA_URL} unoptimized={unoptimized} className="object-cover" />}
      {onPlay && <YoutubePlayButton title={title} onClick={(event) => onPlay(event.currentTarget)} />}
      <Badge className="pointer-events-none absolute bottom-3 right-3 z-20">{workoutTimecode(durationSeconds)}</Badge>
      {/* Layout-stability (AGENTS.md): pending/error overlay lives inside the fixed aspect-video cover so the card never shifts. */}
      {pending && <div className="absolute inset-0 z-30 grid place-items-center bg-black/35" role="status" aria-live="polite"><Preloader /><span className="sr-only">Открываем тренировку</span></div>}
      {error && <div className="absolute inset-x-0 bottom-0 z-30 bg-danger/90 p-2 text-center text-xs text-white" role="alert">{error}</div>}
    </div>
    <div className="grid min-w-0 gap-2 p-4 [&>*]:min-w-0">
      <div className="flex min-w-0 items-start gap-2">
        <div className="min-w-0 flex-1">
          <Heading className="m-0 line-clamp-2 break-words text-lg font-semibold leading-tight" title={title}>{title}</Heading>
          <p className="mt-1 mb-0 truncate text-sm leading-snug text-text-muted">{metadata}</p>
        </div>
        {actions && <div className="relative z-20 flex min-h-11 shrink-0 items-center">{actions}</div>}
      </div>
      {status}
    </div>
  </Card>;
}
