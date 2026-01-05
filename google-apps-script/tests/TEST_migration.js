/**
 * ===============================
 * MIGRATION TEST SUITE
 * ===============================
 *
 * Test suite to verify Phase 0.6 migration
 * Tests adapter functionality and migrated functions
 *
 * Run from: Extensions > Apps Script > Select function > Run
 */

/**
 * Run all migration tests
 */
function runAllMigrationTests() {
  PlatformLogger.info("🧪 Starting Phase 0.6 Migration Tests...");
  PlatformLogger.info("=".repeat(50));

  let passed = 0;
  let failed = 0;

  // Test 1: Adapter Availability
  try {
    testAdapterAvailability();
    passed++;
    PlatformLogger.success("✅ Test 1: Adapter Availability - PASSED");
  } catch (e) {
    failed++;
    PlatformLogger.error("❌ Test 1: Adapter Availability - FAILED: " + e);
  }

  // Test 2: QuotaManager Functions
  try {
    testQuotaManager();
    passed++;
    PlatformLogger.success("✅ Test 2: QuotaManager - PASSED");
  } catch (e) {
    failed++;
    PlatformLogger.error("❌ Test 2: QuotaManager - FAILED: " + e);
  }

  // Test 3: CacheManager Functions
  try {
    testCacheManager();
    passed++;
    PlatformLogger.success("✅ Test 3: CacheManager - PASSED");
  } catch (e) {
    failed++;
    PlatformLogger.error("❌ Test 3: CacheManager - FAILED: " + e);
  }

  // Test 4: PlatformLogger Functions
  try {
    testPlatformLogger();
    passed++;
    PlatformLogger.success("✅ Test 4: PlatformLogger - PASSED");
  } catch (e) {
    failed++;
    PlatformLogger.error("❌ Test 4: PlatformLogger - FAILED: " + e);
  }

  // Test 5: HttpClient Functions
  try {
    testHttpClient();
    passed++;
    PlatformLogger.success("✅ Test 5: HttpClient - PASSED");
  } catch (e) {
    failed++;
    PlatformLogger.error("❌ Test 5: HttpClient - FAILED: " + e);
  }

  // Test 6: Migrated API Bridge Functions
  try {
    testApiBridgeFunctions();
    passed++;
    PlatformLogger.success("✅ Test 6: API Bridge Functions - PASSED");
  } catch (e) {
    failed++;
    PlatformLogger.error("❌ Test 6: API Bridge Functions - FAILED: " + e);
  }

  // Test 7: Migrated Cache Functions
  try {
    testCacheFunctions();
    passed++;
    PlatformLogger.success("✅ Test 7: Cache Functions - PASSED");
  } catch (e) {
    failed++;
    PlatformLogger.error("❌ Test 7: Cache Functions - FAILED: " + e);
  }

  // Summary
  PlatformLogger.info("=".repeat(50));
  PlatformLogger.info(`📊 Test Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    PlatformLogger.success("🎉 All migration tests passed!");
  } else {
    PlatformLogger.error(`⚠️ ${failed} test(s) failed. Please review.`);
  }

  return { passed, failed };
}

/**
 * Test 1: Verify all adapters are available
 */
function testAdapterAvailability() {
  PlatformLogger.info("Testing adapter availability...");

  // Check HttpClient
  if (typeof HttpClient === 'undefined') {
    throw new Error("HttpClient adapter not found");
  }
  if (typeof HttpClient.get !== 'function') {
    throw new Error("HttpClient.get not found");
  }
  if (typeof HttpClient.post !== 'function') {
    throw new Error("HttpClient.post not found");
  }

  // Check CacheManager
  if (typeof CacheManager === 'undefined') {
    throw new Error("CacheManager adapter not found");
  }
  if (typeof CacheManager.get !== 'function') {
    throw new Error("CacheManager.get not found");
  }
  if (typeof CacheManager.set !== 'function') {
    throw new Error("CacheManager.set not found");
  }

  // Check QuotaManager
  if (typeof QuotaManager === 'undefined') {
    throw new Error("QuotaManager adapter not found");
  }
  if (typeof QuotaManager.getAPIKeys !== 'function') {
    throw new Error("QuotaManager.getAPIKeys not found");
  }
  if (typeof QuotaManager.getUsage !== 'function') {
    throw new Error("QuotaManager.getUsage not found");
  }

  // Check PlatformLogger
  if (typeof PlatformLogger === 'undefined') {
    throw new Error("PlatformLogger adapter not found");
  }
  if (typeof PlatformLogger.info !== 'function') {
    throw new Error("PlatformLogger.info not found");
  }

  PlatformLogger.debug("All adapters available");
}

/**
 * Test 2: QuotaManager functionality
 */
function testQuotaManager() {
  PlatformLogger.info("Testing QuotaManager...");

  // Test getAPIKeys
  const keys = QuotaManager.getAPIKeys();
  if (typeof keys !== 'object') {
    throw new Error("getAPIKeys should return an object");
  }

  // Test getQuotaLimits
  const limits = QuotaManager.getQuotaLimits();
  if (typeof limits !== 'object') {
    throw new Error("getQuotaLimits should return an object");
  }
  if (typeof limits.ZILLOW_MONTHLY_LIMIT !== 'number') {
    throw new Error("ZILLOW_MONTHLY_LIMIT should be a number");
  }

  // Test getUsage
  const usage = QuotaManager.getUsage('zillow', '2025-11');
  if (typeof usage !== 'number') {
    throw new Error("getUsage should return a number");
  }

  // Test incrementUsage
  const testPeriod = '2025-11-test';
  const newUsage = QuotaManager.incrementUsage('test_api', testPeriod);
  if (typeof newUsage !== 'number') {
    throw new Error("incrementUsage should return a number");
  }

  // Test trackSuccess
  const tracked = QuotaManager.trackSuccess('test_api');
  if (typeof tracked !== 'boolean') {
    throw new Error("trackSuccess should return a boolean");
  }

  // Test getLastSuccess
  const lastSuccess = QuotaManager.getLastSuccess();
  if (typeof lastSuccess !== 'object') {
    throw new Error("getLastSuccess should return an object");
  }
  if (!lastSuccess.hasOwnProperty('api')) {
    throw new Error("getLastSuccess should have 'api' property");
  }

  PlatformLogger.debug("QuotaManager tests passed");
}

/**
 * Test 3: CacheManager functionality
 */
function testCacheManager() {
  PlatformLogger.info("Testing CacheManager...");

  const testKey = 'test_migration_key';
  const testData = { test: 'data', timestamp: Date.now() };

  // Test set
  const setResult = CacheManager.set(testKey, testData, 300);
  if (typeof setResult !== 'boolean') {
    throw new Error("CacheManager.set should return a boolean");
  }

  // Test has
  const hasResult = CacheManager.has(testKey);
  if (typeof hasResult !== 'boolean') {
    throw new Error("CacheManager.has should return a boolean");
  }

  // Test get
  const getData = CacheManager.get(testKey);
  if (getData === null) {
    throw new Error("CacheManager.get should return cached data");
  }
  if (getData.test !== 'data') {
    throw new Error("Cached data doesn't match");
  }

  // Test remove
  const removeResult = CacheManager.remove(testKey);
  if (typeof removeResult !== 'boolean') {
    throw new Error("CacheManager.remove should return a boolean");
  }

  // Verify removed
  const afterRemove = CacheManager.get(testKey);
  if (afterRemove !== null) {
    throw new Error("Data should be removed from cache");
  }

  PlatformLogger.debug("CacheManager tests passed");
}

/**
 * Test 4: PlatformLogger functionality
 */
function testPlatformLogger() {
  PlatformLogger.info("Testing PlatformLogger...");

  // Test all logging methods (they should not throw errors)
  PlatformLogger.info("Test info message");
  PlatformLogger.success("Test success message");
  PlatformLogger.warn("Test warning message");
  PlatformLogger.error("Test error message");
  PlatformLogger.debug("Test debug message");

  // Test specialized logging
  PlatformLogger.logAPI('test_api', 'SUCCESS');
  PlatformLogger.logQuota('test_api', 10, 100, true);
  PlatformLogger.logCache('HIT', 'test_key');

  PlatformLogger.debug("PlatformLogger tests passed");
}

/**
 * Test 5: HttpClient functionality
 */
function testHttpClient() {
  PlatformLogger.info("Testing HttpClient...");

  // Test GET request (using a public API)
  const getResponse = HttpClient.get('https://httpbin.org/get', {
    headers: { 'User-Agent': 'REI-Tool-Test' }
  });

  if (typeof getResponse !== 'object') {
    throw new Error("HttpClient.get should return an object");
  }
  if (!getResponse.hasOwnProperty('statusCode')) {
    throw new Error("Response should have statusCode");
  }
  if (!getResponse.hasOwnProperty('body')) {
    throw new Error("Response should have body");
  }
  if (!getResponse.hasOwnProperty('success')) {
    throw new Error("Response should have success flag");
  }

  // Test POST request
  const postResponse = HttpClient.post('https://httpbin.org/post', {
    headers: { 'Content-Type': 'application/json' },
    payload: JSON.stringify({ test: 'data' })
  });

  if (typeof postResponse !== 'object') {
    throw new Error("HttpClient.post should return an object");
  }
  if (!postResponse.hasOwnProperty('statusCode')) {
    throw new Error("POST response should have statusCode");
  }

  PlatformLogger.debug("HttpClient tests passed");
}

/**
 * Test 6: Migrated API Bridge functions
 */
function testApiBridgeFunctions() {
  PlatformLogger.info("Testing migrated API Bridge functions...");

  // Test getApiKeys (should use QuotaManager)
  const keys = getApiKeys();
  if (typeof keys !== 'object') {
    throw new Error("getApiKeys should return an object");
  }

  // Test getApiQuotas (should use QuotaManager)
  const quotas = getApiQuotas();
  if (typeof quotas !== 'object') {
    throw new Error("getApiQuotas should return an object");
  }

  // Test checkQuotaAvailable (should use QuotaManager)
  const available = checkQuotaAvailable('zillow', 'month');
  if (typeof available !== 'boolean') {
    throw new Error("checkQuotaAvailable should return a boolean");
  }

  // Test trackAPIUsage (should use QuotaManager)
  trackAPIUsage('test_api', true);
  // Should not throw error

  PlatformLogger.debug("API Bridge function tests passed");
}

/**
 * Test 7: Migrated Cache functions
 */
function testCacheFunctions() {
  PlatformLogger.info("Testing migrated cache functions...");

  const testAddress = "123 Test St";
  const testCity = "Test City";
  const testState = "CA";
  const testZip = "12345";
  const testComps = [
    { address: "125 Test St", price: 500000, sqft: 1500 },
    { address: "127 Test St", price: 525000, sqft: 1600 }
  ];

  // Test generateCompsKey
  const key = generateCompsKey(testAddress, testCity, testState, testZip);
  if (typeof key !== 'string') {
    throw new Error("generateCompsKey should return a string");
  }

  // Test setCachedComps (should use CacheManager)
  const setResult = setCachedComps(testAddress, testCity, testState, testZip, testComps);
  if (typeof setResult !== 'boolean') {
    throw new Error("setCachedComps should return a boolean");
  }

  // Test getCachedComps (should use CacheManager)
  const cached = getCachedComps(testAddress, testCity, testState, testZip);
  if (!Array.isArray(cached)) {
    throw new Error("getCachedComps should return an array");
  }
  if (cached.length !== testComps.length) {
    throw new Error("Cached comps count doesn't match");
  }

  // Test getCacheStats (should use CacheManager)
  const stats = getCacheStats(testAddress, testCity, testState, testZip);
  if (typeof stats !== 'object') {
    throw new Error("getCacheStats should return an object");
  }
  if (!stats.hasOwnProperty('exists')) {
    throw new Error("Cache stats should have 'exists' property");
  }

  // Test clearCachedComps (should use CacheManager)
  const clearResult = clearCachedComps(testAddress, testCity, testState, testZip);
  if (typeof clearResult !== 'boolean') {
    throw new Error("clearCachedComps should return a boolean");
  }

  PlatformLogger.debug("Cache function tests passed");
}

/**
 * Quick test - Run a subset of critical tests
 */
function quickMigrationTest() {
  PlatformLogger.info("🚀 Running quick migration test...");

  try {
    // Test adapters are available
    testAdapterAvailability();
    PlatformLogger.success("✅ Adapters available");

    // Test basic functionality
    const keys = getApiKeys();
    const quotas = getApiQuotas();
    const available = checkQuotaAvailable('zillow', 'month');

    PlatformLogger.success("✅ API Bridge functions working");

    // Test cache
    const testComps = [{ address: "Test", price: 500000, sqft: 1500 }];
    setCachedComps("Test", "City", "CA", "12345", testComps);
    const cached = getCachedComps("Test", "City", "CA", "12345");

    PlatformLogger.success("✅ Cache functions working");

    PlatformLogger.success("🎉 Quick test passed! Migration successful.");
    return true;
  } catch (e) {
    PlatformLogger.error("❌ Quick test failed: " + e);
    return false;
  }
}

/**
 * Test HTTP functionality with real API call
 * WARNING: This will use API quota!
 */
function testRealAPICall() {
  PlatformLogger.warn("⚠️ This test will make a real API call and use quota!");

  try {
    const testData = {
      address: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zip: "94102"
    };

    PlatformLogger.info("Testing fetchPropertyDetails...");
    const details = fetchPropertyDetails(testData);

    if (details && details.beds && details.baths && details.sqft) {
      PlatformLogger.success("✅ Real API call successful!");
      PlatformLogger.info(`Property: ${details.beds} bed, ${details.baths} bath, ${details.sqft} sqft`);
      return true;
    } else {
      PlatformLogger.warn("⚠️ API returned default values (API may have failed)");
      return false;
    }
  } catch (e) {
    PlatformLogger.error("❌ Real API call failed: " + e);
    return false;
  }
}
