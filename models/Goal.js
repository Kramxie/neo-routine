import mongoose from 'mongoose';

/**
 * Goal Model
 * Stores user goals with progress tracking
 */

const GoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    category: {
      type: String,
      enum: ['health', 'productivity', 'learning', 'mindfulness', 'social', 'creative', 'finance', 'other'],
      default: 'other',
    },
    timeframe: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly',
    },
    // Target value (e.g., complete 30 routines)
    targetValue: {
      type: Number,
      required: true,
      min: [1, 'Target value must be at least 1'],
      default: 100,
    },
    // Current progress value
    currentValue: {
      type: Number,
      min: [0, 'Current value cannot be negative'],
      default: 0,
    },
    // Due date for the goal
    dueDate: {
      type: Date,
    },
    // Link goal to a specific routine (optional)
    linkedRoutineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Routine',
    },
    // Goal status
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
      index: true,
    },
    // When the goal was completed
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
GoalSchema.index({ userId: 1, status: 1, createdAt: -1 });

// Virtual for calculating progress percentage
GoalSchema.virtual('progressPercentage').get(function () {
  if (!this.targetValue) return 0;
  return Math.min(100, Math.round((this.currentValue / this.targetValue) * 100));
});

// Virtual for checking if goal is completed
GoalSchema.virtual('isCompleted').get(function () {
  return this.currentValue >= this.targetValue;
});

// Virtual for days remaining
GoalSchema.virtual('daysRemaining').get(function () {
  if (!this.dueDate) return null;
  const today = new Date();
  const due = new Date(this.dueDate);
  return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
});

// Enable virtuals in JSON output
GoalSchema.set('toJSON', { virtuals: true });
GoalSchema.set('toObject', { virtuals: true });

// Pre-save hook to auto-complete goals
GoalSchema.pre('save', function (next) {
  if (this.currentValue >= this.targetValue && this.status === 'active') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  next();
});

export default mongoose.models.Goal || mongoose.model('Goal', GoalSchema);
