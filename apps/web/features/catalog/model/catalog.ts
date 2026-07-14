export type CatalogCategory = { id: string; slug: string; name: string; icon: string; sortOrder?: number; isActive?: boolean };
export type CatalogWorkout = {
  id: string;
  title: string;
  description: string;
  durationSeconds: number;
  difficulty: string;
  format: string;
  sourceType: string;
  coverObjectKey: string | null;
  youtubeVideoId: string | null;
  equipment: string[];
  contraindications: string[];
  categories: CatalogCategory[];
};
export type CatalogResponse = { filters: Record<string, string>; total: number; categories: CatalogCategory[]; workouts: CatalogWorkout[]; explanation: string | null };
export type WorkoutExercise = { id: string; position: number; title: string; description: string; mediaObjectKey: string | null; mediaType: string | null; durationSeconds: number | null; repetitions: number | null; plannedDurationSeconds: number | null };
export type WorkoutAction = { enabled: boolean; reason: string };
export type WorkoutDetail = CatalogWorkout & {
  visibility: string;
  exercises: WorkoutExercise[];
  author: { name: string; type: "flowly" | "youtube" | "user" };
  actions: Record<"start" | "favorite" | "share" | "report" | "hide" | "author", WorkoutAction>;
};
export type WorkoutDetailResponse = { workout: WorkoutDetail };

export const DIFFICULTY = { beginner: "Лёгкая", intermediate: "Средняя", advanced: "Сложная" } as const;
export const FORMAT = { video: "Видео", step_by_step: "Шаги", mixed: "Смешанная" } as const;
export const SOURCE = { flowly: "Flowly", youtube: "YouTube", user: "Пользователи" } as const;
export const DURATION = { short: "≤10 мин", medium: "11–20 мин", long: "21–35 мин" } as const;

export const minutes = (seconds: number) => `${Math.round(seconds / 60)} мин`;
