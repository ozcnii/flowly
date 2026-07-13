"use client";

import Image from "next/image";
import { useState } from "react";
import { AppHeader, Badge, BottomNavigation, Button, Card, EmptyState, Icon, IconButton, InlineError, OfflineBanner, Progress, Skeleton, type NavigationItem } from "@flowly/ui";
import styles from "./ui-kit.module.css";

const navItems: NavigationItem[] = [
  { id: "home", href: "#home", label: "Главная", icon: <Icon name="house" /> },
  { id: "workouts", href: "#workouts", label: "Тренировки", icon: <Icon name="dumbbell" /> },
  { id: "programs", href: "#programs", label: "Программы", icon: <Icon name="sparkles" />, badge: "2" },
  { id: "rhythm", href: "#rhythm", label: "Мой ритм", icon: <Icon name="leaf" /> },
  { id: "calendar", href: "#calendar", label: "Календарь", icon: <Icon name="calendar-days" /> },
];

const swatches = [
  ["Canvas", "var(--color-canvas)"], ["Surface", "var(--color-surface)"], ["Accent", "var(--color-accent)"],
  ["Accent soft", "var(--color-accent-soft)"], ["Success", "var(--color-success)"], ["Warning", "var(--color-warning)"],
  ["Danger", "var(--color-danger)"], ["Info", "var(--color-info)"],
] as const;

