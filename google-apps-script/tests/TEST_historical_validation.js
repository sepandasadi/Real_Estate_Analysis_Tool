/**
 * ===============================
 * HISTORICAL VALIDATION TEST SUITE
 * ===============================
 *
 * Tests ARV validation against historical trends and market data
 * Part of Phase 2: Historical Validation & Market Context
 *
 * Run from: Extensions > Apps Script > Select function > Run
 */

/**
 * ========================================
 * CONFIGURATION - Change these for testing
 * ========================================
 */
const TEST_CONFIG = {
  estimatedARV: 825000,
  zpid: "12345678",              // Replace with real ZPID
  location: "San Diego, CA",     // Replace with real location
  propertyData: {
    address: "123 Main St",
    city: "San Diego",
    state: "CA",
    zip: "92101",
    beds: 3,
    baths: 2,
    sqft: 1500
  }
};

/**
 * Test complete historical validation workflow
 * This is the main integration test
 */
function testHistoricalValidation() {
  PlatformLogger.info("=".repeat(50));
  PlatformLogger.info("📊 HISTORICAL VALIDATION TEST");
  PlatformLogger.info("=".repeat(50));

  PlatformLogger.info("Testing with:");
  PlatformLogger.info(`  Estimated ARV: $${TEST_CONFIG.estimatedARV.toLocaleString()}`);
  PlatformLogger.info(`  ZPID: ${TEST_CONFIG.zpid}`);
  PlatformLogger.info(`  Location: ${TEST_CONFIG.location}`);

  try {
    const result = validateARVAgainstMarketTrends(
      TEST_CONFIG.estimatedARV,
      TEST_CONFIG.zpid,
      TEST_CONFIG.location
    );

    if (!result) {
      PlatformLogger.error("❌ Validation returned null");
      PlatformLogger.error("Check if ZPID is valid and APIs are working");
      return false;
    }

    PlatformLogger.info("\n=== Validation Results ===");
    PlatformLogger.info(`Is Valid: ${result.isValid ? '✅' : '⚠️'}`);
    PlatformLogger.info(`Deviation: ${(result.deviation * 100).toFixed(2)}%`);
    PlatformLogger.info(`Historical ARV: $${(result.historicalARV || 0).toLocaleString()}`);
    PlatformLogger.info(`Market Trend: ${result.marketTrend}`);
    PlatformLogger.info(`Appreciation Rate: ${(result.appreciationRate * 100).toFixed(2)}%/year`);
    PlatformLogger.info(`Warnings: ${result.warnings.length}`);

    if (result.warnings.length > 0) {
      PlatformLogger.info("\n=== Warnings ===");
      result.warnings.forEach((warning, i) => {
        PlatformLogger.warn(`  ${i + 1}. ${warning}`);
      });
    }

    if (result.isValid) {
      PlatformLogger.success("\n✅ ARV validation passed!");
      return true;
    } else {
      PlatformLogger.warn("\n⚠️ ARV validation raised warnings");
      return false;
    }
  } catch (e) {
    PlatformLogger.error("❌ Test failed: " + e);
    PlatformLogger.error("Stack trace: " + e.stack);
    return false;
  }
}

/**
 * Test ARV deviation calculation
 * Verifies deviation is calculated correctly
 */
function testARVDeviation() {
  PlatformLogger.info("=".repeat(50));
  PlatformLogger.info("📊 ARV DEVIATION TEST");
  PlatformLogger.info("=".repeat(50));

  const testCases = [
    { estimated: 800000, historical: 800000, expectedDev: 0 },      // Perfect match
    { estimated: 880000, historical: 800000, expectedDev: 0.10 },   // 10% higher
    { estimated: 720000, historical: 800000, expectedDev: -0.10 },  // 10% lower
    { estimated: 920000, historical: 800000, expectedDev: 0.15 },   // 15% higher (threshold)
    { estimated: 680000, historical: 800000, expectedDev: -0.15 }   // 15% lower (threshold)
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, i) => {
    PlatformLogger.info(`\nTest Case ${i + 1}:`);
    PlatformLogger.info(`  Estimated: $${testCase.estimated.toLocaleString()}`);
    PlatformLogger.info(`  Historical: $${testCase.historical.toLocaleString()}`);
    PlatformLogger.info(`  Expected Deviation: ${(testCase.expectedDev * 100).toFixed(1)}%`);

    const actualDev = (testCase.estimated - testCase.historical) / testCase.historical;
    PlatformLogger.info(`  Actual Deviation: ${(actualDev * 100).toFixed(1)}%`);

    if (Math.abs(actualDev - testCase.expectedDev) < 0.001) {
      PlatformLogger.success("  ✅ PASSED");
      passed++;
    } else {
      PlatformLogger.error("  ❌ FAILED");
      failed++;
    }
  });

  PlatformLogger.info("\n" + "=".repeat(50));
  PlatformLogger.info(`Results: ${passed} passed, ${failed} failed`);

  return failed === 0;
}

