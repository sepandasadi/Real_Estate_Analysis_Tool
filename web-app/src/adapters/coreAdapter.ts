/**
 * ===============================
 * WEB APP PLATFORM ADAPTER
 * ===============================
 *
 * This adapter bridges the shared-core functions with Web App platform APIs.
 * It provides platform-specific implementations for:
 * - HTTP Client (fetch API)
 * - Cache Manager (localStorage/IndexedDB)
 * - Quota Manager (localStorage)
 * - Logger (console)
 *
 * @module web-app/src/adapters/coreAdapter
 */

/**
 * ===============================
 * TYPE DEFINITIONS
 * ===============================
 */

interface HttpResponse {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
  success: boolean;
  error?: string;
}

interface HttpOptions {
  headers?: Record<string, string>;
  contentType?: string;
  payload?: string;
}

interface APIKeys {
  RAPIDAPI_KEY?: string;
  GEMINI_API_KEY?: string;
  BRIDGE_API_KEY?: string;
  BRIDGE_BASE_URL?: string;
}

interface QuotaLimits {
  ZILLOW_MONTHLY_LIMIT: number;
  ZILLOW_THRESHOLD: number;
  US_REAL_ESTATE_MONTHLY_LIMIT: number;
  US_REAL_ESTATE_THRESHOLD: number;
  GEMINI_DAILY_LIMIT: number;
  GEMINI_THRESHOLD: number;
}

interface LastSuccess {
  api: string;
  time: string;
}

interface PlatformInfo {
  platform: string;
  version: string;
  capabilities: {
    http: boolean;
    cache: boolean;
    quota: boolean;
    storage: boolean;
  };
}

/**
 * ===============================
 * HTTP CLIENT ADAPTER
 * ===============================
 */

/**
 * HTTP Client for Web App
 * Wraps fetch API to provide consistent interface
 */
export const HttpClient = {
  /**
   * Make HTTP GET request
   * @param url - Request URL
   * @param options - Request options
   * @returns Response object
   */
  async get(url: string, options: HttpOptions = {}): Promise<HttpResponse> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: options.headers || {},
      });

      const body = await response.text();

      return {
        statusCode: response.status,
        body,
        headers: Object.fromEntries(response.headers.entries()),
        success: response.ok,
      };
    } catch (error) {
      return {
        statusCode: 0,
        body: '',
        headers: {},
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  /**
   * Make HTTP POST request
   * @param url - Request URL
   * @param options - Request options
   * @returns Response object
   */
  async post(url: string, options: HttpOptions = {}): Promise<HttpResponse> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': options.contentType || 'application/json',
          ...options.headers,
        },
        body: options.payload,
      });

      const body = await response.text();

      return {
        statusCode: response.status,
        body,
        headers: Object.fromEntries(response.headers.entries()),
        success: response.ok,
      };
    } catch (error) {
      return {
        statusCode: 0,
        body: '',
        headers: {},
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  /**
   * Retry request with exponential backoff
   * @param requestFn - Function that makes the request
   * @param maxRetries - Maximum number of retries
   * @param initialDelay - Initial delay in milliseconds
   * @returns Response object
   */
  async retryWithBackoff(
    requestFn: () => Promise<HttpResponse>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<HttpResponse> {
    let lastError: string = '';

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await requestFn();

        // Return if successful
        if (response.success) {
          return response;
        }

        // Store error for last attempt
        lastError = response.error || `Request failed with status ${response.statusCode}`;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
      }

      // Wait before retry (except on last attempt)
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // All retries failed
    return {
      statusCode: 0,
      body: '',
      headers: {},
      success: false,
      error: `Failed after ${maxRetries} attempts: ${lastError}`,
    };
  },
};

/**
 * ===============================
 * CACHE MANAGER ADAPTER
 * ===============================
 */

/**
 * Cache Manager for Web App
 * Uses localStorage for caching (can be upgraded to IndexedDB for larger data)
 */
export const CacheManager = {
  /**
   * Get cached data
   * @param key - Cache key
   * @returns Cached data or null if not found/expired
   */
  get(key: string): any {
    try {
      const cached = localStorage.getItem(key);

      if (!cached) {
        return null;
      }

      // Parse cached data
      const data = JSON.parse(cached);
      return data;
    } catch (error) {
      PlatformLogger.error(`Cache get error: ${error}`);
      return null;
    }
  },

  /**
   * Set cached data
   * @param key - Cache key
   * @param data - Data to cache
   * @param expirationInSeconds - Expiration time in seconds (not enforced by localStorage)
   * @returns Success status
   */
  set(key: string, data: any, expirationInSeconds?: number): boolean {
    try {
      const serialized = JSON.stringify(data);

      // localStorage has a ~5-10MB limit (varies by browser)
      // Warn if data is large
      if (serialized.length > 1000000) {
        PlatformLogger.warn(`Cache data large (${serialized.length} bytes), may hit storage limits`);
      }

      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      PlatformLogger.error(`Cache set error: ${error}`);
      return false;
    }
  },

  /**
   * Remove cached data
   * @param key - Cache key
   * @returns Success status
   */
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      PlatformLogger.error(`Cache remove error: ${error}`);
      return false;
    }
  },

  /**
   * Clear all cache entries matching prefix
   * @param prefix - Key prefix to match
   * @returns Success status
   */
  clearByPrefix(prefix: string): boolean {
    try {
      const keysToRemove: string[] = [];

      // Find all keys with matching prefix
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keysToRemove.push(key);
        }
      }

      // Remove matching keys
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      PlatformLogger.info(`Cleared ${keysToRemove.length} cache entries with prefix: ${prefix}`);
      return true;
    } catch (error) {
      PlatformLogger.error(`Cache clear error: ${error}`);
      return false;
    }
  },

  /**
   * Check if cache entry exists
   * @param key - Cache key
   * @returns True if exists
   */
  has(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      return false;
    }
  },
};

