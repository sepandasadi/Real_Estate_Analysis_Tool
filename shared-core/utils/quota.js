/**
 * ===============================
 * API QUOTA MANAGEMENT
 * ===============================
 *
 * Platform-agnostic quota tracking and management
 * Actual quota storage is handled by platform adapters
 *
 * @module shared-core/utils/quota
 */

/**
 * API quota limits (Phase 1.1 - UPDATED)
 */
const API_QUOTAS = {
  // Priority 1: US Real Estate (300/month)
  US_REAL_ESTATE_MONTHLY_LIMIT: 300,
  US_REAL_ESTATE_THRESHOLD: 270, // 90% threshold

  // Priority 2: Zillow (100/month)
  ZILLOW_MONTHLY_LIMIT: 100,
  ZILLOW_THRESHOLD: 90, // 90% threshold

  // Priority 3: Gemini (1500/day)
  GEMINI_DAILY_LIMIT: 1500,
  GEMINI_THRESHOLD: 1400 // 93% threshold
};

/**
 * API priority order (Phase 1.1 - UPDATED)
 */
const API_PRIORITY = [
  'us_real_estate', // Priority 1: 300/month
  'zillow',         // Priority 2: 100/month
  'gemini',         // Priority 3: 1500/day
  'bridge'          // Priority 4: No limit (fallback)
];

/**
 * Get API quota limit
 * @param {string} apiName - API name (zillow, us_real_estate, gemini)
 * @param {string} period - Period (month, day)
 * @returns {number} Quota limit
 */
function getAPIQuotaLimit(apiName, period) {
  const key = `${apiName.toUpperCase()}_${period.toUpperCase()}_LIMIT`;
  return API_QUOTAS[key] || 0;
}

/**
 * Get API quota threshold
 * @param {string} apiName - API name (zillow, us_real_estate, gemini)
 * @returns {number} Quota threshold
 */
function getAPIQuotaThreshold(apiName) {
  const key = `${apiName.toUpperCase()}_THRESHOLD`;
  return API_QUOTAS[key] || 0;
}

/**
 * Get current period key for quota tracking
 * @param {string} period - Period type (month, day)
 * @returns {string} Period key (e.g., "2025-11" for month, "2025-11-17" for day)
 */
function getCurrentPeriodKey(period) {
  const now = new Date();

  if (period === 'month') {
    return now.toISOString().slice(0, 7); // "2025-11"
  } else if (period === 'day') {
    return now.toISOString().slice(0, 10); // "2025-11-17"
  }

  return now.toISOString().slice(0, 10); // Default to day
}

/**
 * Generate usage key for tracking
 * @param {string} apiName - API name
 * @param {string} periodKey - Period key
 * @returns {string} Usage key
 */
function generateUsageKey(apiName, periodKey) {
  return `api_usage_${apiName}_${periodKey}`;
}

/**
 * Check if API quota is available
 * @param {string} apiName - API name (zillow, us_real_estate, gemini)
 * @param {number} currentUsage - Current usage count
 * @param {string} period - Period (month, day)
 * @returns {Object} { available: boolean, usage: number, limit: number, threshold: number }
 */
function checkQuotaAvailable(apiName, currentUsage, period) {
  // Validate inputs
  if (!apiName) {
    return { error: true, message: 'API name is required' };
  }

  const usage = currentUsage || 0;
  const limit = getAPIQuotaLimit(apiName, period || 'month');
  const threshold = getAPIQuotaThreshold(apiName);

  // Check if under threshold
  const available = usage < threshold;

  return {
    error: false,
    available: available,
    usage: usage,
    limit: limit,
    threshold: threshold,
    remaining: Math.max(0, limit - usage),
    percentUsed: limit > 0 ? Math.round((usage / limit) * 100) : 0
  };
}

/**
 * Increment API usage count
 * @param {number} currentUsage - Current usage count
 * @returns {number} New usage count
 */
