/**
 * ===============================
 * ZPID LOOKUP TEST SUITE
 * ===============================
 *
 * Tests property details fetching and ZPID retrieval
 * CRITICAL: This is where the "ZPID not found" issue is happening
 *
 * Run from: Extensions > Apps Script > Select function > Run
 */

/**
 * ========================================
 * CONFIGURATION - Change these for testing
 * ========================================
 */
const TEST_PROPERTY = {
  address: "123 Main St",        // Replace with real address
  city: "San Diego",             // Replace with real city
  state: "CA",                   // Replace with real state
  zip: "92101"                   // Replace with real zip
};

/**
 * Test ZPID lookup with configured property
 * This is the main test to debug your issue
 */
function testZPIDLookup() {
  PlatformLogger.info("=".repeat(50));
  PlatformLogger.info("🔍 ZPID LOOKUP TEST");
  PlatformLogger.info("=".repeat(50));

  PlatformLogger.info("Testing property:");
  PlatformLogger.info(`  Address: ${TEST_PROPERTY.address}`);
  PlatformLogger.info(`  City: ${TEST_PROPERTY.city}`);
  PlatformLogger.info(`  State: ${TEST_PROPERTY.state}`);
  PlatformLogger.info(`  Zip: ${TEST_PROPERTY.zip}`);

  try {
    const result = fetchPropertyDetails(TEST_PROPERTY);

    PlatformLogger.info("\n=== Property Details Result ===");
    PlatformLogger.info(`Beds: ${result.beds}`);
    PlatformLogger.info(`Baths: ${result.baths}`);
    PlatformLogger.info(`Sqft: ${result.sqft}`);
    PlatformLogger.info(`Year Built: ${result.yearBuilt || 'N/A'}`);
    PlatformLogger.info(`Property Type: ${result.propertyType}`);
    PlatformLogger.info(`ZPID: ${result.zpid || '❌ NOT FOUND'}`);

    if (!result.zpid) {
      PlatformLogger.warn("\n⚠️ ZPID NOT FOUND - Historical validation will be skipped");
      PlatformLogger.warn("This could be because:");
      PlatformLogger.warn("  1. Property not in Zillow database");
      PlatformLogger.warn("  2. Address format doesn't match exactly");
      PlatformLogger.warn("  3. API quota exhausted");
      PlatformLogger.warn("  4. API error occurred");
      PlatformLogger.warn("\n💡 Try:");
      PlatformLogger.warn("  - Run testZPIDWithVariousFormats() to try different formats");
      PlatformLogger.warn("  - Check API quota with showAPIUsage()");
      PlatformLogger.warn("  - Verify address exists on Zillow.com");
      return false;
    } else {
      PlatformLogger.success("\n✅ ZPID FOUND: " + result.zpid);
      PlatformLogger.success("Historical validation will work!");
      return true;
    }
  } catch (e) {
    PlatformLogger.error("❌ Test failed: " + e);
    PlatformLogger.error("Stack trace: " + e.stack);
    return false;
  }
}

/**
 * Test ZPID lookup with various address formats
 * Helps identify if address format is the issue
 */
function testZPIDWithVariousFormats() {
  PlatformLogger.info("=".repeat(50));
  PlatformLogger.info("🔍 TESTING VARIOUS ADDRESS FORMATS");
  PlatformLogger.info("=".repeat(50));

  const baseAddress = TEST_PROPERTY.address;
  const city = TEST_PROPERTY.city;
  const state = TEST_PROPERTY.state;
  const zip = TEST_PROPERTY.zip;

  // Try different address formats
  const formats = [
    baseAddress,                                    // Original
    baseAddress.replace(/\./g, ''),                // Remove periods
    baseAddress.replace(/\bSt\b/g, 'Street'),      // Expand abbreviations
    baseAddress.replace(/\bAve\b/g, 'Avenue'),
    baseAddress.replace(/\bDr\b/g, 'Drive'),
    baseAddress.replace(/\bRd\b/g, 'Road'),
    baseAddress.toUpperCase(),                      // All caps
    baseAddress.toLowerCase()                       // All lowercase
  ];

  let foundZPID = null;

  for (let i = 0; i < formats.length; i++) {
    const testData = {
      address: formats[i],
      city: city,
      state: state,
      zip: zip
    };

    PlatformLogger.info(`\nTrying format ${i + 1}: "${formats[i]}"`);

    try {
      const result = fetchPropertyDetails(testData);

      if (result.zpid) {
        PlatformLogger.success(`✅ ZPID FOUND: ${result.zpid}`);
        foundZPID = result.zpid;
        PlatformLogger.success(`Working format: "${formats[i]}"`);
        break;
      } else {
        PlatformLogger.warn("❌ No ZPID");
      }
    } catch (e) {
      PlatformLogger.error(`Error: ${e.message}`);
    }

    // Small delay to avoid rate limiting
    Utilities.sleep(500);
  }

  if (foundZPID) {
    PlatformLogger.success("\n🎉 Found working address format!");
    PlatformLogger.success(`Use this format: "${formats[formats.indexOf(foundZPID)]}"`);
    return foundZPID;
  } else {
    PlatformLogger.error("\n❌ No working format found");
    PlatformLogger.error("Property may not be in Zillow database");
    return null;
  }
}

