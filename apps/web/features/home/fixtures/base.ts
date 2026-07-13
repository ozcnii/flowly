import type { HomeViewModel } from "../model/home-view-model";

export const homeBase: HomeViewModel = {
  date: "Воскресенье, 13 июля",
  greeting: "Привет, Алина!",
  subtitle: "Рада видеть тебя в потоке.",
  progress: { completed: 2, total: 4, percent: 50 },
  resume: { title: "Мягкая спина", meta: "Осталось 12 минут · checkpoint сохранён", image: "/media/home-resume.webp" },
  plan: [
    { id: "stretch", icon: "circle-check", title: "Утренняя растяжка", meta: "10 минут · выполнено", status: "done" },
    { id: "program", icon: "sparkles", title: "Гибкая спина · день 4", meta: "18 минут · ближайшее действие", status: "current" },
    { id: "breath", icon: "leaf", title: "Вечернее дыхание", meta: "5 минут · в 21:30", status: "upcoming" },
  ],
  program: { title: "Гибкая спина", meta: "День 4 из 7", percent: 43, image: "/media/home-program.webp" },
  categories: [
    { id: "back", label: "Для спины", icon: "dumbbell" },
    { id: "energy", label: "Энергия", icon: "sun" },
    { id: "stretch", label: "Растяжка", icon: "leaf" },
    { id: "sleep", label: "Перед сном", icon: "moon" },
  ],
  habits: [
    { id: "stretch", title: "Утренняя растяжка", meta: "10 минут", done: true },
    { id: "water", title: "Выпить воду", meta: "1,5 литра", done: true },
    { id: "mindfulness", title: "Практика осознанности", meta: "5 минут", done: false },
  ],
  week: { completed: 4, total: 6, percent: 67 },
  recommendation: { title: "Мягкая энергия", meta: "12 минут · лёгкая практика", reason: "Подходит для спокойного утра" },
  friendActivity: { initial: "М", name: "Маша", action: "завершила практику «Шея и плечи»", meta: "Поделилась с вами · 18 минут назад" },
};
