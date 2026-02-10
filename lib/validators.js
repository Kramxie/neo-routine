/**
 * Input Validators
 * Centralized validation functions for API endpoints
 */

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Minimum 6 characters
 * @param {string} password
 * @returns {boolean}
 */
export function isValidPassword(password) {
  return password && password.length >= 6;
}

/**
 * Validate registration input
 * @param {Object} data - { name, email, password }
 * @returns {Object} - { isValid, errors }
 */
export function validateRegister(data) {
  const errors = {};

  // Name validation
  if (!data.name || data.name.trim() === '') {
    errors.name = 'Name is required';
  } else if (data.name.trim().length > 50) {
    errors.name = 'Name cannot exceed 50 characters';
  }

  // Email validation
  if (!data.email || data.email.trim() === '') {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(data.password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate login input
 * @param {Object} data - { email, password }
 * @returns {Object} - { isValid, errors }
 */
export function validateLogin(data) {
  const errors = {};

  // Email validation
  if (!data.email || data.email.trim() === '') {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate routine input
 * @param {Object} data - { title, description, tasks }
 * @returns {Object} - { isValid, errors }
 */
export function validateRoutine(data) {
  const errors = {};

  // Title validation
  if (!data.title || data.title.trim() === '') {
    errors.title = 'Routine title is required';
  } else if (data.title.trim().length > 100) {
    errors.title = 'Title cannot exceed 100 characters';
  }

  // Description validation (optional but has max length)
  if (data.description && data.description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters';
  }

  // Tasks validation
  if (data.tasks) {
    if (!Array.isArray(data.tasks)) {
      errors.tasks = 'Tasks must be an array';
    } else if (data.tasks.length > 20) {
      errors.tasks = 'Cannot have more than 20 tasks per routine';
    } else {
      // Validate each task
      const taskErrors = [];
      data.tasks.forEach((task, index) => {
        if (!task.label || task.label.trim() === '') {
          taskErrors.push(`Task ${index + 1}: Label is required`);
        } else if (task.label.length > 100) {
          taskErrors.push(`Task ${index + 1}: Label cannot exceed 100 characters`);
        }
      });
      if (taskErrors.length > 0) {
        errors.tasks = taskErrors;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate check-in input
 * @param {Object} data - { routineId, taskIndex, dateISO }
 * @returns {Object} - { isValid, errors }
 */
export function validateCheckIn(data) {
  const errors = {};

  if (!data.routineId) {
    errors.routineId = 'Routine ID is required';
  }

  if (data.taskIndex === undefined || data.taskIndex === null) {
    errors.taskIndex = 'Task index is required';
  } else if (typeof data.taskIndex !== 'number' || data.taskIndex < 0) {
    errors.taskIndex = 'Task index must be a non-negative number';
  }

  if (!data.dateISO) {
    errors.dateISO = 'Date is required';
  } else {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.dateISO)) {
      errors.dateISO = 'Date must be in YYYY-MM-DD format';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Sanitize string input
 * Removes leading/trailing whitespace and limits length
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function sanitizeString(str, maxLength = 500) {
  if (!str || typeof str !== 'string') return '';
  return str.trim().substring(0, maxLength);
}
