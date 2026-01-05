/**
 * ===============================
 * MASTER TEST RUNNER
 * ===============================
 *
 * Central test runner for all test suites
 * Run specific test suites or all tests at once
 *
 * Run from: Extensions > Apps Script > Select function > Run
 */

/**
 * Run all tests across all test suites
 * This is the master test function
 */
function runAllTests() {
  PlatformLogger.info("🧪 RUNNING ALL TESTS");
  PlatformLogger.info("=".repeat(70));
  PlatformLogger.info("This will run tests from all test suites:");
  PlatformLogger.info("  - Adapters & Migration");
  PlatformLogger.info("  - API Priority & Multi-Source ARV");
  PlatformLogger.info("  - ZPID Lookup");
  PlatformLogger.info("  - Historical Validation");
  PlatformLogger.info("=".repeat(70));

  const results = {
    adapters: { passed: 0, failed: 0 },
    migration: { passed: 0, failed: 0 },
    apiPriority: { passed: 0, failed: 0 },
    zpid: { passed: 0, failed: 0 },
    historicalValidation: { passed: 0, failed: 0 }
  };

  // Run Adapter Tests
  try {
    PlatformLogger.info("\n📦 RUNNING ADAPTER TESTS...");
    results.adapters = runAllAdapterTests();
  } catch (e) {
    PlatformLogger.error("❌ Adapter tests failed: " + e);
  }

  // Run Migration Tests
  try {
    PlatformLogger.info("\n🔄 RUNNING MIGRATION TESTS...");
    results.migration = runAllMigrationTests();
  } catch (e) {
    PlatformLogger.error("❌ Migration tests failed: " + e);
  }

  // Run API Priority Tests
  try {
    PlatformLogger.info("\n🔑 RUNNING API PRIORITY TESTS...");
    results.apiPriority = runAllPhase1Tests();
  } catch (e) {
    PlatformLogger.error("❌ API Priority tests failed: " + e);
  }

  // Run ZPID Tests
  try {
    PlatformLogger.info("\n🏠 RUNNING ZPID LOOKUP TESTS...");
    results.zpid = runAllZPIDTests();
  } catch (e) {
    PlatformLogger.error("❌ ZPID tests failed: " + e);
  }

  // Run Historical Validation Tests
  try {
    PlatformLogger.info("\n📊 RUNNING HISTORICAL VALIDATION TESTS...");
    results.historicalValidation = runAllHistoricalValidationTests();
  } catch (e) {
    PlatformLogger.error("❌ Historical Validation tests failed: " + e);
  }

  // Calculate totals
  const totalPassed = Object.values(results).reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0);
  const totalTests = totalPassed + totalFailed;

  // Display summary
  PlatformLogger.info("\n" + "=".repeat(70));
  PlatformLogger.info("📊 FINAL TEST SUMMARY");
  PlatformLogger.info("=".repeat(70));

  PlatformLogger.info("\nResults by Test Suite:");
  PlatformLogger.info(`  Adapters:              ${results.adapters.passed} passed, ${results.adapters.failed} failed`);
  PlatformLogger.info(`  Migration:             ${results.migration.passed} passed, ${results.migration.failed} failed`);
  PlatformLogger.info(`  API Priority:          ${results.apiPriority.passed} passed, ${results.apiPriority.failed} failed`);
  PlatformLogger.info(`  ZPID Lookup:           ${results.zpid.passed} passed, ${results.zpid.failed} failed`);
  PlatformLogger.info(`  Historical Validation: ${results.historicalValidation.passed} passed, ${results.historicalValidation.failed} failed`);

  PlatformLogger.info("\n" + "=".repeat(70));
  PlatformLogger.info(`TOTAL: ${totalPassed}/${totalTests} tests passed (${((totalPassed / totalTests) * 100).toFixed(1)}%)`);
  PlatformLogger.info("=".repeat(70));

  if (totalFailed === 0) {
    PlatformLogger.success("\n🎉 ALL TESTS PASSED! 🎉");
  } else {
    PlatformLogger.error(`\n⚠️ ${totalFailed} TEST(S) FAILED`);
    PlatformLogger.error("Review logs above for details");
  }

  return results;
}

