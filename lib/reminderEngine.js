/**
 * Reminder Engine - Enhanced for Phase 4
 * Generates gentle, adaptive messages based on user progress and patterns
 * 
 * Philosophy:
 * - No guilt or pressure
 * - Softer reminders when struggling
 * - Encouraging progression when consistent
 * - Calm, water-themed language
 * - Time-aware messaging
 * - Pattern recognition for personalization
 */

// Time of day greeting helpers
const timeGreetings = {
  morning: ['Good morning', 'Rise and shine', 'Morning'],
  afternoon: ['Good afternoon', 'Hello', 'Hey there'],
  evening: ['Good evening', 'Evening', 'Hello'],
  night: ['Still up?', 'Late night', 'Burning the midnight oil?'],
};

// Day of week context
const dayContext = {
  0: { name: 'Sunday', vibe: 'restful', message: 'A calm Sunday to reset.' },
  1: { name: 'Monday', vibe: 'fresh', message: 'Fresh start to the week.' },
  2: { name: 'Tuesday', vibe: 'momentum', message: 'Building momentum.' },
  3: { name: 'Wednesday', vibe: 'midweek', message: 'Midweek milestone.' },
  4: { name: 'Thursday', vibe: 'progress', message: 'Almost there.' },
  5: { name: 'Friday', vibe: 'celebration', message: 'End the week strong.' },
  6: { name: 'Saturday', vibe: 'flexible', message: 'Weekend flow.' },
};

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

  // Recovery messages (returning after a break)
  recovery: [
    "Welcome back. The water remembers you.",
    "Breaks are natural. Ready to flow again?",
    "Every return is a new beginning.",
    "The pool is still here, waiting patiently.",
    "No judgment, just a fresh start.",
  ],

  // Milestone celebrations
  milestones: {
    firstCheckIn: "Your first drop! The journey begins. 💧",
    weekStreak: "One week of consistency! The ripples are spreading.",
    twoWeekStreak: "Two weeks strong! Your habit is taking root.",
    monthStreak: "A full month! You've created an ocean of progress.",
    hundredCheckIns: "100 check-ins! Your dedication is remarkable.",
    perfectWeek: "A perfect week! Every drop collected.",
  },

  // Time-specific motivations
  timeSpecific: {
    earlyMorning: [
      "Early bird! Your morning dedication is inspiring.",
      "Starting fresh with the sunrise.",
      "Morning routines set the day's tone.",
    ],
    lateMorning: [
      "Mid-morning momentum. Perfect timing.",
      "The day is unfolding beautifully.",
    ],
    afternoon: [
      "Afternoon check-in. Keeping the flow steady.",
      "Midday momentum. Well done.",
    ],
    evening: [
      "Evening reflection. A calming way to close the day.",
      "Winding down with intention.",
    ],
    night: [
      "Late night dedication. Rest well after.",
      "Finishing strong, even when it's late.",
    ],
  },
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
 * Get current time of day category
 * @returns {string} morning|afternoon|evening|night
 */
export function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Get detailed time category for messages
 * @returns {string}
 */
function getDetailedTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return 'earlyMorning';
  if (hour >= 9 && hour < 12) return 'lateMorning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Get time-aware greeting
 * @returns {string}
 */
export function getTimeGreeting() {
  const timeOfDay = getTimeOfDay();
  return getRandomMessage(timeGreetings[timeOfDay]);
}

/**
 * Get day context message
 * @returns {Object}
 */
export function getDayContext() {
  const day = new Date().getDay();
  return dayContext[day];
}

/**
 * Get a gentle micro-message based on today's and weekly progress
 * Enhanced with time awareness
 * @param {number} todayPercent - Today's completion percentage (0-100)
 * @param {number} weeklyPercent - Weekly completion percentage (0-100)
 * @param {Object} options - Additional options
 * @returns {string} - A gentle, encouraging message
 */
