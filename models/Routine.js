import mongoose from 'mongoose';

/**
 * Routine Model
 * Stores user routines with tasks that can be checked off daily
 */

const TaskSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, 'Task label is required'],
      trim: true,
      maxlength: [100, 'Task label cannot exceed 100 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const RoutineSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Routine title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    tasks: {
      type: [TaskSchema],
      validate: {
        validator: function (tasks) {
          return tasks.length <= 20;
        },
        message: 'Cannot have more than 20 tasks per routine',
      },
      default: [],
    },
    // Soft delete - archived routines are hidden but not deleted
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Color theme for the routine card
    color: {
      type: String,
      enum: ['blue', 'green', 'purple', 'orange', 'pink'],
      default: 'blue',
    },
    // Order for displaying routines
    order: {
      type: Number,
      default: 0,
    },
    // Reference to source template (if created from a template)
    sourceTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoutineTemplate',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
RoutineSchema.index({ userId: 1, isArchived: 1, order: 1 });

/**
 * Get active tasks count
 */
RoutineSchema.virtual('activeTasksCount').get(function () {
  return this.tasks.filter((task) => task.isActive).length;
});

/**
 * Convert to safe object for API responses
 */
RoutineSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    tasks: this.tasks.map((task) => ({
      id: task._id,
      label: task.label,
      isActive: task.isActive,
    })),
    color: this.color,
    order: this.order,
    isArchived: this.isArchived,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Ensure virtuals are included in JSON
RoutineSchema.set('toJSON', { virtuals: true });
RoutineSchema.set('toObject', { virtuals: true });

// Prevent model recompilation in development
const Routine = mongoose.models.Routine || mongoose.model('Routine', RoutineSchema);

export default Routine;
