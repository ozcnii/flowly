"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { Badge, Button, Card, Icon, IconButton, Progress } from "@flowly/ui";
import type { HomeViewModel } from "../model/home-view-model";
import styles from "./home-screen.module.css";

export function HomeScreen({ data }: { data: HomeViewModel }) {
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [completedHabits, setCompletedHabits] = useState(() => new Set(data.habits.filter(item => item.done).map(item => item.id)));
  const [notice, setNotice] = useState("");
  const nextAction = data.plan.find(item => item.status === "current") ?? data.plan[0];

  const toggleHabit = (id: string, title: string) => setCompletedHabits(current => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    setNotice(`${title}: ${next.has(id) ? "выполнено" : "снова в плане"}`);
    return next;
  });

  return <div className={styles.root}>
    <header className={styles.intro}>
      <p>{data.date}</p>
      <h1>{data.greeting}<Icon name="leaf" /></h1>
      <span>{data.subtitle}</span>
    </header>

    <Card as="section" tone="subtle" className={styles.resumeStrip} aria-labelledby="resume-title">
      <Image src={data.resume.image} alt="Мягкая практика для спины" width={120} height={90} priority />
      <div><Badge tone="success">Checkpoint</Badge><h2 id="resume-title">Продолжить «{data.resume.title}»</h2><p>{data.resume.meta}</p></div>
      <IconButton label="Продолжить сохранённую тренировку" variant="secondary" icon={<Icon name="play" />} onClick={() => setNotice("Открываем сохранённую тренировку")} />
    </Card>

    <Card as="section" className={styles.progressCard} aria-labelledby="day-progress-title">
      <div className={styles.progressRing} style={{ "--progress": `${data.progress.percent * 3.6}deg` } as CSSProperties}><span><strong>{data.progress.percent}%</strong><small>{data.progress.completed} из {data.progress.total}</small></span></div>
      <div><p className={styles.eyebrow}>Сегодня</p><h2 id="day-progress-title">Отличная работа!</h2><p>Ты на пути к гармонии</p>{nextAction && <small><Icon name={nextAction.icon} />Дальше: {nextAction.title} · {nextAction.meta.split(" · ")[0]}</small>}</div>
    </Card>

    <div className={styles.categories} aria-label="Быстрый старт по категории">{data.categories.map(category => <Button key={category.id} size="sm" variant="secondary" aria-pressed={selectedCategory === category.id} className={styles.category} leadingIcon={<Icon name={category.icon} />} onClick={() => { setSelectedCategory(category.id); setNotice(`Выбрана категория «${category.label}»`); }}>{category.label}</Button>)}</div>

    <section className={styles.section} aria-labelledby="program-title">
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Текущая программа</p><h2 id="program-title">{data.program.title}</h2></div><span>{data.program.meta}</span></div>
      <Card className={styles.programFeature}>
        <Image src={data.program.image} alt="Практика программы Гибкая спина" fill sizes="(max-width: 832px) 100vw, 50rem" />
        <div className={styles.programShade} />
        <div className={styles.programContent}>
          <Badge tone="info">{data.program.percent}% пройдено</Badge>
          <h3>Мягкая сила<br />и свободное движение</h3>
          <p>7 дней · 15–20 минут в день</p>
          <Progress value={data.program.percent} label="Прогресс программы" />
          <Button size="sm" onClick={() => setNotice("Открываем текущую программу")}>Открыть программу</Button>
        </div>
      </Card>
    </section>

    <section className={styles.section} aria-labelledby="habits-title">
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Сегодня</p><h2 id="habits-title">Привычки</h2></div><Badge tone="success">{completedHabits.size}/{data.habits.length}</Badge></div>
      <Card className={styles.habits}>{data.habits.map(item => {
        const done = completedHabits.has(item.id);
        return <div key={item.id}><span className={styles.habitIcon}><Icon name={item.id === "water" ? "heart" : item.id === "mindfulness" ? "leaf" : "sun"} /></span><span><strong>{item.title}</strong><small>{done ? "Выполнено" : item.meta}</small></span><IconButton label={`${done ? "Вернуть" : "Выполнить"}: ${item.title}`} variant={done ? "secondary" : "ghost"} icon={<Icon name={done ? "check" : "square"} />} onClick={() => toggleHabit(item.id, item.title)} /></div>;
      })}</Card>
    </section>

    <Button size="lg" className={styles.primaryAction} leadingIcon={<Icon name="play" />} onClick={() => setNotice("Открываем быстрый старт тренировки")}>Начать тренировку</Button>

    <section className={styles.more} aria-labelledby="more-title">
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>В своём ритме</p><h2 id="more-title">Ещё для тебя</h2></div></div>
      <div className={styles.moreGrid}>
        <Card as="section" tone="subtle" className={styles.compactCard} aria-labelledby="week-title"><Badge>Эта неделя</Badge><h3 id="week-title">{data.week.completed} практики из {data.week.total}</h3><Progress value={data.week.completed} max={data.week.total} label="Практики за неделю" showValue /><p>Уверенный темп без перегрузки.</p></Card>
        <Card as="section" className={styles.compactCard} aria-labelledby="recommendation-title"><Badge tone="warning" icon={<Icon name="sparkles" />}>Рекомендация</Badge><h3 id="recommendation-title">{data.recommendation.title}</h3><p>{data.recommendation.meta}</p><small><Icon name="sun" />{data.recommendation.reason}</small><Button size="sm" variant="secondary" onClick={() => setNotice(`Открываем рекомендацию «${data.recommendation.title}»`)}>Посмотреть</Button></Card>
      </div>
      <Card as="section" className={styles.friendCard} aria-labelledby="friend-title"><div aria-hidden="true">{data.friendActivity.initial}</div><span><Badge>Поделились с вами</Badge><h3 id="friend-title">{data.friendActivity.name} {data.friendActivity.action}</h3><small>{data.friendActivity.meta}</small></span></Card>
    </section>

    <p className={styles.notice} aria-live="polite">{notice}</p>
  </div>;
}
