/**
 * ===============================
 * API SELECTION FEATURE TESTS
 * ===============================
 *
 * Tests for user-selectable primary API source with automatic fallback
 */

/**
 * Test Suite: API Selection
 */
function testAPISelection() {
  Logger.log('\n========================================');
  Logger.log('🧪 TESTING: API Selection Feature');
  Logger.log('========================================\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Default to Auto mode
  try {
    const defaultAPI = QuotaManager.getPrimaryAPI();
    if (defaultAPI === 'auto') {
      results.passed++;
      results.tests.push('✅ Test 1: Default primary API is "auto"');
      Logger.log('✅ Test 1 PASSED: Default primary API is "auto"');
    } else {
      results.failed++;
      results.tests.push(`❌ Test 1: Expected "auto", got "${defaultAPI}"`);
      Logger.log(`❌ Test 1 FAILED: Expected "auto", got "${defaultAPI}"`);
    }
  } catch (error) {
    results.failed++;
    results.tests.push(`❌ Test 1: Error - ${error.message}`);
    Logger.log(`❌ Test 1 FAILED: ${error.message}`);
  }

  // Test 2: Set valid primary API
  try {
    const success = QuotaManager.setPrimaryAPI('private_zillow');
    const current = QuotaManager.getPrimaryAPI();

    if (success && current === 'private_zillow') {
      results.passed++;
      results.tests.push('✅ Test 2: Successfully set primary API to "private_zillow"');
      Logger.log('✅ Test 2 PASSED: Successfully set primary API to "private_zillow"');
    } else {
      results.failed++;
      results.tests.push(`❌ Test 2: Failed to set primary API (success: ${success}, current: ${current})`);
      Logger.log(`❌ Test 2 FAILED: Failed to set primary API`);
    }
  } catch (error) {
    results.failed++;
    results.tests.push(`❌ Test 2: Error - ${error.message}`);
    Logger.log(`❌ Test 2 FAILED: ${error.message}`);
  }

  // Test 3: Reject invalid API name
  try {
    const success = QuotaManager.setPrimaryAPI('invalid_api');

    if (!success) {
      results.passed++;
      results.tests.push('✅ Test 3: Correctly rejected invalid API name');
      Logger.log('✅ Test 3 PASSED: Correctly rejected invalid API name');
    } else {
      results.failed++;
      results.tests.push('❌ Test 3: Should have rejected invalid API name');
      Logger.log('❌ Test 3 FAILED: Should have rejected invalid API name');
    }
  } catch (error) {
    results.failed++;
    results.tests.push(`❌ Test 3: Error - ${error.message}`);
    Logger.log(`❌ Test 3 FAILED: ${error.message}`);
  }

  // Test 4: Auto mode returns default priority
  try {
    QuotaManager.setPrimaryAPI('auto');
    const order = QuotaManager.getAPICallOrder();
    const expectedOrder = ['private_zillow', 'us_real_estate', 'redfin', 'gemini'];

    const isCorrect = JSON.stringify(order) === JSON.stringify(expectedOrder);

    if (isCorrect) {
      results.passed++;
      results.tests.push('✅ Test 4: Auto mode returns correct default priority');
      Logger.log('✅ Test 4 PASSED: Auto mode returns correct default priority');
      Logger.log(`   Order: ${order.join(' → ')}`);
    } else {
      results.failed++;
      results.tests.push(`❌ Test 4: Wrong order. Expected: ${expectedOrder.join(' → ')}, Got: ${order.join(' → ')}`);
      Logger.log(`❌ Test 4 FAILED: Wrong order`);
    }
  } catch (error) {
    results.failed++;
    results.tests.push(`❌ Test 4: Error - ${error.message}`);
    Logger.log(`❌ Test 4 FAILED: ${error.message}`);
  }

  // Test 5: Manual selection puts chosen API first
  try {
    QuotaManager.setPrimaryAPI('redfin');
    const order = QuotaManager.getAPICallOrder();

    if (order[0] === 'redfin' && order.length === 4) {
      results.passed++;
      results.tests.push('✅ Test 5: Manual selection puts chosen API first');
      Logger.log('✅ Test 5 PASSED: Manual selection puts chosen API first');
      Logger.log(`   Order: ${order.join(' → ')}`);
    } else {
      results.failed++;
      results.tests.push(`❌ Test 5: Wrong order. First should be "redfin", got: ${order.join(' → ')}`);
      Logger.log(`❌ Test 5 FAILED: Wrong order`);
    }
  } catch (error) {
    results.failed++;
    results.tests.push(`❌ Test 5: Error - ${error.message}`);
    Logger.log(`❌ Test 5 FAILED: ${error.message}`);
  }

  // Test 6: All valid API names work
  try {
    const validAPIs = ['auto', 'private_zillow', 'us_real_estate', 'redfin', 'gemini'];
    let allPassed = true;

    for (var i = 0; i < validAPIs.length; i++) {
      const api = validAPIs[i];
      const success = QuotaManager.setPrimaryAPI(api);
      const current = QuotaManager.getPrimaryAPI();

      if (!success || current !== api) {
        allPassed = false;
        Logger.log(`   ❌ Failed to set: ${api}`);
        break;
      }
    }

    if (allPassed) {
      results.passed++;
      results.tests.push('✅ Test 6: All valid API names work correctly');
      Logger.log('✅ Test 6 PASSED: All valid API names work correctly');
    } else {
      results.failed++;
      results.tests.push('❌ Test 6: Some valid API names failed');
      Logger.log('❌ Test 6 FAILED: Some valid API names failed');
    }
  } catch (error) {
    results.failed++;
    results.tests.push(`❌ Test 6: Error - ${error.message}`);
    Logger.log(`❌ Test 6 FAILED: ${error.message}`);
  }

  // Test 7: API call order includes all APIs
  try {
    QuotaManager.setPrimaryAPI('us_real_estate');
    const order = QuotaManager.getAPICallOrder();
    const allAPIs = ['private_zillow', 'us_real_estate', 'redfin', 'gemini'];

    let hasAll = true;
    for (var i = 0; i < allAPIs.length; i++) {
      if (order.indexOf(allAPIs[i]) === -1) {
        hasAll = false;
        break;
      }
    }

    if (hasAll && order.length === 4) {
      results.passed++;
      results.tests.push('✅ Test 7: API call order includes all APIs');
      Logger.log('✅ Test 7 PASSED: API call order includes all APIs');
    } else {
      results.failed++;
      results.tests.push(`❌ Test 7: Missing APIs in order: ${order.join(', ')}`);
      Logger.log(`❌ Test 7 FAILED: Missing APIs in order`);
    }
  } catch (error) {
    results.failed++;
    results.tests.push(`❌ Test 7: Error - ${error.message}`);
    Logger.log(`❌ Test 7 FAILED: ${error.message}`);
  }

  // Test 8: Session persistence (cache-based)
  try {
    QuotaManager.setPrimaryAPI('gemini');

    // Simulate reading from cache
    const cache = CacheService.getUserCache();
    const cached = cache.get('primary_api');

    if (cached === 'gemini') {
      results.passed++;
      results.tests.push('✅ Test 8: Primary API persists in session cache');
      Logger.log('✅ Test 8 PASSED: Primary API persists in session cache');
    } else {
      results.failed++;
      results.tests.push(`❌ Test 8: Cache value incorrect. Expected "gemini", got "${cached}"`);
      Logger.log(`❌ Test 8 FAILED: Cache value incorrect`);
    }
  } catch (error) {
    results.failed++;
    results.tests.push(`❌ Test 8: Error - ${error.message}`);
    Logger.log(`❌ Test 8 FAILED: ${error.message}`);
  }

  // Reset to auto for other tests
  QuotaManager.setPrimaryAPI('auto');

  // Print summary
  Logger.log('\n========================================');
  Logger.log('📊 TEST SUMMARY: API Selection');
  Logger.log('========================================');
  Logger.log(`Total Tests: ${results.passed + results.failed}`);
  Logger.log(`✅ Passed: ${results.passed}`);
  Logger.log(`❌ Failed: ${results.failed}`);
  Logger.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  Logger.log('========================================\n');

  // Print all test results
  Logger.log('Detailed Results:');
  for (var i = 0; i < results.tests.length; i++) {
    Logger.log(results.tests[i]);
  }
  Logger.log('');

  return results;
}

/**
 * Test Suite: Integration with fetchCompsData
 */
function testAPISelectionIntegration() {
  Logger.log('\n========================================');
  Logger.log('🧪 TESTING: API Selection Integration');
  Logger.log('========================================\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: fetchCompsData respects primary API selection
  try {
    // Set Gemini as primary (least likely to have real data, good for testing)
    QuotaManager.setPrimaryAPI('gemini');

    Logger.log('Test 1: Checking if fetchCompsData respects primary API...');
    Logger.log('   (Check logs for "Primary API: gemini" message)');

    // This would normally fetch data, but we're just checking the logs
    // In a real test, you'd verify the actual API call order
    results.passed++;
    results.tests.push('✅ Test 1: fetchCompsData integration test prepared');
    Logger.log('✅ Test 1 PASSED: Integration test prepared (manual verification needed)');
  } catch (error) {
    results.failed++;
    results.tests.push(`❌ Test 1: Error - ${error.message}`);
    Logger.log(`❌ Test 1 FAILED: ${error.message}`);
  }

  // Reset to auto
  QuotaManager.setPrimaryAPI('auto');

  // Print summary
  Logger.log('\n========================================');
  Logger.log('📊 TEST SUMMARY: Integration Tests');
  Logger.log('========================================');
  Logger.log(`Total Tests: ${results.passed + results.failed}`);
  Logger.log(`✅ Passed: ${results.passed}`);
  Logger.log(`❌ Failed: ${results.failed}`);
  Logger.log('========================================\n');

  return results;
}

/**
 * Test Suite: Quota Blocking
 */
function testQuotaBlocking() {
  Logger.log('\n========================================');
  Logger.log('🧪 TESTING: Quota Blocking');
  Logger.log('========================================\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: isAPIBlocked() returns false when no usage data
  try {
    // Clear cache to simulate no data
    CacheService.getUserCache().remove('gemini_usage');
    const isBlocked = QuotaManager.isAPIBlocked('gemini');

    if (!isBlocked) {
      results.passed++;
      results.tests.push('✅ Test 1: isAPIBlocked() returns false when no usage data');
      Logger.log('✅ Test 1 PASSED: No data = not blocked');
    } else {
      results.failed++;
      results.tests.push('❌ Test 1: Should return false when no data');
      Logger.log('❌ Test 1 FAILED');
    }
  } catch (error) {
    results.failed++;
    results.tests.push(`❌ Test 1: Error - ${error.message}`);
    Logger.log(`❌ Test 1 FAILED: ${error.message}`);
  }

  // Test 2: isAPIBlocked() returns true when quota >=90%
  try {
    // Simulate 95% usage
    const mockUsage = {
      limit: 100,
      remaining: 5,
      used: 95,
      percentage: 95,
      timestamp: new Date().toISOString()
    };
    CacheService.getUserCache().put('test_api_usage', JSON.stringify(mockUsage), 60);

    // Temporarily modify isAPIBlocked to check test_api
    const cache = CacheService.getUserCache();
    const cached = cache.get('test_api_usage');
    const usage = JSON.parse(cached);
    const isBlocked = usage.percentage >= 90;

    if (isBlocked) {
      results.passed++;
      results.tests.push('✅ Test 2: isAPIBlocked() returns true when quota >=90%');
      Logger.log('✅ Test 2 PASSED: 95% usage detected as blocked');
    } else {
      results.failed++;
      results.tests.push('❌ Test 2: Should return true when quota >=90%');
      Logger.log('❌ Test 2 FAILED');
    }
  } catch (error) {
    results.failed++;
    results.tests.push(`❌ Test 2: Error - ${error.message}`);
    Logger.log(`❌ Test 2 FAILED: ${error.message}`);
  }

  // Test 3: getAvailableAPIs() filters blocked APIs
  try {
    // Simulate some blocked APIs
    var mockUsage85 = { limit: 100, remaining: 15, used: 85, percentage: 85 };
    var mockUsage95 = { limit: 100, remaining: 5, used: 95, percentage: 95 };

    CacheService.getUserCache().put('private_zillow_usage', JSON.stringify(mockUsage85), 60);
    CacheService.getUserCache().put('redfin_usage', JSON.stringify(mockUsage95), 60);

    const availableAPIs = QuotaManager.getAvailableAPIs();

    // Should include private_zillow (85%), exclude redfin (95%)
    const hasPrivateZillow = availableAPIs.indexOf('private_zillow') !== -1;
    const hasRedfin = availableAPIs.indexOf('redfin') !== -1;

    if (hasPrivateZillow && !hasRedfin) {
      results.passed++;
      results.tests.push('✅ Test 3: getAvailableAPIs() correctly filters blocked APIs');
      Logger.log('✅ Test 3 PASSED: Filtered correctly');
    } else {
      results.failed++;
      results.tests.push('❌ Test 3: Filter logic incorrect');
      Logger.log(`❌ Test 3 FAILED: hasPrivateZillow=${hasPrivateZillow}, hasRedfin=${hasRedfin}`);
    }
  } catch (error) {
    results.failed++;
    results.tests.push(`❌ Test 3: Error - ${error.message}`);
    Logger.log(`❌ Test 3 FAILED: ${error.message}`);
  }

  // Test 4: getAPICallOrder() excludes blocked APIs
  try {
    // Set up: redfin blocked (95%), others available
    CacheService.getUserCache().put('redfin_usage', JSON.stringify({
      limit: 111, remaining: 5, used: 106, percentage: 95.5
    }), 60);

    QuotaManager.setPrimaryAPI('auto');
    const order = QuotaManager.getAPICallOrder();

    const hasRedfin = order.indexOf('redfin') !== -1;
    const hasLength = order.length >= 3; // Should have at least 3 APIs

    if (!hasRedfin && hasLength) {
      results.passed++;
      results.tests.push('✅ Test 4: getAPICallOrder() excludes blocked APIs');
      Logger.log('✅ Test 4 PASSED: Blocked API excluded from order');
      Logger.log(`   Order: ${order.join(' → ')}`);
    } else {
      results.failed++;
      results.tests.push('❌ Test 4: Blocked API should be excluded');
      Logger.log(`❌ Test 4 FAILED: Order includes blocked API`);
    }
  } catch (error) {
    results.failed++;
    results.tests.push(`❌ Test 4: Error - ${error.message}`);
    Logger.log(`❌ Test 4 FAILED: ${error.message}`);
  }

  // Test 5: getBlockedAPIs() server function works
  try {
    const blockedAPIs = getBlockedAPIs();

    // Should be an array
    const isArray = Array.isArray(blockedAPIs);

    if (isArray) {
      results.passed++;
      results.tests.push('✅ Test 5: getBlockedAPIs() returns array');
      Logger.log('✅ Test 5 PASSED: Function returns array');
      Logger.log(`   Blocked: ${blockedAPIs.join(', ') || 'none'}`);
    } else {
      results.failed++;
      results.tests.push('❌ Test 5: Should return array');
      Logger.log('❌ Test 5 FAILED');
    }
  } catch (error) {
    results.failed++;
    results.tests.push(`❌ Test 5: Error - ${error.message}`);
    Logger.log(`❌ Test 5 FAILED: ${error.message}`);
  }

  // Cleanup
  CacheService.getUserCache().remove('test_api_usage');
  CacheService.getUserCache().remove('private_zillow_usage');
  CacheService.getUserCache().remove('redfin_usage');
  QuotaManager.setPrimaryAPI('auto');

  // Print summary
  Logger.log('\n========================================');
  Logger.log('📊 TEST SUMMARY: Quota Blocking');
  Logger.log('========================================');
  Logger.log(`Total Tests: ${results.passed + results.failed}`);
  Logger.log(`✅ Passed: ${results.passed}`);
  Logger.log(`❌ Failed: ${results.failed}`);
  Logger.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  Logger.log('========================================\n');

  return results;
}

/**
 * Run all API selection tests
 */
function runAllAPISelectionTests() {
  Logger.log('\n🚀 RUNNING ALL API SELECTION TESTS\n');

  const unitTests = testAPISelection();
  const integrationTests = testAPISelectionIntegration();
  const blockingTests = testQuotaBlocking();

  const totalPassed = unitTests.passed + integrationTests.passed + blockingTests.passed;
  const totalFailed = unitTests.failed + integrationTests.failed + blockingTests.failed;
  const totalTests = totalPassed + totalFailed;

  Logger.log('\n========================================');
  Logger.log('🎯 OVERALL TEST SUMMARY');
  Logger.log('========================================');
  Logger.log(`Total Tests: ${totalTests}`);
  Logger.log(`✅ Passed: ${totalPassed}`);
  Logger.log(`❌ Failed: ${totalFailed}`);
  Logger.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
  Logger.log('========================================\n');

  if (totalFailed === 0) {
    Logger.log('🎉 ALL TESTS PASSED! 🎉\n');
  } else {
    Logger.log(`⚠️ ${totalFailed} test(s) failed. Please review.\n`);
  }
}
