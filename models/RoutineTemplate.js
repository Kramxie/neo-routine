import mongoose from 'mongoose';

/**
 * Task Template Schema
 * Defines task structure within a routine template
 */
const TaskTemplateSchema = new mongoose.Schema({
  label: {
    type: String,
    required: [true, 'Task label is required'],
    trim: true,
    maxlength: [100, 'Task label cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Task description cannot exceed 300 characters'],
  },
  order: {
    type: Number,
    default: 0,
  },
});

/**
 * Routine Template Model
 * Shareable routine blueprints created by coaches
 */
const RoutineTemplateSchema = new mongoose.Schema(
  {
    // Coach who created this template
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Template name
    title: {
      type: String,
      required: [true, 'Template title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    // Description / pitch
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    // Default tasks included
    tasks: {
      type: [TaskTemplateSchema],
      validate: {
        validator: function (tasks) {
          return tasks.length <= 30;
        },
        message: 'Template cannot have more than 30 tasks',
      },
      default: [],
    },
    // Category / type
    category: {
      type: String,
      enum: [
        'morning',
        'evening',
        'fitness',
        'productivity',
        'mindfulness',
        'health',
        'learning',
        'creativity',
        'social',
        'custom',
      ],
      default: 'custom',
    },
    // Suggested schedule
    suggestedFrequency: {
      type: String,
      enum: ['daily', 'weekdays', 'weekends', 'custom'],
      default: 'daily',
    },
    // Estimated time to complete (in minutes)
    estimatedMinutes: {
      type: Number,
      min: 1,
      max: 480,
      default: 15,
    },
    // Difficulty level
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    // Template color
    color: {
      type: String,
      enum: ['blue', 'green', 'purple', 'orange', 'pink'],
      default: 'blue',
    },
    // Tags for searchability
    tags: [{
      type: String,
      trim: true,
      maxlength: 30,
    }],
    // Visibility
    isPublic: {
      type: Boolean,
      default: false,
    },
    // Published (available to clients)
    isPublished: {
      type: Boolean,
      default: false,
    },
    // Featured by admin
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Usage statistics
    stats: {
      // Times this template was adopted
      adoptions: { type: Number, default: 0 },
      // Average rating (1-5)
      avgRating: { type: Number, default: 0 },
      // Number of ratings
      ratingCount: { type: Number, default: 0 },
      // Views count
      views: { type: Number, default: 0 },
    },
    // Unique share code
    shareCode: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
RoutineTemplateSchema.index({ coachId: 1, isPublished: 1 });
RoutineTemplateSchema.index({ category: 1, isPublic: 1 });
// Note: shareCode already has unique index from schema definition
RoutineTemplateSchema.index({ tags: 1 });

/**
 * Generate unique share code before saving new templates
 */
RoutineTemplateSchema.pre('save', async function (next) {
  if (this.isNew && !this.shareCode) {
    // Generate 8-character alphanumeric code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.shareCode = code;
  }
  next();
});

/**
 * Return safe object for API responses
 */
RoutineTemplateSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    coachId: this.coachId,
    title: this.title,
    description: this.description,
    tasks: this.tasks.map((t) => ({
      id: t._id,
      label: t.label,
      description: t.description,
      order: t.order,
    })),
    category: this.category,
    suggestedFrequency: this.suggestedFrequency,
    estimatedMinutes: this.estimatedMinutes,
    difficulty: this.difficulty,
    color: this.color,
    tags: this.tags,
    isPublic: this.isPublic,
    isPublished: this.isPublished,
    isFeatured: this.isFeatured,
    stats: this.stats,
    shareCode: this.shareCode,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

/**
 * Static method to find public templates
 */
RoutineTemplateSchema.statics.findPublicTemplates = function (options = {}) {
  const query = { isPublic: true, isPublished: true };
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.difficulty) {
    query.difficulty = options.difficulty;
  }
  
  return this.find(query)
    .populate('coachId', 'name coachProfile.brandName coachProfile.avatarUrl')
    .sort(options.sort || { 'stats.adoptions': -1 })
    .limit(options.limit || 20);
};

// Prevent model recompilation in development
const RoutineTemplate =
  mongoose.models.RoutineTemplate ||
  mongoose.model('RoutineTemplate', RoutineTemplateSchema);

export default RoutineTemplate;
