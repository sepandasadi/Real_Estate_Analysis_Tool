/**
 * ===============================
 * WEB APP ADAPTER TEST SUITE
 * ===============================
 *
 * Test suite for Web App platform adapter
 * Run these tests to verify adapter functionality
 *
 * Usage: Import and run in your test framework (Jest, Vitest, etc.)
 */

import {
  HttpClient,
  CacheManager,
  QuotaManager,
  PlatformLogger,
  safeJSONParse,
  safeJSONStringify,
  getPlatformInfo,
} from './coreAdapter';

/**
 * Test results interface
 */
interface TestResults {
  total: number;
  passed: number;
  failed: number;
  tests: Array<{ name: string; passed: boolean; error?: string }>;
}

/**
 * Run all adapter tests
 */
export async function testAllAdapterComponents(): Promise<TestResults> {
  console.log('========================================');
  console.log('Starting Web App Adapter Test Suite');
  console.log('========================================');

  const results: TestResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: [],
  };

  // Test HttpClient
  console.log('\n📡 Testing HttpClient...');
  await runTest(results, 'HttpClient.get', testHttpClientGet);
  await runTest(results, 'HttpClient.post', testHttpClientPost);
  await runTest(results, 'HttpClient.retryWithBackoff', testHttpClientRetry);

  // Test CacheManager
  console.log('\n💾 Testing CacheManager...');
  runTest(results, 'CacheManager.set', testCacheManagerSet);
  runTest(results, 'CacheManager.get', testCacheManagerGet);
  runTest(results, 'CacheManager.has', testCacheManagerHas);
  runTest(results, 'CacheManager.remove', testCacheManagerRemove);
  runTest(results, 'CacheManager.clearByPrefix', testCacheManagerClearByPrefix);

  // Test QuotaManager
  console.log('\n📊 Testing QuotaManager...');
  runTest(results, 'QuotaManager.getAPIKeys', testQuotaManagerGetKeys);
  runTest(results, 'QuotaManager.setAPIKeys', testQuotaManagerSetKeys);
  runTest(results, 'QuotaManager.getQuotaLimits', testQuotaManagerGetLimits);
  runTest(results, 'QuotaManager.usage', testQuotaManagerUsage);

  // Test PlatformLogger
  console.log('\n📝 Testing PlatformLogger...');
  runTest(results, 'PlatformLogger.logging', testPlatformLoggerLogging);

  // Test Utilities
  console.log('\n🔧 Testing Utilities...');
  runTest(results, 'safeJSONParse', testSafeJSONParse);
  runTest(results, 'safeJSONStringify', testSafeJSONStringify);
  runTest(results, 'getPlatformInfo', testGetPlatformInfo);

  // Print summary
  console.log('\n========================================');
  console.log('Test Suite Complete');
  console.log('========================================');
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  if (results.failed > 0) {
    console.error(`❌ Failed: ${results.failed}`);
  }
  console.log(`Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);

  // Show failed tests
  if (results.failed > 0) {
    console.error('\nFailed Tests:');
    results.tests.forEach((test) => {
      if (!test.passed) {
        console.error(`  - ${test.name}: ${test.error}`);
      }
    });
  }

  return results;
}

/**
 * Run a single test
 */
async function runTest(
  results: TestResults,
  name: string,
  testFn: () => void | Promise<void>
): Promise<TestResults> {
  results.total++;

  try {
    await testFn();
    results.passed++;
    results.tests.push({ name, passed: true });
    console.log(`✓ ${name}`);
  } catch (error) {
    results.failed++;
    results.tests.push({
      name,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
    console.error(`✗ ${name}: ${error}`);
  }

  return results;
}

/**
 * Assert helper
 */
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * ===============================
 * HTTP CLIENT TESTS
 * ===============================
 */

async function testHttpClientGet(): Promise<void> {
  const response = await HttpClient.get('https://httpbin.org/get');

  assert(response !== null, 'Response should not be null');
  assert(response.statusCode === 200, 'Status code should be 200');
  assert(response.success === true, 'Success should be true');
  assert(response.body.length > 0, 'Body should not be empty');
}

async function testHttpClientPost(): Promise<void> {
  const response = await HttpClient.post('https://httpbin.org/post', {
    payload: JSON.stringify({ test: 'data' }),
  });

  assert(response !== null, 'Response should not be null');
  assert(response.statusCode === 200, 'Status code should be 200');
  assert(response.success === true, 'Success should be true');
  assert(response.body.length > 0, 'Body should not be empty');
}

async function testHttpClientRetry(): Promise<void> {
  let attempts = 0;
  const response = await HttpClient.retryWithBackoff(async () => {
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

function testCacheManagerSet(): void {
  const testData = { value: 'test123', timestamp: new Date().getTime() };
  const result = CacheManager.set('test_key_set', testData);

  assert(result === true, 'Set should return true');
}

function testCacheManagerGet(): void {
  const testData = { value: 'test456', timestamp: new Date().getTime() };
  CacheManager.set('test_key_get', testData);

  const cached = CacheManager.get('test_key_get');

  assert(cached !== null, 'Cached data should not be null');
  assert(cached.value === 'test456', 'Cached value should match');
}

function testCacheManagerHas(): void {
  const testData = { value: 'test789' };
  CacheManager.set('test_key_has', testData);

  const exists = CacheManager.has('test_key_has');
  const notExists = CacheManager.has('test_key_nonexistent');

  assert(exists === true, 'Should return true for existing key');
  assert(notExists === false, 'Should return false for non-existing key');
}

function testCacheManagerRemove(): void {
  const testData = { value: 'test_remove' };
  CacheManager.set('test_key_remove', testData);

  const result = CacheManager.remove('test_key_remove');
  const cached = CacheManager.get('test_key_remove');

  assert(result === true, 'Remove should return true');
  assert(cached === null, 'Cached data should be null after removal');
}

function testCacheManagerClearByPrefix(): void {
  // Set multiple keys with same prefix
  CacheManager.set('prefix_test_1', { value: 1 });
  CacheManager.set('prefix_test_2', { value: 2 });
  CacheManager.set('other_key', { value: 3 });

  // Clear by prefix
  const result = CacheManager.clearByPrefix('prefix_test_');

  // Check results
  assert(result === true, 'Clear by prefix should return true');
  assert(CacheManager.get('prefix_test_1') === null, 'First key should be cleared');
  assert(CacheManager.get('prefix_test_2') === null, 'Second key should be cleared');
  assert(CacheManager.get('other_key') !== null, 'Other key should remain');

  // Cleanup
  CacheManager.remove('other_key');
}

/**
 * ===============================
 * QUOTA MANAGER TESTS
 * ===============================
 */

function testQuotaManagerGetKeys(): void {
  const keys = QuotaManager.getAPIKeys();

  assert(keys !== null, 'Keys should not be null');
  assert(typeof keys === 'object', 'Keys should be an object');
}

function testQuotaManagerSetKeys(): void {
  const testKeys = {
    RAPIDAPI_KEY: 'test_key_123',
    GEMINI_API_KEY: 'test_gemini_key',
  };

  const result = QuotaManager.setAPIKeys(testKeys);
  assert(result === true, 'Set keys should return true');

  const retrieved = QuotaManager.getAPIKeys();
  assert(retrieved.RAPIDAPI_KEY === 'test_key_123', 'Retrieved key should match');

  // Cleanup
  QuotaManager.setAPIKeys({});
}

function testQuotaManagerGetLimits(): void {
  const limits = QuotaManager.getQuotaLimits();

  assert(limits !== null, 'Limits should not be null');
  assert(typeof limits === 'object', 'Limits should be an object');
  assert(limits.ZILLOW_MONTHLY_LIMIT === 100, 'Zillow limit should be 100');
  assert(limits.US_REAL_ESTATE_MONTHLY_LIMIT === 300, 'US Real Estate limit should be 300');
}

function testQuotaManagerUsage(): void {
  const testPeriod = 'test_2025_11';

  // Set usage
  const setResult = QuotaManager.setUsage('test_api', testPeriod, 5);
  assert(setResult === true, 'Set usage should return true');

  // Get usage
  const usage = QuotaManager.getUsage('test_api', testPeriod);
  assert(usage === 5, 'Usage should be 5');

  // Increment usage
  const newUsage = QuotaManager.incrementUsage('test_api', testPeriod);
  assert(newUsage === 6, 'Usage should be incremented to 6');

  // Track success
  const trackResult = QuotaManager.trackSuccess('test_api');
  assert(trackResult === true, 'Track success should return true');

  // Get last success
  const lastSuccess = QuotaManager.getLastSuccess();
  assert(lastSuccess.api === 'test_api', 'Last success API should be test_api');

  // Cleanup
  QuotaManager.setUsage('test_api', testPeriod, 0);
}

/**
 * ===============================
 * LOGGER TESTS
 * ===============================
 */

function testPlatformLoggerLogging(): void {
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

function testSafeJSONParse(): void {
  // Valid JSON
  const validResult = safeJSONParse('{"key":"value"}');
  assert(validResult !== null, 'Valid JSON should parse');
  assert(validResult.key === 'value', 'Parsed value should match');

  // Invalid JSON with default
  const invalidResult = safeJSONParse('invalid json', { default: true });
  assert(invalidResult !== null && invalidResult.default === true, 'Should return default on error');

  // Invalid JSON without default
  const nullResult = safeJSONParse('invalid json');
  assert(nullResult === null, 'Should return null on error without default');
}

function testSafeJSONStringify(): void {
  // Valid object
  const validResult = safeJSONStringify({ key: 'value' });
  assert(validResult === '{"key":"value"}', 'Should stringify correctly');

  // Circular reference with default
  const circular: any = {};
  circular.self = circular;
  const circularResult = safeJSONStringify(circular, '{}');
  assert(circularResult === '{}', 'Should return default on circular reference');
}

function testGetPlatformInfo(): void {
  const info = getPlatformInfo();

  assert(info !== null, 'Platform info should not be null');
  assert(info.platform === 'web-app', 'Platform should be web-app');
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
export async function testIntegrationWorkflow(): Promise<void> {
  console.log('\n🔄 Running Integration Test...');

  try {
    // 1. Make HTTP request
    console.log('Step 1: Making HTTP request...');
    const response = await HttpClient.get('https://httpbin.org/json');
    assert(response.success === true, 'HTTP request should succeed');

    // 2. Cache the response
    console.log('Step 2: Caching response...');
    const cacheKey = `integration_test_${new Date().getTime()}`;
    const cacheData = {
      data: safeJSONParse(response.body, {}),
      timestamp: new Date().getTime(),
      source: 'httpbin',
    };
    const cacheResult = CacheManager.set(cacheKey, cacheData);
    assert(cacheResult === true, 'Cache should succeed');

    // 3. Retrieve from cache
    console.log('Step 3: Retrieving from cache...');
    const cached = CacheManager.get(cacheKey);
    assert(cached !== null, 'Should retrieve from cache');
    assert(cached.source === 'httpbin', 'Cached data should match');

    // 4. Track quota usage
    console.log('Step 4: Tracking quota usage...');
    const testPeriod = 'integration_2025_11';
    const usage = QuotaManager.incrementUsage('integration_test', testPeriod);
    assert(usage > 0, 'Usage should be incremented');

    // 5. Track success
    console.log('Step 5: Tracking success...');
    const trackResult = QuotaManager.trackSuccess('integration_test');
    assert(trackResult === true, 'Should track success');

    // 6. Cleanup
    console.log('Step 6: Cleaning up...');
    CacheManager.remove(cacheKey);
    QuotaManager.setUsage('integration_test', testPeriod, 0);

    console.log('✅ Integration test passed');
  } catch (error) {
    console.error('❌ Integration test failed:', error);
    throw error;
  }
}

/**
 * Quick smoke test
 */
export async function testAdapterQuick(): Promise<void> {
  console.log('Running quick smoke test...');

  // Test basic functionality
  const httpWorks = (await HttpClient.get('https://httpbin.org/get')).success;
  const cacheWorks =
    CacheManager.set('test', { value: 1 }) && CacheManager.get('test') !== null;
  const quotaWorks = QuotaManager.getQuotaLimits().ZILLOW_MONTHLY_LIMIT === 100;

  if (httpWorks && cacheWorks && quotaWorks) {
    console.log('✅ All adapter components working');
  } else {
    console.error('❌ Some adapter components failed');
    console.error(`HTTP: ${httpWorks}, Cache: ${cacheWorks}, Quota: ${quotaWorks}`);
  }

  // Cleanup
  CacheManager.remove('test');
}

/**
 * Run tests in browser console
 */
if (typeof window !== 'undefined') {
  (window as any).testAdapter = {
    testAll: testAllAdapterComponents,
    testIntegration: testIntegrationWorkflow,
    testQuick: testAdapterQuick,
  };

  console.log('📝 Adapter tests loaded. Run in console:');
  console.log('  - testAdapter.testAll()');
  console.log('  - testAdapter.testIntegration()');
  console.log('  - testAdapter.testQuick()');
}
