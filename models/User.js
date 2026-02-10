import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Model
 * Stores user account information with secure password hashing
 */

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ['user', 'coach', 'admin'],
      default: 'user',
    },
    // Subscription tier
    tier: {
      type: String,
      enum: ['free', 'premium', 'premium_plus'],
      default: 'free',
    },
    // Subscription details
    subscription: {
      // Subscription status
      status: {
        type: String,
        enum: ['none', 'active', 'canceled', 'past_due', 'trialing'],
        default: 'none',
      },
      // Plan identifier (monthly, yearly, etc.)
      plan: {
        type: String,
        enum: ['none', 'premium_monthly', 'premium_yearly', 'premium_plus_monthly', 'premium_plus_yearly'],
        default: 'none',
      },
      // Stripe customer ID (for payment integration)
      stripeCustomerId: { type: String },
      // Stripe subscription ID
      stripeSubscriptionId: { type: String },
      // Current period start
      currentPeriodStart: { type: Date },
      // Current period end (when subscription renews or expires)
      currentPeriodEnd: { type: Date },
      // Trial end date (if applicable)
      trialEnd: { type: Date },
      // Cancellation date (if canceled)
      canceledAt: { type: Date },
      // Whether subscription will cancel at period end
      cancelAtPeriodEnd: { type: Boolean, default: false },
    },
    // Profile customization
    preferences: {
      reminderTime: {
        type: String,
        default: '09:00',
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
      // Reminder frequency preference
      reminderFrequency: {
        type: String,
        enum: ['off', 'gentle', 'normal', 'frequent'],
        default: 'normal',
      },
      // Preferred days (bitmask: Sun=1, Mon=2, Tue=4, Wed=8, Thu=16, Fri=32, Sat=64)
      activeDays: {
        type: Number,
        default: 127, // All days
      },
      // Theme preference
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light',
      },
      // Weekly summary emails
      weeklyDigest: {
        type: Boolean,
        default: true,
      },
      // Celebration animations
      celebrations: {
        type: Boolean,
        default: true,
      },
    },
    // Analytics tracking (for adaptive reminders)
    analytics: {
      // Longest active streak
      longestStreak: { type: Number, default: 0 },
      // Current streak
      currentStreak: { type: Number, default: 0 },
      // Last activity date
      lastActiveDate: { type: String },
      // Total check-ins ever
      totalCheckIns: { type: Number, default: 0 },
      // Best day of week (0-6)
      bestDayOfWeek: { type: Number },
      // Preferred time of day (morning/afternoon/evening)
      preferredTimeOfDay: { type: String },
      // Days since registration
      daysSinceJoined: { type: Number, default: 0 },
    },
    // Coach-specific fields (only populated for role='coach')
    coachProfile: {
      // Display name / brand name
      brandName: { type: String, maxlength: 100 },
      // Bio / description
      bio: { type: String, maxlength: 500 },
      // Specializations (e.g., "fitness", "productivity", "mindfulness")
      specializations: [{ type: String }],
      // Social links
      socialLinks: {
        website: { type: String },
        instagram: { type: String },
        twitter: { type: String },
        youtube: { type: String },
      },
      // Branding colors
      brandColor: { type: String, default: '#0ea5e9' },
      // Profile image URL
      avatarUrl: { type: String },
      // Verification status
      isVerified: { type: Boolean, default: false },
      // Active since (when became a coach)
      activeSince: { type: Date },
    },
    // Client relationship (for users with a coach)
    coaching: {
      // Reference to coach user
      coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      // When client joined this coach
      joinedAt: { type: Date },
      // Status of coaching relationship
      status: {
        type: String,
        enum: ['pending', 'active', 'paused', 'ended'],
        default: 'pending',
      },
      // Invite code used to join
      inviteCode: { type: String },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

/**
 * Pre-save middleware to hash password
 * Only hashes if password is new or modified
 */
UserSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare entered password with stored hash
 * @param {string} enteredPassword - Plain text password to compare
 * @returns {Promise<boolean>} - True if passwords match
 */
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.passwordHash);
};

/**
 * Return user object without sensitive fields
 * @returns {Object} - Safe user object for API responses
 */
UserSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    tier: this.tier,
    preferences: this.preferences,
    createdAt: this.createdAt,
  };
};

// Prevent model recompilation in development (hot reload)
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
