"use client";

import { Badge, BlockTitle, Button, Card, List, ListItem, Navbar, Preloader, Radio, Searchbar, Sheet, Toggle } from "konsta/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@flowly/ui";
import { GlassIconButton } from "@/components/glass-icon-button";
import { FavoriteButton } from "@/components/workouts/favorite-button";
import { WorkoutMediaCard } from "@/components/workouts/workout-media-card";
import type { CatalogWorkout } from "../model/catalog";
import { DIFFICULTY, DURATION, FORMAT, SOURCE } from "../model/catalog";
import { useCatalogQuery, type CatalogFilters } from "../model/catalog-queries";

type Forced = "loading" | "empty" | "error" | "offline" | null;
type Choice = readonly [value: string, label: string];

const EMPTY_FILTERS: CatalogFilters = { q: "", category: "", duration: "", difficulty: "", format: "", source: "", equipment: "", favorite: "" };
const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";
const choiceFocus = "rounded-full has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent";
const workoutCountLabel = (count: number) => {
  const mod10 = count % 10, mod100 = count % 100;
  return `${count} ${mod10 === 1 && mod100 !== 11 ? "тренировка" : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "тренировки" : "тренировок"}`;
};

function WorkoutCard({ workout, onOpen, eager }: { workout: CatalogWorkout; onOpen: (id: string) => void; eager?: boolean }) {
  const thumb = workout.sourceType === "youtube" && workout.youtubeVideoId ? `https://i.ytimg.com/vi/${workout.youtubeVideoId}/hqdefault.jpg` : workout.coverObjectKey ? `/media/${workout.coverObjectKey}` : "";
  const source = SOURCE[workout.sourceType as keyof typeof SOURCE] ?? workout.sourceType;
  const format = FORMAT[workout.format as keyof typeof FORMAT] ?? workout.format;
  const difficulty = DIFFICULTY[workout.difficulty as keyof typeof DIFFICULTY] ?? workout.difficulty;
  const category = workout.categories[0]?.name;
  return <WorkoutMediaCard
    title={workout.title}
    coverSrc={thumb}
    durationSeconds={workout.durationSeconds}
    metadata={[source, format, difficulty, category, workout.sourceType === "user" ? "Сообщество" : ""].filter(Boolean).join(" · ")}
    eager={eager}
    unoptimized={workout.sourceType === "youtube"}
    onOpen={() => onOpen(workout.id)}
    actions={<FavoriteButton workoutId={workout.id} title={workout.title} isFavorite={Boolean(workout.isFavorite)} workout={workout} />}
  />;
}

function FilterGroup({ title, name, value, choices, onChange }: { title: string; name: string; value: string; choices: readonly Choice[]; onChange: (value: string) => void }) {
  return <section aria-labelledby={`catalog-filter-${name}`}>
    <BlockTitle component="h3" id={`catalog-filter-${name}`}>{title}</BlockTitle>
    <List strong inset>
      {choices.map(([choice, label]) => <ListItem key={choice || "all"} label title={label} after={<Radio component="div" className={choiceFocus} name={name} value={choice} checked={value === choice} onChange={() => onChange(choice)} />} />)}
    </List>
  </section>;
}

