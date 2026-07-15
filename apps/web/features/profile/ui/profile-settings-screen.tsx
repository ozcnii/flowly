"use client";

import { BlockFooter, BlockTitle, List, ListInput, ListItem, Navbar, NavbarBackLink, Preloader, Segmented, SegmentedButton, Toggle } from "konsta/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMeQuery, usePatchMeMutation, type PublicUser, type ReportSettings } from "../model/me-queries";
import { rootNavbarClassName, rootNavbarStyle } from "@/components/shell/primary-navbar";
import { buildTimezoneOptions, detectedTimezone, TimezonePicker } from "@/components/timezone-picker";

const THEMES = [
  { value: "system", label: "Авто" },
  { value: "light", label: "Светлая" },
  { value: "dark", label: "Тёмная" },
] as const;

const REPORTS = [
  { id: "weekly", label: "Недельный отчёт", hint: "Итоги недели и мягкая рекомендация" },
  { id: "monthly", label: "Месячный отчёт", hint: "Длинная динамика без лишних уведомлений" },
] as const;

const THEME_STORAGE_KEY = "flowly-theme";
const initialTheme = () => typeof window === "undefined" ? "system" : ["light", "dark", "system"].includes(localStorage.getItem(THEME_STORAGE_KEY) ?? "") ? localStorage.getItem(THEME_STORAGE_KEY)! : "system";
const applyTheme = (theme: string) => {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  const resolved = theme === "light" || theme === "dark" ? theme : window.Telegram?.WebApp?.colorScheme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.dataset.theme = resolved;
  document.documentElement.classList.toggle("dark", resolved === "dark");
  window.dispatchEvent(new Event("flowly-theme-change"));
};

/**
 * S-MA-090 — Profile settings (F11, §27, §38.1; DEC-020/022/024/025/027).
 * Flowly name is editable separately from Telegram. Avatar is read-only from Telegram.
 */
export function ProfileSettingsScreen() {
  const router = useRouter();
  const me = useMeQuery();
  return me.data ? <ProfileSettingsForm user={me.data.user} reportSettings={me.data.settings} /> : <div className="min-h-dvh"><Navbar className={rootNavbarClassName} style={rootNavbarStyle} title="Настройки" left={<NavbarBackLink aria-label="Назад" onClick={() => router.back()} />} /><main className="grid min-h-[70dvh] place-items-center" role="status" aria-live="polite"><Preloader /><span className="sr-only">Загружаем настройки</span></main></div>;
}

function ProfileSettingsForm({ user, reportSettings }: { user: PublicUser; reportSettings: ReportSettings }) {
  const router = useRouter();
  const forced = useSearchParams().get("settings");
  const timezoneOptions = useMemo(() => buildTimezoneOptions(), []);
  const [firstName, setFirstName] = useState(user.firstName);
  const [timezone, setTimezone] = useState(user.timezone === "UTC" ? detectedTimezone : user.timezone);
  const [theme, setTheme] = useState(initialTheme);
  const [reports, setReports] = useState(() => new Set<string>([...(reportSettings.weeklyReportEnabled ? ["weekly"] : []), ...(reportSettings.monthlyReportEnabled ? ["monthly"] : [])]));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error" | "offline">("idle");
  const { mutateAsync } = usePatchMeMutation();
  const reportsKey = useMemo(() => [...reports].sort().join(","), [reports]);
  const draftKey = `${firstName}\0${timezone}\0${theme}\0${reportsKey}`;
  const lastSaved = useRef(draftKey);

  const saveDraft = useCallback(async () => {
    const name = firstName.trim();
    if (!name) return setStatus("error");
    if (forced === "offline") return setStatus("offline");
    if (forced === "error") return setStatus("error");
    try {
      applyTheme(theme);
      await mutateAsync({ firstName: name, timezone, weeklyReportEnabled: reports.has("weekly"), monthlyReportEnabled: reports.has("monthly") });
      lastSaved.current = draftKey;
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }, [draftKey, firstName, forced, mutateAsync, reports, theme, timezone]);

  useEffect(() => {
    if (draftKey === lastSaved.current) return;
    setStatus("saving");
    const timer = window.setTimeout(() => void saveDraft(), 550);
    return () => window.clearTimeout(timer);
  }, [draftKey, saveDraft]);

  const toggleReport = (id: string) => setReports((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <div className="min-h-dvh">
      <Navbar className={rootNavbarClassName} style={rootNavbarStyle} title="Настройки" left={<NavbarBackLink aria-label="Назад" onClick={() => router.back()} />} />
      <main>
        <BlockTitle>Имя в Flowly</BlockTitle>
        <List className="mt-8 mb-2">
          {/* Konsta 5.2.0 ListInput forwards title=null into cls(); empty HTML title avoids its null-constructor crash. */}
          <ListInput title="" outline type="text" value={firstName} placeholder="Введите имя" onInput={(event) => setFirstName(event.currentTarget.value)} maxLength={64} />
        </List>

        <BlockTitle>Часовой пояс</BlockTitle>
        <TimezonePicker options={timezoneOptions} value={timezone} onChange={setTimezone} />

        <BlockTitle>Тема оформления</BlockTitle>
        <List strong inset>
          <ListItem innerChildren={<Segmented strong rounded role="radiogroup" aria-label="Тема интерфейса">{THEMES.map((item) => <SegmentedButton key={item.value} active={theme === item.value} aria-pressed={theme === item.value} onClick={() => setTheme(item.value)}>{item.label}</SegmentedButton>)}</Segmented>} />
        </List>

        <BlockTitle>Отчёты</BlockTitle>
        <List strong inset dividers className="!mb-0">
          {REPORTS.map((report) => <ListItem key={report.id} title={report.label} subtitle={report.hint} after={<Toggle checked={reports.has(report.id)} onChange={() => toggleReport(report.id)} aria-label={report.label} />} />)}
        </List>

        {(status === "offline" || status === "error") && <BlockFooter role={status === "error" ? "alert" : "status"} aria-live="polite">{status === "offline" ? "Офлайн: изменения останутся на экране" : "Не удалось сохранить. Проверьте имя."}</BlockFooter>}
      </main>
    </div>
  );
}
