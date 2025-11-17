/**
 * ===============================
 * CACHING UTILITIES
 * ===============================
 *
 * Platform-agnostic caching logic
 * Actual cache storage is handled by platform adapters
 *
 * @module shared-core/utils/cache
 */

/**
 * Cache duration constants (in milliseconds)
 * Phase 2.5: Differentiated cache durations
 */
const CACHE_DURATIONS = {
  // Property-specific data (7 days)
  PROPERTY_DETAILS: 7 * 24 * 60 * 60 * 1000,
  COMPS: 7 * 24 * 60 * 60 * 1000,
  ESTIMATES: 7 * 24 * 60 * 60 * 1000,

  // Location data (30 days - rarely changes)
  SCHOOLS: 30 * 24 * 60 * 60 * 1000,
  WALK_SCORE: 30 * 24 * 60 * 60 * 1000,
  NOISE_SCORE: 30 * 24 * 60 * 60 * 1000,

  // Market data (1 day - changes frequently)
  MARKET_RATES: 24 * 60 * 60 * 1000,
  RENTAL_RATES: 7 * 24 * 60 * 60 * 1000
};

/**
 * Generate cache key for property-specific data
 * @param {string} address - Property address
 * @param {string} city - City
 * @param {string} state - State
 * @param {string} zip - Zip code
 * @returns {string} Cache key
 */
function generatePropertyCacheKey(address, city, state, zip) {
  // Normalize inputs to create consistent keys
  const normalized = [
    address.toLowerCase().trim(),
    city.toLowerCase().trim(),
    state.toLowerCase().trim(),
    zip.trim()
  ].join('_');

  return `property_${normalized}`;
}

/**
 * Generate cache key for zip code-level data
 * @param {string} zip - Zip code
 * @param {string} dataType - Type of data (schools, walk_score, noise_score)
 * @returns {string} Cache key
 */
function generateZipCodeCacheKey(zip, dataType) {
  return `zipcode_${zip}_${dataType}`;
}

/**
 * Generate cache key for area-level data
 * @param {string} city - City
 * @param {string} state - State
 * @param {string} dataType - Type of data (market_trends, rental_trends)
 * @returns {string} Cache key
 */
function generateAreaCacheKey(city, state, dataType) {
  const normalized = [
    city.toLowerCase().trim(),
    state.toLowerCase().trim()
  ].join('_');

  return `area_${normalized}_${dataType}`;
}

/**
 * Generate cache key for comps
 * @param {string} address - Property address
 * @param {string} city - City
 * @param {string} state - State
 * @param {string} zip - Zip code
 * @returns {string} Cache key
 */
function generateCompsKey(address, city, state, zip) {
  const normalized = [
    address.toLowerCase().trim(),
    city.toLowerCase().trim(),
    state.toLowerCase().trim(),
    zip.trim()
  ].join('_');

  return `comps_${normalized}`;
}

/**
 * Check if cached data is still valid
 * @param {number} timestamp - Cache timestamp (milliseconds)
 * @param {number} maxAge - Maximum age in milliseconds
 * @returns {boolean} True if cache is still valid
 */
function isCacheValid(timestamp, maxAge) {
  if (!timestamp || !maxAge) {
    return false;
  }

  const now = new Date().getTime();
  const age = now - timestamp;

  return age <= maxAge;
}

/**
 * Get cache duration for data type
 * @param {string} dataType - Data type (PROPERTY_DETAILS, COMPS, SCHOOLS, etc.)
 * @returns {number} Cache duration in milliseconds
 */
function getCacheDuration(dataType) {
  return CACHE_DURATIONS[dataType] || CACHE_DURATIONS.PROPERTY_DETAILS;
}

/**
 * Create cache entry with metadata
 * @param {*} data - Data to cache
 * @param {string} source - Data source
 * @returns {Object} Cache entry with metadata
 */
function createCacheEntry(data, source) {
  return {
    data: data,
    timestamp: new Date().getTime(),
    source: source || 'unknown',
    version: '1.0'
  };
}

/**
 * Validate cache entry structure
 * @param {Object} cacheEntry - Cache entry to validate
 * @returns {boolean} True if valid
 */
function isValidCacheEntry(cacheEntry) {
  if (!cacheEntry || typeof cacheEntry !== 'object') {
    return false;
  }

  return (
    cacheEntry.data !== undefined &&
    typeof cacheEntry.timestamp === 'number' &&
    cacheEntry.timestamp > 0
  );
}

