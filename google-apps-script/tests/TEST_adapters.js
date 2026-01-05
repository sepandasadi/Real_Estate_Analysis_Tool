/**
 * ===============================
 * ADAPTER TEST SUITE
 * ===============================
 *
 * Test suite for Google Apps Script platform adapter
 * Run these tests to verify adapter functionality
 *
 * Usage: Run from Apps Script editor
 */

/**
 * Run all adapter tests
 */
function testAllAdapterComponents() {
  PlatformLogger.info('========================================');
  PlatformLogger.info('Starting Adapter Test Suite');
  PlatformLogger.info('========================================');

  var results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test HttpClient
  PlatformLogger.info('\n📡 Testing HttpClient...');
  results = runTest(results, 'HttpClient.get', testHttpClientGet);
  results = runTest(results, 'HttpClient.retryWithBackoff', testHttpClientRetry);

  // Test CacheManager
  PlatformLogger.info('\n💾 Testing CacheManager...');
  results = runTest(results, 'CacheManager.set', testCacheManagerSet);
  results = runTest(results, 'CacheManager.get', testCacheManagerGet);
  results = runTest(results, 'CacheManager.has', testCacheManagerHas);
  results = runTest(results, 'CacheManager.remove', testCacheManagerRemove);

  // Test QuotaManager
  PlatformLogger.info('\n📊 Testing QuotaManager...');
  results = runTest(results, 'QuotaManager.getAPIKeys', testQuotaManagerGetKeys);
  results = runTest(results, 'QuotaManager.getQuotaLimits', testQuotaManagerGetLimits);
  results = runTest(results, 'QuotaManager.usage', testQuotaManagerUsage);

  // Test PlatformLogger
  PlatformLogger.info('\n📝 Testing PlatformLogger...');
  results = runTest(results, 'PlatformLogger.logging', testPlatformLoggerLogging);

  // Test Utilities
  PlatformLogger.info('\n🔧 Testing Utilities...');
  results = runTest(results, 'safeJSONParse', testSafeJSONParse);
  results = runTest(results, 'safeJSONStringify', testSafeJSONStringify);
  results = runTest(results, 'getPlatformInfo', testGetPlatformInfo);

  // Print summary
  PlatformLogger.info('\n========================================');
  PlatformLogger.info('Test Suite Complete');
  PlatformLogger.info('========================================');
  PlatformLogger.info('Total Tests: ' + results.total);
  PlatformLogger.success('Passed: ' + results.passed);
  if (results.failed > 0) {
    PlatformLogger.error('Failed: ' + results.failed);
  }
  PlatformLogger.info('Success Rate: ' + Math.round((results.passed / results.total) * 100) + '%');

  // Show failed tests
  if (results.failed > 0) {
    PlatformLogger.error('\nFailed Tests:');
    results.tests.forEach(function(test) {
      if (!test.passed) {
        PlatformLogger.error('  - ' + test.name + ': ' + test.error);
      }
    });
  }

  return results;
}

/**
 * Run a single test
 */
function runTest(results, name, testFn) {
  results.total++;

  try {
    testFn();
    results.passed++;
    results.tests.push({ name: name, passed: true });
    PlatformLogger.success('✓ ' + name);
  } catch (error) {
    results.failed++;
    results.tests.push({ name: name, passed: false, error: error.toString() });
    PlatformLogger.error('✗ ' + name + ': ' + error);
  }

  return results;
}

/**
 * Assert helper
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

/**
 * ===============================
 * HTTP CLIENT TESTS
 * ===============================
 */

function testHttpClientGet() {
  var response = HttpClient.get('https://httpbin.org/get');

  assert(response !== null, 'Response should not be null');
  assert(response.statusCode === 200, 'Status code should be 200');
  assert(response.success === true, 'Success should be true');
  assert(response.body.length > 0, 'Body should not be empty');
}

function testHttpClientRetry() {
  var attempts = 0;
  var response = HttpClient.retryWithBackoff(function() {
    attempts++;
    if (attempts < 2) {
      return { success: false, statusCode: 500, body: '', headers: {} };
    }
    return { success: true, statusCode: 200, body: 'OK', headers: {} };
  }, 3, 100);

  assert(response.success === true, 'Should succeed after retry');
  assert(attempts === 2, 'Should retry once before succeeding');
}

