"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button, Icon } from "@flowly/ui";
import type { CatalogWorkout } from "../model/catalog";
import { DIFFICULTY, DURATION, FORMAT, SOURCE, minutes } from "../model/catalog";
import { useCatalogQuery, type CatalogFilters } from "../model/catalog-queries";
import styles from "./catalog-screen.module.css";

type Forced = "loading" | "empty" | "error" | "offline" | null;

const EMPTY_FILTERS: CatalogFilters = { q: "", category: "", duration: "", difficulty: "", format: "", source: "", equipment: "", favorite: "" };
const set = (filters: CatalogFilters, key: keyof CatalogFilters, value: string): CatalogFilters => ({ ...filters, [key]: filters[key] === value ? "" : value });
const workoutCountLabel = (count: number) => {
  const mod10 = count % 10, mod100 = count % 100;
  return `${count} ${mod10 === 1 && mod100 !== 11 ? "тренировка" : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "тренировки" : "тренировок"}`;
};

function WorkoutCard({ workout, onOpen }: { workout: CatalogWorkout; onOpen: (id: string) => void }) {
  const thumb = workout.sourceType === "youtube" && workout.youtubeVideoId ? `https://i.ytimg.com/vi/${workout.youtubeVideoId}/hqdefault.jpg` : workout.coverObjectKey ? `/media/${workout.coverObjectKey}` : "";
  const tags = [DIFFICULTY[workout.difficulty as keyof typeof DIFFICULTY] ?? workout.difficulty, workout.equipment.length === 0 ? "Без инвентаря" : workout.equipment[0], workout.categories[0]?.name].filter(Boolean).slice(0, 3);
  return <article className={`${styles.card} ${thumb ? "" : styles.cardTextOnly}`} role="button" tabIndex={0} onClick={() => onOpen(workout.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(workout.id); } }} aria-label={`Открыть ${workout.title}`}>
    {thumb && <div className={styles.cover} data-source={workout.sourceType} style={{ backgroundImage: `${workout.sourceType === "youtube" ? "linear-gradient(135deg, rgba(28, 45, 39, 0.1), rgba(28, 45, 39, 0.55)), " : ""}url(${thumb})` }} aria-hidden="true">{workout.sourceType === "youtube" && <Icon name="play" />}</div>}
    <div className={styles.cardBody}>
      <div className={styles.cardTop}><span className={styles.source}>{SOURCE[workout.sourceType as keyof typeof SOURCE] ?? workout.sourceType}</span><span>{minutes(workout.durationSeconds)}</span></div>
      <h2 className="flow-card-title">{workout.title}</h2>
      <p>{workout.description}</p>
    </div>
    <div className={styles.meta}>{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
  </article>;
}

function Skeleton() {
  return <div className={styles.list} aria-label="Загрузка каталога">{[0, 1, 2].map((i) => <div key={i} className={`${styles.card} ${styles.skeleton}`}><i /><span /><b /></div>)}</div>;
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return <div className={styles.filterGroup}><h3>{title}</h3><div>{children}</div></div>;
}