export function getGentleMessage(todayPercent = 0, weeklyPercent = 0, options = {}) {
  const { isReturning = false, daysAway = 0 } = options;

  // If returning after a break, prioritize recovery messages
  if (isReturning && daysAway > 2) {
    return getRandomMessage(messages.recovery);
  }

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
 * Get milestone celebration message
 * @param {string} milestoneType - Type of milestone achieved
 * @returns {string|null}
 */
export function getMilestoneMessage(milestoneType) {
  return messages.milestones[milestoneType] || null;
}

/**
 * Check for milestones based on user analytics
 * @param {Object} analytics - User analytics object
 * @param {number} todayCheckIns - Check-ins made today
 * @returns {Object|null} - Milestone info or null
 */
export function checkMilestones(analytics, todayCheckIns = 0) {
  const { totalCheckIns = 0, currentStreak = 0 } = analytics;

  // First ever check-in
  if (totalCheckIns === 0 && todayCheckIns > 0) {
    return { type: 'firstCheckIn', message: messages.milestones.firstCheckIn };
  }

  // Streak milestones
  if (currentStreak === 7) {
    return { type: 'weekStreak', message: messages.milestones.weekStreak };
  }
  if (currentStreak === 14) {
    return { type: 'twoWeekStreak', message: messages.milestones.twoWeekStreak };
  }
  if (currentStreak === 30) {
    return { type: 'monthStreak', message: messages.milestones.monthStreak };
  }

  // Total check-ins milestone
  if (totalCheckIns + todayCheckIns === 100) {
    return { type: 'hundredCheckIns', message: messages.milestones.hundredCheckIns };
  }

  return null;
}

/**
 * Get time-specific motivation based on when user is active
 * @returns {string}
 */
export function getTimeSpecificMotivation() {
  const detailedTime = getDetailedTimeOfDay();
  const timeMessages = messages.timeSpecific[detailedTime];
  return timeMessages ? getRandomMessage(timeMessages) : null;
}

/**
 * Get adaptive reminder intensity based on recent compliance
 * Enhanced with pattern recognition
 * 
 * @param {number} last7DaysPercent - Completion rate for last 7 days
 * @param {Object} userAnalytics - User's analytics data
 * @returns {Object} - Reminder configuration
 */
export function getAdaptiveReminder(last7DaysPercent = 0, userAnalytics = {}) {
  const { 
    currentStreak = 0, 
    lastActiveDate,
    preferredTimeOfDay 
  } = userAnalytics;

  // Check if user is returning after a break
  const isReturning = lastActiveDate && 
    (new Date() - new Date(lastActiveDate)) > (2 * 24 * 60 * 60 * 1000);

  if (isReturning) {
    return {
      intensity: 'gentle',
      tone: 'welcoming',
      frequency: 'reduced',
      message: getRandomMessage(messages.recovery),
      suggested: 'Start with just one task today.',
    };
  }

  if (last7DaysPercent < 30) {
    // User is struggling - be extra gentle
    return {
      intensity: 'soft',
      tone: 'supportive',
      frequency: 'reduced',
      message: getRandomMessage([
        "Just a gentle nudge. Your routine misses you.",
        "Whenever you're ready, your drops are waiting.",
        "No pressure. Just a friendly reminder.",
        "Take it one small step at a time.",
      ]),
      suggested: 'Try completing just one task to start.',
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
      suggested: null,
    };
  } else {
    // High engagement - celebrate and encourage growth
    const streakMessage = currentStreak > 7 
      ? ` You're on a ${currentStreak}-day flow!`
      : '';
    return {
      intensity: 'energetic',
      tone: 'celebratory',
      frequency: 'normal',
      message: getRandomMessage([
        "You're on a roll! Keep the momentum going.",
        "Your consistency is amazing. Ready for today?",
        "Let's continue your winning flow!",
        "Another day, another opportunity to grow.",
      ]) + streakMessage,
      suggested: null,
    };
  }
}

/**
 * Calculate completion stats for reminder decisions
 * Enhanced with pattern analysis
 * 
 * @param {Array} checkIns - Array of check-in records
 * @param {number} totalTasksPerDay - Total possible tasks per day
 * @param {number} days - Number of days to analyze
 * @returns {Object} - Stats object
 */
export function calculateCompletionStats(checkIns, totalTasksPerDay, days = 7) {
  const now = new Date();
  const dateMap = {};
  const dayOfWeekMap = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const hourMap = {};

  // Group check-ins by date and track patterns
  checkIns.forEach((checkIn) => {
    const date = checkIn.dateISO;
    dateMap[date] = (dateMap[date] || 0) + 1;

    // Track day of week patterns
    const checkInDate = new Date(date);
    dayOfWeekMap[checkInDate.getDay()]++;

    // Track time of day patterns (if timestamp available)
    if (checkIn.createdAt) {
      const hour = new Date(checkIn.createdAt).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    }
  });

  // Calculate stats for each day in range
  let totalCompleted = 0;
  let totalPossible = totalTasksPerDay * days;
  let daysWithActivity = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateISO = date.toISOString().split('T')[0];
    const count = dateMap[dateISO] || 0;
    totalCompleted += count;
    
    if (count > 0) {
      daysWithActivity++;
      tempStreak++;
      if (i === 0 || tempStreak > 0) {
        currentStreak = tempStreak;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      if (i === 0) currentStreak = 0;
      tempStreak = 0;
    }
  }

  // Find best day of week
  const bestDayOfWeek = Object.entries(dayOfWeekMap)
    .sort((a, b) => b[1] - a[1])[0][0];

  // Find preferred time of day
  let preferredTimeOfDay = 'morning';
  const morningHours = Object.entries(hourMap)
    .filter(([h]) => h >= 5 && h < 12)
    .reduce((sum, [, count]) => sum + count, 0);
  const afternoonHours = Object.entries(hourMap)
    .filter(([h]) => h >= 12 && h < 17)
    .reduce((sum, [, count]) => sum + count, 0);
  const eveningHours = Object.entries(hourMap)
    .filter(([h]) => h >= 17 || h < 5)
    .reduce((sum, [, count]) => sum + count, 0);

  if (afternoonHours > morningHours && afternoonHours > eveningHours) {
    preferredTimeOfDay = 'afternoon';
  } else if (eveningHours > morningHours && eveningHours > afternoonHours) {
    preferredTimeOfDay = 'evening';
  }

  return {
    totalCompleted,
    totalPossible,
    completionRate: totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0,
    daysWithActivity,
    activeDayRate: (daysWithActivity / days) * 100,
    currentStreak,
    longestStreak,
    bestDayOfWeek: parseInt(bestDayOfWeek),
    preferredTimeOfDay,
  };
}

/**
 * Generate personalized insights based on user patterns
 * @param {Object} stats - Completion stats
 * @param {Object} userAnalytics - User analytics
 * @returns {Array} - Array of insight objects
 */
export function generateInsights(stats, userAnalytics = {}) {
  const insights = [];

  // Best day insight
  if (stats.bestDayOfWeek !== undefined) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    insights.push({
      type: 'pattern',
      icon: '📅',
      title: 'Best Day',
      description: `You're most active on ${dayNames[stats.bestDayOfWeek]}s.`,
    });
  }

  // Time preference insight
  if (stats.preferredTimeOfDay) {
    const timeLabels = {
      morning: 'morning person',
      afternoon: 'afternoon achiever',
      evening: 'evening finisher',
    };
    insights.push({
      type: 'pattern',
      icon: '⏰',
      title: 'Timing',
      description: `You're a ${timeLabels[stats.preferredTimeOfDay]}.`,
    });
  }

  // Streak insight
  if (stats.currentStreak > 0) {
    insights.push({
      type: 'streak',
      icon: '🔥',
      title: 'Current Flow',
      description: `${stats.currentStreak} day${stats.currentStreak > 1 ? 's' : ''} of consistent activity.`,
    });
  }

  // Completion rate insight
  if (stats.completionRate >= 80) {
    insights.push({
      type: 'achievement',
      icon: '⭐',
      title: 'High Achiever',
      description: 'You completed over 80% of your tasks this week!',
    });
  } else if (stats.completionRate >= 50) {
    insights.push({
      type: 'progress',
      icon: '📈',
      title: 'Steady Progress',
      description: 'You\'re completing more than half your routine consistently.',
    });
  }

  // Room for growth insight (gentle)
  if (stats.activeDayRate < 50 && stats.daysWithActivity > 0) {
    insights.push({
      type: 'suggestion',
      icon: '💡',
      title: 'Gentle Suggestion',
      description: 'Try adding just one more active day next week.',
    });
  }

  return insights;
}

export default {
  getGentleMessage,
  getWeeklyMessage,
  getAdaptiveReminder,
  calculateCompletionStats,
  getTimeOfDay,
  getTimeGreeting,
  getDayContext,
  getMilestoneMessage,
  checkMilestones,
  getTimeSpecificMotivation,
  generateInsights,
};