/**
 * Test ZPID error handling
 * Verifies graceful degradation when ZPID not found
 */
function testZPIDErrorHandling() {
  PlatformLogger.info("=".repeat(50));
  PlatformLogger.info("🔍 TESTING ZPID ERROR HANDLING");
  PlatformLogger.info("=".repeat(50));

  try {
    // Test with invalid address
    const invalidData = {
      address: "999999 Nonexistent St",
      city: "Nowhere",
      state: "XX",
      zip: "00000"
    };

    PlatformLogger.info("Testing with invalid address...");
    const result = fetchPropertyDetails(invalidData);

    if (!result.zpid) {
      PlatformLogger.success("✅ Gracefully handled missing ZPID");
      PlatformLogger.success("Returned default values:");
      PlatformLogger.info(`  Beds: ${result.beds}`);
      PlatformLogger.info(`  Baths: ${result.baths}`);
      PlatformLogger.info(`  Sqft: ${result.sqft}`);
      return true;
    } else {
      PlatformLogger.warn("⚠️ Unexpectedly found ZPID for invalid address");
      return false;
    }
  } catch (e) {
    PlatformLogger.error("❌ Error handling test failed: " + e);
    return false;
  }
}

/**
 * Test ZPID caching
 * Verifies ZPID is cached for performance
 */
function testZPIDCaching() {
  PlatformLogger.info("=".repeat(50));
  PlatformLogger.info("🔍 TESTING ZPID CACHING");
  PlatformLogger.info("=".repeat(50));

  try {
    // First call - should fetch from API
    PlatformLogger.info("First call (should fetch from API)...");
    const start1 = Date.now();
    const result1 = fetchPropertyDetails(TEST_PROPERTY);
    const time1 = Date.now() - start1;
    PlatformLogger.info(`Time: ${time1}ms`);
    PlatformLogger.info(`ZPID: ${result1.zpid || 'N/A'}`);

    // Second call - should use cache
    PlatformLogger.info("\nSecond call (should use cache)...");
    const start2 = Date.now();
    const result2 = fetchPropertyDetails(TEST_PROPERTY);
    const time2 = Date.now() - start2;
    PlatformLogger.info(`Time: ${time2}ms`);
    PlatformLogger.info(`ZPID: ${result2.zpid || 'N/A'}`);

    // Verify results match
    if (result1.zpid === result2.zpid) {
      PlatformLogger.success("\n✅ Results match");

      if (time2 < time1) {
        PlatformLogger.success("✅ Second call was faster (cache working)");
        return true;
      } else {
        PlatformLogger.warn("⚠️ Second call not faster (cache may not be working)");
        return false;
      }
    } else {
      PlatformLogger.error("❌ Results don't match");
      return false;
    }
  } catch (e) {
    PlatformLogger.error("❌ Caching test failed: " + e);
    return false;
  }
}

/**
 * Debug ZPID issue step-by-step
 * Comprehensive debugging function
 */
