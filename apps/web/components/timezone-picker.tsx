"use client";

import { Button, Card, List, ListItem, Navbar, Searchbar, Sheet } from "konsta/react";
import { useMemo, useState, type ReactNode } from "react";
import { Icon } from "@flowly/ui";

export type TimezoneOption = { value: string; label: string; group?: string; keywords?: string[]; meta?: string };

export const detectedTimezone =
  typeof Intl !== "undefined"
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : "UTC";

/** IANA timezones grouped by region (no manual typing — pick from a list). */
const TIMEZONE_GROUPS: Record<string, string[]> = (() => {
  const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
  const all = (intl.supportedValuesOf?.("timeZone") ?? []).filter((tz) => tz.includes("/"));
  const groups: Record<string, string[]> = {};
  const push = (tz: string) => {
    const region = tz.split("/")[0] ?? "Other";
    (groups[region] ??= []).push(tz);
  };
  for (const tz of all) push(tz);
  if (detectedTimezone !== "UTC" && !all.includes(detectedTimezone)) push(detectedTimezone);
  return groups;
})();

/** Russian city aliases so users can search in Cyrillic (e.g. «самара»). */
const RU_TZ_KEYWORDS: Record<string, string[]> = {
  "Europe/Moscow": ["москва", "мск", "санкт-петербург", "спб", "петербург"],
  "Europe/Kaliningrad": ["калининград"],
  "Europe/Samara": ["самара"],
  "Europe/Volgograd": ["волгоград"],
  "Europe/Saratov": ["саратов"],
  "Europe/Astrakhan": ["астрахань"],
  "Europe/Ulyanovsk": ["ульяновск"],
  "Europe/Kirov": ["киров"],
  "Asia/Yekaterinburg": ["екатеринбург", "екб"],
  "Asia/Omsk": ["омск"],
  "Asia/Novosibirsk": ["новосибирск"],
  "Asia/Barnaul": ["барнаул"],
  "Asia/Tomsk": ["томск"],
  "Asia/Krasnoyarsk": ["красноярск"],
  "Asia/Irkutsk": ["иркутск"],
  "Asia/Chita": ["чита"],
  "Asia/Yakutsk": ["якутск"],
  "Asia/Vladivostok": ["владивосток"],
  "Asia/Sakhalin": ["сахалин", "южно-сахалинск"],
  "Asia/Magadan": ["магадан"],
  "Asia/Kamchatka": ["камчатка", "петропавловск-камчатский"],
  "Asia/Anadyr": ["анадырь"],
  "Asia/Chelyabinsk": ["челябинск"],
  "Asia/Tyumen": ["тюмень"],
  "Europe/Minsk": ["минск"],
  "Europe/Kyiv": ["киев", "київ"],
  "Europe/Chisinau": ["кишинёв", "кишинев"],
  "Asia/Tbilisi": ["тбилиси"],
  "Asia/Yerevan": ["ереван"],
  "Asia/Baku": ["баку"],
  "Asia/Almaty": ["алматы", "алма-ата", "астана", "нур-султан"],
  "Asia/Tashkent": ["ташкент"],
  "Asia/Samarkand": ["самарканд"],
  "Asia/Bishkek": ["бишкек"],
  "Asia/Dushanbe": ["душанбе"],
  "Asia/Ashgabat": ["ашхабад"],
  "Asia/Dubai": ["дубай"],
  "Asia/Istanbul": ["стамбул"],
  "Asia/Nicosia": ["никосия", "кипр"],
  "Asia/Jerusalem": ["тель-авив", "иерусалим"],
  "Europe/Berlin": ["берлин"],
  "Europe/London": ["лондон"],
  "Europe/Paris": ["париж"],
  "Europe/Amsterdam": ["амстердам"],
  "Europe/Brussels": ["брюссель"],
  "Europe/Vienna": ["вена"],
  "Europe/Prague": ["прага"],
  "Europe/Warsaw": ["варшава"],
  "Europe/Rome": ["рим"],
  "Europe/Madrid": ["мадрид"],
  "Europe/Athens": ["афины"],
  "Europe/Helsinki": ["хельсинки"],
  "Europe/Stockholm": ["стокгольм"],
  "Europe/Oslo": ["осло"],
  "Europe/Copenhagen": ["копенгаген"],
  "Europe/Zurich": ["цюрих", "берн", "базель"],
  "Europe/Riga": ["рига"],
  "Europe/Vilnius": ["вильнюс"],
  "Europe/Tallinn": ["таллин"],
  "America/New_York": ["нью-йорк"],
  "America/Los_Angeles": ["лос-анджелес"],
  "America/Chicago": ["чикаго"],
  "America/Toronto": ["торонто"],
};

