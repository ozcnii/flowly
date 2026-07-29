export type HomePlanItem = {
  id: string;
  icon: "circle-check" | "sparkles" | "leaf";
  title: string;
  meta: string;
  href: string;
  status: "done" | "current" | "upcoming";
};

export type HomeViewModel = {
  progress: { completed: number; total: number; partial: number; remaining: number; noResponse: number; percent: number };
  /** Fixture-only fallback for resume card when no open session. */
  resume: { title: string; meta: string; image: string };
  plan: HomePlanItem[];
  program: { title: string; meta: string; percent: number; image: string; href: string } | null;
  habits: { id: string; title: string; meta: string; icon: "leaf" | "glass-water" | "sparkles"; done: boolean }[];
  empty: boolean;
  today: string;
};