/**
 * Run core infrastructure tests
 * Adapters + Migration
 */
function runCoreTests() {
  PlatformLogger.info("🧪 RUNNING CORE INFRASTRUCTURE TESTS");
  PlatformLogger.info("=".repeat(70));

  const results = {
    adapters: { passed: 0, failed: 0 },
    migration: { passed: 0, failed: 0 }
  };

  // Run Adapter Tests
  try {
    PlatformLogger.info("\n📦 RUNNING ADAPTER TESTS...");
    results.adapters = runAllAdapterTests();
  } catch (e) {
    PlatformLogger.error("❌ Adapter tests failed: " + e);
  }

  // Run Migration Tests
  try {
    PlatformLogger.info("\n🔄 RUNNING MIGRATION TESTS...");
    results.migration = runAllMigrationTests();
  } catch (e) {
    PlatformLogger.error("❌ Migration tests failed: " + e);
  }

  // Summary
  const totalPassed = results.adapters.passed + results.migration.passed;
  const totalFailed = results.adapters.failed + results.migration.failed;

  PlatformLogger.info("\n" + "=".repeat(70));
  PlatformLogger.info(`CORE TESTS: ${totalPassed} passed, ${totalFailed} failed`);
  PlatformLogger.info("=".repeat(70));

  return results;
}

/**
 * Run API-related tests
 * API Priority + ZPID Lookup
 */
function runAPITests() {
  PlatformLogger.info("🧪 RUNNING API TESTS");
  PlatformLogger.info("=".repeat(70));

  const results = {
    apiPriority: { passed: 0, failed: 0 },
    zpid: { passed: 0, failed: 0 }
  };

  // Run API Priority Tests
  try {
    PlatformLogger.info("\n🔑 RUNNING API PRIORITY TESTS...");
    results.apiPriority = runAllPhase1Tests();
  } catch (e) {
    PlatformLogger.error("❌ API Priority tests failed: " + e);
  }

  // Run ZPID Tests
  try {
    PlatformLogger.info("\n🏠 RUNNING ZPID LOOKUP TESTS...");
    results.zpid = runAllZPIDTests();
  } catch (e) {
    PlatformLogger.error("❌ ZPID tests failed: " + e);
  }

  // Summary
  const totalPassed = results.apiPriority.passed + results.zpid.passed;
  const totalFailed = results.apiPriority.failed + results.zpid.failed;

  PlatformLogger.info("\n" + "=".repeat(70));
  PlatformLogger.info(`API TESTS: ${totalPassed} passed, ${totalFailed} failed`);
  PlatformLogger.info("=".repeat(70));

  return results;
}

/**
 * Run ARV-related tests
 * Historical Validation
 */
function runARVTests() {
  PlatformLogger.info("🧪 RUNNING ARV TESTS");
  PlatformLogger.info("=".repeat(70));

  const results = {
    historicalValidation: { passed: 0, failed: 0 }
  };

  // Run Historical Validation Tests
  try {
    PlatformLogger.info("\n📊 RUNNING HISTORICAL VALIDATION TESTS...");
    results.historicalValidation = runAllHistoricalValidationTests();
  } catch (e) {
    PlatformLogger.error("❌ Historical Validation tests failed: " + e);
  }

  // Summary
  const totalPassed = results.historicalValidation.passed;
  const totalFailed = results.historicalValidation.failed;

  PlatformLogger.info("\n" + "=".repeat(70));
  PlatformLogger.info(`ARV TESTS: ${totalPassed} passed, ${totalFailed} failed`);
  PlatformLogger.info("=".repeat(70));

  return results;
}

/**
 * Quick diagnostic test
 * Fast health check of critical functionality
 */