/**
 * ===============================
 * QUOTA MANAGER ADAPTER
 * ===============================
 */

/**
 * Quota Manager for Web App
 * Uses localStorage for quota tracking
 */
export const QuotaManager = {
  /**
   * Get API keys from localStorage or environment variables
   * @returns API keys object
   */
  getAPIKeys(): APIKeys {
    try {
      // Try to get from localStorage first
      const stored = localStorage.getItem('api_keys');
      if (stored) {
        return JSON.parse(stored);
      }

      // Fallback to environment variables (if available)
      return {
        RAPIDAPI_KEY: import.meta.env.VITE_RAPIDAPI_KEY,
        GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
        BRIDGE_API_KEY: import.meta.env.VITE_BRIDGE_API_KEY,
        BRIDGE_BASE_URL: import.meta.env.VITE_BRIDGE_BASE_URL,
      };
    } catch (error) {
      PlatformLogger.error(`Failed to get API keys: ${error}`);
      return {};
    }
  },

  /**
   * Set API keys in localStorage
   * @param keys - API keys object
   * @returns Success status
   */
  setAPIKeys(keys: APIKeys): boolean {
    try {
      localStorage.setItem('api_keys', JSON.stringify(keys));
      return true;
    } catch (error) {
      PlatformLogger.error(`Failed to set API keys: ${error}`);
      return false;
    }
  },

  /**
   * Get API quota limits from localStorage
   * @returns Quota limits object
   */
  getQuotaLimits(): QuotaLimits {
    try {
      const stored = localStorage.getItem('quota_limits');
      if (stored) {
        return JSON.parse(stored);
      }

      // Default limits
      return {
        ZILLOW_MONTHLY_LIMIT: 100,
        ZILLOW_THRESHOLD: 90,
        US_REAL_ESTATE_MONTHLY_LIMIT: 300,
        US_REAL_ESTATE_THRESHOLD: 270,
        GEMINI_DAILY_LIMIT: 1500,
        GEMINI_THRESHOLD: 1400,
      };
    } catch (error) {
      PlatformLogger.error(`Failed to get quota limits: ${error}`);
      return {
        ZILLOW_MONTHLY_LIMIT: 100,
        ZILLOW_THRESHOLD: 90,
        US_REAL_ESTATE_MONTHLY_LIMIT: 300,
        US_REAL_ESTATE_THRESHOLD: 270,
        GEMINI_DAILY_LIMIT: 1500,
        GEMINI_THRESHOLD: 1400,
      };
    }
  },

  /**
   * Set API quota limits in localStorage
   * @param limits - Quota limits object
   * @returns Success status
   */
  setQuotaLimits(limits: QuotaLimits): boolean {
    try {
      localStorage.setItem('quota_limits', JSON.stringify(limits));
      return true;
    } catch (error) {
      PlatformLogger.error(`Failed to set quota limits: ${error}`);
      return false;
    }
  },

  /**
   * Get current API usage
   * @param apiName - API name (zillow, us_real_estate, gemini)
   * @param periodKey - Period key (e.g., "2025-11" for month)
   * @returns Current usage count
   */
  getUsage(apiName: string, periodKey: string): number {
    try {
      const usageKey = `api_usage_${apiName}_${periodKey}`;
      const usage = localStorage.getItem(usageKey);
      return parseInt(usage || '0', 10);
    } catch (error) {
      PlatformLogger.error(`Failed to get usage: ${error}`);
      return 0;
    }
  },

  /**
   * Set API usage
   * @param apiName - API name
   * @param periodKey - Period key
   * @param usage - Usage count
   * @returns Success status
   */
  setUsage(apiName: string, periodKey: string, usage: number): boolean {
    try {
      const usageKey = `api_usage_${apiName}_${periodKey}`;
      localStorage.setItem(usageKey, usage.toString());
      return true;
    } catch (error) {
      PlatformLogger.error(`Failed to set usage: ${error}`);
      return false;
    }
  },

  /**
   * Increment API usage
   * @param apiName - API name
   * @param periodKey - Period key
   * @returns New usage count
   */
  incrementUsage(apiName: string, periodKey: string): number {
    try {
      const currentUsage = this.getUsage(apiName, periodKey);
      const newUsage = currentUsage + 1;
      this.setUsage(apiName, periodKey, newUsage);
      return newUsage;
    } catch (error) {
      PlatformLogger.error(`Failed to increment usage: ${error}`);
      return 0;
    }
  },

  /**
   * Track successful API call
   * @param apiName - API name
   * @returns Success status
   */
  trackSuccess(apiName: string): boolean {
    try {
      const success = {
        api: apiName,
        time: new Date().toISOString(),
      };
      localStorage.setItem('last_successful_api', JSON.stringify(success));
      return true;
    } catch (error) {
      PlatformLogger.error(`Failed to track success: ${error}`);
      return false;
    }
  },

  /**
   * Get last successful API
   * @returns Last success object
   */
  getLastSuccess(): LastSuccess {
    try {
      const stored = localStorage.getItem('last_successful_api');
      if (stored) {
        return JSON.parse(stored);
      }
      return { api: 'None', time: 'Never' };
    } catch (error) {
      PlatformLogger.error(`Failed to get last success: ${error}`);
      return { api: 'None', time: 'Never' };
    }
  },
};

