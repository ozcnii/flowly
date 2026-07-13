export type HomePlanItem = {
  id: string;
  icon: "circle-check" | "sparkles" | "leaf";
  title: string;
  meta: string;
  status: "done" | "current" | "upcoming";
};

export type HomeViewModel = {
  date: string;
  greeting: string;
  subtitle: string;
  progress: { completed: number; total: number; percent: number };
  resume: { title: string; meta: string; image: string };
  plan: HomePlanItem[];
  program: { title: string; meta: string; percent: number; image: string };
  categories: { id: string; label: string; icon: "dumbbell" | "sun" | "leaf" | "moon" }[];
  habits: { id: string; title: string; meta: string; done: boolean }[];
  week: { completed: number; total: number; percent: number };
  recommendation: { title: string; meta: string; reason: string };
  friendActivity: { initial: string; name: string; action: string; meta: string };
};
