"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Icon } from "@flowly/ui";
import type { CatalogWorkout } from "../model/catalog";
import { DIFFICULTY, DURATION, FORMAT, SOURCE, minutes } from "../model/catalog";
import { useCatalogQuery, type CatalogFilters } from "../model/catalog-queries";
import styles from "./catalog-screen.module.css";

type Forced = "loading" | "empty" | "error" | "offline" | null;

const EMPTY_FILTERS: CatalogFilters = { q: "", category: "", duration: "", difficulty: "", format: "", source: "", equipment: "", favorite: "" };
const set = (filters: CatalogFilters, key: keyof CatalogFilters, value: string): CatalogFilters => ({ ...filters, [key]: filters[key] === value ? "" : value });

function WorkoutCard({ workout, onOpen }: { workout: CatalogWorkout; onOpen: (id: string) => void }) {
  const thumb = workout.sourceType === "youtube" && workout.youtubeVideoId ? `https://i.ytimg.com/vi/${workout.youtubeVideoId}/hqdefault.jpg` : workout.coverObjectKey ? `/media/${workout.coverObjectKey}` : "";
  return <article className={`${styles.card} ${thumb ? "" : styles.cardTextOnly}`} role="button" tabIndex={0} onClick={() => onOpen(workout.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(workout.id); } }} aria-label={`Открыть ${workout.title}`}>
    {thumb && <div className={styles.cover} data-source={workout.sourceType} style={{ backgroundImage: `${workout.sourceType === "youtube" ? "linear-gradient(135deg, rgba(28, 45, 39, 0.1), rgba(28, 45, 39, 0.55)), " : ""}url(${thumb})` }} aria-hidden="true">{workout.sourceType === "youtube" && <Icon name="play" />}</div>}
    <div className={styles.cardHead}>
      <div className={styles.cardTop}><span className={styles.source}>{SOURCE[workout.sourceType as keyof typeof SOURCE] ?? workout.sourceType}</span><span>{minutes(workout.durationSeconds)}</span></div>
      <h2>{workout.title}</h2>
    </div>
    <div className={styles.cardDetails}>
      <p>{workout.description}</p>
      <div className={styles.meta}>
        <span>{DIFFICULTY[workout.difficulty as keyof typeof DIFFICULTY] ?? workout.difficulty}</span>
        <span>{FORMAT[workout.format as keyof typeof FORMAT] ?? workout.format}</span>
        {workout.equipment.length === 0 ? <span>Без инвентаря</span> : <span>{workout.equipment.join(", ")}</span>}
      </div>
      <div className={styles.catList}>{workout.categories.map((c) => <span key={c.id}>{c.name}</span>)}</div>
    </div>
  </article>;
}

function Skeleton() {
  return <div className={styles.list} aria-label="Загрузка каталога">{[0, 1, 2].map((i) => <div key={i} className={`${styles.card} ${styles.skeleton}`}><i /><span /><b /></div>)}</div>;
}

export function CatalogScreen({ forced = null }: { forced?: Forced }) {
  const router = useRouter();
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);
  const [notice, setNotice] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const catalog = useCatalogQuery(filters, !forced);
  const data = catalog.data ?? null;

  const reset = () => { setFilters(EMPTY_FILTERS); setNotice("Фильтры сброшены"); };
  const update = (key: keyof CatalogFilters, value: string) => setFilters((f) => set(f, key, value));
  const onOpen = (id: string) => router.push(`/?screen=workout&id=${encodeURIComponent(id)}`);
  const categories = data?.categories ?? [];
  const workouts = forced === "empty" ? [] : data?.workouts ?? [];
  const extraFilterCount = [filters.duration, filters.difficulty, filters.format, filters.source, filters.equipment, filters.favorite].filter(Boolean).length;
  const viewState = forced === "loading" ? "loading" : forced === "error" ? "error" : forced === "empty" ? "ready" : catalog.isError ? "error" : catalog.isPending ? "loading" : "ready";
  const explanation = forced === "empty" ? "По таким фильтрам ничего не найдено." : data?.explanation;

  return <div className={`${styles.screen} safe-shell`}>
    <header className={styles.header}>
      <p className={styles.eyebrow}>Каталог</p>
      <h1>Тренировки</h1>
      <p>Поиск по стартовому каталогу Flowly и нескольким YouTube-практикам для примера.</p>
    </header>

    <section className={styles.searchBox} aria-label="Поиск и фильтры">
      <label className={styles.search}><Icon name="search" /><input value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} placeholder="Название, описание, категория" /></label>
      <div className={styles.chips} aria-label="Категории">
        {categories.map((c) => <button key={c.id} type="button" aria-pressed={filters.category === c.slug} onClick={() => update("category", c.slug)}>{c.name}</button>)}
      </div>
      <div className={styles.filterActions}>
        <button type="button" className={styles.filterToggle} aria-expanded={filtersOpen} onClick={() => setFiltersOpen((v) => !v)}><Icon name="settings" />Фильтры{extraFilterCount ? ` · ${extraFilterCount}` : ""}</button>
        {(extraFilterCount > 0 || filters.q || filters.category) && <button type="button" className={styles.resetInline} onClick={reset}>Сбросить</button>}
      </div>
      {filtersOpen && <div className={styles.filterPanel}>
        <p>Уточнить результаты</p>
        <div className={styles.filterGrid}>
          {Object.entries(DURATION).map(([k, v]) => <button key={k} type="button" aria-pressed={filters.duration === k} onClick={() => update("duration", k)}>{v}</button>)}
          {Object.entries(DIFFICULTY).map(([k, v]) => <button key={k} type="button" aria-pressed={filters.difficulty === k} onClick={() => update("difficulty", k)}>{v}</button>)}
          {Object.entries(FORMAT).map(([k, v]) => <button key={k} type="button" aria-pressed={filters.format === k} onClick={() => update("format", k)}>{v}</button>)}
          <button type="button" aria-pressed={filters.equipment === "none"} onClick={() => update("equipment", "none")}>Без инвентаря</button>
          <button type="button" aria-pressed={filters.source === "youtube"} onClick={() => update("source", "youtube")}>YouTube</button>
          <button type="button" aria-pressed={filters.favorite === "1"} onClick={() => update("favorite", "1")}>Избранное</button>
        </div>
      </div>}
    </section>

    {forced === "offline" && <p className={styles.offline}>Офлайн: показываем доступные данные, новые источники подтянутся позже.</p>}
    {viewState === "loading" ? <Skeleton /> : viewState === "error" ? <section className={styles.empty} role="alert"><Icon name="triangle-alert" /><h2>Не удалось загрузить каталог</h2><p>Повторите запрос. Ввод и фильтры сохраняются.</p><Button onClick={() => catalog.refetch()}>Повторить</Button></section> : workouts.length === 0 ? <section className={styles.empty}><Icon name="search-x" /><h2>Ничего не найдено</h2><p>{explanation || "Попробуйте убрать часть фильтров."}</p><Button onClick={reset}>Сбросить фильтры</Button></section> : <><div className={styles.resultBar}><strong>{data?.total ?? workouts.length}</strong><span>результатов</span></div><div className={styles.list}>{workouts.map((w) => <WorkoutCard key={w.id} workout={w} onOpen={onOpen} />)}</div></>}
    <p className={styles.notice} aria-live="polite">{notice}</p>
  </div>;
}
