/**
 * Feature Gating Configuration
 * Defines features available at each subscription tier
 * 
 * Tiers:
 * - free: Basic functionality
 * - premium: Enhanced features
 * - premium_plus: All features unlocked
 */

// Feature limits by tier
export const tierLimits = {
  free: {
    maxRoutines: 3,
    maxTasksPerRoutine: 5,
    insightsDays: 7,
    customColors: false,
    advancedInsights: false,
    exportData: false,
    prioritySupport: false,
    coachAccess: false,
    apiAccess: false,
    weeklyDigest: true,
    celebrations: true,
    darkMode: false,
  },
  premium: {
    maxRoutines: 10,
    maxTasksPerRoutine: 15,
    insightsDays: 90,
    customColors: true,
    advancedInsights: true,
    exportData: true,
    prioritySupport: false,
    coachAccess: false,
    apiAccess: false,
    weeklyDigest: true,
    celebrations: true,
    darkMode: true,
  },
  premium_plus: {
    maxRoutines: Infinity,
    maxTasksPerRoutine: Infinity,
    insightsDays: 365,
    customColors: true,
    advancedInsights: true,
    exportData: true,
    prioritySupport: true,
    coachAccess: true,
    apiAccess: true,
    weeklyDigest: true,
    celebrations: true,
    darkMode: true,
  },
};

// Subscription plans with pricing
export const plans = {
  premium_monthly: {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    tier: 'premium',
    price: 4.99,
    currency: 'USD',
    interval: 'month',
    intervalCount: 1,
    features: [
      'Up to 10 routines',
      'Up to 15 tasks per routine',
      '90 days of insights history',
      'Custom routine colors',
      'Advanced analytics',
      'Data export (CSV)',
      'Dark mode',
    ],
  },
  premium_yearly: {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    tier: 'premium',
    price: 39.99,
    currency: 'USD',
    interval: 'year',
    intervalCount: 1,
    savings: '33%',
    features: [
      'All Premium Monthly features',
      '2 months free',
    ],
  },
  premium_plus_monthly: {
    id: 'premium_plus_monthly',
    name: 'Premium+ Monthly',
    tier: 'premium_plus',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    intervalCount: 1,
    features: [
      'Unlimited routines',
      'Unlimited tasks',
      'Full year of insights',
      'Priority support',
      'Coach access',
      'API access',
      'Everything in Premium',
    ],
  },
  premium_plus_yearly: {
    id: 'premium_plus_yearly',
    name: 'Premium+ Yearly',
    tier: 'premium_plus',
    price: 79.99,
    currency: 'USD',
    interval: 'year',
    intervalCount: 1,
    savings: '33%',
    features: [
      'All Premium+ Monthly features',
      '2 months free',
    ],
  },
};

// Free tier features for marketing
export const freeTierFeatures = [
  'Up to 3 routines',
  'Up to 5 tasks per routine',
  '7 days of insights',
  'Daily reminders',
  'Progress tracking',
  'Basic analytics',
];

/**
 * Check if a user has access to a feature
 * @param {string} userTier - User's subscription tier
 * @param {string} feature - Feature key to check
 * @returns {boolean}
 */
export function hasFeature(userTier, feature) {
  const tier = userTier || 'free';
  const limits = tierLimits[tier] || tierLimits.free;
  return !!limits[feature];
}

/**
 * Get the limit for a feature
 * @param {string} userTier - User's subscription tier
 * @param {string} limitKey - Limit key to check
 * @returns {number|boolean}
 */
export function getLimit(userTier, limitKey) {
  const tier = userTier || 'free';
  const limits = tierLimits[tier] || tierLimits.free;
  return limits[limitKey];
}

/**
 * Check if user can create more routines
 * @param {string} userTier - User's subscription tier
 * @param {number} currentCount - Current number of routines
 * @returns {Object} - { allowed: boolean, limit: number, remaining: number }
 */
export function canCreateRoutine(userTier, currentCount) {
  const limit = getLimit(userTier, 'maxRoutines');
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - currentCount);
  return {
    allowed: currentCount < limit,
    limit,
    remaining,
  };
}

/**
 * Check if user can add more tasks to a routine
 * @param {string} userTier - User's subscription tier
 * @param {number} currentCount - Current number of tasks in routine
 * @returns {Object} - { allowed: boolean, limit: number, remaining: number }
 */
export function canAddTask(userTier, currentCount) {
  const limit = getLimit(userTier, 'maxTasksPerRoutine');
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - currentCount);
  return {
    allowed: currentCount < limit,
    limit,
    remaining,
  };
}

/**
 * Get insights days limit for a user
 * @param {string} userTier - User's subscription tier
 * @returns {number}
 */
export function getInsightsDaysLimit(userTier) {
  return getLimit(userTier, 'insightsDays');
}

/**
 * Check if subscription is active (not expired)
 * @param {Object} subscription - User's subscription object
 * @returns {boolean}
 */
export function isSubscriptionActive(subscription) {
  if (!subscription) return false;
  if (subscription.status === 'active' || subscription.status === 'trialing') {
    // Check if still within period
    if (subscription.currentPeriodEnd) {
      return new Date(subscription.currentPeriodEnd) > new Date();
    }
    return true;
  }
  return false;
}

/**
 * Get effective tier (considering subscription status)
 * @param {Object} user - User object with tier and subscription
 * @returns {string}
 */
export function getEffectiveTier(user) {
  if (!user) return 'free';
  
  // Admin always has full access
  if (user.role === 'admin') return 'premium_plus';
  
  // Check if subscription is active
  if (user.subscription && isSubscriptionActive(user.subscription)) {
    return user.tier;
  }
  
  // Default to free if subscription not active
  return 'free';
}

/**
 * Get upgrade prompt message based on feature
 * @param {string} feature - Feature that requires upgrade
 * @returns {Object} - { title, description, cta }
 */
export function getUpgradePrompt(feature) {
  const prompts = {
    maxRoutines: {
      title: 'Routine Limit Reached',
      description: 'Upgrade to Premium to create up to 10 routines, or Premium+ for unlimited.',
      cta: 'View Plans',
    },
    maxTasksPerRoutine: {
      title: 'Task Limit Reached',
      description: 'Upgrade to add more tasks to your routines.',
      cta: 'Upgrade Now',
    },
    advancedInsights: {
      title: 'Unlock Advanced Insights',
      description: 'See detailed patterns, trends, and personalized recommendations.',
      cta: 'Go Premium',
    },
    exportData: {
      title: 'Export Your Data',
      description: 'Download your routine and check-in history as CSV.',
      cta: 'Unlock Export',
    },
    darkMode: {
      title: 'Dark Mode',
      description: 'Easier on the eyes, especially at night.',
      cta: 'Enable Dark Mode',
    },
    default: {
      title: 'Premium Feature',
      description: 'This feature is available on Premium plans.',
      cta: 'View Plans',
    },
  };

  return prompts[feature] || prompts.default;
}

export default {
  tierLimits,
  plans,
  freeTierFeatures,
  hasFeature,
  getLimit,
  canCreateRoutine,
  canAddTask,
  getInsightsDaysLimit,
  isSubscriptionActive,
  getEffectiveTier,
  getUpgradePrompt,
};
