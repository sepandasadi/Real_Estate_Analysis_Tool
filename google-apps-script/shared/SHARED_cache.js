/**
 * ===============================
 * CACHING UTILITIES
 * ===============================
 *
 * This module provides caching functionality for API responses.
 * Uses platform adapters for cross-platform compatibility.
 *
 * Benefits:
 * - Reduces API calls and costs
 * - Improves performance
 * - Respects rate limits
 * - 24-hour cache expiration
 *
 * MIGRATED: Phase 0.6 - Now uses CacheManager adapter
 */

/**
 * Generate a cache key for comps data
 *
 * @param {string} address - Property address
 * @param {string} city - City
 * @param {string} state - State
 * @param {string} zip - Zip code
 * @returns {string} Cache key
 */
function generateCompsKey(address, city, state, zip) {
  // Normalize inputs to create consistent keys
  const normalized = [
    address.toLowerCase().trim(),
    city.toLowerCase().trim(),
    state.toLowerCase().trim(),
    zip.trim()
  ].join('_');

  return `comps_${normalized}`;
}

/**
 * Get cached comps data if available and not expired
 * Phase 2.5: Respects differentiated cache durations by data type
 *
 * @param {string} address - Property address
 * @param {string} city - City
 * @param {string} state - State
 * @param {string} zip - Zip code
 * @returns {Array|null} Cached comps data or null if not found/expired
 */
function getCachedComps(address, city, state, zip) {
  try {
    const key = generateCompsKey(address, city, state, zip);
    const data = CacheManager.get(key);

    if (!data) {
      PlatformLogger.logCache('MISS', key);
      return null;
    }

    // Phase 2.5: Check cache validity based on data type
    const now = new Date().getTime();
    const cacheAge = now - data.timestamp;

    // Determine max age based on data type
    let maxAge;
    switch (data.dataType) {
      case 'property':
        maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        break;
      case 'location':
        maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        break;
      case 'comps':
        maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        break;
      case 'estimates':
        maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        break;
      case 'rates':
        maxAge = 24 * 60 * 60 * 1000; // 1 day
        break;
      default:
        maxAge = 7 * 24 * 60 * 60 * 1000; // Default 7 days
    }

    if (cacheAge > maxAge) {
      const ageHours = Math.round(cacheAge / 1000 / 60 / 60);
      const maxAgeHours = Math.round(maxAge / 1000 / 60 / 60);
      PlatformLogger.warn(`Cache expired for: ${key} (age: ${ageHours}h, max: ${maxAgeHours}h, type: ${data.dataType || 'unknown'})`);
      CacheManager.remove(key);
      return null;
    }

    const ageMinutes = Math.round(cacheAge / 1000 / 60);
    PlatformLogger.logCache('HIT', `${key} (age: ${ageMinutes}m, type: ${data.dataType || 'unknown'})`);
    return data.comps;

  } catch (error) {
    PlatformLogger.error('Error reading cache: ' + error);
    return null;
  }
}

/**
 * Store comps data in cache
 * Phase 2.5: Smart caching with differentiated durations
 *
 * @param {string} address - Property address
 * @param {string} city - City
 * @param {string} state - State
 * @param {string} zip - Zip code
 * @param {Array} comps - Comps data to cache
 * @param {string} dataType - Type of data: 'comps', 'property', 'location', 'estimates', 'rates'
 * @returns {boolean} Success status
 */
function setCachedComps(address, city, state, zip, comps, dataType = 'comps') {
  try {
    const key = generateCompsKey(address, city, state, zip);

    const data = {
      comps: comps,
      timestamp: new Date().getTime(),
      address: address,
      city: city,
      state: state,
      zip: zip,
      dataType: dataType
    };

    // Phase 2.5: Differentiated cache durations based on data type
    let cacheDuration;
    switch (dataType) {
      case 'property':
        cacheDuration = 30 * 24 * 60 * 60; // 30 days for property details
        break;
      case 'location':
        cacheDuration = 30 * 24 * 60 * 60; // 30 days for location data (schools, scores)
        break;
      case 'comps':
        cacheDuration = 7 * 24 * 60 * 60; // 7 days for comps
        break;
      case 'estimates':
        cacheDuration = 7 * 24 * 60 * 60; // 7 days for ARV estimates
        break;
      case 'rates':
        cacheDuration = 24 * 60 * 60; // 1 day for market rates
        break;
      default:
        cacheDuration = 7 * 24 * 60 * 60; // Default 7 days
    }

    // CacheService max is 6 hours, so we use timestamp for longer durations
    const cacheServiceDuration = Math.min(cacheDuration, 21600); // 6 hours max
    const success = CacheManager.set(key, data, cacheServiceDuration);

    if (success) {
      const durationDays = Math.round(cacheDuration / 86400);
      PlatformLogger.logCache('SET', `${key} (${comps.length} items, ${dataType}, ${durationDays}d TTL)`);
    } else {
      PlatformLogger.warn(`Failed to cache data for: ${key}`);
    }

    return success;

  } catch (error) {
    PlatformLogger.error('Error writing cache: ' + error);
    return false;
  }
}

