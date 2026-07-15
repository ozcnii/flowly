"use client";

import { Badge, Button, Card, Chip, List, ListItem, Preloader, Progressbar, Searchbar, Segmented, SegmentedButton, Sheet, Tabbar, TabbarLink, Toggle } from "konsta/react";
import { useState } from "react";
import { EmptyState, Icon, InlineError, OfflineBanner, Select, Skeleton } from "@flowly/ui";
import styles from "./ui-kit.module.css";

const zones = [
  { value: "Europe/Moscow", label: "Москва", group: "Европа", meta: "UTC+3" },
  { value: "Europe/Samara", label: "Самара", group: "Европа", meta: "UTC+4" },
  { value: "Asia/Yekaterinburg", label: "Екатеринбург", group: "Азия", meta: "UTC+5" },
];

export function UIKitClient() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(.64);
  const [active, setActive] = useState("home");
  const [zone, setZone] = useState("Europe/Moscow");
  const [sheet, setSheet] = useState(false);
  const [toggle, setToggle] = useState(true);
  const [segment, setSegment] = useState("week");

  const switchTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const simulate = () => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 900);
  };

  return <main className={styles.page}>
    <header className={styles.hero}>
      <span className={styles.kicker}>Flowly × Konsta UI</span>
      <h1>iOS foundation</h1>
      <p>Живая галерея production-компонентов, Flowly palette и обязательных состояний.</p>
      <div className={styles.heroActions}><Button large rounded onClick={simulate}>{loading ? <Preloader /> : <Icon name="sparkles" />}Проверить loading</Button><Button large rounded tonal onClick={switchTheme}><Icon name={theme === "light" ? "moon" : "sun"} />{theme === "light" ? "Тёмная тема" : "Светлая тема"}</Button></div>
    </header>

    <section className={styles.section}>
      <h2>Actions</h2>
      <Card contentWrap={false} outline className={styles.card}>
        <div className={styles.row}><Button inline rounded><Icon name="play" />Начать</Button><Button inline rounded tonal><Icon name="bookmark" />Сохранить</Button><Button inline rounded outline>Подробнее</Button><Button inline rounded clear>Отмена</Button></div>
        <div className={styles.row}><Badge>3</Badge><Chip>Растяжка</Chip><Chip outline>15 минут</Chip><Button inline small rounded disabled>Недоступно</Button></div>
      </Card>
    </section>

    <section className={styles.section}>
      <h2>Forms</h2>
      <Card contentWrap={false} outline className={styles.card}>
        <Searchbar placeholder="Найти практику" />
        <List strong dividers><ListItem title="Недельный отчёт" subtitle="Итоги без лишних уведомлений" after={<Toggle checked={toggle} onChange={() => setToggle((v) => !v)} />} /></List>
        <Segmented strong rounded>{["day", "week", "month"].map((id) => <SegmentedButton key={id} active={segment === id} onClick={() => setSegment(id)}>{id === "day" ? "День" : id === "week" ? "Неделя" : "Месяц"}</SegmentedButton>)}</Segmented>
        <Select options={zones} value={zone} onChange={setZone} ariaLabel="Часовой пояс" searchPlaceholder="Город или регион" />
        <Button inline rounded tonal onClick={() => setSheet(true)}>Открыть sheet</Button>
      </Card>
    </section>

    <section className={styles.section}>
      <h2>Progress & states</h2>
      <Card contentWrap={false} outline className={styles.card}>
        <Progressbar progress={progress} aria-label="Прогресс программы" />
        <div className={styles.row}><Button inline small rounded tonal onClick={() => setProgress(Math.max(0, progress - .1))}>−10%</Button><strong>{Math.round(progress * 100)}%</strong><Button inline small rounded tonal onClick={() => setProgress(Math.min(1, progress + .1))}>+10%</Button></div>
        <div className={styles.skeletons}><Skeleton height="hero" /><Skeleton /><Skeleton /></div>
      </Card>
      <InlineError icon={<Icon name="triangle-alert" />} description="Проверьте соединение и повторите запрос." onRetry={() => undefined} />
      <OfflineBanner icon={<Icon name="wifi-off" />}>Нет сети. Доступные данные остаются на экране.</OfflineBanner>
      <EmptyState icon={<Icon name="calendar-plus" />} title="Пока ничего не запланировано" description="Добавьте первую практику — она появится здесь." actionLabel="Добавить" onAction={() => undefined} />
    </section>

    <section className={styles.section}>
      <h2>Navigation</h2>
      <Tabbar top labels icons className={styles.tabbar}>{[["home", "house", "Главная"], ["workouts", "dumbbell", "Йога"], ["rhythm", "leaf", "Ритм"]].map(([id, icon, label]) => <TabbarLink key={id} active={active === id} component="button" linkProps={{ type: "button" }} icon={<Icon name={icon!} />} label={label} onClick={() => setActive(id!)} />)}</Tabbar>
    </section>

    <Sheet opened={sheet} onBackdropClick={() => setSheet(false)} className={styles.sheet}><div className={styles.sheetHandle} /><h2>Фильтры</h2><p>Konsta Sheet сохраняет iOS-геометрию, Flowly отвечает только за содержимое.</p><div className={styles.row}><Chip>Для спины</Chip><Chip outline>Вечер</Chip></div><Button large rounded onClick={() => setSheet(false)}>Готово</Button></Sheet>
  </main>;
}
