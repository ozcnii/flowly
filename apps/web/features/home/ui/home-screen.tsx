"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { Badge, Button, Card, Icon, IconButton, InlineError, Progress, Skeleton } from "@flowly/ui";
import type { HomeScenario } from "../model/home-scenario";
import { useMeQuery } from "@/features/profile/model/me-queries";
import type { HomeViewModel } from "../model/home-view-model";
import styles from "./home-screen-v2.module.css";

type Props = { data: HomeViewModel; scenario?: HomeScenario };

export function HomeScreen({ data, scenario = "base" }: Props) {
  const [completedHabits, setCompletedHabits] = useState(() => new Set(data.habits.filter(item => item.done).map(item => item.id)));
  const [recommendationState, setRecommendationState] = useState<"error" | "loading" | "ready">(scenario === "module-error" ? "error" : "ready");
  const [notice, setNotice] = useState("");
  const nextAction = data.plan.find(item => item.status === "current") ?? data.plan[0];
  const offline = scenario === "offline";

  if (scenario === "loading") return <HomeLoading />;
  if (scenario === "empty") return <HomeEmpty data={data} />;

  const toggleHabit = (id: string, title: string) => setCompletedHabits(current => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    setNotice(`${title}: ${next.has(id) ? "выполнено" : "снова в плане"}${offline ? " · сохранено на устройстве" : ""}`);
    return next;
  });

  const retryRecommendation = () => {
    setRecommendationState("loading");
    setNotice("Повторно загружаем рекомендации");
    window.setTimeout(() => { setRecommendationState("ready"); setNotice("Рекомендации загружены"); }, 900);
  };

  return <div className={`flow-screen flow-screen--wide ${styles.root}`}>
    <HomeIntro data={data} />

    <Card as="section" tone={scenario === "resume" ? "accent" : "subtle"} className={`${styles.resumeStrip} ${scenario === "resume" ? styles.resumeActive : ""}`} aria-labelledby="resume-title">
      <Image src={data.resume.image} alt="Мягкая практика для спины" width={120} height={90} priority />
      <div><Badge tone="success">{scenario === "resume" ? "Можно продолжить" : "Checkpoint"}</Badge><h2 id="resume-title">Продолжить «{data.resume.title}»</h2><p>{scenario === "resume" ? "Сессия приостановлена · прогресс синхронизирован" : data.resume.meta}</p></div>
      <IconButton label="Продолжить сохранённую тренировку" variant="secondary" icon={<Icon name="play" />} onClick={() => setNotice("Открываем сохранённую тренировку")} />
    </Card>

    <Card as="section" className={styles.progressCard} aria-labelledby="day-progress-title">
      <div className={styles.progressRing} style={{ "--progress": `${data.progress.percent * 3.6}deg` } as CSSProperties}><span><strong>{data.progress.percent}%</strong><small>{data.progress.completed} из {data.progress.total}</small></span></div>
      <div><p className={styles.eyebrow}>Сегодня</p><h2 id="day-progress-title" className="flow-section-title">Отличная работа!</h2><p>Ты на пути к гармонии</p>{nextAction && <small><Icon name={nextAction.icon} />Дальше: {nextAction.title} · {nextAction.meta.split(" · ")[0]}</small>}</div>
    </Card>

    <Button size="lg" className={styles.primaryAction} leadingIcon={<Icon name="play" />} onClick={() => setNotice(offline ? "Открываем сохранённую тренировку" : "Открываем быстрый старт тренировки")}>Начать тренировку</Button>

    <section className={styles.section} aria-labelledby="habits-title">
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Сегодня</p><h2 id="habits-title" className="flow-section-title">Привычки</h2></div>{offline ? <Badge tone="warning">Сохранится локально</Badge> : <Badge tone="success">{completedHabits.size}/{data.habits.length}</Badge>}</div>
      <Card className={styles.habits}>{data.habits.map(item => {
        const done = completedHabits.has(item.id);
        return <div key={item.id}><span className={styles.habitIcon}><Icon name={item.id === "water" ? "heart" : item.id === "mindfulness" ? "leaf" : "sun"} /></span><span><strong>{item.title}</strong><small>{done ? "Выполнено" : item.meta}</small></span><IconButton className={styles.habitAction} label={`${done ? "Вернуть" : "Выполнить"}: ${item.title}`} variant={done ? "secondary" : "ghost"} icon={<Icon name={done ? "check" : "square"} />} onClick={() => toggleHabit(item.id, item.title)} /></div>;
      })}</Card>
    </section>

    <section className={styles.section} aria-labelledby="program-title">
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Текущая программа</p><h2 id="program-title" className="flow-section-title">{data.program.title}</h2></div><span>{data.program.meta}</span></div>
      <Card className={styles.programCompact}><Badge tone="info">{data.program.percent}% пройдено</Badge><p>7 дней · 15–20 минут в день</p><Progress value={data.program.percent} label="Прогресс программы" /><Button size="sm" variant="secondary" onClick={() => setNotice("Открываем текущую программу")}>Открыть программу</Button></Card>
    </section>

    <section className={styles.more} aria-labelledby="more-title">
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>В своём ритме</p><h2 id="more-title" className="flow-section-title">Ещё для тебя</h2></div></div>
      <div className={styles.moreGrid}>
        <Card as="section" tone="subtle" className={styles.compactCard} aria-labelledby="week-title"><Badge>Эта неделя</Badge><h3 id="week-title">{data.week.completed} практики из {data.week.total}</h3><Progress value={data.week.completed} max={data.week.total} label="Практики за неделю" showValue /><p>Уверенный темп без перегрузки.</p></Card>
        {recommendationState === "error" ? <InlineError title="Рекомендации временно недоступны" description="Остальная Главная продолжает работать." onRetry={retryRecommendation} icon={<Icon name="triangle-alert" />} /> : recommendationState === "loading" ? <Card className={styles.moduleLoading} aria-label="Загрузка рекомендаций"><Skeleton /><Skeleton height="card" /></Card> : <Card as="section" className={styles.compactCard} aria-labelledby="recommendation-title"><Badge tone="warning" icon={<Icon name="sparkles" />}>Рекомендация</Badge><h3 id="recommendation-title">{data.recommendation.title}</h3><p>{data.recommendation.meta}</p><small><Icon name="sun" />{data.recommendation.reason}</small><Button size="sm" variant="secondary" onClick={() => setNotice(`Открываем рекомендацию «${data.recommendation.title}»`)}>Посмотреть</Button></Card>}
      </div>
    </section>

    {notice && <p className={styles.notice} aria-live="polite">{notice}</p>}
  </div>;
}

