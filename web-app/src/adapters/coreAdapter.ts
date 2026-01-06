/**
 * ===============================
 * WEB APP PLATFORM ADAPTER
 * ===============================
 *
 * This adapter bridges the shared-core functions with Web App platform APIs.
 * It provides platform-specific implementations for:
 * - HTTP Client (fetch API with header-based usage tracking)
 * - Cache Manager (localStorage/IndexedDB)
 * - Quota Manager (header-based tracking)
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
  usage?: RapidAPIUsage;
}

interface HttpOptions {
  headers?: Record<string, string>;
  contentType?: string;
  payload?: string;
}

interface APIKeys {
  RAPIDAPI_KEY?: string;
  GEMINI_API_KEY?: string;
}

interface RapidAPIUsage {
  limit: number;
  remaining: number;
  used: number;
  percentage: number;
  timestamp: string;
}

interface APIUsageCache {
  private_zillow?: RapidAPIUsage;
  us_real_estate?: RapidAPIUsage;
  redfin?: RapidAPIUsage;
  gemini?: RapidAPIUsage;
}

interface QuotaLimits {
  PRIVATE_ZILLOW_MONTHLY_LIMIT: number;
  US_REAL_ESTATE_MONTHLY_LIMIT: number;
  REDFIN_MONTHLY_LIMIT: number;
  GEMINI_DAILY_LIMIT: number;
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
 * API BASE URLS
 * ===============================
 */

const API_BASE_URLS = {
  PRIVATE_ZILLOW: 'https://private-zillow.p.rapidapi.com',
  REDFIN: 'https://redfin-base-us.p.rapidapi.com',
  US_REAL_ESTATE: 'https://us-real-estate.p.rapidapi.com',
  GEMINI: 'https://generativelanguage.googleapis.com',
};

/**
 * ===============================
 * HTTP CLIENT ADAPTER
 * ===============================
 */

/**
 * HTTP Client for Web App
 * Wraps fetch API with header-based usage tracking
 */