export function UIKitClient() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(64);
  const [activeNav, setActiveNav] = useState("home");
  const [message, setMessage] = useState("Компоненты готовы к проверке");

  const simulateLoading = () => {
    setLoading(true);
    setMessage("Показываем loading-состояние кнопки");
    window.setTimeout(() => { setLoading(false); setMessage("Действие завершено"); }, 1200);
  };

  return <div className={styles.page} data-theme={theme}>
    <header className={styles.topbar}>
      <a href="#content" className={styles.skip}>К компонентам</a>
      <a href="/ui-kit" className={styles.brand} aria-label="Flowly UI Kit — начало страницы">
        <Image src="/brand/flowly-icon.svg" alt="" width={44} height={44} priority />
        <span><strong>Flowly</strong><small>Production UI Kit</small></span>
      </a>
      <div className={styles.themeControl} role="group" aria-label="Тема интерфейса">
        <button type="button" aria-pressed={theme === "light"} onClick={() => setTheme("light")}><Icon name="sun" />Светлая</button>
        <button type="button" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}><Icon name="moon" />Тёмная</button>
      </div>
    </header>

    <main id="content" className={styles.main}>
      <section className={styles.hero}>
        <Badge tone="success" icon={<Icon name="check" />}>Production foundation</Badge>
        <h1>Компоненты Flowly,<br />готовые к реальным экранам</h1>
        <p>Единые токены, доступные состояния и адаптивное поведение. Переключайте тему и проверяйте интеракции прямо на странице.</p>
        <div className={styles.heroActions}>
          <Button size="lg" leadingIcon={<Icon name="arrow-down" />} onClick={() => document.querySelector("#actions")?.scrollIntoView({ behavior: "smooth" })}>Смотреть компоненты</Button>
          <Button size="lg" variant="ghost" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>Сменить тему</Button>
        </div>
      </section>

      <div className={styles.status} aria-live="polite"><Icon name="info" />{message}</div>

      <section className={styles.section} aria-labelledby="foundations-title">
        <div className={styles.sectionHeading}><span>01</span><div><h2 id="foundations-title">Основы</h2><p>Семантические цвета и типографическая иерархия автоматически адаптируются к теме.</p></div></div>
        <div className={styles.swatches}>{swatches.map(([name, color]) => <div key={name} className={styles.swatch}><i style={{ background: color }} /><strong>{name}</strong><code>{color.replace("var(--color-", "").replace(")", "")}</code></div>)}</div>
        <Card className={styles.typeSpecimen}>
          <p className={styles.display}>Двигайся в своём ритме</p>
          <h3>Заголовок помогает быстро понять главное</h3>
          <p>Основной текст остаётся спокойным и хорошо читаемым. Вторичный текст сообщает дополнительные детали без визуального шума.</p>
          <small>Подпись · Inter 14</small>
        </Card>
      </section>

      <section id="actions" className={styles.section} aria-labelledby="actions-title">
        <div className={styles.sectionHeading}><span>02</span><div><h2 id="actions-title">Действия</h2><p>Primary, secondary, ghost, danger, размеры и обязательные состояния.</p></div></div>
        <Card className={styles.demoCard}>
          <div className={styles.row}>
            <Button leadingIcon={<Icon name="play" />}>Начать тренировку</Button>
            <Button variant="secondary" leadingIcon={<Icon name="bookmark" />}>Сохранить</Button>
            <Button variant="ghost">Подробнее</Button>
            <Button variant="danger" leadingIcon={<Icon name="trash-2" />}>Удалить</Button>
          </div>
          <div className={styles.row}>
            <Button size="sm">Small</Button><Button size="md">Medium</Button><Button size="lg">Large</Button>
          </div>
          <div className={styles.row}>
            <Button loading={loading} onClick={simulateLoading}>Сохранить изменения</Button>
            <Button disabled>Недоступно</Button>
            <IconButton label="Добавить в избранное" icon={<Icon name="heart" />} onClick={() => setMessage("Добавлено в избранное")} />
            <IconButton label="Удалить элемент" variant="danger" icon={<Icon name="trash-2" />} onClick={() => setMessage("Нажата destructive icon action")} />
          </div>
        </Card>
      </section>

      <section className={styles.section} aria-labelledby="surfaces-title">
        <div className={styles.sectionHeading}><span>03</span><div><h2 id="surfaces-title">Поверхности и данные</h2><p>Карточки, статусы и прогресс для контента разной плотности.</p></div></div>
        <div className={styles.cardGrid}>
          <Card><Badge>Базовая</Badge><h3>Мягкая поверхность</h3><p>Основной контейнер для связанного контента.</p></Card>
          <Card tone="subtle"><Badge tone="info">Новая</Badge><h3>Спокойный акцент</h3><p>Выделяет блок, не конкурируя с главным действием.</p></Card>
          <Card tone="accent"><Badge tone="neutral">Сегодня</Badge><h3>Йога для спины</h3><p>24 минуты · лёгкая интенсивность</p></Card>
        </div>
        <Card className={styles.demoCard}>
          <div className={styles.badges}><Badge>Черновик</Badge><Badge tone="success">Готово</Badge><Badge tone="warning">Нужна пауза</Badge><Badge tone="danger">Ошибка</Badge><Badge tone="info">Информация</Badge></div>
          <Progress value={progress} label="Недельная цель" showValue />
          <div className={styles.row}><Button size="sm" variant="secondary" onClick={() => setProgress(Math.max(0, progress - 10))}>− 10%</Button><Button size="sm" variant="secondary" onClick={() => setProgress(Math.min(100, progress + 10))}>+ 10%</Button></div>
        </Card>
      </section>

      <section className={styles.section} aria-labelledby="navigation-title">
        <div className={styles.sectionHeading}><span>04</span><div><h2 id="navigation-title">Навигация</h2><p>App header и нижняя навигация в контексте мобильного экрана.</p></div></div>
        <div className={styles.phone}>
          <AppHeader eyebrow="Добрый вечер" title="Ваш ритм" subtitle="Понедельник, 13 июля" leading={<Image src="/brand/flowly-icon.svg" alt="" width={44} height={44} />} trailing={<IconButton label="Открыть профиль" icon={<Icon name="user" />} />} />
          <div className={styles.phoneBody}>
            <Badge tone="success">План на сегодня</Badge><h3>{navItems.find(item => item.id === activeNav)?.label}</h3><p>Выберите другой раздел в нижней навигации.</p>
            <Card tone="subtle"><Progress value={3} max={5} label="Тренировки на неделе" showValue /></Card>
          </div>
          <BottomNavigation items={navItems} activeId={activeNav} onNavigate={id => { setActiveNav(id); setMessage(`Открыт раздел «${navItems.find(item => item.id === id)?.label}»`); }} />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="feedback-title">
        <div className={styles.sectionHeading}><span>05</span><div><h2 id="feedback-title">Состояния и обратная связь</h2><p>Loading, empty, error и offline не проектируются заново на каждом экране.</p></div></div>
        <div className={styles.feedbackGrid}>
          <Card className={styles.skeletonDemo}><Badge>Loading</Badge><Skeleton height="hero" /><Skeleton /><Skeleton /></Card>
          <EmptyState icon={<Icon name="calendar-plus" />} title="Пока ничего не запланировано" description="Добавьте первую тренировку — она появится здесь." actionLabel="Добавить тренировку" onAction={() => setMessage("Empty state action нажата")} />
        </div>
        <div className={styles.feedbackStack}>
          <InlineError icon={<Icon name="triangle-alert" />} description="Проверьте соединение и попробуйте ещё раз." onRetry={() => setMessage("Повторная загрузка запущена")} />
          <OfflineBanner icon={<Icon name="wifi-off" />} actionLabel="Подробнее" onAction={() => setMessage("Открыта информация об offline-режиме")}>Нет сети. Изменения сохранятся на устройстве.</OfflineBanner>
        </div>
      </section>
    </main>

    <footer className={styles.footer}><Image src="/brand/flowly-icon.svg" alt="" width={36} height={36} /><span><strong>Flowly UI Kit</strong><small>Foundation for approved product screens</small></span></footer>
  </div>;
}