/**
 * Extract data from cache entry
 * @param {Object} cacheEntry - Cache entry
 * @param {number} maxAge - Maximum age in milliseconds
 * @returns {*} Cached data or null if invalid/expired
 */
function extractCacheData(cacheEntry, maxAge) {
  // Validate entry structure
  if (!isValidCacheEntry(cacheEntry)) {
    return null;
  }

  // Check if expired
  if (!isCacheValid(cacheEntry.timestamp, maxAge)) {
    return null;
  }

  return cacheEntry.data;
}

/**
 * Calculate cache age in minutes
 * @param {number} timestamp - Cache timestamp
 * @returns {number} Age in minutes
 */
function getCacheAgeMinutes(timestamp) {
  if (!timestamp) {
    return 0;
  }

  const now = new Date().getTime();
  const ageMs = now - timestamp;
  return Math.round(ageMs / (1000 * 60));
}

/**
 * Calculate cache age in hours
 * @param {number} timestamp - Cache timestamp
 * @returns {number} Age in hours (with 1 decimal)
 */
function getCacheAgeHours(timestamp) {
  if (!timestamp) {
    return 0;
  }

  const minutes = getCacheAgeMinutes(timestamp);
  return Math.round(minutes / 60 * 10) / 10;
}

/**
 * Get cache statistics
 * @param {Object} cacheEntry - Cache entry
 * @returns {Object} Cache statistics
 */
function getCacheStats(cacheEntry) {
  if (!isValidCacheEntry(cacheEntry)) {
    return {
      exists: false,
      valid: false
    };
  }

  const ageMinutes = getCacheAgeMinutes(cacheEntry.timestamp);
  const ageHours = getCacheAgeHours(cacheEntry.timestamp);

  return {
    exists: true,
    valid: true,
    ageMinutes: ageMinutes,
    ageHours: ageHours,
    timestamp: new Date(cacheEntry.timestamp).toLocaleString(),
    source: cacheEntry.source || 'unknown',
    version: cacheEntry.version || 'unknown'
  };
}

/**
 * Determine cache freshness status
 * @param {number} timestamp - Cache timestamp
 * @param {number} maxAge - Maximum age in milliseconds
 * @returns {string} Status: 'fresh', 'stale', or 'expired'
 */
function getCacheFreshness(timestamp, maxAge) {
  if (!timestamp || !maxAge) {
    return 'expired';
  }

  const now = new Date().getTime();
  const age = now - timestamp;

  if (age <= maxAge * 0.5) {
    return 'fresh'; // Less than 50% of max age
  } else if (age <= maxAge) {
    return 'stale'; // Between 50% and 100% of max age
  } else {
    return 'expired'; // Older than max age
  }
}

/**
 * Should refresh cache based on freshness
 * @param {number} timestamp - Cache timestamp
 * @param {number} maxAge - Maximum age in milliseconds
 * @param {boolean} forceRefresh - Force refresh regardless of age
 * @returns {boolean} True if should refresh
 */
function shouldRefreshCache(timestamp, forceRefresh, maxAge) {
  // Always refresh if forced
  if (forceRefresh) {
    return true;
  }

  // Refresh if expired
  if (!isCacheValid(timestamp, maxAge)) {
    return true;
  }

  // Don't refresh if still fresh
  return false;
}

/**
 * Validate zip code match for cache
 * Phase 2.5: Strict zip code matching
 * @param {string} requestedZip - Requested zip code
 * @param {string} cachedZip - Cached zip code
 * @returns {boolean} True if zip codes match exactly
 */
function validateZipCodeMatch(requestedZip, cachedZip) {
  if (!requestedZip || !cachedZip) {
    return false;
  }

  // Exact match required - no cross-zip data
  return requestedZip.trim() === cachedZip.trim();
}

/**
 * Filter cached comps by zip code
 * Phase 2.5: Only return comps from same zip code
 * @param {Array} comps - Array of comps
 * @param {string} targetZip - Target zip code
 * @returns {Array} Filtered comps
 */
function filterCompsByZipCode(comps, targetZip) {
  if (!comps || !Array.isArray(comps) || !targetZip) {
    return [];
  }

  return comps.filter(function(comp) {
    return comp.zip && comp.zip.trim() === targetZip.trim();
  });
}