const getTimezoneMeta = (timezone: string) => {
  const now = new Date();
  const time = new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
    hour12: false,
  }).format(now);

  let offset = "";
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    }).formatToParts(now);
    offset = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    }).formatToParts(now);
    offset = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  }

  return [offset, time].filter(Boolean).join(" · ");
};

export const buildTimezoneOptions = (): TimezoneOption[] =>
  Object.entries(TIMEZONE_GROUPS).flatMap(([region, list]) =>
    list.map((tz) => ({
      value: tz,
      label: tz.slice(tz.indexOf("/") + 1).replace(/_/g, " "),
      group: region,
      meta: getTimezoneMeta(tz),
      keywords: RU_TZ_KEYWORDS[tz],
    })),
  );

/** DEC-036/041: one shared direct-Konsta timezone picker for onboarding and settings. */
export function TimezonePicker({ options, value, onChange, children }: { options: TimezoneOption[]; value: string; onChange: (value: string) => void; children?: ReactNode }) {
  const [opened, setOpened] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((option) => [option.label, option.value, option.group ?? "", option.meta ?? "", ...(option.keywords ?? [])].join(" ").toLowerCase().includes(q)) : options;
  }, [options, query]);
  const groups = useMemo(() => filtered.reduce((map, option) => { const group = option.group ?? "Другое"; map.set(group, [...(map.get(group) ?? []), option]); return map; }, new Map<string, TimezoneOption[]>()), [filtered]);
  return <>
    <List strong inset dividers><ListItem link linkComponent="button" contentClassName="w-full" innerClassName="text-left" linkProps={{ type: "button", onClick: () => setOpened(true) }} title="Часовой пояс" subtitle={selected?.label ?? value} after={selected?.meta} />{children}</List>
    {opened && <Sheet opened onBackdropClick={() => setOpened(false)} className="flex h-[min(88dvh,46rem)] flex-col gap-2 overflow-hidden">
      <Navbar title="Часовой пояс" right={<Button inline clear rounded={false} onClick={() => setOpened(false)}>Готово</Button>} />
      <div className="px-4"><Searchbar value={query} onInput={(event) => setQuery(event.target.value)} onClear={() => setQuery("")} placeholder="Город, регион или время" /></div>
      <div className="min-h-0 overflow-auto pb-[calc(var(--component-safe-area-bottom)+1rem)]">{filtered.length === 0 ? <Card outline><p className="m-0">Ничего не найдено</p></Card> : [...groups.entries()].map(([group, items]) => <List key={group} strong inset dividers className="my-2"><ListItem groupTitle title={group} colors={{ groupTitleBgIos: "bg-surface-subtle", secondaryTextIos: "text-text-muted" }} />{items.map((option) => <ListItem key={option.value} link chevron={false} linkComponent="button" contentClassName="w-full" innerClassName="text-left" linkProps={{ type: "button", onClick: () => { onChange(option.value); setOpened(false); } }} title={option.label} subtitle={option.meta} after={option.value === value ? <Icon name="check" /> : null} />)}</List>)}</div>
    </Sheet>}
  </>;
}