export const HttpClient = {
  /**
   * Extract usage data from RapidAPI response headers
   * @param headers - Response headers
   * @returns Usage data or null
   */
  extractUsageFromHeaders(headers: Record<string, string>): RapidAPIUsage | null {
    // RapidAPI may use different header formats, so we check for multiple variations
    const headerVariations = {
      limit: [
        'x-ratelimit-requests-limit',
        'x-rapidapi-requests-limit',
        'x-ratelimit-limit',
        'ratelimit-limit'
      ],
      remaining: [
        'x-ratelimit-requests-remaining',
        'x-rapidapi-requests-remaining',
        'x-ratelimit-remaining',
        'ratelimit-remaining'
      ]
    };

    // Find the limit header
    let limitKey: string | undefined;
    for (const variant of headerVariations.limit) {
      limitKey = Object.keys(headers).find((k) => k.toLowerCase() === variant);
      if (limitKey) break;
    }

    // Find the remaining header
    let remainingKey: string | undefined;
    for (const variant of headerVariations.remaining) {
      remainingKey = Object.keys(headers).find((k) => k.toLowerCase() === variant);
      if (remainingKey) break;
    }

    // Log what headers we found (for debugging)
    console.log('[HttpClient] Response headers:', Object.keys(headers));

    if (!limitKey || !remainingKey) {
      console.log('[HttpClient] Rate limit headers not found. Expected one of:', headerVariations);
      return null;
    }

    const limit = parseInt(headers[limitKey]);
    const remaining = parseInt(headers[remainingKey]);

    if (isNaN(limit) || isNaN(remaining)) {
      console.log('[HttpClient] Invalid rate limit values:', { limit: headers[limitKey], remaining: headers[remainingKey] });
      return null;
    }

    console.log('[HttpClient] Extracted usage:', { limit, remaining, used: limit - remaining });

    return {
      limit,
      remaining,
      used: limit - remaining,
      percentage: ((limit - remaining) / limit) * 100,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Get API name from URL
   * @param url - Request URL
   * @returns API name or null
   */
  getAPINameFromURL(url: string): string | null {
    if (url.includes('private-zillow')) return 'private_zillow';
    if (url.includes('redfin-base-us')) return 'redfin';
    if (url.includes('us-real-estate')) return 'us_real_estate';
    if (url.includes('generativelanguage')) return 'gemini';
    return null;
  },

  /**
   * Get quota warning message
   * @param apiName - API name
   * @param usage - Usage data
   * @returns Warning message or null
   */
  getQuotaWarning(apiName: string, usage: RapidAPIUsage): string | null {
    if (usage.percentage >= 95) {
      return `CRITICAL: ${apiName} at ${usage.percentage.toFixed(1)}% (${usage.remaining}/${usage.limit} remaining)`;
    } else if (usage.percentage >= 90) {
      return `WARNING: ${apiName} at ${usage.percentage.toFixed(1)}% (${usage.remaining}/${usage.limit} remaining)`;
    }
    return null;
  },

  /**
   * Make HTTP GET request
   * @param url - Request URL
   * @param options - Request options
   * @returns Response object with usage data
   */
  async get(url: string, options: HttpOptions = {}): Promise<HttpResponse> {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: options.headers || {},
      });

      const body = await response.text();
      const headers = Object.fromEntries(response.headers.entries());

      // Extract and cache usage data from RapidAPI headers
      const usage = this.extractUsageFromHeaders(headers);
      if (usage) {
        const apiName = this.getAPINameFromURL(url);
        if (apiName) {
          CacheManager.set(`${apiName}_usage`, usage, 3600); // 1 hour cache

          // Log warnings if approaching limits
          const warning = this.getQuotaWarning(apiName, usage);
          if (warning) {
            PlatformLogger.warn(warning);
          }
        }
      }

      return {
        statusCode: response.status,
        body,
        headers,
        success: response.ok,
        usage: usage ?? undefined,
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
   * @returns Response object with usage data
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
      const headers = Object.fromEntries(response.headers.entries());

      // Extract and cache usage data from RapidAPI headers
      const usage = this.extractUsageFromHeaders(headers);
      if (usage) {
        const apiName = this.getAPINameFromURL(url);
        if (apiName) {
          CacheManager.set(`${apiName}_usage`, usage, 3600); // 1 hour cache

          // Log warnings if approaching limits
          const warning = this.getQuotaWarning(apiName, usage);
          if (warning) {
            PlatformLogger.warn(warning);
          }
        }
      }

      return {
        statusCode: response.status,
        body,
        headers,
        success: response.ok,
        usage: usage ?? undefined,
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
  set(key: string, data: any, _expirationInSeconds?: number): boolean {
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
 * Uses header-based usage tracking from RapidAPI
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
   * Get API quota reference limits
   * @returns Quota limits object
   */
  getQuotaLimits(): QuotaLimits {
    return {
      PRIVATE_ZILLOW_MONTHLY_LIMIT: 250,
      US_REAL_ESTATE_MONTHLY_LIMIT: 300,
      REDFIN_MONTHLY_LIMIT: 111,
      GEMINI_DAILY_LIMIT: 1500,
    };
  },

  /**
   * Get cached usage data for an API (from response headers)
   * @param apiName - API name
   * @returns Usage data or null
   */
  getUsage(apiName: string): RapidAPIUsage | null {
    return CacheManager.get(`${apiName}_usage`);
  },

  /**
   * Check if API has quota remaining (based on cached headers)
   * @param apiName - API name
   * @param threshold - Percentage threshold (default: 90)
   * @returns True if under threshold
   */
  hasQuotaRemaining(apiName: string, threshold: number = 90): boolean {
    const usage = this.getUsage(apiName);
    if (!usage) return true; // No cached data, allow call

    return usage.percentage < threshold;
  },

  /**
   * Get all API usage statistics (from cached headers)
   * @returns Usage data for all APIs
   */
  getAllUsage(): APIUsageCache {
    return {
      private_zillow: this.getUsage('private_zillow') ?? undefined,
      us_real_estate: this.getUsage('us_real_estate') ?? undefined,
      redfin: this.getUsage('redfin') ?? undefined,
      gemini: this.getUsage('gemini') ?? undefined,
    };
  },

  /**
   * Select best API based on priority and available quota
   * @returns API name
   */
  selectBestAPI(): string {
    const priority = ['private_zillow', 'us_real_estate', 'redfin', 'gemini'];

    for (const apiName of priority) {
      if (this.hasQuotaRemaining(apiName)) {
        return apiName;
      }
    }

    // All exhausted, return gemini as last resort
    return 'gemini';
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
    version: '2.0.0',
    capabilities: {
      http: true,
      cache: true,
      quota: true,
      storage: true,
    },
  };
}

/**
 * Get API base URLs
 * @returns API base URLs
 */
export function getAPIBaseURLs() {
  return API_BASE_URLS;
}
