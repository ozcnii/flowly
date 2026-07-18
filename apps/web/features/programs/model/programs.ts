export type ProgramSummary = {
  id: string;
  title: string;
  description: string;
  coverObjectKey: string | null;
  durationDays: number;
  category: string;
  categoryLabel: string;
  isSystem: boolean;
};

export type ProgramDay = {
  id: string;
  dayNumber: number;
  type: "workout" | "rest";
  title: string;
  description: string;
  workout: { id: string; title: string; durationSeconds: number; format: string; difficulty: string } | null;
};

export type ProgramDetail = ProgramSummary & {
  days: ProgramDay[];
  actions: { start: { enabled: boolean; reason: string } };
};

export type ProgramsResponse = { filters: { duration: string }; total: number; programs: ProgramSummary[]; explanation?: string | null };
export type ProgramDetailResponse = { program: ProgramDetail };

export const DURATION_LABEL: Record<number, string> = { 7: "7 дней", 14: "14 дней", 30: "30 дней" };
export const minutes = (seconds: number) => `${Math.round(seconds / 60)} мин`;