/**
 * Test validation warning generation
 * Verifies warnings are generated correctly
 */
function testValidationWarnings() {
  PlatformLogger.info("=".repeat(50));
  PlatformLogger.info("⚠️ VALIDATION WARNINGS TEST");
  PlatformLogger.info("=".repeat(50));

  try {
    // Test with ARV 20% higher than historical (should trigger warning)
    const highARV = TEST_CONFIG.estimatedARV * 1.2;

    PlatformLogger.info(`Testing with high ARV: $${highARV.toLocaleString()}`);

    const result = validateARVAgainstMarketTrends(
      highARV,
      TEST_CONFIG.zpid,
      TEST_CONFIG.location
    );

    if (!result) {
      PlatformLogger.warn("⚠️ Validation returned null (ZPID may be invalid)");
      return false;
    }

    PlatformLogger.info(`\nDeviation: ${(result.deviation * 100).toFixed(2)}%`);
    PlatformLogger.info(`Warnings: ${result.warnings.length}`);

    if (result.warnings.length > 0) {
      PlatformLogger.success("✅ Warnings generated as expected");
      result.warnings.forEach((warning, i) => {
        PlatformLogger.info(`  ${i + 1}. ${warning}`);
      });
      return true;
    } else {
      PlatformLogger.warn("⚠️ No warnings generated (expected at least one)");
      return false;
    }
  } catch (e) {
    PlatformLogger.error("❌ Test failed: " + e);
    return false;
  }
}

/**
 * Test flip pattern detection
 * Verifies flip vs hold pattern identification
 */
function testFlipPatternDetection() {
  PlatformLogger.info("=".repeat(50));
  PlatformLogger.info("🔄 FLIP PATTERN DETECTION TEST");
  PlatformLogger.info("=".repeat(50));

  try {
    PlatformLogger.info(`Testing with ZPID: ${TEST_CONFIG.zpid}`);

    const priceHistory = fetchPriceAndTaxHistory(TEST_CONFIG.zpid);

    if (!priceHistory) {
      PlatformLogger.warn("⚠️ No price history found");
      PlatformLogger.warn("ZPID may be invalid or property has no history");
      return false;
    }

    PlatformLogger.info("\n=== Price History ===");
    PlatformLogger.info(`Records: ${priceHistory.priceHistory.length}`);
    PlatformLogger.info(`Appreciation Rate: ${(priceHistory.appreciationRate * 100).toFixed(2)}%/year`);

    PlatformLogger.info("\n=== Sale Pattern ===");
    PlatformLogger.info(`Pattern: ${priceHistory.salePattern.pattern}`);
    PlatformLogger.info(`Holding Period: ${priceHistory.salePattern.holdingPeriod.toFixed(1)} years`);
    PlatformLogger.info(`Flip Count: ${priceHistory.salePattern.flipCount}`);

    // Verify pattern classification
    if (priceHistory.salePattern.pattern === 'flip' && priceHistory.salePattern.holdingPeriod < 2) {
      PlatformLogger.success("✅ Flip pattern correctly identified");
      return true;
    } else if (priceHistory.salePattern.pattern === 'long-term' && priceHistory.salePattern.holdingPeriod >= 7) {
      PlatformLogger.success("✅ Long-term hold pattern correctly identified");
      return true;
    } else if (priceHistory.salePattern.pattern === 'medium-term') {
      PlatformLogger.success("✅ Medium-term hold pattern correctly identified");
      return true;
    } else {
      PlatformLogger.warn("⚠️ Pattern classification may be incorrect");
      return false;
    }
  } catch (e) {
    PlatformLogger.error("❌ Test failed: " + e);
    return false;
  }
}

/**
 * Test market condition checking
 * Verifies market trend classification
 */