function ToggleFilter({ title, checked, onChange }: { title: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <ListItem label title={title} after={<Toggle component="div" className={choiceFocus} checked={checked} onChange={(event) => onChange(event.target.checked)} />} />;
}

export function CatalogScreen({ forced = null, initialSource = "" }: { forced?: Forced; initialSource?: string }) {
  const router = useRouter();
  const screenRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const initialFilters = useMemo<CatalogFilters>(() => ({ ...EMPTY_FILTERS, source: initialSource }), [initialSource]);
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<CatalogFilters>(initialFilters);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!filtersOpen) return;
    const sheet = sheetRef.current, screen = screenRef.current, trigger = filterButtonRef.current;
    if (!sheet || !screen) return;
    const backgrounds = [screen, document.querySelector<HTMLElement>(".primary-navbar"), document.querySelector<HTMLElement>("[aria-label='Основная навигация']")].filter((element): element is HTMLElement => Boolean(element));
    const previousOverflow = document.documentElement.style.overflow, previousAria = backgrounds.map((element) => element.getAttribute("aria-hidden"));
    sheet.querySelector<HTMLElement>("[data-filter-close]")?.focus();
    for (const element of backgrounds) { element.inert = true; element.setAttribute("aria-hidden", "true"); }
    document.documentElement.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setFiltersOpen(false); return; }
      if (event.key !== "Tab") return;
      const focusable = [...sheet.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])")].filter((element) => element.offsetParent !== null);
      if (!focusable.length) { event.preventDefault(); return; }
      const first = focusable[0]!, last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = previousOverflow;
      backgrounds.forEach((element, index) => { element.inert = false; const value = previousAria[index]; if (value == null) element.removeAttribute("aria-hidden"); else element.setAttribute("aria-hidden", value); });
      requestAnimationFrame(() => trigger?.focus());
    };
  }, [filtersOpen]);

  const queryFilters = useMemo<CatalogFilters>(() => ({ ...filters, q: debouncedSearch }), [debouncedSearch, filters]);
  const catalog = useCatalogQuery(queryFilters, forced === null || forced === "offline");
  const data = catalog.data ?? null;
  const reset = () => { setFilters(EMPTY_FILTERS); setDraftFilters(EMPTY_FILTERS); setSearchInput(""); setDebouncedSearch(""); setNotice("Фильтры сброшены"); };
  const updateDraft = (key: keyof CatalogFilters, value: string) => setDraftFilters((current) => ({ ...current, [key]: value }));
  const openFilters = () => { setDraftFilters(filters); setFiltersOpen(true); };
  const applyFilters = () => { setFilters(draftFilters); setFiltersOpen(false); setNotice("Фильтры применены"); };
  const openYoutube = () => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries({ category: filters.category, duration: filters.duration, difficulty: filters.difficulty, equipment: filters.equipment })) if (value) params.set(key, value);
    router.push(`/youtube${params.size ? `?${params}` : ""}` as never);
  };
  const categories = data?.categories ?? [];
  const workouts = forced === "empty" ? [] : data?.workouts ?? [];
  const extraFilterCount = [filters.category, filters.duration, filters.difficulty, filters.format, filters.source, filters.equipment, filters.favorite].filter(Boolean).length;
  const viewState = forced === "loading" ? "loading" : forced === "error" ? "error" : forced === "empty" ? "ready" : catalog.isError && !data ? "error" : catalog.isPending && !data ? "loading" : "ready";
  const explanation = forced === "empty" ? "По таким фильтрам ничего не найдено." : data?.explanation;
  const categoryChoices = [["", "Любая"], ...categories.map((category) => [category.slug, category.name] as const)] as const;
  const choices = (values: Record<string, string>): readonly Choice[] => [["", "Любая"], ...Object.entries(values)];

  return <>
    <div ref={screenRef} className="flow-screen">
      <h1 className="sr-only">Йога</h1>
      <section aria-label="Поиск и фильтры" className="grid gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor="catalog-search" className="sr-only">Поиск тренировок</label>
          {/* DEC-050: Konsta 5.2.0 Searchbar drops className; this single focus owner restores the required keyboard cue without changing its anatomy. */}
          <div className="min-w-0 flex-1 rounded-3xl focus-within:ring-2 focus-within:ring-inset focus-within:ring-accent"><Searchbar inputId="catalog-search" value={searchInput} onInput={(event) => setSearchInput(event.target.value)} clearButton={false} placeholder="Поиск" /></div>
          {searchInput && <Button inline clear rounded className={`h-11 w-11 min-w-11 p-0 ${focusRing}`} aria-label="Очистить поиск" onClick={() => setSearchInput("")}><Icon name="x" /></Button>}
          <span className="relative inline-flex shrink-0">
            <GlassIconButton ref={filterButtonRef} icon="funnel" className={focusRing} aria-label={extraFilterCount ? `Открыть фильтры, выбрано: ${extraFilterCount}` : "Открыть фильтры"} aria-haspopup="dialog" aria-expanded={filtersOpen} onClick={openFilters} />
            {extraFilterCount > 0 && <Badge aria-hidden="true" className="pointer-events-none absolute -right-1 -top-1 z-20 min-w-5">{extraFilterCount}</Badge>}
          </span>
        </div>
      </section>

      {forced === "offline" && <Card component="aside" outline className="m-0" role="status" contentWrapPadding="p-3"><p className="m-0 text-sm text-text-muted">Офлайн: показываем доступные данные, новые источники подтянутся позже.</p></Card>}
      {viewState === "loading" ? <div className="grid min-h-48 place-items-center" role="status" aria-live="polite" aria-busy="true"><Preloader /><span className="sr-only">Загружаем каталог</span></div> : viewState === "error" ? <Card component="section" outline className="m-0 text-center" role="alert" contentWrapPadding="p-6 grid justify-items-center gap-3"><Icon name="triangle-alert" /><h2 className="m-0 text-lg font-semibold">Не удалось загрузить каталог</h2><p className="m-0 text-sm text-text-muted">Повторите запрос. Ввод и фильтры сохраняются.</p><Button large rounded className={focusRing} onClick={() => catalog.refetch()}>Повторить</Button></Card> : workouts.length === 0 ? <Card component="section" outline className="m-0 text-center" contentWrapPadding="p-6 grid justify-items-center gap-3"><Icon name="search-x" /><h2 className="m-0 text-lg font-semibold">Ничего не найдено</h2><p className="m-0 text-sm text-text-muted">{explanation || "Попробуйте убрать часть фильтров."}</p><Button large rounded className={focusRing} onClick={reset}>Сбросить фильтры</Button><Button clear rounded className={focusRing} onClick={openYoutube}>Искать видео</Button></Card> : <>
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold"><span aria-live="polite">{workoutCountLabel(data?.total ?? workouts.length)}</span><span aria-hidden="true" className="text-text-muted">·</span><Button inline clear small rounded className={focusRing} onClick={openYoutube}>Искать видео</Button></div>
        <div className="grid gap-2">{workouts.map((workout, index) => <WorkoutCard key={workout.id} workout={workout} eager={index < 2} onOpen={(id) => router.push(`/workouts/${encodeURIComponent(id)}` as never)} />)}</div>
      </>}
      {notice && <p className="m-0 text-sm text-text-muted" aria-live="polite">{notice}</p>}
    </div>

    {filtersOpen && <Sheet ref={sheetRef} opened backdrop onBackdropClick={() => setFiltersOpen(false)} className="flex h-[82dvh] max-h-[44rem] flex-col" role="dialog" aria-modal="true" aria-labelledby="catalog-filter-title">
      <Navbar title={<span id="catalog-filter-title">Уточнить каталог</span>} titleClassName="!text-xl" right={<Button data-filter-close inline clear rounded className={`h-11 w-11 min-w-11 p-0 ${focusRing}`} aria-label="Закрыть фильтры" onClick={() => setFiltersOpen(false)}><Icon name="x" /></Button>} />
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <FilterGroup title="Категория" name="category" value={draftFilters.category} choices={categoryChoices} onChange={(value) => updateDraft("category", value)} />
        <FilterGroup title="Длительность" name="duration" value={draftFilters.duration} choices={choices(DURATION)} onChange={(value) => updateDraft("duration", value)} />
        <FilterGroup title="Сложность" name="difficulty" value={draftFilters.difficulty} choices={choices(DIFFICULTY)} onChange={(value) => updateDraft("difficulty", value)} />
        <FilterGroup title="Формат" name="format" value={draftFilters.format} choices={choices(FORMAT)} onChange={(value) => updateDraft("format", value)} />
        <BlockTitle component="h3">Дополнительно</BlockTitle>
        <List strong inset>
          <ToggleFilter title="Без инвентаря" checked={draftFilters.equipment === "none"} onChange={(checked) => updateDraft("equipment", checked ? "none" : "")} />
          <ToggleFilter title="YouTube" checked={draftFilters.source === "youtube"} onChange={(checked) => updateDraft("source", checked ? "youtube" : "")} />
          <ToggleFilter title="Избранное" checked={draftFilters.favorite === "1"} onChange={(checked) => updateDraft("favorite", checked ? "1" : "")} />
        </List>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-border p-4 pb-safe-4"><Button clear rounded className={focusRing} onClick={() => setDraftFilters(EMPTY_FILTERS)}>Сбросить</Button><Button large rounded className={focusRing} onClick={applyFilters}>Готово</Button></div>
    </Sheet>}
  </>;
}