function HomeIntro({ data }: { data: HomeViewModel }) {
  const me = useMeQuery();
  const user = me.data?.user;
  const [photoFailed, setPhotoFailed] = useState(false);
  const photoUrl = user?.photoUrl && !photoFailed ? "/api/v1/me/photo" : null;
  const date = new Intl.DateTimeFormat("ru-RU", { weekday: "long", day: "numeric", month: "long" }).format(new Date()).toUpperCase();
  return <header className={`flow-top ${styles.intro}`}><div><p className="flow-eyebrow" suppressHydrationWarning>{date}</p><h1 className="flow-title">{user ? `Привет, ${user.firstName}!` : "Привет!"}</h1><span className="flow-subtitle">{data.subtitle}</span></div><Link href="/profile" className={styles.profileLink} aria-label="Открыть профиль">{photoUrl ? <Image src={photoUrl} alt="" width={44} height={44} unoptimized className={styles.profilePhoto} onError={() => setPhotoFailed(true)} /> : <Icon name="user-round" />}</Link></header>;
}

function HomeLoading() { return <div className={`flow-screen flow-screen--wide ${styles.root} ${styles.loading}`} aria-busy="true"><p className="sr-only" role="status">Загружаем Главную</p><div className={styles.loadingIntro}><Skeleton /><Skeleton /></div><Card className={styles.loadingStrip}><Skeleton height="card" /><div><Skeleton /><Skeleton /></div></Card><Card className={styles.loadingProgress}><Skeleton className={styles.loadingCircle} /><div><Skeleton /><Skeleton /><Skeleton /></div></Card><div className={styles.loadingChips}><Skeleton /><Skeleton /><Skeleton /></div><section className={styles.section}><Skeleton /><Skeleton height="hero" /></section><section className={styles.section}><Skeleton /><Card className={styles.loadingHabits}><Skeleton /><Skeleton /><Skeleton /></Card></section></div>; }

function HomeEmpty({ data }: { data: HomeViewModel }) {
  const [notice, setNotice] = useState("");
  return <div className={`flow-screen flow-screen--wide ${styles.root}`}><HomeIntro data={data} /><Card as="section" tone="subtle" className={styles.emptyDay} aria-labelledby="empty-title"><span className={styles.emptyIcon}><Icon name="calendar-days" /></span><Badge>Свободный день</Badge><h2 id="empty-title">На сегодня ничего не запланировано</h2><p>Можно выбрать мягкую практику сейчас или добавить план на удобное время.</p><div className={styles.emptyActions}><Button leadingIcon={<Icon name="play" />} onClick={() => setNotice("Открываем каталог тренировок")}>Выбрать тренировку</Button><Button variant="secondary" leadingIcon={<Icon name="sparkles" />} onClick={() => setNotice("Открываем программы")}>Выбрать программу</Button><Button variant="ghost" leadingIcon={<Icon name="plus" />} onClick={() => setNotice("Создаём новую привычку")}>Добавить привычку</Button></div></Card>{notice && <p className={styles.notice} aria-live="polite">{notice}</p>}</div>;
}
