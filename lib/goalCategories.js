/**
 * Shared goal category definitions for UI and server validation.
 * Legacy category values are normalized to keep older data compatible.
 */

export const GOAL_CATEGORIES = [
  { id: 'health', name: 'Health & Fitness', icon: '💪', color: 'bg-green-500' },
  { id: 'productivity', name: 'Productivity', icon: '⚡', color: 'bg-blue-500' },
  { id: 'learning', name: 'Learning', icon: '📚', color: 'bg-purple-500' },
  { id: 'mindfulness', name: 'Mindfulness', icon: '🧘', color: 'bg-teal-500' },
  { id: 'consistency', name: 'Consistency', icon: '💧', color: 'bg-cyan-500' },
  { id: 'routine_building', name: 'Routine Building', icon: '🛠️', color: 'bg-slate-500' },
  { id: 'streak', name: 'Streak', icon: '🔥', color: 'bg-amber-500' },
  { id: 'daily_completion', name: 'Daily Completion', icon: '✅', color: 'bg-emerald-500' },
];

export const GOAL_CATEGORY_IDS = GOAL_CATEGORIES.map((category) => category.id);

export const DEFAULT_GOAL_CATEGORY_ID = GOAL_CATEGORIES[0].id;

const LEGACY_GOAL_CATEGORY_MAP = {
  other: DEFAULT_GOAL_CATEGORY_ID,
  finance: 'consistency',
  social: 'daily_completion',
  creative: 'routine_building',
};

export const LEGACY_GOAL_CATEGORY_IDS = Object.keys(LEGACY_GOAL_CATEGORY_MAP);

export function normalizeGoalCategory(category) {
  if (GOAL_CATEGORY_IDS.includes(category)) {
    return category;
  }

  if (typeof category === 'string' && LEGACY_GOAL_CATEGORY_MAP[category]) {
    return LEGACY_GOAL_CATEGORY_MAP[category];
  }

  return DEFAULT_GOAL_CATEGORY_ID;
}

export function isValidGoalCategory(category) {
  return GOAL_CATEGORY_IDS.includes(category);
}

export function isLegacyGoalCategory(category) {
  return LEGACY_GOAL_CATEGORY_IDS.includes(category);
}