/**
 * ===============================
 * VALIDATION UTILITIES
 * ===============================
 *
 * Platform-agnostic data validation functions
 * Used across all modules for input validation
 *
 * @module shared-core/utils/validation
 */

/**
 * Validate address components
 * @param {string} address - Street address
 * @param {string} city - City
 * @param {string} state - State
 * @param {string} zip - Zip code
 * @returns {Object} { valid: boolean, errors: Array }
 */
function validateAddress(address, city, state, zip) {
  const errors = [];

  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    errors.push('Address is required');
  }

  if (!city || typeof city !== 'string' || city.trim().length === 0) {
    errors.push('City is required');
  }

  if (!state || typeof state !== 'string' || state.trim().length === 0) {
    errors.push('State is required');
  }

  if (!zip || typeof zip !== 'string' || zip.trim().length === 0) {
    errors.push('Zip code is required');
  } else if (!/^\d{5}(-\d{4})?$/.test(zip.trim())) {
    errors.push('Zip code must be 5 digits (e.g., 92101) or 9 digits (e.g., 92101-1234)');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate property data
 * @param {Object} propertyData - Property data object
 * @returns {Object} { valid: boolean, errors: Array }
 */
function validatePropertyData(propertyData) {
  const errors = [];

  if (!propertyData || typeof propertyData !== 'object') {
    return {
      valid: false,
      errors: ['Property data is required']
    };
  }

  // Validate address
  const addressValidation = validateAddress(
    propertyData.address,
    propertyData.city,
    propertyData.state,
    propertyData.zip
  );

  if (!addressValidation.valid) {
    errors.push.apply(errors, addressValidation.errors);
  }

  // Validate purchase price
  if (!propertyData.purchasePrice || propertyData.purchasePrice <= 0) {
    errors.push('Purchase price must be greater than 0');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate number is positive
 * @param {number} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Object} { valid: boolean, error?: string }
 */
function validatePositiveNumber(value, fieldName) {
  if (value === undefined || value === null) {
    return {
      valid: false,
      error: `${fieldName} is required`
    };
  }

  if (typeof value !== 'number' || isNaN(value)) {
    return {
      valid: false,
      error: `${fieldName} must be a number`
    };
  }

  if (value <= 0) {
    return {
      valid: false,
      error: `${fieldName} must be greater than 0`
    };
  }

  return { valid: true };
}

/**
 * Validate number is non-negative
 * @param {number} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateNonNegativeNumber(value, fieldName) {
  if (value === undefined || value === null) {
    return {
      valid: false,
      error: `${fieldName} is required`
    };
  }

  if (typeof value !== 'number' || isNaN(value)) {
    return {
      valid: false,
      error: `${fieldName} must be a number`
    };
  }

  if (value < 0) {
    return {
      valid: false,
      error: `${fieldName} cannot be negative`
    };
  }

  return { valid: true };
}

/**
 * Validate percentage (0-100)
 * @param {number} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Object} { valid: boolean, error?: string }
 */
function validatePercentage(value, fieldName) {
  if (value === undefined || value === null) {
    return {
      valid: false,
      error: `${fieldName} is required`
    };
  }

  if (typeof value !== 'number' || isNaN(value)) {
    return {
      valid: false,
      error: `${fieldName} must be a number`
    };
  }

  if (value < 0 || value > 100) {
    return {
      valid: false,
      error: `${fieldName} must be between 0 and 100`
    };
  }

  return { valid: true };
}

/**
 * Validate decimal rate (0-1)
 * @param {number} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateDecimalRate(value, fieldName) {
  if (value === undefined || value === null) {
    return {
      valid: false,
      error: `${fieldName} is required`
    };
  }

  if (typeof value !== 'number' || isNaN(value)) {
    return {
      valid: false,
      error: `${fieldName} must be a number`
    };
  }

  if (value < 0 || value > 1) {
    return {
      valid: false,
      error: `${fieldName} must be between 0 and 1`
    };
  }

  return { valid: true };
}

/**
 * Validate array is not empty
 * @param {Array} value - Array to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateNonEmptyArray(value, fieldName) {
  if (!value) {
    return {
      valid: false,
      error: `${fieldName} is required`
    };
  }

  if (!Array.isArray(value)) {
    return {
      valid: false,
      error: `${fieldName} must be an array`
    };
  }

  if (value.length === 0) {
    return {
      valid: false,
      error: `${fieldName} cannot be empty`
    };
  }

  return { valid: true };
}

/**
 * Validate string is not empty
 * @param {string} value - String to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateNonEmptyString(value, fieldName) {
  if (!value) {
    return {
      valid: false,
      error: `${fieldName} is required`
    };
  }

  if (typeof value !== 'string') {
    return {
      valid: false,
      error: `${fieldName} must be a string`
    };
  }

  if (value.trim().length === 0) {
    return {
      valid: false,
      error: `${fieldName} cannot be empty`
    };
  }

  return { valid: true };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return {
      valid: false,
      error: 'Email is required'
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: 'Invalid email format'
    };
  }

  return { valid: true };
}

/**
 * Validate date string
 * @param {string} dateString - Date string to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Object} { valid: boolean, error?: string, date?: Date }
 */
function validateDateString(dateString, fieldName) {
  if (!dateString || typeof dateString !== 'string') {
    return {
      valid: false,
      error: `${fieldName} is required`
    };
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return {
        valid: false,
        error: `${fieldName} is not a valid date`
      };
    }

    return {
      valid: true,
      date: date
    };
  } catch (e) {
    return {
      valid: false,
      error: `${fieldName} is not a valid date`
    };
  }
}

/**
 * Validate comp object
 * @param {Object} comp - Comp object to validate
 * @returns {Object} { valid: boolean, errors: Array }
 */
function validateComp(comp) {
  const errors = [];

  if (!comp || typeof comp !== 'object') {
    return {
      valid: false,
      errors: ['Comp must be an object']
    };
  }

  // Address is optional but should be string if provided
  if (comp.address && typeof comp.address !== 'string') {
    errors.push('Comp address must be a string');
  }

  // Price is required and must be positive
  const priceValidation = validatePositiveNumber(comp.price, 'Comp price');
  if (!priceValidation.valid) {
    errors.push(priceValidation.error);
  }

  // Sqft should be positive if provided
  if (comp.sqft !== undefined && comp.sqft !== null) {
    const sqftValidation = validatePositiveNumber(comp.sqft, 'Comp sqft');
    if (!sqftValidation.valid) {
      errors.push(sqftValidation.error);
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate estimate object
 * @param {Object} estimate - Estimate object to validate
 * @returns {Object} { valid: boolean, errors: Array }
 */
function validateEstimate(estimate) {
  const errors = [];

  if (!estimate || typeof estimate !== 'object') {
    return {
      valid: false,
      errors: ['Estimate must be an object']
    };
  }

  // Value is required and must be positive
  const valueValidation = validatePositiveNumber(estimate.value, 'Estimate value');
  if (!valueValidation.valid) {
    errors.push(valueValidation.error);
  }

  // Weight is required and must be non-negative
  const weightValidation = validateNonNegativeNumber(estimate.weight, 'Estimate weight');
  if (!weightValidation.valid) {
    errors.push(weightValidation.error);
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Sanitize string input
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
function sanitizeString(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input.trim();
}

/**
 * Sanitize number input
 * @param {*} input - Input value
 * @param {number} defaultValue - Default value if invalid
 * @returns {number} Sanitized number
 */
function sanitizeNumber(input, defaultValue) {
  const num = parseFloat(input);

  if (isNaN(num)) {
    return defaultValue || 0;
  }

  return num;
}

/**
 * Clamp number to range
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clampNumber(value, min, max) {
  if (typeof value !== 'number' || isNaN(value)) {
    return min;
  }

  return Math.max(min, Math.min(max, value));
}

/**
 * Validate and sanitize property data
 * @param {Object} propertyData - Raw property data
 * @returns {Object} { valid: boolean, data?: Object, errors?: Array }
 */
function validateAndSanitizePropertyData(propertyData) {
  const validation = validatePropertyData(propertyData);

  if (!validation.valid) {
    return {
      valid: false,
      errors: validation.errors
    };
  }

  // Sanitize data
  const sanitized = {
    address: sanitizeString(propertyData.address),
    city: sanitizeString(propertyData.city),
    state: sanitizeString(propertyData.state),
    zip: sanitizeString(propertyData.zip),
    purchasePrice: sanitizeNumber(propertyData.purchasePrice, 0),
    downPayment: clampNumber(sanitizeNumber(propertyData.downPayment, 20), 0, 100),
    loanInterestRate: clampNumber(sanitizeNumber(propertyData.loanInterestRate, 7), 0, 30),
    loanTerm: clampNumber(sanitizeNumber(propertyData.loanTerm, 30), 1, 50),
    rehabCost: sanitizeNumber(propertyData.rehabCost, 0),
    monthsToFlip: clampNumber(sanitizeNumber(propertyData.monthsToFlip, 6), 1, 60),
    cashInvestment: sanitizeNumber(propertyData.cashInvestment, 0),
    helocAmount: sanitizeNumber(propertyData.helocAmount, 0),
    helocInterest: clampNumber(sanitizeNumber(propertyData.helocInterest, 7), 0, 30)
  };

  return {
    valid: true,
    data: sanitized
  };
}