/**
 * Clear cached comps for a specific property
 *
 * @param {string} address - Property address
 * @param {string} city - City
 * @param {string} state - State
 * @param {string} zip - Zip code
 * @returns {boolean} Success status
 */
function clearCachedComps(address, city, state, zip) {
  try {
    const key = generateCompsKey(address, city, state, zip);
    const success = CacheManager.remove(key);

    if (success) {
      PlatformLogger.logCache('CLEAR', key);
    }

    return success;
  } catch (error) {
    PlatformLogger.error('Error clearing cache: ' + error);
    return false;
  }
}

/**
 * Clear all cached comps data
 * Use with caution - this clears the entire cache
 *
 * @returns {boolean} Success status
 */
function clearAllCache() {
  try {
    // Note: CacheManager.clearByPrefix may not be fully supported on all platforms
    const success = CacheManager.clearByPrefix('comps_');

    if (success) {
      PlatformLogger.logCache('CLEAR', 'all comps cache');
    } else {
      PlatformLogger.warn('clearByPrefix not fully supported on this platform');
    }

    return success;
  } catch (error) {
    PlatformLogger.error('Error clearing all cache: ' + error);
    return false;
  }
}

/**
 * Get cache statistics for debugging
 *
 * @param {string} address - Property address
 * @param {string} city - City
 * @param {string} state - State
 * @param {string} zip - Zip code
 * @returns {Object} Cache statistics
 */
function getCacheStats(address, city, state, zip) {
  try {
    const key = generateCompsKey(address, city, state, zip);
    const exists = CacheManager.has(key);

    if (!exists) {
      return {
        exists: false,
        key: key
      };
    }

    const data = CacheManager.get(key);

    if (!data) {
      return {
        exists: false,
        key: key
      };
    }

    const now = new Date().getTime();
    const ageMinutes = Math.round((now - data.timestamp) / 1000 / 60);
    const ageHours = Math.round(ageMinutes / 60 * 10) / 10;

    return {
      exists: true,
      key: key,
      compsCount: data.comps?.length || 0,
      ageMinutes: ageMinutes,
      ageHours: ageHours,
      timestamp: new Date(data.timestamp).toLocaleString(),
      size: JSON.stringify(data).length
    };

  } catch (error) {
    PlatformLogger.error('Error getting cache stats: ' + error);
    return {
      exists: false,
      error: error.toString()
    };
  }
}

/**
 * Test function to verify cache functionality
 */
function testCache() {
  PlatformLogger.info("🧪 Testing cache functionality...");

  const testAddress = "123 Test St";
  const testCity = "San Francisco";
  const testState = "CA";
  const testZip = "94102";

  const testComps = [
    { address: "125 Test St", price: 800000, sqft: 1500 },
    { address: "127 Test St", price: 825000, sqft: 1600 }
  ];

  // Test 1: Set cache
  PlatformLogger.info("Test 1: Setting cache...");
  const setResult = setCachedComps(testAddress, testCity, testState, testZip, testComps);
  PlatformLogger.info(`Set result: ${setResult}`);

  // Test 2: Get cache
  PlatformLogger.info("Test 2: Getting cache...");
  const getResult = getCachedComps(testAddress, testCity, testState, testZip);
  PlatformLogger.info(`Get result: ${JSON.stringify(getResult)}`);

  // Test 3: Cache stats
  PlatformLogger.info("Test 3: Cache stats...");
  const stats = getCacheStats(testAddress, testCity, testState, testZip);
  PlatformLogger.info(`Stats: ${JSON.stringify(stats, null, 2)}`);

  // Test 4: Clear cache
  PlatformLogger.info("Test 4: Clearing cache...");
  const clearResult = clearCachedComps(testAddress, testCity, testState, testZip);
  PlatformLogger.info(`Clear result: ${clearResult}`);

  // Test 5: Verify cleared
  PlatformLogger.info("Test 5: Verifying cache cleared...");
  const verifyResult = getCachedComps(testAddress, testCity, testState, testZip);
  PlatformLogger.info(`Verify result (should be null): ${verifyResult}`);

  PlatformLogger.success("✅ Cache tests complete!");
}
