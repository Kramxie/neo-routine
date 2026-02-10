import mongoose from 'mongoose';

/**
 * CheckIn Model
 * Records when a user completes a task in their routine
 * Each check-in represents a "drop" in the progress pool
 */

const CheckInSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    routineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Routine',
      required: [true, 'Routine ID is required'],
      index: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Task ID is required'],
    },
    // Date in YYYY-MM-DD format for easy querying
    dateISO: {
      type: String,
      required: [true, 'Date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
      index: true,
    },
    // Optional note for the check-in
    note: {
      type: String,
      trim: true,
      maxlength: [200, 'Note cannot exceed 200 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
// Prevents duplicate check-ins for same task on same day
CheckInSchema.index(
  { userId: 1, routineId: 1, taskId: 1, dateISO: 1 },
  { unique: true }
);

// Index for fetching today's check-ins
CheckInSchema.index({ userId: 1, dateISO: 1 });

// Index for weekly/monthly stats
CheckInSchema.index({ userId: 1, createdAt: -1 });

/**
 * Static method to get check-ins for a specific date
 * @param {string} userId - User's ObjectId
 * @param {string} dateISO - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} - Array of check-ins
 */
CheckInSchema.statics.getByDate = function (userId, dateISO) {
  return this.find({ userId, dateISO }).lean();
};

/**
 * Static method to get check-ins for date range
 * @param {string} userId - User's ObjectId
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Array>} - Array of check-ins
 */
CheckInSchema.statics.getByDateRange = function (userId, startDate, endDate) {
  return this.find({
    userId,
    dateISO: { $gte: startDate, $lte: endDate },
  }).lean();
};

/**
 * Static method to count check-ins for last N days
 * @param {string} userId - User's ObjectId
 * @param {number} days - Number of days
 * @returns {Promise<number>} - Count of check-ins
 */
CheckInSchema.statics.countLastDays = async function (userId, days = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days + 1);

  const startISO = startDate.toISOString().split('T')[0];
  const endISO = endDate.toISOString().split('T')[0];

  return this.countDocuments({
    userId,
    dateISO: { $gte: startISO, $lte: endISO },
  });
};

/**
 * Static method to check if task is already checked in for today
 * @param {string} userId
 * @param {string} routineId
 * @param {string} taskId
 * @param {string} dateISO
 * @returns {Promise<boolean>}
 */
CheckInSchema.statics.isCheckedIn = async function (userId, routineId, taskId, dateISO) {
  const count = await this.countDocuments({
    userId,
    routineId,
    taskId,
    dateISO,
  });
  return count > 0;
};

/**
 * Convert to safe object for API responses
 */
CheckInSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    routineId: this.routineId,
    taskId: this.taskId,
    dateISO: this.dateISO,
    note: this.note,
    createdAt: this.createdAt,
  };
};

// Prevent model recompilation in development
const CheckIn = mongoose.models.CheckIn || mongoose.model('CheckIn', CheckInSchema);

export default CheckIn;
