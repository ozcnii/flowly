"use client";

import { Button, Card, Preloader, Searchbar } from "konsta/react";
import NextLink from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@flowly/ui";
import { PrimaryNavbar } from "@/components/shell/primary-navbar";
import { WorkoutMediaCard } from "@/components/workouts/workout-media-card";
import { YoutubePlayerPopup, type YoutubePlayerVideo } from "@/components/youtube/youtube-player-popup";
import type { YoutubeFilters, YoutubeResult } from "../model/youtube";
import { useSaveYoutubeVideoMutation, useYoutubeSearchQuery } from "../model/youtube-queries";

type Forced = "loading" | "error" | "empty" | "stale" | "saved" | null;
type Props = { filters?: YoutubeFilters; forced?: Forced };

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";
const resultCountLabel = (count: number) => {
  const mod10 = count % 10, mod100 = count % 100;
  return `${count} ${mod10 === 1 && mod100 !== 11 ? "результат" : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "результата" : "результатов"}`;
};
const publishedLabel = (publishedAt: string | null) => {
  const timestamp = publishedAt ? Date.parse(publishedAt) : NaN;
  if (!Number.isFinite(timestamp)) return "";
  const days = Math.round((timestamp - Date.now()) / 86_400_000), absolute = Math.abs(days), formatter = new Intl.RelativeTimeFormat("ru-RU", { numeric: "auto" });
  return absolute < 30 ? formatter.format(days, "day") : absolute < 365 ? formatter.format(Math.round(days / 30), "month") : formatter.format(Math.round(days / 365), "year");
};
const viewsLabel = (views: number | null) => views == null ? "" : `${new Intl.NumberFormat("ru-RU", { notation: "compact", maximumFractionDigits: 1 }).format(views)} просмотров`;
const CATEGORY: Record<string, string> = { morning: "Утро", back: "Спина", stretch: "Растяжка", strength: "Сила", relax: "Расслабление", mobility: "Мобильность", balance: "Баланс", core: "Кор", evening: "Вечер", breath: "Дыхание" };
const DURATION: Record<string, string> = { short: "≤10 мин", medium: "11–20 мин", long: "21–35 мин" };
const DIFFICULTY: Record<string, string> = { beginner: "Лёгкая", intermediate: "Средняя", advanced: "Сложная" };
const EQUIPMENT: Record<string, string> = { none: "Без инвентаря", any: "С инвентарём" };
const filterLabel = (key: string, value?: string) => {
  if (!value || key === "category" || key === "categoryName" || key === "query") return null;
  return key === "duration" ? DURATION[value] ?? value : key === "difficulty" ? DIFFICULTY[value] ?? value : EQUIPMENT[value] ?? value;
};

function ResultCard({ result, filters, onPlay, initialSaved = false, eager = false }: { result: YoutubeResult; filters: YoutubeFilters; onPlay: (video: YoutubePlayerVideo) => void; initialSaved?: boolean; eager?: boolean }) {
  const save = useSaveYoutubeVideoMutation();
  const [saved, setSaved] = useState(false);
  const isSaved = saved || initialSaved;
  const submit = async () => { try { await save.mutateAsync({ result, filters }); setSaved(true); } catch { /* mutation state renders the inline error */ } };
  return <WorkoutMediaCard
    title={result.title}
    coverSrc={result.thumbnailUrl ?? ""}
    durationSeconds={result.durationSeconds}
    metadata={[result.channelTitle, viewsLabel(result.viewCount), publishedLabel(result.publishedAt)].filter(Boolean).join(" · ")}
    eager={eager}
    unoptimized
    onPlay={(trigger) => onPlay({ videoId: result.videoId, title: result.title, trigger })}
    actions={<Button inline clear={!isSaved} tonal={isSaved} rounded disabled={save.isPending || isSaved} aria-busy={save.isPending || undefined} aria-label={isSaved ? `«${result.title}» сохранено` : `Сохранить «${result.title}»`} title={isSaved ? "Сохранено" : "Сохранить"} className={`h-11 w-11 min-w-11 p-0 ${focusRing}`} onClick={submit}>{save.isPending ? <Preloader className="size-4" /> : <Icon name={isSaved ? "check" : "bookmark"} />}<span className="sr-only" aria-live="polite">{isSaved ? "Сохранено" : "Сохранить"}</span></Button>}
    status={save.isError ? <p className="m-0 text-sm text-danger" role="alert">Не удалось сохранить. Повторите позже.</p> : undefined}
  />;
}