/**
 * ===============================
 * CACHE MANAGER TESTS
 * ===============================
 */

function testCacheManagerSet() {
  var testData = { value: 'test123', timestamp: new Date().getTime() };
  var result = CacheManager.set('test_key_set', testData, 3600);

  assert(result === true, 'Set should return true');
}

function testCacheManagerGet() {
  var testData = { value: 'test456', timestamp: new Date().getTime() };
  CacheManager.set('test_key_get', testData, 3600);

  var cached = CacheManager.get('test_key_get');

  assert(cached !== null, 'Cached data should not be null');
  assert(cached.value === 'test456', 'Cached value should match');
}

function testCacheManagerHas() {
  var testData = { value: 'test789' };
  CacheManager.set('test_key_has', testData, 3600);

  var exists = CacheManager.has('test_key_has');
  var notExists = CacheManager.has('test_key_nonexistent');

  assert(exists === true, 'Should return true for existing key');
  assert(notExists === false, 'Should return false for non-existing key');
}

function testCacheManagerRemove() {
  var testData = { value: 'test_remove' };
  CacheManager.set('test_key_remove', testData, 3600);

  var result = CacheManager.remove('test_key_remove');
  var cached = CacheManager.get('test_key_remove');

  assert(result === true, 'Remove should return true');
  assert(cached === null, 'Cached data should be null after removal');
}

/**
 * ===============================
 * QUOTA MANAGER TESTS
 * ===============================
 */

function testQuotaManagerGetKeys() {
  var keys = QuotaManager.getAPIKeys();

  assert(keys !== null, 'Keys should not be null');
  assert(typeof keys === 'object', 'Keys should be an object');
  // Note: Keys may be undefined if not set in Script Properties
}

function testQuotaManagerGetLimits() {
  var limits = QuotaManager.getQuotaLimits();

  assert(limits !== null, 'Limits should not be null');
  assert(typeof limits === 'object', 'Limits should be an object');
  assert(limits.ZILLOW_MONTHLY_LIMIT === 100, 'Zillow limit should be 100');
  assert(limits.US_REAL_ESTATE_MONTHLY_LIMIT === 300, 'US Real Estate limit should be 300');
}

function testQuotaManagerUsage() {
  var testPeriod = 'test_2025_11';

  // Set usage
  var setResult = QuotaManager.setUsage('test_api', testPeriod, 5);
  assert(setResult === true, 'Set usage should return true');

  // Get usage
  var usage = QuotaManager.getUsage('test_api', testPeriod);
  assert(usage === 5, 'Usage should be 5');

  // Increment usage
  var newUsage = QuotaManager.incrementUsage('test_api', testPeriod);
  assert(newUsage === 6, 'Usage should be incremented to 6');

  // Track success
  var trackResult = QuotaManager.trackSuccess('test_api');
  assert(trackResult === true, 'Track success should return true');

  // Get last success
  var lastSuccess = QuotaManager.getLastSuccess();
  assert(lastSuccess.api === 'test_api', 'Last success API should be test_api');

  // Cleanup
  QuotaManager.setUsage('test_api', testPeriod, 0);
}

/**
 * ===============================
 * LOGGER TESTS
 * ===============================
 */

function testPlatformLoggerLogging() {
  // Test all logging methods (should not throw errors)
  PlatformLogger.info('Test info message');
  PlatformLogger.success('Test success message');
  PlatformLogger.warn('Test warning message');
  PlatformLogger.error('Test error message');
  PlatformLogger.debug('Test debug message');

  PlatformLogger.logAPI('test_api', 'SUCCESS');
  PlatformLogger.logQuota('test_api', 50, 100, true);
  PlatformLogger.logCache('HIT', 'test_key');

  // If we get here without errors, test passes
  assert(true, 'All logging methods should work');
}

/**
 * ===============================
 * UTILITY TESTS
 * ===============================
 */

