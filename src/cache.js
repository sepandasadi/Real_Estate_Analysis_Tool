/**
 * ===============================
 * CACHING UTILITIES
 * ===============================
 *
 * This module provides caching functionality for API responses.
 * Uses Google Apps Script CacheService for temporary storage.
 *
 * Benefits:
 * - Reduces API calls and costs
 * - Improves performance
 * - Respects rate limits
 * - 24-hour cache expiration
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
 *
 * @param {string} address - Property address
 * @param {string} city - City
 * @param {string} state - State
 * @param {string} zip - Zip code
 * @returns {Array|null} Cached comps data or null if not found/expired
 */
function getCachedComps(address, city, state, zip) {
  try {
    const cache = CacheService.getScriptCache();
    const key = generateCompsKey(address, city, state, zip);
    const cached = cache.get(key);

    if (!cached) {
      Logger.log(`📭 Cache miss for: ${key}`);
      return null;
    }

    // Parse cached data
    const data = JSON.parse(cached);

    // Check if cache is still valid (24 hours)
    const now = new Date().getTime();
    const cacheAge = now - data.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (cacheAge > maxAge) {
      Logger.log(`⏰ Cache expired for: ${key} (age: ${Math.round(cacheAge / 1000 / 60 / 60)} hours)`);
      cache.remove(key);
      return null;
    }

    Logger.log(`✅ Cache hit for: ${key} (age: ${Math.round(cacheAge / 1000 / 60)} minutes)`);
    return data.comps;

  } catch (error) {
    Logger.log(`❌ Error reading cache: ${error}`);
    return null;
  }
}

/**
 * Store comps data in cache
 *
 * @param {string} address - Property address
 * @param {string} city - City
 * @param {string} state - State
 * @param {string} zip - Zip code
 * @param {Array} comps - Comps data to cache
 * @returns {boolean} Success status
 */
function setCachedComps(address, city, state, zip, comps) {
  try {
    const cache = CacheService.getScriptCache();
    const key = generateCompsKey(address, city, state, zip);

    const data = {
      comps: comps,
      timestamp: new Date().getTime(),
      address: address,
      city: city,
      state: state,
      zip: zip
    };

    const serialized = JSON.stringify(data);

    // CacheService has a 100KB limit per entry
    if (serialized.length > 100000) {
      Logger.log(`⚠️ Cache data too large (${serialized.length} bytes), truncating comps`);
      // Keep only first 10 comps if data is too large
      data.comps = comps.slice(0, 10);
    }

    // Cache for 6 hours (max allowed by CacheService)
    // We'll check the timestamp for 24-hour expiration
    cache.put(key, JSON.stringify(data), 21600); // 6 hours in seconds

    Logger.log(`💾 Cached ${comps.length} comps for: ${key}`);
    return true;

  } catch (error) {
    Logger.log(`❌ Error writing cache: ${error}`);
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
    const cache = CacheService.getScriptCache();
    const key = generateCompsKey(address, city, state, zip);
    cache.remove(key);
    Logger.log(`🗑️ Cleared cache for: ${key}`);
    return true;
  } catch (error) {
    Logger.log(`❌ Error clearing cache: ${error}`);
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
    const cache = CacheService.getScriptCache();
    cache.removeAll(['comps_']); // Remove all keys starting with 'comps_'
    Logger.log(`🗑️ Cleared all comps cache`);
    return true;
  } catch (error) {
    Logger.log(`❌ Error clearing all cache: ${error}`);
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
    const cache = CacheService.getScriptCache();
    const key = generateCompsKey(address, city, state, zip);
    const cached = cache.get(key);

    if (!cached) {
      return {
        exists: false,
        key: key
      };
    }

    const data = JSON.parse(cached);
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
    Logger.log(`❌ Error getting cache stats: ${error}`);
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
  Logger.log("🧪 Testing cache functionality...");

  const testAddress = "123 Test St";
  const testCity = "San Francisco";
  const testState = "CA";
  const testZip = "94102";

  const testComps = [
    { address: "125 Test St", price: 800000, sqft: 1500 },
    { address: "127 Test St", price: 825000, sqft: 1600 }
  ];

  // Test 1: Set cache
  Logger.log("Test 1: Setting cache...");
  const setResult = setCachedComps(testAddress, testCity, testState, testZip, testComps);
  Logger.log(`Set result: ${setResult}`);

  // Test 2: Get cache
  Logger.log("Test 2: Getting cache...");
  const getResult = getCachedComps(testAddress, testCity, testState, testZip);
  Logger.log(`Get result: ${JSON.stringify(getResult)}`);

  // Test 3: Cache stats
  Logger.log("Test 3: Cache stats...");
  const stats = getCacheStats(testAddress, testCity, testState, testZip);
  Logger.log(`Stats: ${JSON.stringify(stats, null, 2)}`);

  // Test 4: Clear cache
  Logger.log("Test 4: Clearing cache...");
  const clearResult = clearCachedComps(testAddress, testCity, testState, testZip);
  Logger.log(`Clear result: ${clearResult}`);

  // Test 5: Verify cleared
  Logger.log("Test 5: Verifying cache cleared...");
  const verifyResult = getCachedComps(testAddress, testCity, testState, testZip);
  Logger.log(`Verify result (should be null): ${verifyResult}`);

  Logger.log("✅ Cache tests complete!");
}
