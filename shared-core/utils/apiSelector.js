/**
 * ===============================
 * API SELECTOR UTILITY
 * ===============================
 *
 * Handles user-selectable primary API source with automatic fallback logic.
 * Used by both Google Sheets (Apps Script) and Web App (TypeScript)
 *
 * @module shared-core/utils/apiSelector
 */

/**
 * Available API options with metadata
 */
const API_OPTIONS = {
  auto: {
    id: 'auto',
    name: 'Auto (Recommended)',
    description: 'Automatically selects best available API based on quality and quota',
    icon: '✅',
    isDefault: true
  },
  private_zillow: {
    id: 'private_zillow',
    name: 'Private Zillow',
    description: 'Highest quality data (250/month)',
    quota: { limit: 250, period: 'month' },
    priority: 1,
    icon: '🏠'
  },
  us_real_estate: {
    id: 'us_real_estate',
    name: 'US Real Estate',
    description: 'High quality data (300/month)',
    quota: { limit: 300, period: 'month' },
    priority: 2,
    icon: '🏘️'
  },
  redfin: {
    id: 'redfin',
    name: 'Redfin',
    description: 'Good quality data (111/month)',
    quota: { limit: 111, period: 'month' },
    priority: 3,
    icon: '🏡'
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini AI',
    description: 'AI-powered fallback (1500/day)',
    quota: { limit: 1500, period: 'day' },
    priority: 4,
    icon: '🤖'
  }
};

/**
 * Default API priority order (used in Auto mode)
 */
const DEFAULT_PRIORITY = ['private_zillow', 'us_real_estate', 'redfin', 'gemini'];

/**
 * Get list of available API options
 * @returns {Array} Array of API option objects
 */
function getAvailableAPIs() {
  return Object.values(API_OPTIONS);
}

/**
 * Get API option metadata by ID
 * @param {string} apiId - API identifier (e.g., 'private_zillow', 'auto')
 * @returns {Object|null} API option object or null if not found
 */
function getAPIOption(apiId) {
  return API_OPTIONS[apiId] || null;
}

/**
 * Get ordered array of APIs to try based on primary selection
 * @param {string} primaryAPI - Primary API ID or 'auto'
 * @returns {Array<string>} Ordered array of API IDs to attempt
 */
function getAPICallOrder(primaryAPI) {
  // If auto mode or invalid selection, use default priority
  if (!primaryAPI || primaryAPI === 'auto' || !API_OPTIONS[primaryAPI]) {
    return [...DEFAULT_PRIORITY];
  }

  // If specific API selected, put it first then add others
  const otherAPIs = DEFAULT_PRIORITY.filter(api => api !== primaryAPI);
  return [primaryAPI, ...otherAPIs];
}

/**
 * Get fallback APIs for a given primary API
 * @param {string} primaryAPI - Primary API ID
 * @returns {Array<string>} Array of fallback API IDs
 */
function getFallbackAPIs(primaryAPI) {
  const order = getAPICallOrder(primaryAPI);
  // Return all except the first (which is the primary)
  return order.slice(1);
}

/**
 * Validate API ID
 * @param {string} apiId - API identifier to validate
 * @returns {boolean} True if valid API ID
 */
function isValidAPIId(apiId) {
  return apiId === 'auto' || DEFAULT_PRIORITY.includes(apiId);
}

/**
 * Get display name for API
 * @param {string} apiId - API identifier
 * @returns {string} Display name
 */
function getAPIDisplayName(apiId) {
  const option = API_OPTIONS[apiId];
  return option ? option.name : 'Unknown';
}

/**
 * Get quota information for API
 * @param {string} apiId - API identifier
 * @returns {Object|null} Quota info { limit, period } or null if not available
 */
function getAPIQuota(apiId) {
  const option = API_OPTIONS[apiId];
  return option && option.quota ? option.quota : null;
}

/**
 * Format API selection for logging
 * @param {string} primaryAPI - Primary API ID
 * @param {string} actualAPI - API that was actually used
 * @returns {string} Formatted log message
 */
function formatAPISelectionLog(primaryAPI, actualAPI) {
  const primaryName = getAPIDisplayName(primaryAPI);
  const actualName = getAPIDisplayName(actualAPI);

  if (primaryAPI === 'auto') {
    return `Auto mode selected ${actualName}`;
  } else if (primaryAPI === actualAPI) {
    return `Using primary API: ${actualName}`;
  } else {
    return `Primary ${primaryName} unavailable, using fallback: ${actualName}`;
  }
}

/**
 * Get status emoji based on usage percentage
 * @param {number} percentage - Usage percentage (0-100)
 * @returns {string} Status emoji
 */
function getStatusEmoji(percentage) {
  if (percentage >= 90) return '🔴';
  if (percentage >= 75) return '🟡';
  return '🟢';
}

/**
 * Calculate usage percentage
 * @param {number} used - Number of calls used
 * @param {number} limit - Total quota limit
 * @returns {number} Percentage (0-100)
 */
function calculateUsagePercentage(used, limit) {
  if (!limit || limit === 0) return 0;
  return Math.round((used / limit) * 100);
}

// Export for CommonJS (Google Apps Script) and ES6 (Web App)
if (typeof module !== 'undefined' && module.exports) {
  // CommonJS
  module.exports = {
    getAvailableAPIs,
    getAPIOption,
    getAPICallOrder,
    getFallbackAPIs,
    isValidAPIId,
    getAPIDisplayName,
    getAPIQuota,
    formatAPISelectionLog,
    getStatusEmoji,
    calculateUsagePercentage,
    API_OPTIONS,
    DEFAULT_PRIORITY
  };
}

// Also support direct usage in Google Apps Script global scope
if (typeof global !== 'undefined') {
  global.APISelector = {
    getAvailableAPIs,
    getAPIOption,
    getAPICallOrder,
    getFallbackAPIs,
    isValidAPIId,
    getAPIDisplayName,
    getAPIQuota,
    formatAPISelectionLog,
    getStatusEmoji,
    calculateUsagePercentage,
    API_OPTIONS,
    DEFAULT_PRIORITY
  };
}
