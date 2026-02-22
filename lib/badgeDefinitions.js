/**
 * Badge Definitions
 * Shared badge metadata for client and server components
 * This file contains NO server-only dependencies
 */

// Badge definitions with metadata
export const BADGE_DEFINITIONS = {
  // Streak badges
  first_checkin: {
    name: 'First Drop',
    description: 'Complete your first check-in',
    icon: '💧',
    category: 'starter',
    rarity: 'common',
  },
  streak_3: {
    name: 'Getting Started',
    description: '3-day streak',
    icon: '🌱',
    category: 'streak',
    rarity: 'common',
  },
  streak_7: {
    name: 'Week Warrior',
    description: '7-day streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'uncommon',
  },
  streak_14: {
    name: 'Fortnight Fighter',
    description: '14-day streak',
    icon: '⚡',
    category: 'streak',
    rarity: 'uncommon',
  },
  streak_30: {
    name: 'Monthly Master',
    description: '30-day streak',
    icon: '🏆',
    category: 'streak',
    rarity: 'rare',
  },
  streak_60: {
    name: 'Double Down',
    description: '60-day streak',
    icon: '💎',
    category: 'streak',
    rarity: 'epic',
  },
  streak_100: {
    name: 'Century Club',
    description: '100-day streak',
    icon: '👑',
    category: 'streak',
    rarity: 'legendary',
  },
  streak_365: {
    name: 'Year of Flow',
    description: '365-day streak',
    icon: '🌟',
    category: 'streak',
    rarity: 'legendary',
  },

  // Achievement badges
  perfect_day: {
    name: 'Perfect Day',
    description: 'Complete all tasks in a day',
    icon: '✨',
    category: 'achievement',
    rarity: 'common',
  },
  perfect_week: {
    name: 'Perfect Week',
    description: 'Complete all tasks for 7 days straight',
    icon: '🌊',
    category: 'achievement',
    rarity: 'rare',
  },
  early_bird: {
    name: 'Early Bird',
    description: 'Complete a task before 7 AM',
    icon: '🌅',
    category: 'achievement',
    rarity: 'uncommon',
  },
  night_owl: {
    name: 'Night Owl',
    description: 'Complete a task after 10 PM',
    icon: '🦉',
    category: 'achievement',
    rarity: 'uncommon',
  },
  weekend_warrior: {
    name: 'Weekend Warrior',
    description: 'Complete all weekend tasks',
    icon: '🎉',
    category: 'achievement',
    rarity: 'uncommon',
  },

  // Goal badges
  first_goal: {
    name: 'Goal Setter',
    description: 'Create your first goal',
    icon: '🎯',
    category: 'goals',
    rarity: 'common',
  },
  goal_complete: {
    name: 'Mission Complete',
    description: 'Complete a goal',
    icon: '🏅',
    category: 'goals',
    rarity: 'uncommon',
  },
  five_goals: {
    name: 'High Achiever',
    description: 'Complete 5 goals',
    icon: '⭐',
    category: 'goals',
    rarity: 'rare',
  },

  // Routine badges
  first_routine: {
    name: 'Routine Builder',
    description: 'Create your first routine',
    icon: '📝',
    category: 'routines',
    rarity: 'common',
  },
  five_routines: {
    name: 'Multi-Tasker',
    description: 'Create 5 routines',
    icon: '📋',
    category: 'routines',
    rarity: 'uncommon',
  },

  // Volume badges
  checkins_50: {
    name: 'Gathering Drops',
    description: '50 total check-ins',
    icon: '💦',
    category: 'volume',
    rarity: 'common',
  },
  checkins_100: {
    name: 'Making Waves',
    description: '100 total check-ins',
    icon: '🌊',
    category: 'volume',
    rarity: 'uncommon',
  },
  checkins_500: {
    name: 'Ocean of Progress',
    description: '500 total check-ins',
    icon: '🐋',
    category: 'volume',
    rarity: 'rare',
  },
  checkins_1000: {
    name: 'Tsunami Force',
    description: '1,000 total check-ins',
    icon: '🌀',
    category: 'volume',
    rarity: 'epic',
  },

  // Special badges
  comeback_kid: {
    name: 'Comeback Kid',
    description: 'Return after 7+ days away',
    icon: '🦋',
    category: 'special',
    rarity: 'uncommon',
  },
  explorer: {
    name: 'Explorer',
    description: 'Try all app features',
    icon: '🧭',
    category: 'special',
    rarity: 'uncommon',
  },
};

// Rarity colors for UI
export const RARITY_COLORS = {
  common: { bg: '#f1f5f9', border: '#cbd5e1', text: '#64748b' },
  uncommon: { bg: '#dcfce7', border: '#86efac', text: '#16a34a' },
  rare: { bg: '#dbeafe', border: '#93c5fd', text: '#2563eb' },
  epic: { bg: '#f3e8ff', border: '#c084fc', text: '#9333ea' },
  legendary: { bg: '#fef3c7', border: '#fcd34d', text: '#d97706' },
};
