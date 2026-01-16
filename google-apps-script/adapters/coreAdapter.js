/**
 * ===============================
 * GOOGLE APPS SCRIPT PLATFORM ADAPTER
 * ===============================
 *
 * This adapter bridges the shared-core functions with Google Apps Script platform APIs.
 * It provides platform-specific implementations for:
 * - HTTP Client (UrlFetchApp)
 * - Cache Manager (CacheService)
 * - Quota Manager (PropertiesService)
 * - Logger (Logger)
 *
 * @module google-apps-script/adapters/coreAdapter
 */

/**
 * ===============================
 * HTTP CLIENT ADAPTER
 * ===============================
 */

/**
 * HTTP Client for Google Apps Script
 * Wraps UrlFetchApp with header-based usage tracking
 */
var HttpClient = {
  /**
   * Extract usage data from RapidAPI response headers
   * @param {Object} headers - Response headers
   * @returns {Object|null} Usage data or null
   */
  extractUsageFromHeaders: function(headers) {
    if (!headers) return null;

    // Check for multiple header name variations (RapidAPI uses x-ratelimit-*)
    var limit = headers['x-ratelimit-requests-limit'] ||
                headers['X-RateLimit-Requests-Limit'] ||
                headers['X-RapidAPI-Requests-Limit'] ||
                headers['x-rapidapi-requests-limit'];

    var remaining = headers['x-ratelimit-requests-remaining'] ||
                    headers['X-RateLimit-Requests-Remaining'] ||
                    headers['X-RapidAPI-Requests-Remaining'] ||
                    headers['x-rapidapi-requests-remaining'];

    if (!limit || !remaining) return null;

    var limitNum = parseInt(limit);
    var remainingNum = parseInt(remaining);

    if (isNaN(limitNum) || isNaN(remainingNum)) return null;

    return {
      limit: limitNum,
      remaining: remainingNum,
      used: limitNum - remainingNum,
      percentage: ((limitNum - remainingNum) / limitNum) * 100,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Get API name from URL
   * @param {string} url - Request URL
   * @returns {string|null} API name or null
   */
  getAPINameFromURL: function(url) {
    if (url.indexOf('private-zillow') !== -1) return 'private_zillow';
    if (url.indexOf('redfin-base-us') !== -1) return 'redfin';
    if (url.indexOf('us-real-estate') !== -1) return 'us_real_estate';
    if (url.indexOf('generativelanguage') !== -1) return 'gemini';
    return null;
  },

  /**
   * Make HTTP GET request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Object} Response object { statusCode, body, headers, usage }
   */
  get: function(url, options) {
    options = options || {};

    var fetchOptions = {
      method: 'get',
      headers: options.headers || {},
      muteHttpExceptions: true
    };

    try {
      var response = UrlFetchApp.fetch(url, fetchOptions);
      var headers = response.getHeaders();

      // Extract and cache usage data from RapidAPI headers
      var usage = this.extractUsageFromHeaders(headers);

      if (usage) {
        var apiName = this.getAPINameFromURL(url);

        if (apiName) {
          var cacheKey = apiName + '_usage';
          var cacheValue = JSON.stringify(usage);
          CacheService.getScriptCache().put(cacheKey, cacheValue, 3600); // 1 hour

          // Log warning if approaching limit
          if (usage.percentage >= 90) {
            Logger.log('WARNING: ' + apiName + ' at ' + usage.percentage.toFixed(1) + '% (' + usage.remaining + '/' + usage.limit + ' remaining)');
          }
        }
      }

      return {
        statusCode: response.getResponseCode(),
        body: response.getContentText(),
        headers: headers,
        success: response.getResponseCode() >= 200 && response.getResponseCode() < 300,
        usage: usage
      };
    } catch (error) {
      return {
        statusCode: 0,
        body: '',
        headers: {},
        success: false,
        error: error.toString()
      };
    }
  },

  /**
   * Make HTTP POST request
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {Object} Response object { statusCode, body, headers, usage }
   */
  post: function(url, options) {
    options = options || {};

    var fetchOptions = {
      method: 'post',
      headers: options.headers || {},
      contentType: options.contentType || 'application/json',
      payload: options.payload || '',
      muteHttpExceptions: true
    };

    try {
      var response = UrlFetchApp.fetch(url, fetchOptions);
      var headers = response.getHeaders();

      // Extract and cache usage data from RapidAPI headers
      var usage = this.extractUsageFromHeaders(headers);
      if (usage) {
        var apiName = this.getAPINameFromURL(url);
        if (apiName) {
          CacheService.getScriptCache().put(
            apiName + '_usage',
            JSON.stringify(usage),
            3600 // 1 hour
          );

          // Log warning if approaching limit
          if (usage.percentage >= 90) {
            Logger.log('WARNING: ' + apiName + ' at ' + usage.percentage.toFixed(1) + '% (' + usage.remaining + '/' + usage.limit + ' remaining)');
          }
        }
      }

      return {
        statusCode: response.getResponseCode(),
        body: response.getContentText(),
        headers: headers,
        success: response.getResponseCode() >= 200 && response.getResponseCode() < 300,
        usage: usage
      };
    } catch (error) {
      return {
        statusCode: 0,
        body: '',
        headers: {},
        success: false,
        error: error.toString()
      };
    }
  },

  /**
   * Retry request with exponential backoff
   * @param {Function} requestFn - Function that makes the request
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} initialDelay - Initial delay in milliseconds
   * @returns {Object} Response object
   */
  retryWithBackoff: function(requestFn, maxRetries, initialDelay) {
    maxRetries = maxRetries || 3;
    initialDelay = initialDelay || 1000;

    var lastError;

    for (var i = 0; i < maxRetries; i++) {
      try {
        var response = requestFn();

        // Return if successful
        if (response.success) {
          return response;
        }

        // Store error for last attempt
        lastError = response.error || 'Request failed with status ' + response.statusCode;

      } catch (error) {
        lastError = error.toString();
      }

      // Wait before retry (except on last attempt)
      if (i < maxRetries - 1) {
        var delay = initialDelay * Math.pow(2, i);
        Utilities.sleep(delay);
      }
    }

    // All retries failed
    return {
      statusCode: 0,
      body: '',
      headers: {},
      success: false,
      error: 'Failed after ' + maxRetries + ' attempts: ' + lastError
    };
  }
};

/**
 * ===============================
 * QUOTA MANAGER ADAPTER
 * ===============================
 */

/**
 * Quota Manager for Google Apps Script
 * Wraps PropertiesService to provide consistent interface
 */
var QuotaManager = {
  /**
   * Get API keys from Script Properties
   * @returns {Object} API keys object
   */
  getAPIKeys: function() {
    try {
      var props = PropertiesService.getScriptProperties();
      return {
        RAPIDAPI_KEY: props.getProperty('RAPIDAPI_KEY'),
        GEMINI_API_KEY: props.getProperty('GEMINI_API_KEY'),
        BRIDGE_API_KEY: props.getProperty('BRIDGE_API_KEY'),
        BRIDGE_BASE_URL: props.getProperty('BRIDGE_BASE_URL')
      };
    } catch (error) {
      PlatformLogger.error('Failed to get API keys: ' + error);
      return {};
    }
  },

  /**
   * Get API quota limits from Script Properties
   * @returns {Object} Quota limits object
   */
  getQuotaLimits: function() {
    try {
      var props = PropertiesService.getScriptProperties();

      // Global threshold percentage (default 90%)
      // Can be changed in Script Properties: QUOTA_THRESHOLD_PERCENT = 85 (for 85%)
      var thresholdPercent = parseFloat(props.getProperty('QUOTA_THRESHOLD_PERCENT') || '90') / 100;

      // API Limits
      var privateZillowLimit = parseInt(props.getProperty('PRIVATE_ZILLOW_MONTHLY_LIMIT') || '250');
      var usRealEstateLimit = parseInt(props.getProperty('US_REAL_ESTATE_MONTHLY_LIMIT') || '300');
      var redfinLimit = parseInt(props.getProperty('REDFIN_MONTHLY_LIMIT') || '111');
      var geminiLimit = parseInt(props.getProperty('GEMINI_DAILY_LIMIT') || '1500');

      return {
        // Global threshold percentage
        THRESHOLD_PERCENT: thresholdPercent,

        // Private Zillow (250/month)
        PRIVATE_ZILLOW_MONTHLY_LIMIT: privateZillowLimit,
        PRIVATE_ZILLOW_THRESHOLD: parseInt(props.getProperty('PRIVATE_ZILLOW_THRESHOLD') || Math.floor(privateZillowLimit * thresholdPercent)),

        // US Real Estate (300/month)
        US_REAL_ESTATE_MONTHLY_LIMIT: usRealEstateLimit,
        US_REAL_ESTATE_THRESHOLD: parseInt(props.getProperty('US_REAL_ESTATE_THRESHOLD') || Math.floor(usRealEstateLimit * thresholdPercent)),

        // Redfin (111/month)
        REDFIN_MONTHLY_LIMIT: redfinLimit,
        REDFIN_THRESHOLD: parseInt(props.getProperty('REDFIN_THRESHOLD') || Math.floor(redfinLimit * thresholdPercent)),

        // Gemini (1500/day)
        GEMINI_DAILY_LIMIT: geminiLimit,
        GEMINI_THRESHOLD: parseInt(props.getProperty('GEMINI_THRESHOLD') || Math.floor(geminiLimit * thresholdPercent)),

        // Legacy (for backward compatibility)
        ZILLOW_MONTHLY_LIMIT: parseInt(props.getProperty('ZILLOW_MONTHLY_LIMIT') || '100'),
        ZILLOW_THRESHOLD: parseInt(props.getProperty('ZILLOW_THRESHOLD') || '90')
      };
    } catch (error) {
      PlatformLogger.error('Failed to get quota limits: ' + error);
      return {};
    }
  },

  /**
   * Get current API usage
   * @param {string} apiName - API name (zillow, us_real_estate, gemini)
   * @param {string} periodKey - Period key (e.g., "2025-11" for month)
   * @returns {number} Current usage count
   */
  getUsage: function(apiName, periodKey) {
    try {
      var props = PropertiesService.getScriptProperties();
      var usageKey = 'api_usage_' + apiName + '_' + periodKey;
      return parseInt(props.getProperty(usageKey) || '0');
    } catch (error) {
      PlatformLogger.error('Failed to get usage: ' + error);
      return 0;
    }
  },

  /**
   * Set API usage
   * @param {string} apiName - API name
   * @param {string} periodKey - Period key
   * @param {number} usage - Usage count
   * @returns {boolean} Success status
   */
  setUsage: function(apiName, periodKey, usage) {
    try {
      var props = PropertiesService.getScriptProperties();
      var usageKey = 'api_usage_' + apiName + '_' + periodKey;
      props.setProperty(usageKey, usage.toString());
      return true;
    } catch (error) {
      PlatformLogger.error('Failed to set usage: ' + error);
      return false;
    }
  },

  /**
   * Increment API usage
   * @param {string} apiName - API name
   * @param {string} periodKey - Period key
   * @returns {number} New usage count
   */
  incrementUsage: function(apiName, periodKey) {
    try {
      var currentUsage = this.getUsage(apiName, periodKey);
      var newUsage = currentUsage + 1;
      this.setUsage(apiName, periodKey, newUsage);
      return newUsage;
    } catch (error) {
      PlatformLogger.error('Failed to increment usage: ' + error);
      return 0;
    }
  },

  /**
   * Track successful API call
   * @param {string} apiName - API name
   * @returns {boolean} Success status
   */
  trackSuccess: function(apiName) {
    try {
      var props = PropertiesService.getScriptProperties();
      props.setProperty('last_successful_api', apiName);
      props.setProperty('last_successful_api_time', new Date().toISOString());
      return true;
    } catch (error) {
      PlatformLogger.error('Failed to track success: ' + error);
      return false;
    }
  },

  /**
   * Get last successful API
   * @returns {Object} { api: string, time: string }
   */
  getLastSuccess: function() {
    try {
      var props = PropertiesService.getScriptProperties();
      return {
        api: props.getProperty('last_successful_api') || 'None',
        time: props.getProperty('last_successful_api_time') || 'Never'
      };
    } catch (error) {
      PlatformLogger.error('Failed to get last success: ' + error);
      return { api: 'None', time: 'Never' };
    }
  },

  /**
   * Set primary API for current session (stored in session cache)
   * @param {string} apiName - API name or 'auto'
   * @returns {boolean} Success status
   */
  setPrimaryAPI: function(apiName) {
    var validAPIs = ['auto', 'private_zillow', 'us_real_estate', 'redfin', 'gemini'];

    if (validAPIs.indexOf(apiName) === -1) {
      PlatformLogger.error('Invalid API name: ' + apiName);
      return false;
    }

    try {
      // Store in session cache (expires when sheet closes)
      var cache = CacheService.getUserCache();
      cache.put('primary_api', apiName, 21600); // 6 hours max
      PlatformLogger.info('Primary API set to: ' + apiName);
      return true;
    } catch (error) {
      PlatformLogger.error('Failed to set primary API: ' + error);
      return false;
    }
  },

  /**
   * Get current primary API selection
   * @returns {string} API name or 'auto'
   */
  getPrimaryAPI: function() {
    try {
      var cache = CacheService.getUserCache();
      var primaryAPI = cache.get('primary_api');
      return primaryAPI || 'auto';
    } catch (error) {
      PlatformLogger.error('Failed to get primary API: ' + error);
      return 'auto';
    }
  },

  /**
   * Check if API is blocked due to quota exceeded (90%+)
   * @param {string} apiName - API name to check
   * @returns {boolean} True if blocked
   */
  isAPIBlocked: function(apiName) {
    try {
      var cache = CacheService.getUserCache();
      var usageKey = apiName + '_usage';
      var cached = cache.get(usageKey);

      if (!cached) return false; // No data = not blocked

      var usage = JSON.parse(cached);
      return usage.percentage >= 90; // Block at 90% threshold
    } catch (error) {
      PlatformLogger.error('Failed to check if API blocked: ' + error);
      return false; // Don't block on error
    }
  },

  /**
   * Get list of available (non-blocked) APIs
   * @returns {Array<string>} Array of available API names
   */
  getAvailableAPIs: function() {
    var allAPIs = ['private_zillow', 'us_real_estate', 'redfin', 'gemini'];
    var available = [];

    for (var i = 0; i < allAPIs.length; i++) {
      if (!this.isAPIBlocked(allAPIs[i])) {
        available.push(allAPIs[i]);
      }
    }

    return available;
  },

  /**
   * Get ordered list of APIs to try based on primary selection
   * Automatically filters out blocked APIs
   * @param {string} primaryAPI - Optional override for primary API
   * @returns {Array<string>} Ordered array of API names (excluding blocked ones)
   */
  getAPICallOrder: function(primaryAPI) {
    var primary = primaryAPI || this.getPrimaryAPI();
    var defaultPriority = ['private_zillow', 'us_real_estate', 'redfin', 'gemini'];
    var order = [];

    // If auto mode or invalid, use default priority
    if (primary === 'auto' || defaultPriority.indexOf(primary) === -1) {
      order = defaultPriority.slice(); // Copy
    } else {
      // Put selected API first, then others in default order
      var others = [];
      for (var i = 0; i < defaultPriority.length; i++) {
        if (defaultPriority[i] !== primary) {
          others.push(defaultPriority[i]);
        }
      }
      order = [primary].concat(others);
    }

    // Filter out blocked APIs
    var available = [];
    for (var i = 0; i < order.length; i++) {
      if (!this.isAPIBlocked(order[i])) {
        available.push(order[i]);
      }
    }

    return available;
  },

  /**
   * Get quota reset time information for an API
   * @param {string} apiName - API name
   * @returns {Object} Reset information { period, resets }
   */
  getQuotaResetTime: function(apiName) {
    var resetInfo = {
      'private_zillow': { period: 'monthly', resets: '1st of next month' },
      'us_real_estate': { period: 'monthly', resets: '1st of next month' },
      'redfin': { period: 'monthly', resets: '1st of next month' },
      'gemini': { period: 'daily', resets: 'midnight tonight' }
    };
    return resetInfo[apiName] || { period: 'unknown', resets: 'unknown' };
  }
};

/**
 * ===============================
 * LOGGER ADAPTER
 * ===============================
 */

/**
 * Logger for Google Apps Script
 * Wraps Logger to provide consistent interface
 */
var PlatformLogger = {
  /**
   * Log info message
   * @param {string} message - Message to log
   */
  info: function(message) {
    Logger.log('ℹ️ ' + message);
  },

  /**
   * Log success message
   * @param {string} message - Message to log
   */
  success: function(message) {
    Logger.log('✅ ' + message);
  },

  /**
   * Log warning message
   * @param {string} message - Message to log
   */
  warn: function(message) {
    Logger.log('⚠️ ' + message);
  },

  /**
   * Log error message
   * @param {string} message - Message to log
   */
  error: function(message) {
    Logger.log('❌ ' + message);
  },

  /**
   * Log debug message
   * @param {string} message - Message to log
   */
  debug: function(message) {
    Logger.log('🔍 ' + message);
  },

  /**
   * Log API call
   * @param {string} apiName - API name
   * @param {string} status - Status (SUCCESS, FAILED, RETRY)
   */
  logAPI: function(apiName, status) {
    var emoji = status === 'SUCCESS' ? '✅' : status === 'FAILED' ? '❌' : '🔄';
    Logger.log(emoji + ' ' + apiName + ' - ' + status);
  },

  /**
   * Log quota status
   * @param {string} apiName - API name
   * @param {number} usage - Current usage
   * @param {number} limit - Quota limit
   * @param {boolean} available - Availability status
   */
  logQuota: function(apiName, usage, limit, available) {
    var status = available ? 'AVAILABLE' : 'EXCEEDED';
    var emoji = available ? '✅' : '⚠️';
    Logger.log('📊 ' + apiName + ' quota: ' + usage + '/' + limit + ' - ' + emoji + ' ' + status);
  },

  /**
   * Log cache operation
   * @param {string} operation - Operation (HIT, MISS, SET, CLEAR)
   * @param {string} key - Cache key
   */
  logCache: function(operation, key) {
    var emoji = operation === 'HIT' ? '✅' : operation === 'MISS' ? '📭' : operation === 'SET' ? '💾' : '🗑️';
    Logger.log(emoji + ' Cache ' + operation + ': ' + key);
  }
};

/**
 * ===============================
 * ADAPTER UTILITIES
 * ===============================
 */

/**
 * Parse JSON safely
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed object or default value
 */
function safeJSONParse(jsonString, defaultValue) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    PlatformLogger.error('JSON parse error: ' + error);
    return defaultValue || null;
  }
}

/**
 * Stringify JSON safely
 * @param {*} data - Data to stringify
 * @param {string} defaultValue - Default value if stringification fails
 * @returns {string} JSON string or default value
 */
function safeJSONStringify(data, defaultValue) {
  try {
    return JSON.stringify(data);
  } catch (error) {
    PlatformLogger.error('JSON stringify error: ' + error);
    return defaultValue || '{}';
  }
}

/**
 * Get platform information
 * @returns {Object} Platform information
 */
function getPlatformInfo() {
  return {
    platform: 'google-apps-script',
    version: '1.0.0',
    capabilities: {
      http: true,
      cache: true,
      quota: true,
      storage: true
    }
  };
}
