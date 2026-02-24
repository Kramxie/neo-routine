/**
 * Timezone Utility
 * Handles timezone conversion for date operations
 * 
 * Uses IANA timezone identifiers (e.g., 'America/New_York', 'Asia/Manila')
 */

/**
 * Supported timezones with their UTC offsets (for display purposes)
 * The actual conversion uses Intl.DateTimeFormat for accuracy (handles DST)
 */
export const SUPPORTED_TIMEZONES = {
  'UTC': 'UTC (+00:00)',
  'America/New_York': 'Eastern Time (ET)',
  'America/Chicago': 'Central Time (CT)',
  'America/Denver': 'Mountain Time (MT)',
  'America/Los_Angeles': 'Pacific Time (PT)',
  'America/Sao_Paulo': 'Brasilia Time (BRT)',
  'Europe/London': 'London (GMT/BST)',
  'Europe/Paris': 'Paris (CET/CEST)',
  'Asia/Dubai': 'Dubai (GST)',
  'Asia/Manila': 'Manila (PHT)',
  'Asia/Tokyo': 'Tokyo (JST)',
  'Asia/Shanghai': 'Shanghai (CST)',
  'Asia/Singapore': 'Singapore (SGT)',
  'Australia/Sydney': 'Sydney (AEST/AEDT)',
};

/**
 * Get today's date in YYYY-MM-DD format for a given timezone
 * @param {string} timezone - IANA timezone identifier
 * @returns {string} - Date in YYYY-MM-DD format
 */
export function getTodayInTimezone(timezone = 'UTC') {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    // en-CA locale returns YYYY-MM-DD format
    return formatter.format(now);
  } catch (_error) {
    // Fallback to UTC if timezone is invalid
    console.warn(`[Timezone] Invalid timezone: ${timezone}, falling back to UTC`);
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Get the current time in HH:MM format for a given timezone
 * @param {string} timezone - IANA timezone identifier
 * @returns {string} - Time in HH:MM format (24-hour)
 */
export function getCurrentTimeInTimezone(timezone = 'UTC') {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(now);
  } catch (_error) {
    console.warn(`[Timezone] Invalid timezone: ${timezone}, falling back to UTC`);
    return new Date().toISOString().split('T')[1].substring(0, 5);
  }
}

/**
 * Get the day of week (0-6, Sunday=0) in a given timezone
 * @param {string} timezone - IANA timezone identifier
 * @param {Date} date - Date object (optional, defaults to now)
 * @returns {number} - Day of week (0-6)
 */
export function getDayOfWeekInTimezone(timezone = 'UTC', date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
    });
    const dayName = formatter.format(date);
    const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return dayMap[dayName] ?? 0;
  } catch (_error) {
    return date.getDay();
  }
}

/**
 * Convert a date string from one timezone to another
 * @param {string} dateISO - Date in YYYY-MM-DD format
 * @param {string} fromTimezone - Source timezone
 * @param {string} toTimezone - Target timezone
 * @returns {string} - Date in YYYY-MM-DD format in target timezone
 */
export function convertDateBetweenTimezones(dateISO, fromTimezone, toTimezone) {
  try {
    // Parse the date as midnight in the source timezone
    const [_year, _month, _day] = dateISO.split('-').map(Number);
    
    // Create a date string with time to be precise
    const dateTimeStr = `${dateISO}T12:00:00`; // Use noon to avoid DST edge cases
    
    // Parse and format for target timezone
    const date = new Date(dateTimeStr);
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: toTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    
    return formatter.format(date);
  } catch (_error) {
    console.warn(`[Timezone] Conversion failed, returning original: ${dateISO}`);
    return dateISO;
  }
}

/**
 * Check if a timezone is valid
 * @param {string} timezone - IANA timezone identifier
 * @returns {boolean}
 */
export function isValidTimezone(timezone) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (_error) {
    return false;
  }
}

/**
 * Get start and end of day as UTC timestamps for a given date in a timezone
 * Useful for database queries
 * @param {string} dateISO - Date in YYYY-MM-DD format
 * @param {string} timezone - IANA timezone identifier
 * @returns {{ startUTC: Date, endUTC: Date }}
 */
export function getDayBoundsUTC(dateISO, _timezone = 'UTC') {
  try {
    // This is more complex because we need to find when midnight
    // in the user's timezone translates to in UTC
    
    // For simplicity and reliability, we'll use the dateISO as-is
    // since we store dates as YYYY-MM-DD strings, not timestamps
    // The key is to use getTodayInTimezone() when determining "today"
    
    const [year, month, day] = dateISO.split('-').map(Number);
    const startUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endUTC = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    
    return { startUTC, endUTC };
  } catch (_error) {
    const now = new Date();
    return {
      startUTC: new Date(now.setHours(0, 0, 0, 0)),
      endUTC: new Date(now.setHours(23, 59, 59, 999)),
    };
  }
}

/**
 * Get the week start (Monday) date for a given date in a timezone
 * @param {string} dateISO - Date in YYYY-MM-DD format
 * @param {string} timezone - IANA timezone identifier
 * @returns {string} - Monday's date in YYYY-MM-DD format
 */
export function getWeekStartInTimezone(dateISO, timezone = 'UTC') {
  try {
    const [year, month, day] = dateISO.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    
    // Get day of week (0-6, Sunday = 0)
    const dayOfWeek = getDayOfWeekInTimezone(timezone, date);
    
    // Calculate days to subtract to get to Monday
    // Monday is 1, so: Sun(0)->6, Mon(1)->0, Tue(2)->1, etc.
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    date.setUTCDate(date.getUTCDate() - daysToMonday);
    
    return date.toISOString().split('T')[0];
  } catch (_error) {
    return dateISO;
  }
}

const timezoneUtils = {
  SUPPORTED_TIMEZONES,
  getTodayInTimezone,
  getCurrentTimeInTimezone,
  getDayOfWeekInTimezone,
  convertDateBetweenTimezones,
  isValidTimezone,
  getDayBoundsUTC,
  getWeekStartInTimezone,
};

export default timezoneUtils;
