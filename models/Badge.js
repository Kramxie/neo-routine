import mongoose from 'mongoose';
import { BADGE_DEFINITIONS, RARITY_COLORS } from '@/lib/badgeDefinitions';

// Re-export for backward compatibility (server-side only)
export { BADGE_DEFINITIONS, RARITY_COLORS };

/**
 * Badge Model
 * Stores achievements and badges earned by users
 * Badges are unlocked based on streaks, milestones, and special actions
 */

const BadgeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    // Badge identifier (e.g., 'streak_7', 'first_checkin', 'perfect_week')
    badgeId: {
      type: String,
      required: [true, 'Badge ID is required'],
      trim: true,
    },
    // When the badge was earned
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    // Additional context (e.g., streak count when earned)
    context: {
      value: { type: Number },
      routineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Routine' },
      goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' },
    },
    // Whether the user has seen this badge
    seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate badges
BadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

// Prevent model recompilation in development
const Badge = mongoose.models.Badge || mongoose.model('Badge', BadgeSchema);

export default Badge;
