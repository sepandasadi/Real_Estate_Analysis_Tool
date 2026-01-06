/**
 * ===============================
 * API QUOTA MANAGEMENT
 * ===============================
 *
 * Platform-agnostic quota reference limits
 * Actual usage tracking handled via X-RapidAPI-* response headers
 *
 * @module shared-core/utils/quota
 */

/**
 * API quota reference limits
 * NOTE: Actual usage tracked via response headers, not local counters
 */
const API_QUOTAS = {
  // Priority 1: Private Zillow (250/month)
  PRIVATE_ZILLOW_MONTHLY_LIMIT: 250,

  // Priority 2: US Real Estate (300/month)
  US_REAL_ESTATE_MONTHLY_LIMIT: 300,

  // Priority 3: Redfin (111/month - hard limit)
  REDFIN_MONTHLY_LIMIT: 111,

  // Priority 4: Gemini (1500/day)
  GEMINI_DAILY_LIMIT: 1500
};

/**
 * API priority order (quality-based)
 */
const API_PRIORITY = [
  'private_zillow',  // Priority 1: 250/month - Best quality
  'us_real_estate',  // Priority 2: 300/month - High quality
  'redfin',          // Priority 3: 111/month - Good quality
  'gemini'           // Priority 4: 1500/day - Fallback only
];

/**
 * Get API quota limit
 * @param {string} apiName - API name (private_zillow, us_real_estate, redfin, gemini)
 * @param {string} period - Period (month, day)
 * @returns {number} Quota limit
 */
function getAPIQuotaLimit(apiName, period) {
  const key = `${apiName.toUpperCase()}_${period.toUpperCase()}_LIMIT`;
  return API_QUOTAS[key] || 0;
}

/**
 * Get API priority order
 * @returns {Array} Array of API names in priority order
 */
function getAPIPriority() {
  return API_PRIORITY.slice(); // Return copy
}

/**
 * Get current period key for quota tracking
 * @param {string} period - Period type (month, day)
 * @returns {string} Period key (e.g., "2025-01" for month, "2025-01-05" for day)
 */
function getCurrentPeriodKey(period) {
  const now = new Date();

  if (period === 'month') {
    return now.toISOString().slice(0, 7); // "2025-01"
  } else if (period === 'day') {
    return now.toISOString().slice(0, 10); // "2025-01-05"
  }

  return now.toISOString().slice(0, 10); // Default to day
}

/**
 * Calculate quota reset date
 * @param {string} period - Period (month, day)
 * @returns {string} Reset date (ISO string)
 */
function getQuotaResetDate(period) {
  const now = new Date();

  if (period === 'month') {
    // Reset on first day of next month
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toISOString();
  } else if (period === 'day') {
    // Reset at midnight tomorrow
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return tomorrow.toISOString();
  }

  return now.toISOString();
}

/**
 * Validate API name
 * @param {string} apiName - API name to validate
 * @returns {boolean} True if valid
 */
function isValidAPIName(apiName) {
  if (!apiName || typeof apiName !== 'string') {
    return false;
  }

  const validNames = ['private_zillow', 'us_real_estate', 'redfin', 'gemini'];
  return validNames.indexOf(apiName.toLowerCase()) !== -1;
}

/**
 * Normalize API name
 * @param {string} apiName - API name to normalize
 * @returns {string} Normalized API name
 */
function normalizeAPIName(apiName) {
  if (!apiName) {
    return '';
  }

  return apiName.toLowerCase().replace(/[^a-z_]/g, '_');
}