function debugZPIDIssue() {
  PlatformLogger.info("=".repeat(50));
  PlatformLogger.info("🔍 ZPID ISSUE DEBUG - STEP BY STEP");
  PlatformLogger.info("=".repeat(50));

  // Step 1: Check API keys
  PlatformLogger.info("\nStep 1: Checking API keys...");
  try {
    const keys = getApiKeys();
    if (keys.RAPIDAPI_KEY) {
      PlatformLogger.success("✅ RAPIDAPI_KEY found");
    } else {
      PlatformLogger.error("❌ RAPIDAPI_KEY not found");
      PlatformLogger.error("Add RAPIDAPI_KEY to Script Properties");
      return;
    }
  } catch (e) {
    PlatformLogger.error("❌ Error getting API keys: " + e);
    return;
  }

  // Step 2: Check quota
  PlatformLogger.info("\nStep 2: Checking API quota...");
  try {
    const available = checkQuotaAvailable('zillow', 'month');
    if (available) {
      PlatformLogger.success("✅ Zillow quota available");
    } else {
      PlatformLogger.error("❌ Zillow quota exceeded");
      PlatformLogger.error("Wait for quota reset or use different API");
      return;
    }
  } catch (e) {
    PlatformLogger.error("❌ Error checking quota: " + e);
  }

  // Step 3: Test property lookup
  PlatformLogger.info("\nStep 3: Testing property lookup...");
  try {
    const result = fetchPropertyDetails(TEST_PROPERTY);

    PlatformLogger.info("Property details:");
    PlatformLogger.info(`  Beds: ${result.beds}`);
    PlatformLogger.info(`  Baths: ${result.baths}`);
    PlatformLogger.info(`  Sqft: ${result.sqft}`);
    PlatformLogger.info(`  ZPID: ${result.zpid || '❌ NOT FOUND'}`);

    if (!result.zpid) {
      PlatformLogger.warn("\n⚠️ ZPID not found");

      // Step 4: Try different formats
      PlatformLogger.info("\nStep 4: Trying different address formats...");
      testZPIDWithVariousFormats();
    } else {
      PlatformLogger.success("\n✅ ZPID found: " + result.zpid);

      // Step 5: Test historical validation
      PlatformLogger.info("\nStep 5: Testing historical validation...");
      const validation = validateARVAgainstMarketTrends(
        825000,
        result.zpid,
        `${TEST_PROPERTY.city}, ${TEST_PROPERTY.state}`
      );

      if (validation) {
        PlatformLogger.success("✅ Historical validation working");
        PlatformLogger.info(`  Valid: ${validation.isValid}`);
        PlatformLogger.info(`  Warnings: ${validation.warnings.length}`);
      } else {
        PlatformLogger.warn("⚠️ Historical validation returned null");
      }
    }
  } catch (e) {
    PlatformLogger.error("❌ Property lookup failed: " + e);
    PlatformLogger.error("Stack trace: " + e.stack);
  }

  PlatformLogger.info("\n" + "=".repeat(50));
  PlatformLogger.info("🔍 DEBUG COMPLETE");
  PlatformLogger.info("=".repeat(50));
}

/**
 * Test with real property (uses API quota)
 * WARNING: This makes real API calls
 */
function testRealPropertyZPID() {
  PlatformLogger.warn("⚠️ This test will make REAL API calls and use quota!");

  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Real API Test',
    'This will make real API calls and use your quota. Continue?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    PlatformLogger.info("Test cancelled by user");
    return;
  }

  PlatformLogger.info("=".repeat(50));
  PlatformLogger.info("🔍 REAL PROPERTY ZPID TEST");
  PlatformLogger.info("=".repeat(50));

  // Test with a known property (Google HQ)
  const knownProperty = {
    address: "1600 Amphitheatre Parkway",
    city: "Mountain View",
    state: "CA",
    zip: "94043"
  };

  PlatformLogger.info("Testing with known property (Google HQ):");
  PlatformLogger.info(`  ${knownProperty.address}`);
  PlatformLogger.info(`  ${knownProperty.city}, ${knownProperty.state} ${knownProperty.zip}`);

  try {
    const result = fetchPropertyDetails(knownProperty);

    PlatformLogger.info("\nResult:");
    PlatformLogger.info(`  Beds: ${result.beds}`);
    PlatformLogger.info(`  Baths: ${result.baths}`);
    PlatformLogger.info(`  Sqft: ${result.sqft}`);
    PlatformLogger.info(`  ZPID: ${result.zpid || '❌ NOT FOUND'}`);

    if (result.zpid) {
      PlatformLogger.success("\n✅ ZPID found for known property");
      PlatformLogger.success("Your API connection is working!");

      // Now test with your property
      PlatformLogger.info("\nNow testing with your property...");
      const yourResult = fetchPropertyDetails(TEST_PROPERTY);

      if (yourResult.zpid) {
        PlatformLogger.success("✅ ZPID found for your property too!");
      } else {
        PlatformLogger.warn("⚠️ ZPID not found for your property");
        PlatformLogger.warn("Your property may not be in Zillow database");
      }
    } else {
      PlatformLogger.error("❌ ZPID not found even for known property");
      PlatformLogger.error("Check your API key and quota");
    }
  } catch (e) {
    PlatformLogger.error("❌ Test failed: " + e);
    PlatformLogger.error("Stack trace: " + e.stack);
  }
}