function runQuickDiagnostic() {
  PlatformLogger.info("🚀 RUNNING QUICK DIAGNOSTIC");
  PlatformLogger.info("=".repeat(70));
  PlatformLogger.info("This is a fast health check of critical functionality");
  PlatformLogger.info("=".repeat(70));

  let passed = 0;
  let failed = 0;

  // Test 1: Adapters available
  try {
    PlatformLogger.info("\n1. Checking adapters...");
    if (typeof HttpClient !== 'undefined' &&
        typeof CacheManager !== 'undefined' &&
        typeof QuotaManager !== 'undefined' &&
        typeof PlatformLogger !== 'undefined') {
      PlatformLogger.success("✅ All adapters available");
      passed++;
    } else {
      PlatformLogger.error("❌ Some adapters missing");
      failed++;
    }
  } catch (e) {
    PlatformLogger.error("❌ Adapter check failed: " + e);
    failed++;
  }

  // Test 2: API keys configured
  try {
    PlatformLogger.info("\n2. Checking API keys...");
    const keys = getApiKeys();
    if (keys.RAPIDAPI_KEY) {
      PlatformLogger.success("✅ RAPIDAPI_KEY configured");
      passed++;
    } else {
      PlatformLogger.error("❌ RAPIDAPI_KEY not found");
      failed++;
    }
  } catch (e) {
    PlatformLogger.error("❌ API key check failed: " + e);
    failed++;
  }

  // Test 3: Quota available
  try {
    PlatformLogger.info("\n3. Checking API quota...");
    const zillowAvailable = checkQuotaAvailable('zillow', 'month');
    const usRealEstateAvailable = checkQuotaAvailable('us_real_estate', 'month');

    if (zillowAvailable || usRealEstateAvailable) {
      PlatformLogger.success("✅ API quota available");
      passed++;
    } else {
      PlatformLogger.warn("⚠️ All API quotas exceeded");
      failed++;
    }
  } catch (e) {
    PlatformLogger.error("❌ Quota check failed: " + e);
    failed++;
  }

  // Test 4: Core functions exist
  try {
    PlatformLogger.info("\n4. Checking core functions...");
    const functionsExist =
      typeof fetchPropertyDetails === 'function' &&
      typeof fetchCompsData === 'function' &&
      typeof validateARVAgainstMarketTrends === 'function';

    if (functionsExist) {
      PlatformLogger.success("✅ Core functions available");
      passed++;
    } else {
      PlatformLogger.error("❌ Some core functions missing");
      failed++;
    }
  } catch (e) {
    PlatformLogger.error("❌ Function check failed: " + e);
    failed++;
  }

  // Test 5: Cache working
  try {
    PlatformLogger.info("\n5. Checking cache...");
    const testKey = 'diagnostic_test';
    const testData = { test: 'data' };

    CacheManager.set(testKey, testData, 60);
    const retrieved = CacheManager.get(testKey);

    if (retrieved && retrieved.test === 'data') {
      PlatformLogger.success("✅ Cache working");
      CacheManager.remove(testKey);
      passed++;
    } else {
      PlatformLogger.error("❌ Cache not working");
      failed++;
    }
  } catch (e) {
    PlatformLogger.error("❌ Cache check failed: " + e);
    failed++;
  }

  // Summary
  PlatformLogger.info("\n" + "=".repeat(70));
  PlatformLogger.info(`DIAGNOSTIC: ${passed}/5 checks passed`);
  PlatformLogger.info("=".repeat(70));

  if (failed === 0) {
    PlatformLogger.success("\n✅ SYSTEM HEALTHY - All checks passed!");
  } else {
    PlatformLogger.error(`\n⚠️ ${failed} CHECK(S) FAILED - Review logs above`);
  }

  return { passed, failed };
}

/**
 * Run specific test by name
 * Useful for debugging individual tests
 */
