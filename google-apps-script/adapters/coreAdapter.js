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

    var limit = headers['X-RapidAPI-Requests-Limit'] || headers['x-rapidapi-requests-limit'];
    var remaining = headers['X-RapidAPI-Requests-Remaining'] || headers['x-rapidapi-requests-remaining'];

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
    // #region agent log
    UrlFetchApp.fetch('http://127.0.0.1:7244/ingest/bde32f66-859e-484d-8409-cf1887350e6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'coreAdapter.js:73',message:'HttpClient.get called',data:{url:url,hasOptions:!!options},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,E'})}).catch(function(){});
    // #endregion

    options = options || {};

    var fetchOptions = {
      method: 'get',
      headers: options.headers || {},
      muteHttpExceptions: true
    };

    try {
      var response = UrlFetchApp.fetch(url, fetchOptions);
      var headers = response.getHeaders();

      // #region agent log
      var headerKeys = Object.keys(headers);
      UrlFetchApp.fetch('http://127.0.0.1:7244/ingest/bde32f66-859e-484d-8409-cf1887350e6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'coreAdapter.js:87',message:'API response received',data:{url:url,statusCode:response.getResponseCode(),headerKeys:headerKeys,hasRapidAPILimitHeader:!!(headers['X-RapidAPI-Requests-Limit']||headers['x-rapidapi-requests-limit']),hasRapidAPIRemainingHeader:!!(headers['X-RapidAPI-Requests-Remaining']||headers['x-rapidapi-requests-remaining'])},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,D'})}).catch(function(){});
      // #endregion

      // Extract and cache usage data from RapidAPI headers
      var usage = this.extractUsageFromHeaders(headers);

      // #region agent log
      UrlFetchApp.fetch('http://127.0.0.1:7244/ingest/bde32f66-859e-484d-8409-cf1887350e6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'coreAdapter.js:91',message:'Usage extraction result',data:{url:url,extractedUsage:usage,hasUsage:!!usage},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,D'})}).catch(function(){});
      // #endregion

      if (usage) {
        var apiName = this.getAPINameFromURL(url);

        // #region agent log
        UrlFetchApp.fetch('http://127.0.0.1:7244/ingest/bde32f66-859e-484d-8409-cf1887350e6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'coreAdapter.js:95',message:'Attempting to cache usage',data:{url:url,apiName:apiName,usage:usage},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(function(){});
        // #endregion

        if (apiName) {
          var cacheKey = apiName + '_usage';
          var cacheValue = JSON.stringify(usage);
          CacheService.getScriptCache().put(cacheKey, cacheValue, 3600); // 1 hour

          // #region agent log
          UrlFetchApp.fetch('http://127.0.0.1:7244/ingest/bde32f66-859e-484d-8409-cf1887350e6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'coreAdapter.js:102',message:'Usage cached',data:{apiName:apiName,cacheKey:cacheKey,usage:usage},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(function(){});
          // #endregion

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
      // #region agent log
      UrlFetchApp.fetch('http://127.0.0.1:7244/ingest/bde32f66-859e-484d-8409-cf1887350e6d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'coreAdapter.js:119',message:'HttpClient.get error',data:{url:url,error:error.toString()},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(function(){});
      // #endregion

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
      return {
        ZILLOW_MONTHLY_LIMIT: parseInt(props.getProperty('ZILLOW_MONTHLY_LIMIT') || '100'),
        ZILLOW_THRESHOLD: parseInt(props.getProperty('ZILLOW_THRESHOLD') || '90'),
        US_REAL_ESTATE_MONTHLY_LIMIT: parseInt(props.getProperty('US_REAL_ESTATE_MONTHLY_LIMIT') || '300'),
        US_REAL_ESTATE_THRESHOLD: parseInt(props.getProperty('US_REAL_ESTATE_THRESHOLD') || '270'),
        GEMINI_DAILY_LIMIT: parseInt(props.getProperty('GEMINI_DAILY_LIMIT') || '1500'),
        GEMINI_THRESHOLD: parseInt(props.getProperty('GEMINI_THRESHOLD') || '1400')
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
