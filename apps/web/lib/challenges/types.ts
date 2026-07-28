export const GOAL_TYPES = ["workout_count", "daily", "habit_count", "total_time"] as const;
export type GoalType = (typeof GOAL_TYPES)[number];

export const REACTION_EMOJIS = ["👏", "🔥", "💪", "❤️", "🙌"] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];