export function YoutubeSearchScreen({ filters = {}, forced = null }: Props) {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [playerVideo, setPlayerVideo] = useState<YoutubePlayerVideo | null>(null);
  const closePlayer = useCallback(() => setPlayerVideo(null), []);
  const initialSearch = filters.query ?? (filters.category ? `Йога ${CATEGORY[filters.category] ?? filters.category}` : "");
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(id);
  }, [searchInput]);
  const searchFilters = useMemo(() => ({ ...filters, query: debouncedSearch || undefined }), [debouncedSearch, filters]);
  const queryEnabled = forced === null || forced === "stale" || forced === "saved";
  const query = useYoutubeSearchQuery(searchFilters, queryEnabled);
  const results = forced === "empty" || forced === "error" || forced === "loading" ? [] : query.data?.results ?? [];
  const activeFilters = query.data?.query.filters ?? searchFilters;
  const labels = Object.entries(activeFilters).map(([key, value]) => filterLabel(key, value)).filter(Boolean);
  const warning = forced === "stale" ? "Показываем сохранённые результаты: поиск временно недоступен." : query.data?.warning;
  const isLoading = forced === "loading" || (queryEnabled && query.isPending && !query.data);
  const isError = forced === "error" || (queryEnabled && (query.isError || query.data?.cache === "unavailable") && !query.data?.results.length);
  const headline = labels.length ? labels.join(" · ") : "";

  return <div className="min-h-dvh">
    <div ref={backgroundRef}>
      <PrimaryNavbar title="Поиск YouTube" />
      <main className="flow-screen">
      <h1 className="sr-only">Поиск YouTube</h1>
      <section aria-label="Параметры поиска" className="grid gap-2">
        <label htmlFor="youtube-search" className="sr-only">Что найти на YouTube</label>
        <div className="flex items-center gap-2">
          {/* DEC-050: Konsta 5.2.0 drops Searchbar className; one focus owner preserves the keyboard cue. */}
          <div className="min-w-0 flex-1 rounded-3xl focus-within:ring-2 focus-within:ring-inset focus-within:ring-accent"><Searchbar inputId="youtube-search" value={searchInput} onInput={(event) => setSearchInput(event.target.value)} clearButton={false} placeholder="Например, йога для спины" /></div>
          {searchInput && <Button inline clear rounded className={`h-11 w-11 min-w-11 p-0 ${focusRing}`} aria-label="Очистить поиск" onClick={() => setSearchInput("")}><Icon name="x" /></Button>}
        </div>
        {headline && <p className="m-0 text-sm font-semibold">{headline}</p>}
        {warning && <Card component="aside" outline className="m-0" role="status" contentWrapPadding="p-3"><p className="m-0 text-sm text-text-muted">{warning}</p></Card>}
      </section>

      {isLoading ? <div className="grid min-h-48 place-items-center" role="status" aria-live="polite" aria-busy="true"><Preloader /><span className="sr-only">Загружаем видео</span></div> : isError ? <Card component="section" outline className="m-0 text-center" role="alert" contentWrapPadding="p-6 grid justify-items-center gap-3"><Icon name="triangle-alert" /><h2 className="m-0 text-lg font-semibold">YouTube-поиск недоступен</h2><p className="m-0 text-sm text-text-muted">Попробуйте позже. Введённые параметры сохранены.</p><Button large rounded className={focusRing} onClick={() => query.refetch()}>Повторить</Button></Card> : results.length === 0 ? <Card component="section" outline className="m-0 text-center" contentWrapPadding="p-6 grid justify-items-center gap-3"><Icon name="search-x" /><h2 className="m-0 text-lg font-semibold">Видео не найдены</h2><p className="m-0 text-sm text-text-muted">Попробуйте изменить запрос, длительность или сложность.</p><Button component={NextLink} href="/catalog" large rounded className={focusRing}>Вернуться в каталог</Button></Card> : <>
        <p className="m-0 text-sm font-semibold" aria-live="polite">{resultCountLabel(results.length)}</p>
        <div className="grid gap-3">{results.map((result, index) => <ResultCard key={result.videoId} result={result} filters={searchFilters} onPlay={setPlayerVideo} initialSaved={forced === "saved" && index === 0} eager={index < 2} />)}</div>
      </>}
      </main>
    </div>
    <YoutubePlayerPopup video={playerVideo} backgroundRef={backgroundRef} onClose={closePlayer} />
  </div>;
}