function runSpecificTest(testName) {
  PlatformLogger.info(`🧪 RUNNING SPECIFIC TEST: ${testName}`);
  PlatformLogger.info("=".repeat(70));

  try {
    // Check if function exists
    if (typeof this[testName] !== 'function') {
      PlatformLogger.error(`❌ Test function '${testName}' not found`);
      PlatformLogger.info("\nAvailable tests:");
      PlatformLogger.info("  - testZPIDLookup");
      PlatformLogger.info("  - testHistoricalValidation");
      PlatformLogger.info("  - testARVDeviation");
      PlatformLogger.info("  - testValidationWarnings");
      PlatformLogger.info("  - testFlipPatternDetection");
      PlatformLogger.info("  - testMarketConditionCheck");
      PlatformLogger.info("  - debugZPIDIssue");
      return false;
    }

    // Run the test
    const result = this[testName]();

    if (result) {
      PlatformLogger.success(`\n✅ Test '${testName}' PASSED`);
    } else {
      PlatformLogger.error(`\n❌ Test '${testName}' FAILED`);
    }

    return result;
  } catch (e) {
    PlatformLogger.error(`❌ Test '${testName}' threw error: ${e}`);
    PlatformLogger.error("Stack trace: " + e.stack);
    return false;
  }
}

/**
 * Display test menu
 * Shows available test options
 */
function showTestMenu() {
  const menu = `
📋 TEST RUNNER MENU

🎯 MASTER TEST FUNCTIONS:
   runAllTests()                    - Run ALL tests (comprehensive)
   runQuickDiagnostic()             - Fast health check (5 tests)

📦 TEST SUITES:
   runCoreTests()                   - Adapters + Migration
   runAPITests()                    - API Priority + ZPID Lookup
   runARVTests()                    - Historical Validation

🔍 INDIVIDUAL TEST SUITES:
   runAllAdapterTests()             - TEST_adapters.js
   runAllMigrationTests()           - TEST_migration.js
   runAllPhase1Tests()              - TEST_api_priority.js
   runAllZPIDTests()                - TEST_zpid_lookup.js
   runAllHistoricalValidationTests() - TEST_historical_validation.js

🐛 DEBUG FUNCTIONS:
   debugZPIDIssue()                 - Step-by-step ZPID debug
   testZPIDLookup()                 - Test ZPID lookup
   testHistoricalValidation()       - Test ARV validation

💡 USAGE:
   1. Select a function from the dropdown menu
   2. Click Run
   3. Check logs (View → Logs or Ctrl+Enter)

📝 CONFIGURATION:
   - Edit TEST_PROPERTY in TEST_zpid_lookup.js
   - Edit TEST_CONFIG in TEST_historical_validation.js
  `;

  PlatformLogger.info(menu);
  SpreadsheetApp.getUi().alert('Test Runner Menu', menu, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Display current test status
 * Shows which tests are passing/failing
 */
function showTestStatus() {
  PlatformLogger.info("📊 CURRENT TEST STATUS");
  PlatformLogger.info("=".repeat(70));

  // Run quick diagnostic
  const diagnostic = runQuickDiagnostic();

  // Show API usage
  PlatformLogger.info("\n📈 API USAGE:");
  showAPIUsage();

  // Show recommendations
  PlatformLogger.info("\n💡 RECOMMENDATIONS:");

  if (diagnostic.failed > 0) {
    PlatformLogger.warn("⚠️ Some checks failed. Run runQuickDiagnostic() for details.");
  } else {
    PlatformLogger.success("✅ All systems operational!");
  }

  PlatformLogger.info("\nNext steps:");
  PlatformLogger.info("  1. Run runAllTests() for comprehensive testing");
  PlatformLogger.info("  2. Run debugZPIDIssue() if ZPID lookup failing");
  PlatformLogger.info("  3. Run testHistoricalValidation() to test Phase 2");
}

/**
 * Helper function to run a test suite safely
 */
function runTestSuiteSafely(suiteName, testFunction) {
  try {
    PlatformLogger.info(`\n🧪 Running ${suiteName}...`);
    const result = testFunction();
    PlatformLogger.success(`✅ ${suiteName} complete: ${result.passed} passed, ${result.failed} failed`);
    return result;
  } catch (e) {
    PlatformLogger.error(`❌ ${suiteName} failed: ${e}`);
    return { passed: 0, failed: 1 };
  }
}