export function CatalogScreen({ forced = null }: { forced?: Forced }) {
  const router = useRouter();
  const [filters, setFilters] = useState<CatalogFilters>(EMPTY_FILTERS);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<CatalogFilters>(EMPTY_FILTERS);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryFilters = useMemo<CatalogFilters>(() => ({ ...filters, q: debouncedSearch }), [debouncedSearch, filters]);
  const catalog = useCatalogQuery(queryFilters, !forced);
  const data = catalog.data ?? null;

  const reset = () => { setFilters(EMPTY_FILTERS); setDraftFilters(EMPTY_FILTERS); setSearchInput(""); setDebouncedSearch(""); setNotice("Фильтры сброшены"); };
  const updateDraft = (key: keyof CatalogFilters, value: string) => setDraftFilters((f) => set(f, key, value));
  const openFilters = () => { setDraftFilters(filters); setFiltersOpen(true); };
  const applyFilters = () => { setFilters(draftFilters); setFiltersOpen(false); };
  const onOpen = (id: string) => router.push(`/workouts/${encodeURIComponent(id)}` as never);
  const openYoutube = () => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ category: filters.category, duration: filters.duration, difficulty: filters.difficulty, equipment: filters.equipment })) if (value) params.set(key, value);
    router.push(`/youtube${params.size ? `?${params}` : ""}` as never);
  };
  const categories = data?.categories ?? [];
  const workouts = forced === "empty" ? [] : data?.workouts ?? [];
  const extraFilterCount = [filters.category, filters.duration, filters.difficulty, filters.format, filters.source, filters.equipment, filters.favorite].filter(Boolean).length;
  const viewState = forced === "loading" ? "loading" : forced === "error" ? "error" : forced === "empty" ? "ready" : catalog.isError ? "error" : catalog.isPending ? "loading" : "ready";
  const explanation = forced === "empty" ? "По таким фильтрам ничего не найдено." : data?.explanation;

  return <div className={`flow-screen ${styles.screen}`}>
    <header className={`flow-top ${styles.header}`}>
      <p className="flow-eyebrow">Каталог</p>
      <h1 className="flow-title">Тренировки</h1>

    </header>

    <section className={styles.searchBox} aria-label="Поиск и фильтры">
      <div className={styles.searchRow}>
        <label className={styles.search}><Icon name="search" /><input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Поиск тренировок" /></label>
        <button type="button" className={styles.filterToggle} aria-haspopup="dialog" aria-expanded={filtersOpen} onClick={openFilters}><Icon name="settings" />{extraFilterCount ? `Фильтры · ${extraFilterCount}` : "Фильтры"}</button>
      </div>

      {filtersOpen && <div className={styles.sheetBackdrop} role="presentation" onClick={() => setFiltersOpen(false)}>
        <section className={styles.filterSheet} role="dialog" aria-modal="true" aria-labelledby="catalog-filter-title" onClick={(event) => event.stopPropagation()}>
          <div className={styles.sheetTop}><div><p className="flow-eyebrow">Фильтры</p><h2 id="catalog-filter-title">Уточнить каталог</h2></div><button type="button" aria-label="Закрыть фильтры" onClick={() => setFiltersOpen(false)}><Icon name="x" /></button></div>
          <div className={styles.sheetBody}>
            <FilterGroup title="Категория">{categories.map((c) => <button key={c.id} type="button" aria-pressed={draftFilters.category === c.slug} onClick={() => updateDraft("category", c.slug)}>{c.name}</button>)}</FilterGroup>
            <FilterGroup title="Длительность">{Object.entries(DURATION).map(([k, v]) => <button key={k} type="button" aria-pressed={draftFilters.duration === k} onClick={() => updateDraft("duration", k)}>{v}</button>)}</FilterGroup>
            <FilterGroup title="Сложность">{Object.entries(DIFFICULTY).map(([k, v]) => <button key={k} type="button" aria-pressed={draftFilters.difficulty === k} onClick={() => updateDraft("difficulty", k)}>{v}</button>)}</FilterGroup>
            <FilterGroup title="Формат">{Object.entries(FORMAT).map(([k, v]) => <button key={k} type="button" aria-pressed={draftFilters.format === k} onClick={() => updateDraft("format", k)}>{v}</button>)}</FilterGroup>
            <FilterGroup title="Дополнительно"><button type="button" aria-pressed={draftFilters.equipment === "none"} onClick={() => updateDraft("equipment", "none")}>Без инвентаря</button><button type="button" aria-pressed={draftFilters.source === "youtube"} onClick={() => updateDraft("source", "youtube")}>YouTube</button><button type="button" aria-pressed={draftFilters.favorite === "1"} onClick={() => updateDraft("favorite", "1")}>Избранное</button></FilterGroup>
          </div>
          <div className={styles.sheetActions}><button type="button" onClick={() => setDraftFilters(EMPTY_FILTERS)}>Сбросить</button><button type="button" onClick={applyFilters}>Готово</button></div>
        </section>
      </div>}
    </section>

    {forced === "offline" && <p className={styles.offline}>Офлайн: показываем доступные данные, новые источники подтянутся позже.</p>}
    {viewState === "loading" ? <Skeleton /> : viewState === "error" ? <section className={styles.empty} role="alert"><Icon name="triangle-alert" /><h2 className="flow-section-title">Не удалось загрузить каталог</h2><p>Повторите запрос. Ввод и фильтры сохраняются.</p><Button onClick={() => catalog.refetch()}>Повторить</Button></section> : workouts.length === 0 ? <section className={styles.empty}><Icon name="search-x" /><h2 className="flow-section-title">Ничего не найдено</h2><p>{explanation || "Попробуйте убрать часть фильтров."}</p><div className={styles.emptyActions}><Button onClick={reset}>Сбросить фильтры</Button><button type="button" onClick={openYoutube}>Искать видео</button></div></section> : <><div className={styles.resultBar}><span>{workoutCountLabel(data?.total ?? workouts.length)}</span><button type="button" className={styles.videoLink} onClick={openYoutube}>Искать видео</button></div><div className={styles.list}>{workouts.map((w) => <WorkoutCard key={w.id} workout={w} onOpen={onOpen} />)}</div></>}
    <p className={styles.notice} aria-live="polite">{notice}</p>
  </div>;
}
