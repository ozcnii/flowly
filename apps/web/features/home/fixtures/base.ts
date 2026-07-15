import type { HomeViewModel } from "../model/home-view-model";

export const homeBase: HomeViewModel = {
  progress: { completed: 2, total: 4, partial: 0, remaining: 2, noResponse: 0, percent: 50 },
  resume: { title: "Мягкая спина", meta: "Осталось 12 минут · прогресс сохранён", image: "/media/home-resume.webp" },
  plan: [
    { id: "stretch", icon: "circle-check", title: "Утренняя растяжка", meta: "10 минут · выполнено", href: "/rhythm", status: "done" },
    { id: "program", icon: "sparkles", title: "Гибкая спина · день 4", meta: "18 минут · ближайшее действие", href: "/programs", status: "current" },
    { id: "breath", icon: "leaf", title: "Вечернее дыхание", meta: "5 минут · в 21:30", href: "/rhythm", status: "upcoming" },
  ],
  program: { title: "Гибкая спина", meta: "День 4 из 7", percent: 43, image: "/media/home-program.webp" },
  habits: [
    { id: "stretch", title: "Утренняя растяжка", meta: "10 минут", icon: "leaf", done: true },
    { id: "water", title: "Выпить воду", meta: "1,5 литра", icon: "glass-water", done: true },
    { id: "mindfulness", title: "Практика осознанности", meta: "5 минут", icon: "sparkles", done: false },
  ],
};
