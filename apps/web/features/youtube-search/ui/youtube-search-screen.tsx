"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button, Icon, InlineError, Skeleton } from "@flowly/ui";
import type { YoutubeFilters, YoutubeResult } from "../model/youtube";
import { useSaveYoutubeVideoMutation, useYoutubeSearchQuery } from "../model/youtube-queries";
import styles from "./youtube-search-screen.module.css";

type Forced = "loading" | "error" | "empty" | "stale" | "saved" | null;
type Props = { filters?: YoutubeFilters; forced?: Forced };

const minutes = (seconds: number) => `${Math.max(1, Math.round(seconds / 60))} мин`;
const timecode = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`;
const CATEGORY: Record<string, string> = { morning: "Утро", back: "Спина", stretch: "Растяжка", strength: "Сила", relax: "Расслабление", mobility: "Мобильность", balance: "Баланс", core: "Кор", evening: "Вечер", breath: "Дыхание" };
const DURATION: Record<string, string> = { short: "≤10 мин", medium: "11–20 мин", long: "21–35 мин" };
const DIFFICULTY: Record<string, string> = { beginner: "Лёгкая", intermediate: "Средняя", advanced: "Сложная" };
const EQUIPMENT: Record<string, string> = { none: "Без инвентаря", any: "С инвентарём" };
const filterLabel = (key: string, value?: string) => {
  if (!value || key === "category" || key === "categoryName" || key === "query") return null;
  const label = key === "category" ? CATEGORY[value] ?? value : key === "duration" ? DURATION[value] ?? value : key === "difficulty" ? DIFFICULTY[value] ?? value : EQUIPMENT[value] ?? value;
  return label;
};

function Loading() {
  return <div className={styles.list} aria-label="Загрузка YouTube"><Skeleton height="card" /><Skeleton height="card" /><Skeleton height="card" /></div>;
}

function ResultCard({ result, filters }: { result: YoutubeResult; filters: YoutubeFilters }) {
  const save = useSaveYoutubeVideoMutation();
  const [saved, setSaved] = useState(false);
  const submit = async () => {
    await save.mutateAsync({ result, filters });
    setSaved(true);
  };
  return <article className={`flow-card ${styles.card}`}>
    {result.thumbnailUrl && <a className={styles.thumb} href={result.watchUrl} target="_blank" rel="noreferrer" style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,.55)), url(${result.thumbnailUrl})` }} aria-label={`Открыть ${result.title} на YouTube`}><Icon name="play" /><span>{timecode(result.durationSeconds)}</span></a>}
    <div className={styles.details}>
      <div className={styles.cardTop}><span>YouTube</span><span>{minutes(result.durationSeconds)}</span></div>
      <h2>{result.title}</h2>
      <p className={styles.channel}>{result.channelTitle}</p>
      <p className={styles.videoMeta}>{[result.viewCountText, result.publishedText].filter(Boolean).join(" · ") || minutes(result.durationSeconds)}</p>
      <div className={styles.actions}>
        <Button size="sm" variant={saved ? "secondary" : "primary"} loading={save.isPending} onClick={submit}>{saved ? "Сохранено" : "Сохранить"}</Button>
        <a href={result.watchUrl} target="_blank" rel="noreferrer"><Icon name="external-link" />Смотреть</a>
      </div>
      {save.isError && <p className={styles.error} role="alert">Не удалось сохранить. Повторите позже.</p>}
    </div>
  </article>;
}

export function YoutubeSearchScreen({ filters = {}, forced = null }: Props) {
  const initialSearch = filters.query ?? (filters.category ? `Йога ${CATEGORY[filters.category] ?? filters.category}` : "");
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(id);
  }, [searchInput]);
  const searchFilters = useMemo(() => ({ ...filters, query: debouncedSearch || undefined }), [debouncedSearch, filters]);
  const query = useYoutubeSearchQuery(searchFilters, !forced);
  const forcedMode = forced !== null;
  const results = useMemo(() => forced === "empty" || forced === "error" || forced === "loading" ? [] : query.data?.results ?? [], [forced, query.data?.results]);
  const activeFilters = query.data?.query.filters ?? searchFilters;
  const labels = Object.entries(activeFilters).map(([k, v]) => filterLabel(k, v)).filter(Boolean);
  const warning = forced === "stale" ? "Показываем сохранённые результаты: поиск временно недоступен." : query.data?.warning;
  const isLoading = forced === "loading" || (!forcedMode && query.isPending);
  const isError = forced === "error" || (!forcedMode && (query.isError || query.data?.cache === "unavailable"));
  const headline = labels.length ? labels.join(" · ") : "";
  return <div className={`flow-screen ${styles.screen}`}>
    <Link className={`flow-back ${styles.back}`} href={"/catalog" as never}><Icon name="chevron-left" />Каталог</Link>
    <header className={`flow-top ${styles.header}`}>
      <p className="flow-eyebrow">Поиск YouTube</p>
      <h1 className="flow-title">Видео-практики</h1>
    </header>

    <section className={styles.summary} aria-label="Параметры поиска">
      <label className={styles.searchBox} aria-label="Что найти на YouTube">
        <Icon name="search" />
        <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Например, йога для спины" autoCapitalize="sentences" />
      </label>
      {headline && <strong>{headline}</strong>}
      {warning && <p className={styles.warning}>{warning}</p>}
    </section>

    {isLoading ? <Loading /> : isError ? <InlineError icon={<Icon name="triangle-alert" />} title="YouTube-поиск недоступен" description="Попробуйте позже или вернитесь в каталог Flowly. Введённые фильтры не сброшены." retryLabel="Повторить" onRetry={() => query.refetch()} /> : results.length === 0 ? <section className={styles.empty}><Icon name="search-x" /><h2 className="flow-section-title">Видео не найдены</h2><p>Попробуйте изменить категорию, длительность или сложность.</p><Link href={"/catalog" as never}>Вернуться в каталог</Link></section> : <div className={styles.list}>{results.map((result) => <ResultCard key={result.videoId} result={result} filters={searchFilters} />)}</div>}
  </div>;
}
