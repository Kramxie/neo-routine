/**
 * Reminder Engine
 * Generates gentle, adaptive messages based on user progress
 * 
 * Philosophy:
 * - No guilt or pressure
 * - Softer reminders when struggling
 * - Encouraging progression when consistent
 * - Calm, water-themed language
 */

// Messages for different progress levels
const messages = {
  // No progress today (0%)
  noProgress: [
    "Every journey starts with a single drop. Ready when you are.",
    "The water is calm. Take your time.",
    "New day, fresh start. No pressure.",
    "Your routine is here whenever you need it.",
    "Rest is part of the flow too.",
  ],

  // Low progress (1-25%)
  lowProgress: [
    "You've started! That's what matters most.",
    "Small ripples create big waves over time.",
    "One drop at a time. You're doing great.",
    "Progress isn't always visible, but it's happening.",
    "Even gentle streams carve through stone.",
  ],

  // Moderate progress (26-50%)
  moderateProgress: [
    "You're finding your flow. Keep going.",
    "Halfway there. The water is rising.",
    "Your consistency is building something beautiful.",
    "Every drop adds to the pool.",
    "Steady progress. Well done.",
  ],

  // Good progress (51-75%)
  goodProgress: [
    "Your progress is making waves!",
    "More than halfway. The momentum is with you.",
    "Your routine is flowing smoothly today.",
    "Look at those ripples spreading.",
    "You're in a great flow state.",
  ],

  // High progress (76-99%)
  highProgress: [
    "Almost there! Your dedication shows.",
    "The pool is nearly full. Amazing work.",
    "Your consistency is inspiring.",
    "Just a few more drops to complete the day.",
    "You're creating beautiful ripples.",
  ],

  // Complete (100%)
  complete: [
    "Perfect flow! You completed everything today.",
    "Your pool is full. Well done!",
    "100% - Your consistency is remarkable.",
    "All drops collected. Time to rest.",
    "Beautifully done. The water is still.",
  ],

  // Weekly encouragement (low weekly average)
  weeklyLow: [
    "This week was challenging. That's okay.",
    "Some weeks flow differently. Be gentle with yourself.",
    "The river finds its way, even around obstacles.",
    "Tomorrow is a new opportunity to flow.",
    "Every week teaches us something.",
  ],

  // Weekly encouragement (good weekly average)
  weeklyGood: [
    "Strong week! Your habits are taking root.",
    "Consistent flow this week. Keep it up.",
    "Your weekly progress is impressive.",
    "The ripples from this week will carry forward.",
    "You've built great momentum.",
  ],

  // Weekly encouragement (excellent weekly average)
  weeklyExcellent: [
    "Exceptional week! You're in full flow.",
    "Your dedication this week is inspiring.",
    "Week after week, you're building something lasting.",
    "The pool is overflowing with your progress.",
    "Masterful consistency. Well done.",
  ],
};

/**
 * Get a random message from an array
 * @param {string[]} messageArray
 * @returns {string}
 */
function getRandomMessage(messageArray) {
  return messageArray[Math.floor(Math.random() * messageArray.length)];
}

/**
 * Get a gentle micro-message based on today's and weekly progress
 * @param {number} todayPercent - Today's completion percentage (0-100)
 * @param {number} weeklyPercent - Weekly completion percentage (0-100)
 * @returns {string} - A gentle, encouraging message
 */
export function getGentleMessage(todayPercent = 0, weeklyPercent = 0) {
  // Determine today's message category
  let todayMessage;
  if (todayPercent === 0) {
    todayMessage = getRandomMessage(messages.noProgress);
  } else if (todayPercent <= 25) {
    todayMessage = getRandomMessage(messages.lowProgress);
  } else if (todayPercent <= 50) {
    todayMessage = getRandomMessage(messages.moderateProgress);
  } else if (todayPercent <= 75) {
    todayMessage = getRandomMessage(messages.goodProgress);
  } else if (todayPercent < 100) {
    todayMessage = getRandomMessage(messages.highProgress);
  } else {
    todayMessage = getRandomMessage(messages.complete);
  }

  return todayMessage;
}

/**
 * Get weekly summary message
 * @param {number} weeklyPercent - Weekly completion percentage (0-100)
 * @returns {string}
 */
export function getWeeklyMessage(weeklyPercent = 0) {
  if (weeklyPercent < 40) {
    return getRandomMessage(messages.weeklyLow);
  } else if (weeklyPercent < 75) {
    return getRandomMessage(messages.weeklyGood);
  } else {
    return getRandomMessage(messages.weeklyExcellent);
  }
}

/**
 * Get adaptive reminder intensity based on recent compliance
 * Lower intensity for users who are struggling (softer reminders)
 * Higher intensity for consistent users (encouraging progression)
 * 
 * @param {number} last7DaysPercent - Completion rate for last 7 days
 * @returns {Object} - Reminder configuration
 */
export function getAdaptiveReminder(last7DaysPercent = 0) {
  if (last7DaysPercent < 30) {
    // User is struggling - be extra gentle
    return {
      intensity: 'soft',
      tone: 'supportive',
      frequency: 'reduced', // Don't overwhelm
      message: getRandomMessage([
        "Just a gentle nudge. Your routine misses you.",
        "Whenever you're ready, your drops are waiting.",
        "No pressure. Just a friendly reminder.",
        "Take it one small step at a time.",
      ]),
    };
  } else if (last7DaysPercent < 60) {
    // Moderate engagement - balanced approach
    return {
      intensity: 'medium',
      tone: 'encouraging',
      frequency: 'normal',
      message: getRandomMessage([
        "Time to add some drops to your pool.",
        "Your routine is waiting. Let's flow.",
        "Ready to continue your progress?",
        "A few minutes can make a difference.",
      ]),
    };
  } else {
    // High engagement - celebrate and encourage growth
    return {
      intensity: 'energetic',
      tone: 'celebratory',
      frequency: 'normal',
      message: getRandomMessage([
        "You're on a roll! Keep the momentum going.",
        "Your consistency is amazing. Ready for today?",
        "Let's continue your winning flow!",
        "Another day, another opportunity to grow.",
      ]),
    };
  }
}

/**
 * Calculate completion stats for reminder decisions
 * This will be expanded in Phase 4 with more sophisticated logic
 * 
 * @param {Array} checkIns - Array of check-in records
 * @param {number} totalTasksPerDay - Total possible tasks per day
 * @param {number} days - Number of days to analyze
 * @returns {Object} - Stats object
 */
export function calculateCompletionStats(checkIns, totalTasksPerDay, days = 7) {
  const now = new Date();
  const dateMap = {};

  // Group check-ins by date
  checkIns.forEach((checkIn) => {
    const date = checkIn.dateISO;
    dateMap[date] = (dateMap[date] || 0) + 1;
  });

  // Calculate stats for each day in range
  let totalCompleted = 0;
  let totalPossible = totalTasksPerDay * days;
  let daysWithActivity = 0;

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateISO = date.toISOString().split('T')[0];
    const count = dateMap[dateISO] || 0;
    totalCompleted += count;
    if (count > 0) daysWithActivity++;
  }

  return {
    totalCompleted,
    totalPossible,
    completionRate: totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0,
    daysWithActivity,
    activeDayRate: (daysWithActivity / days) * 100,
  };
}

export default {
  getGentleMessage,
  getWeeklyMessage,
  getAdaptiveReminder,
  calculateCompletionStats,
};