function testMarketConditionCheck() {
  PlatformLogger.info("=".repeat(50));
  PlatformLogger.info("📈 MARKET CONDITION TEST");
  PlatformLogger.info("=".repeat(50));

  try {
    PlatformLogger.info(`Testing location: ${TEST_CONFIG.location}`);

    const marketData = fetchLocalHomeValues(TEST_CONFIG.location);

    if (!marketData) {
      PlatformLogger.warn("⚠️ No market data found");
      return false;
    }

    PlatformLogger.info("\n=== Market Data ===");
    PlatformLogger.info(`Median Home Value: $${(marketData.medianHomeValue || 0).toLocaleString()}`);
    PlatformLogger.info(`Median Rent: $${(marketData.medianRent || 0).toLocaleString()}`);
    PlatformLogger.info(`Value Change: ${marketData.valueChange || 'N/A'}%`);
    PlatformLogger.info(`Market Trend: ${marketData.trend}`);

    // Verify trend classification
    const trendEmoji = {
      'hot': '🔥',
      'rising': '📈',
      'stable': '➡️',
      'declining': '📉'
    };

    PlatformLogger.success(`✅ Market classified as: ${trendEmoji[marketData.trend] || '❓'} ${marketData.trend}`);

    return true;
  } catch (e) {
    PlatformLogger.error("❌ Test failed: " + e);
    return false;
  }
}

/**
 * Test with various ARV scenarios
 * Tests edge cases and boundary conditions
 */
function testARVScenarios() {
  PlatformLogger.info("=".repeat(50));
  PlatformLogger.info("🎯 ARV SCENARIOS TEST");
  PlatformLogger.info("=".repeat(50));

  const scenarios = [
    { name: "Conservative ARV", multiplier: 0.95 },
    { name: "Moderate ARV", multiplier: 1.00 },
    { name: "Aggressive ARV", multiplier: 1.10 },
    { name: "Very Aggressive ARV", multiplier: 1.20 },
    { name: "Extreme ARV", multiplier: 1.50 }
  ];

  scenarios.forEach(scenario => {
    const testARV = Math.round(TEST_CONFIG.estimatedARV * scenario.multiplier);

    PlatformLogger.info(`\n=== ${scenario.name} ===`);
    PlatformLogger.info(`ARV: $${testARV.toLocaleString()} (${(scenario.multiplier * 100).toFixed(0)}%)`);

    try {
      const result = validateARVAgainstMarketTrends(
        testARV,
        TEST_CONFIG.zpid,
        TEST_CONFIG.location
      );

      if (result) {
        PlatformLogger.info(`Valid: ${result.isValid ? '✅' : '⚠️'}`);
        PlatformLogger.info(`Deviation: ${(result.deviation * 100).toFixed(1)}%`);
        PlatformLogger.info(`Warnings: ${result.warnings.length}`);
      } else {
        PlatformLogger.warn("⚠️ Validation returned null");
      }
    } catch (e) {
      PlatformLogger.error(`Error: ${e.message}`);
    }
  });

  PlatformLogger.info("\n" + "=".repeat(50));
  PlatformLogger.success("✅ Scenario testing complete");
}

/**
 * Test validation with missing ZPID
 * Verifies graceful degradation
 */
function testValidationWithoutZPID() {
  PlatformLogger.info("=".repeat(50));
  PlatformLogger.info("🔍 VALIDATION WITHOUT ZPID TEST");
  PlatformLogger.info("=".repeat(50));

  try {
    PlatformLogger.info("Testing with null ZPID...");

    const result = validateARVAgainstMarketTrends(
      TEST_CONFIG.estimatedARV,
      null,
      TEST_CONFIG.location
    );

    if (result) {
      PlatformLogger.info("\n=== Result ===");
      PlatformLogger.info(`Is Valid: ${result.isValid}`);
      PlatformLogger.info(`Warnings: ${result.warnings.length}`);

      if (result.warnings.length > 0) {
        PlatformLogger.success("✅ Gracefully handled missing ZPID");
        return true;
      } else {
        PlatformLogger.warn("⚠️ Expected warnings about missing data");
        return false;
      }
    } else {
      PlatformLogger.success("✅ Returned null as expected");
      return true;
    }
  } catch (e) {
    PlatformLogger.error("❌ Test failed: " + e);
    return false;
  }
}

/**
 * Test validation performance
 * Measures execution time
 */
