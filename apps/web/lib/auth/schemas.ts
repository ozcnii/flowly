import { z } from "zod";

export const telegramAuthSchema = z.object({
  initData: z.string().min(1),
});

/** Phase 0 onboarding fields only; full profile/settings editing is T10 (DEC-020). */
export const mePatchSchema = z
  .object({
    timezone: z.string().min(1).optional(),
    locale: z.string().min(1).optional(),
    weekStartsOn: z.number().int().min(0).max(6).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: "no updatable fields" });

export type MePatch = z.infer<typeof mePatchSchema>;
