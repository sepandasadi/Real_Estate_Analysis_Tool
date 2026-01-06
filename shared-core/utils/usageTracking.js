/**
 * ===============================
 * RAPIDAPI USAGE TRACKING (HEADER-BASED)
 * ===============================
 *
 * Extracts and caches usage data from RapidAPI response headers
 * Platform-agnostic - caching handled by platform adapters
 *
 * @module shared-core/utils/usageTracking
 */

/**
 * Extract usage data from RapidAPI response headers
 * @param {Object} headers - Response headers object
 * @returns {Object|null} Usage data or null
 */
function extractRapidAPIUsage(headers) {
  if (!headers || typeof headers !== 'object') {
    return null;
  }

  // Headers can be lowercase or mixed case depending on platform
  const limitKey = Object.keys(headers).find(function(k) {
    return k.toLowerCase() === 'x-rapidapi-requests-limit';
  });
  const remainingKey = Object.keys(headers).find(function(k) {
    return k.toLowerCase() === 'x-rapidapi-requests-remaining';
  });

  if (!limitKey || !remainingKey) {
    return null;
  }

  const limit = parseInt(headers[limitKey]);
  const remaining = parseInt(headers[remainingKey]);

  if (isNaN(limit) || isNaN(remaining)) {
    return null;
  }

  const used = limit - remaining;
  const percentage = limit > 0 ? (used / limit) * 100 : 0;

  return {
    limit: limit,
    remaining: remaining,
    used: used,
    percentage: percentage,
    timestamp: new Date().toISOString()
  };
}

/**
 * Check if API has sufficient quota remaining
 * @param {Object} usage - Usage object from extractRapidAPIUsage
 * @param {number} threshold - Percentage threshold (default: 90)
 * @returns {boolean} True if under threshold
 */
function hasQuotaRemaining(usage, threshold) {
  if (!usage) {
    return true; // Unknown usage, allow call
  }

  const thresholdPercentage = threshold || 90;
  return usage.percentage < thresholdPercentage;
}

/**
 * Get warning message for quota usage
 * @param {string} apiName - API name
 * @param {Object} usage - Usage object
 * @returns {string|null} Warning message or null
 */
function getQuotaWarning(apiName, usage) {
  if (!usage) {
    return null;
  }

  const displayName = apiName.replace(/_/g, ' ').toUpperCase();

  if (usage.percentage >= 95) {
    return 'CRITICAL: ' + displayName + ' at ' + usage.percentage.toFixed(1) + '% (' + usage.remaining + '/' + usage.limit + ' remaining)';
  } else if (usage.percentage >= 90) {
    return 'WARNING: ' + displayName + ' at ' + usage.percentage.toFixed(1) + '% (' + usage.remaining + '/' + usage.limit + ' remaining)';
  } else if (usage.percentage >= 80) {
    return 'INFO: ' + displayName + ' at ' + usage.percentage.toFixed(1) + '% (' + usage.remaining + '/' + usage.limit + ' remaining)';
  }

  return null;
}

/**
 * Get quota status level
 * @param {Object} usage - Usage object
 * @returns {string} Status level: 'healthy', 'warning', 'critical', 'exhausted'
 */
function getQuotaStatusLevel(usage) {
  if (!usage) {
    return 'unknown';
  }

  if (usage.percentage >= 100 || usage.remaining === 0) {
    return 'exhausted';
  } else if (usage.percentage >= 95) {
    return 'critical';
  } else if (usage.percentage >= 80) {
    return 'warning';
  } else {
    return 'healthy';
  }
}

/**
 * Format usage data for display
 * @param {string} apiName - API name
 * @param {Object} usage - Usage object
 * @returns {string} Formatted usage string
 */
function formatUsageDisplay(apiName, usage) {
  if (!usage) {
    return apiName + ': No recent calls - usage unknown';
  }

  const displayName = apiName.replace(/_/g, ' ').toUpperCase();
  return displayName + ': ' + usage.used + '/' + usage.limit + ' (' + usage.percentage.toFixed(1) + '%) - ' + usage.remaining + ' remaining';
}