/**
 * Compare address formats side-by-side
 * Helps identify exact format Zillow expects
 */
function compareAddressFormats() {
  PlatformLogger.info("=".repeat(50));
  PlatformLogger.info("🔍 ADDRESS FORMAT COMPARISON");
  PlatformLogger.info("=".repeat(50));

  const formats = {
    "Original": TEST_PROPERTY.address,
    "No periods": TEST_PROPERTY.address.replace(/\./g, ''),
    "Expanded St": TEST_PROPERTY.address.replace(/\bSt\b/g, 'Street'),
    "Expanded Ave": TEST_PROPERTY.address.replace(/\bAve\b/g, 'Avenue'),
    "Expanded Dr": TEST_PROPERTY.address.replace(/\bDr\b/g, 'Drive'),
    "Expanded Rd": TEST_PROPERTY.address.replace(/\bRd\b/g, 'Road'),
    "Uppercase": TEST_PROPERTY.address.toUpperCase(),
    "Lowercase": TEST_PROPERTY.address.toLowerCase(),
    "Title Case": TEST_PROPERTY.address.replace(/\w\S*/g, txt =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  };

  PlatformLogger.info("Testing these formats:");
  Object.keys(formats).forEach(key => {
    PlatformLogger.info(`  ${key}: "${formats[key]}"`);
  });

  PlatformLogger.info("\n💡 Recommendation:");
  PlatformLogger.info("1. Check your address on Zillow.com");
  PlatformLogger.info("2. Copy the EXACT format Zillow uses");
  PlatformLogger.info("3. Update TEST_PROPERTY at top of this file");
  PlatformLogger.info("4. Run testZPIDLookup() again");
}

/**
 * Run all ZPID tests
 */
function runAllZPIDTests() {
  PlatformLogger.info("🧪 Running all ZPID tests...");
  PlatformLogger.info("=".repeat(50));

  let passed = 0;
  let failed = 0;

  // Test 1: Basic ZPID lookup
  try {
    if (testZPIDLookup()) {
      passed++;
      PlatformLogger.success("✅ Test 1: ZPID Lookup - PASSED");
    } else {
      failed++;
      PlatformLogger.error("❌ Test 1: ZPID Lookup - FAILED");
    }
  } catch (e) {
    failed++;
    PlatformLogger.error("❌ Test 1: ZPID Lookup - FAILED: " + e);
  }

  // Test 2: Error handling
  try {
    if (testZPIDErrorHandling()) {
      passed++;
      PlatformLogger.success("✅ Test 2: Error Handling - PASSED");
    } else {
      failed++;
      PlatformLogger.error("❌ Test 2: Error Handling - FAILED");
    }
  } catch (e) {
    failed++;
    PlatformLogger.error("❌ Test 2: Error Handling - FAILED: " + e);
  }

  // Test 3: Caching
  try {
    if (testZPIDCaching()) {
      passed++;
      PlatformLogger.success("✅ Test 3: Caching - PASSED");
    } else {
      failed++;
      PlatformLogger.error("❌ Test 3: Caching - FAILED");
    }
  } catch (e) {
    failed++;
    PlatformLogger.error("❌ Test 3: Caching - FAILED: " + e);
  }

  // Summary
  PlatformLogger.info("=".repeat(50));
  PlatformLogger.info(`📊 Test Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    PlatformLogger.success("🎉 All ZPID tests passed!");
  } else {
    PlatformLogger.error(`⚠️ ${failed} test(s) failed. Run debugZPIDIssue() for details.`);
  }

  return { passed, failed };
}