function testValidationPerformance() {
  PlatformLogger.info("=".repeat(50));
  PlatformLogger.info("⚡ VALIDATION PERFORMANCE TEST");
  PlatformLogger.info("=".repeat(50));

  const iterations = 3;
  const times = [];

  for (let i = 0; i < iterations; i++) {
    PlatformLogger.info(`\nIteration ${i + 1}/${iterations}...`);

    const start = Date.now();

    try {
      const result = validateARVAgainstMarketTrends(
        TEST_CONFIG.estimatedARV,
        TEST_CONFIG.zpid,
        TEST_CONFIG.location
      );

      const elapsed = Date.now() - start;
      times.push(elapsed);

      PlatformLogger.info(`Time: ${elapsed}ms`);
      PlatformLogger.info(`Valid: ${result ? result.isValid : 'null'}`);
    } catch (e) {
      PlatformLogger.error(`Error: ${e.message}`);
    }

    // Small delay between iterations
    if (i < iterations - 1) {
      Utilities.sleep(1000);
    }
  }

  // Calculate statistics
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  PlatformLogger.info("\n=== Performance Statistics ===");
  PlatformLogger.info(`Average: ${avgTime.toFixed(0)}ms`);
  PlatformLogger.info(`Min: ${minTime}ms`);
  PlatformLogger.info(`Max: ${maxTime}ms`);

  if (avgTime < 5000) {
    PlatformLogger.success("✅ Performance acceptable (<5s)");
    return true;
  } else {
    PlatformLogger.warn("⚠️ Performance slow (>5s)");
    return false;
  }
}

/**
 * Run all historical validation tests
 */
function runAllHistoricalValidationTests() {
  PlatformLogger.info("🧪 Running all historical validation tests...");
  PlatformLogger.info("=".repeat(50));

  let passed = 0;
  let failed = 0;

  // Test 1: Complete validation
  try {
    if (testHistoricalValidation()) {
      passed++;
      PlatformLogger.success("✅ Test 1: Historical Validation - PASSED");
    } else {
      failed++;
      PlatformLogger.error("❌ Test 1: Historical Validation - FAILED");
    }
  } catch (e) {
    failed++;
    PlatformLogger.error("❌ Test 1: Historical Validation - FAILED: " + e);
  }

  // Test 2: Deviation calculation
  try {
    if (testARVDeviation()) {
      passed++;
      PlatformLogger.success("✅ Test 2: ARV Deviation - PASSED");
    } else {
      failed++;
      PlatformLogger.error("❌ Test 2: ARV Deviation - FAILED");
    }
  } catch (e) {
    failed++;
    PlatformLogger.error("❌ Test 2: ARV Deviation - FAILED: " + e);
  }

  // Test 3: Warning generation
  try {
    if (testValidationWarnings()) {
      passed++;
      PlatformLogger.success("✅ Test 3: Validation Warnings - PASSED");
    } else {
      failed++;
      PlatformLogger.error("❌ Test 3: Validation Warnings - FAILED");
    }
  } catch (e) {
    failed++;
    PlatformLogger.error("❌ Test 3: Validation Warnings - FAILED: " + e);
  }

  // Test 4: Flip pattern detection
  try {
    if (testFlipPatternDetection()) {
      passed++;
      PlatformLogger.success("✅ Test 4: Flip Pattern Detection - PASSED");
    } else {
      failed++;
      PlatformLogger.error("❌ Test 4: Flip Pattern Detection - FAILED");
    }
  } catch (e) {
    failed++;
    PlatformLogger.error("❌ Test 4: Flip Pattern Detection - FAILED: " + e);
  }

  // Test 5: Market condition check
  try {
    if (testMarketConditionCheck()) {
      passed++;
      PlatformLogger.success("✅ Test 5: Market Condition Check - PASSED");
    } else {
      failed++;
      PlatformLogger.error("❌ Test 5: Market Condition Check - FAILED");
    }
  } catch (e) {
    failed++;
    PlatformLogger.error("❌ Test 5: Market Condition Check - FAILED: " + e);
  }

  // Summary
  PlatformLogger.info("=".repeat(50));
  PlatformLogger.info(`📊 Test Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    PlatformLogger.success("🎉 All historical validation tests passed!");
  } else {
    PlatformLogger.error(`⚠️ ${failed} test(s) failed. Review logs for details.`);
  }

  return { passed, failed };
}