/**
 * Calculate time until quota reset
 * @param {string} period - Period type ('month' or 'day')
 * @returns {Object} Time until reset {days, hours, minutes, seconds}
 */
function getTimeUntilReset(period) {
  const now = new Date();
  let resetDate;

  if (period === 'month') {
    // Reset on first day of next month at midnight
    resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
  } else if (period === 'day') {
    // Reset at midnight tomorrow
    resetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  } else {
    return null;
  }

  const diff = resetDate - now;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    totalMilliseconds: diff
  };
}

/**
 * Format time until reset for display
 * @param {string} period - Period type ('month' or 'day')
 * @returns {string} Formatted time string
 */
function formatTimeUntilReset(period) {
  const time = getTimeUntilReset(period);
  if (!time) {
    return 'Unknown';
  }

  if (time.days > 0) {
    return time.days + ' day' + (time.days !== 1 ? 's' : '') + ' ' + time.hours + ' hour' + (time.hours !== 1 ? 's' : '');
  } else if (time.hours > 0) {
    return time.hours + ' hour' + (time.hours !== 1 ? 's' : '') + ' ' + time.minutes + ' minute' + (time.minutes !== 1 ? 's' : '');
  } else {
    return time.minutes + ' minute' + (time.minutes !== 1 ? 's' : '') + ' ' + time.seconds + ' second' + (time.seconds !== 1 ? 's' : '');
  }
}

/**
 * Determine API name from URL
 * @param {string} url - API endpoint URL
 * @returns {string|null} API name or null
 */
function getAPINameFromURL(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('private-zillow')) {
    return 'private_zillow';
  } else if (lowerUrl.includes('redfin-base-us') || lowerUrl.includes('redfin')) {
    return 'redfin';
  } else if (lowerUrl.includes('us-real-estate')) {
    return 'us_real_estate';
  } else if (lowerUrl.includes('generativelanguage') || lowerUrl.includes('gemini')) {
    return 'gemini';
  }

  return null;
}

/**
 * Get API base URL
 * @param {string} apiName - API name
 * @returns {string} Base URL for the API
 */
function getAPIBaseURL(apiName) {
  const urls = {
    'private_zillow': 'https://private-zillow.p.rapidapi.com',
    'redfin': 'https://redfin-base-us.p.rapidapi.com',
    'us_real_estate': 'https://us-real-estate.p.rapidapi.com',
    'gemini': 'https://generativelanguage.googleapis.com'
  };

  return urls[apiName] || '';
}

/**
 * Get API display name
 * @param {string} apiName - API name
 * @returns {string} Display name for the API
 */
function getAPIDisplayName(apiName) {
  const displayNames = {
    'private_zillow': 'Private Zillow',
    'redfin': 'Redfin Base US',
    'us_real_estate': 'US Real Estate',
    'gemini': 'Gemini AI'
  };

  return displayNames[apiName] || apiName;
}

/**
 * Validate usage object structure
 * @param {Object} usage - Usage object to validate
 * @returns {boolean} True if valid
 */
function isValidUsageObject(usage) {
  if (!usage || typeof usage !== 'object') {
    return false;
  }

  return (
    typeof usage.limit === 'number' &&
    typeof usage.remaining === 'number' &&
    typeof usage.used === 'number' &&
    typeof usage.percentage === 'number' &&
    typeof usage.timestamp === 'string'
  );
}

/**
 * Merge usage data from multiple sources
 * @param {Array} usageArray - Array of usage objects
 * @returns {Object} Merged usage data
 */
function mergeUsageData(usageArray) {
  if (!Array.isArray(usageArray) || usageArray.length === 0) {
    return null;
  }

  // Filter out invalid usage objects
  const valid = usageArray.filter(function(u) {
    return isValidUsageObject(u);
  });

  if (valid.length === 0) {
    return null;
  }

  // Use the most recent usage data
  const sorted = valid.sort(function(a, b) {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  return sorted[0];
}