function testSafeJSONParse() {
  // Valid JSON
  var validResult = safeJSONParse('{"key":"value"}');
  assert(validResult !== null, 'Valid JSON should parse');
  assert(validResult.key === 'value', 'Parsed value should match');

  // Invalid JSON with default
  var invalidResult = safeJSONParse('invalid json', { default: true });
  assert(invalidResult.default === true, 'Should return default on error');

  // Invalid JSON without default
  var nullResult = safeJSONParse('invalid json');
  assert(nullResult === null, 'Should return null on error without default');
}

function testSafeJSONStringify() {
  // Valid object
  var validResult = safeJSONStringify({ key: 'value' });
  assert(validResult === '{"key":"value"}', 'Should stringify correctly');

  // Circular reference with default
  var circular = {};
  circular.self = circular;
  var circularResult = safeJSONStringify(circular, '{}');
  assert(circularResult === '{}', 'Should return default on circular reference');
}

function testGetPlatformInfo() {
  var info = getPlatformInfo();

  assert(info !== null, 'Platform info should not be null');
  assert(info.platform === 'google-apps-script', 'Platform should be google-apps-script');
  assert(info.version === '1.0.0', 'Version should be 1.0.0');
  assert(info.capabilities.http === true, 'Should have HTTP capability');
  assert(info.capabilities.cache === true, 'Should have cache capability');
  assert(info.capabilities.quota === true, 'Should have quota capability');
}

/**
 * ===============================
 * INTEGRATION TESTS
 * ===============================
 */

/**
 * Test complete workflow: HTTP -> Cache -> Quota
 */
function testIntegrationWorkflow() {
  PlatformLogger.info('\n🔄 Running Integration Test...');

  try {
    // 1. Make HTTP request
    PlatformLogger.info('Step 1: Making HTTP request...');
    var response = HttpClient.get('https://httpbin.org/json');
    assert(response.success === true, 'HTTP request should succeed');

    // 2. Cache the response
    PlatformLogger.info('Step 2: Caching response...');
    var cacheKey = 'integration_test_' + new Date().getTime();
    var cacheData = {
      data: safeJSONParse(response.body, {}),
      timestamp: new Date().getTime(),
      source: 'httpbin'
    };
    var cacheResult = CacheManager.set(cacheKey, cacheData, 3600);
    assert(cacheResult === true, 'Cache should succeed');

    // 3. Retrieve from cache
    PlatformLogger.info('Step 3: Retrieving from cache...');
    var cached = CacheManager.get(cacheKey);
    assert(cached !== null, 'Should retrieve from cache');
    assert(cached.source === 'httpbin', 'Cached data should match');

    // 4. Track quota usage
    PlatformLogger.info('Step 4: Tracking quota usage...');
    var testPeriod = 'integration_2025_11';
    var usage = QuotaManager.incrementUsage('integration_test', testPeriod);
    assert(usage > 0, 'Usage should be incremented');

    // 5. Track success
    PlatformLogger.info('Step 5: Tracking success...');
    var trackResult = QuotaManager.trackSuccess('integration_test');
    assert(trackResult === true, 'Should track success');

    // 6. Cleanup
    PlatformLogger.info('Step 6: Cleaning up...');
    CacheManager.remove(cacheKey);
    QuotaManager.setUsage('integration_test', testPeriod, 0);

    PlatformLogger.success('✓ Integration test passed');
  } catch (error) {
    PlatformLogger.error('✗ Integration test failed: ' + error);
    throw error;
  }
}

/**
 * Quick smoke test
 */
function testAdapterQuick() {
  PlatformLogger.info('Running quick smoke test...');

  // Test basic functionality
  var httpWorks = HttpClient.get('https://httpbin.org/get').success;
  var cacheWorks = CacheManager.set('test', { value: 1 }, 60) && CacheManager.get('test') !== null;
  var quotaWorks = QuotaManager.getQuotaLimits().ZILLOW_MONTHLY_LIMIT === 100;

  if (httpWorks && cacheWorks && quotaWorks) {
    PlatformLogger.success('✓ All adapter components working');
  } else {
    PlatformLogger.error('✗ Some adapter components failed');
    PlatformLogger.error('HTTP: ' + httpWorks + ', Cache: ' + cacheWorks + ', Quota: ' + quotaWorks);
  }

  // Cleanup
  CacheManager.remove('test');
}