function incrementUsage(currentUsage) {
  return (currentUsage || 0) + 1;
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
 * Get API priority order
 * @returns {Array} Array of API names in priority order
 */
function getAPIPriority() {
  return API_PRIORITY.slice(); // Return copy
}

/**
 * Get next available API based on quota
 * @param {Object} quotaStatus - Object with quota status for each API
 * @returns {string|null} Next available API name or null if all exhausted
 */
function getNextAvailableAPI(quotaStatus) {
  // Validate input
  if (!quotaStatus || typeof quotaStatus !== 'object') {
    return null;
  }

  // Check each API in priority order
  for (let i = 0; i < API_PRIORITY.length; i++) {
    const apiName = API_PRIORITY[i];
    const status = quotaStatus[apiName];

    // Bridge has no quota limit (always available)
    if (apiName === 'bridge') {
      return apiName;
    }

    // Check if API is available
    if (status && status.available) {
      return apiName;
    }
  }

  // All APIs exhausted
  return null;
}

/**
 * Calculate quota usage statistics
 * @param {Object} usageData - Usage data for all APIs
 * @returns {Object} Usage statistics
 */
function calculateQuotaStatistics(usageData) {
  // Validate input
  if (!usageData || typeof usageData !== 'object') {
    return {
      totalCalls: 0,
      totalLimit: 0,
      percentUsed: 0,
      apisExhausted: 0,
      apisAvailable: 0
    };
  }

  let totalCalls = 0;
  let totalLimit = 0;
  let apisExhausted = 0;
  let apisAvailable = 0;

  // Calculate totals
  Object.keys(usageData).forEach(function(apiName) {
    const data = usageData[apiName];
    if (data) {
      totalCalls += data.usage || 0;
      totalLimit += data.limit || 0;

      if (data.available) {
        apisAvailable++;
      } else {
        apisExhausted++;
      }
    }
  });

  const percentUsed = totalLimit > 0 ? Math.round((totalCalls / totalLimit) * 100) : 0;

  return {
    totalCalls: totalCalls,
    totalLimit: totalLimit,
    totalRemaining: Math.max(0, totalLimit - totalCalls),
    percentUsed: percentUsed,
    apisExhausted: apisExhausted,
    apisAvailable: apisAvailable
  };
}

/**
 * Determine quota status level
 * @param {number} percentUsed - Percentage of quota used
 * @returns {string} Status level: 'healthy', 'warning', 'critical', 'exhausted'
 */
function getQuotaStatusLevel(percentUsed) {
  if (percentUsed >= 100) {
    return 'exhausted';
  } else if (percentUsed >= 90) {
    return 'critical';
  } else if (percentUsed >= 75) {
    return 'warning';
  } else {
    return 'healthy';
  }
}

/**
 * Format quota status message
 * @param {Object} quotaCheck - Quota check result
 * @param {string} apiName - API name
 * @returns {string} Formatted status message
 */
function formatQuotaMessage(quotaCheck, apiName) {
  if (quotaCheck.error) {
    return `Error checking ${apiName} quota: ${quotaCheck.message}`;
  }

  const status = quotaCheck.available ? 'AVAILABLE' : 'EXCEEDED';
  return `${apiName}: ${quotaCheck.usage}/${quotaCheck.limit} (${quotaCheck.percentUsed}%) - ${status}`;
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

  const validNames = ['zillow', 'us_real_estate', 'gemini', 'bridge'];
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

/**
 * Get quota warning threshold percentage
 * @param {string} apiName - API name
 * @returns {number} Warning threshold percentage (0-100)
 */
function getWarningThreshold(apiName) {
  const limit = getAPIQuotaLimit(apiName, 'month');
  const threshold = getAPIQuotaThreshold(apiName);

  if (limit === 0) {
    return 90; // Default 90%
  }

  return Math.round((threshold / limit) * 100);
}