/**
 * ===============================
 * LOGGER ADAPTER
 * ===============================
 */

/**
 * Logger for Web App
 * Wraps console to provide consistent interface
 */
export const PlatformLogger = {
  /**
   * Log info message
   * @param message - Message to log
   */
  info(message: string): void {
    console.log(`ℹ️ ${message}`);
  },

  /**
   * Log success message
   * @param message - Message to log
   */
  success(message: string): void {
    console.log(`✅ ${message}`);
  },

  /**
   * Log warning message
   * @param message - Message to log
   */
  warn(message: string): void {
    console.warn(`⚠️ ${message}`);
  },

  /**
   * Log error message
   * @param message - Message to log
   */
  error(message: string): void {
    console.error(`❌ ${message}`);
  },

  /**
   * Log debug message
   * @param message - Message to log
   */
  debug(message: string): void {
    console.debug(`🔍 ${message}`);
  },

  /**
   * Log API call
   * @param apiName - API name
   * @param status - Status (SUCCESS, FAILED, RETRY)
   */
  logAPI(apiName: string, status: string): void {
    const emoji = status === 'SUCCESS' ? '✅' : status === 'FAILED' ? '❌' : '🔄';
    console.log(`${emoji} ${apiName} - ${status}`);
  },

  /**
   * Log quota status
   * @param apiName - API name
   * @param usage - Current usage
   * @param limit - Quota limit
   * @param available - Availability status
   */
  logQuota(apiName: string, usage: number, limit: number, available: boolean): void {
    const status = available ? 'AVAILABLE' : 'EXCEEDED';
    const emoji = available ? '✅' : '⚠️';
    console.log(`📊 ${apiName} quota: ${usage}/${limit} - ${emoji} ${status}`);
  },

  /**
   * Log cache operation
   * @param operation - Operation (HIT, MISS, SET, CLEAR)
   * @param key - Cache key
   */
  logCache(operation: string, key: string): void {
    const emoji =
      operation === 'HIT' ? '✅' : operation === 'MISS' ? '📭' : operation === 'SET' ? '💾' : '🗑️';
    console.log(`${emoji} Cache ${operation}: ${key}`);
  },
};

/**
 * ===============================
 * ADAPTER UTILITIES
 * ===============================
 */

/**
 * Parse JSON safely
 * @param jsonString - JSON string to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed object or default value
 */
export function safeJSONParse<T = any>(jsonString: string, defaultValue?: T): T | null {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    PlatformLogger.error(`JSON parse error: ${error}`);
    return defaultValue !== undefined ? defaultValue : null;
  }
}

/**
 * Stringify JSON safely
 * @param data - Data to stringify
 * @param defaultValue - Default value if stringification fails
 * @returns JSON string or default value
 */
export function safeJSONStringify(data: any, defaultValue: string = '{}'): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    PlatformLogger.error(`JSON stringify error: ${error}`);
    return defaultValue;
  }
}

/**
 * Get platform information
 * @returns Platform information
 */
export function getPlatformInfo(): PlatformInfo {
  return {
    platform: 'web-app',
    version: '1.0.0',
    capabilities: {
      http: true,
      cache: true,
      quota: true,
      storage: true,
    },
  };
}
