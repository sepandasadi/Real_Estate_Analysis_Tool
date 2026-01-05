# 🧪 Test Suite Documentation

Comprehensive test suite for the Real Estate Analysis Tool.

## 📁 Test Organization

```
tests/
├── TEST_adapters.js              # Core adapter functionality tests
├── TEST_migration.js             # Migration verification tests
├── TEST_api_priority.js          # API priority & quota management tests
├── TEST_zpid_lookup.js           # ZPID lookup tests (CRITICAL)
├── TEST_historical_validation.js # Historical ARV validation tests
├── TEST_runner.js                # Master test runner
└── README.md                     # This file
```

## 🎯 Quick Start

### 1. Open Google Apps Script Editor
- Open your Google Sheet
- Go to: Extensions > Apps Script

### 2. Navigate to tests/ folder
- Find the `tests/` folder in the file tree
- All test files are organized here

### 3. Run Tests
Select a test function from the dropdown and click **Run**:

**Quick Health Check:**
```javascript
runQuickDiagnostic()  // 5 fast checks
```

**Debug ZPID Issue:**
```javascript
debugZPIDIssue()      // Step-by-step ZPID debug
```

**Run All Tests:**
```javascript
runAllTests()         // Comprehensive test suite
```

### 4. View Results
- **View → Logs** (or press `Ctrl+Enter`)
- Check for ✅ (passed) or ❌ (failed) indicators

---

## 📋 Test Files

### TEST_adapters.js
**Purpose:** Tests core adapter functionality
**Functions:**
- `testAdapterAvailability()` - Check all adapters exist
- `testQuotaManager()` - Test quota management
- `testCacheManager()` - Test caching
- `testPlatformLogger()` - Test logging
- `testHttpClient()` - Test HTTP requests

**Run:** `runAllAdapterTests()`

---

### TEST_migration.js
**Purpose:** Verifies migration from old to new architecture
**Functions:**
- `testApiBridgeFunctions()` - Test migrated API functions
- `testCacheFunctions()` - Test migrated cache functions
- `quickMigrationTest()` - Fast migration check

**Run:** `runAllMigrationTests()`

---

### TEST_api_priority.js
**Purpose:** Tests API priority order and multi-source ARV
**Functions:**
- `testAPIPriorityOrder()` - Verify US Real Estate is Priority 1
- `testZillowZestimate()` - Test Zestimate fetching
- `testUSRealEstateHomeEstimate()` - Test US Real Estate estimate
- `testAIMatchedComps()` - Test AI-matched comps
- `testQuotaManagement()` - Test quota tracking

**Run:** `runAllPhase1Tests()`

---

### TEST_zpid_lookup.js ⭐ CRITICAL
**Purpose:** Debug ZPID lookup issues
**Configuration:** Edit `TEST_PROPERTY` at top of file

**Main Functions:**
- `testZPIDLookup()` - Basic ZPID lookup test
- `debugZPIDIssue()` - **Step-by-step comprehensive debug**
- `testZPIDWithVariousFormats()` - Try 8 different address formats
- `testRealPropertyZPID()` - Test with known property (Google HQ)

**Debug Functions:**
- `testZPIDErrorHandling()` - Test graceful degradation
- `testZPIDCaching()` - Verify caching works
- `compareAddressFormats()` - Show format variations

**Run:** `runAllZPIDTests()` or `debugZPIDIssue()`

**Configuration Example:**
```javascript
const TEST_PROPERTY = {
  address: "123 Main St",
  city: "San Diego",
  state: "CA",
  zip: "92101"
};
```

---

### TEST_historical_validation.js
**Purpose:** Tests ARV validation against historical trends
**Configuration:** Edit `TEST_CONFIG` at top of file

**Main Functions:**
- `testHistoricalValidation()` - Complete validation workflow
- `testARVDeviation()` - Test deviation calculation
- `testValidationWarnings()` - Test warning generation
- `testFlipPatternDetection()` - Test flip vs hold detection
- `testMarketConditionCheck()` - Test market trend classification

**Advanced Functions:**
- `testARVScenarios()` - Test various ARV scenarios
- `testValidationWithoutZPID()` - Test graceful degradation
- `testValidationPerformance()` - Measure execution time

**Run:** `runAllHistoricalValidationTests()`

**Configuration Example:**
```javascript
const TEST_CONFIG = {
  estimatedARV: 825000,
  zpid: "12345678",
  location: "San Diego, CA",
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
```

---

### TEST_runner.js
**Purpose:** Master test runner for all test suites

**Master Functions:**
- `runAllTests()` - Run ALL tests (comprehensive)
- `runQuickDiagnostic()` - Fast health check (5 tests)

**Test Suites:**
- `runCoreTests()` - Adapters + Migration
- `runAPITests()` - API Priority + ZPID Lookup
- `runARVTests()` - Historical Validation

**Utility Functions:**
- `showTestMenu()` - Display test menu
- `showTestStatus()` - Show current test status
- `runSpecificTest(testName)` - Run one specific test

---

## 🚀 Common Testing Workflows

### Workflow 1: Debug ZPID Issue
```javascript
// 1. Configure test property
// Edit TEST_PROPERTY in TEST_zpid_lookup.js

// 2. Run comprehensive debug
debugZPIDIssue()

// 3. If ZPID not found, try different formats
testZPIDWithVariousFormats()

// 4. Verify API is working
testRealPropertyZPID()
```

### Workflow 2: Test Historical Validation
```javascript
// 1. Configure test data
// Edit TEST_CONFIG in TEST_historical_validation.js

// 2. Run validation test
testHistoricalValidation()

// 3. Test specific components
testFlipPatternDetection()
testMarketConditionCheck()

// 4. Run full suite
runAllHistoricalValidationTests()
```

### Workflow 3: System Health Check
```javascript
// 1. Quick diagnostic
runQuickDiagnostic()

// 2. Check API usage
showAPIUsage()

// 3. Run core tests
runCoreTests()

// 4. Full test suite
runAllTests()
```

---

## 🐛 Debugging Tips

### ZPID Not Found
**Symptoms:** "ℹ️ Property ID (ZPID) not found - historical validation skipped"

**Solutions:**
1. **Check address format:**
   ```javascript
   compareAddressFormats()  // Shows all format variations
   ```

2. **Try different formats:**
   ```javascript
   testZPIDWithVariousFormats()  // Tests 8 formats automatically
   ```

3. **Verify property exists on Zillow:**
   - Go to Zillow.com
   - Search for your property
   - Copy the EXACT address format Zillow uses

4. **Check API quota:**
   ```javascript
   showAPIUsage()  // Check if quota exceeded
   ```

5. **Test with known property:**
   ```javascript
   testRealPropertyZPID()  // Tests with Google HQ
   ```

### API Quota Exceeded
**Symptoms:** "⚠️ API quota exceeded"

**Solutions:**
1. Check current usage:
   ```javascript
   showAPIUsage()
   ```

2. Wait for quota reset (monthly for Zillow/US Real Estate)

3. Use cached data when possible

### Validation Warnings
**Symptoms:** "⚠️ ARV validation raised warnings"

**This is normal!** Warnings indicate:
- ARV deviates >15% from historical projection
- Property has been flipped multiple times
- Market is declining
- ARV significantly above local median

**Review warnings to understand market conditions.**

---

## 📊 Test Results Interpretation

### ✅ Test Passed
- Function worked as expected
- No errors or warnings
- Continue to next test

### ❌ Test Failed
- Function didn't work as expected
- Check error message in logs
- Review stack trace for details
- Fix issue and re-run

### ⚠️ Test Warning
- Function worked but raised concerns
- Review warning message
- May be expected behavior
- Investigate if unexpected

---

## 🔧 Configuration

### Required Script Properties
Set these in: **Project Settings → Script Properties**

```
RAPIDAPI_KEY              - Your RapidAPI key
ZILLOW_MONTHLY_LIMIT      - 100 (default)
US_REAL_ESTATE_MONTHLY_LIMIT - 300 (default)
GEMINI_API_KEY            - Your Gemini API key (optional)
```

### Test Configuration Files

**TEST_zpid_lookup.js:**
```javascript
const TEST_PROPERTY = {
  address: "YOUR_ADDRESS",
  city: "YOUR_CITY",
  state: "YOUR_STATE",
  zip: "YOUR_ZIP"
};
```

**TEST_historical_validation.js:**
```javascript
const TEST_CONFIG = {
  estimatedARV: YOUR_ARV,
  zpid: "YOUR_ZPID",
  location: "YOUR_CITY, YOUR_STATE",
  propertyData: { /* ... */ }
};
```

---

## 📈 Test Coverage

### Phase 0: Core Infrastructure (100%)
- ✅ Adapters (HttpClient, CacheManager, QuotaManager, PlatformLogger)
- ✅ Migration verification
- ✅ Platform compatibility

### Phase 1: Foundation & Quick Wins (100%)
- ✅ API priority order (US Real Estate → Zillow)
- ✅ Multi-source ARV (comps + Zestimate + US Real Estate)
- ✅ AI-matched comps
- ✅ Quota management

### Phase 2: Historical Validation (100%)
- ✅ ZPID lookup
- ✅ Price & tax history
- ✅ Market trends
- ✅ Historical ARV validation
- ✅ Flip pattern detection

### Phase 3: Location Quality (0%)
- ⏳ School ratings
- ⏳ Walkability scores
- ⏳ Noise levels
- ⏳ Location-adjusted ARV

---

## 🎯 Best Practices

### 1. Always Configure Test Data
- Edit `TEST_PROPERTY` and `TEST_CONFIG` with real data
- Use actual addresses from your market
- Test with properties you know

### 2. Run Tests in Order
1. `runQuickDiagnostic()` - Health check
2. `debugZPIDIssue()` - Debug ZPID
3. `testHistoricalValidation()` - Test validation
4. `runAllTests()` - Full suite

### 3. Check Logs Regularly
- View → Logs (Ctrl+Enter)
- Look for ✅ and ❌ indicators
- Read error messages carefully
- Check stack traces for details

### 4. Monitor API Usage
- Run `showAPIUsage()` regularly
- Stay under quota limits
- Use cache when possible
- Test with real properties sparingly

### 5. Document Issues
- Note which tests fail
- Copy error messages
- Save stack traces
- Report bugs with details

---

## 🆘 Getting Help

### Common Issues

**Issue:** "Function not found"
- **Solution:** Make sure you're in the correct test file
- **Solution:** Check function name spelling

**Issue:** "RAPIDAPI_KEY not found"
- **Solution:** Add RAPIDAPI_KEY to Script Properties
- **Solution:** Project Settings → Script Properties → Add Property

**Issue:** "All tests failing"
- **Solution:** Run `runQuickDiagnostic()` first
- **Solution:** Check if adapters are loaded
- **Solution:** Verify API keys configured

**Issue:** "Tests running slow"
- **Solution:** Normal for API calls (can take 5-10 seconds)
- **Solution:** Use cache when possible
- **Solution:** Run `testValidationPerformance()` to measure

---

## 📝 Adding New Tests

### 1. Create New Test File
```javascript
/**
 * TEST_feature_name.js
 * Tests for [feature description]
 */

function testFeatureName() {
  PlatformLogger.info("Testing feature...");
  // Test implementation
  return true; // or false
}

function runAllFeatureTests() {
  let passed = 0;
  let failed = 0;

  // Run tests
  if (testFeatureName()) {
    passed++;
  } else {
    failed++;
  }

  return { passed, failed };
}
```

### 2. Add to TEST_runner.js
```javascript
// In runAllTests()
try {
  PlatformLogger.info("\n🎯 RUNNING FEATURE TESTS...");
  results.feature = runAllFeatureTests();
} catch (e) {
  PlatformLogger.error("❌ Feature tests failed: " + e);
}
```

### 3. Update README.md
- Add test file description
- Document test functions
- Add configuration examples
- Update test coverage

---

## 📚 Additional Resources

- **API Documentation:** See `API_IMPROVEMENT_PLAN.md`
- **Migration Guide:** See `MIGRATION_PLAN.md`
- **Deployment Guide:** See `DEPLOYMENT_GUIDE.md`
- **Testing Guide:** See `TESTING_GUIDE.md`

---

## 🎉 Success Criteria

### All Tests Passing
```
📊 FINAL TEST SUMMARY
======================================================================
Results by Test Suite:
  Adapters:              7 passed, 0 failed
  Migration:             7 passed, 0 failed
  API Priority:          5 passed, 0 failed
  ZPID Lookup:           3 passed, 0 failed
  Historical Validation: 5 passed, 0 failed

======================================================================
TOTAL: 27/27 tests passed (100.0%)
======================================================================

🎉 ALL TESTS PASSED! 🎉
```

### System Healthy
```
🚀 RUNNING QUICK DIAGNOSTIC
======================================================================
1. Checking adapters...
✅ All adapters available

2. Checking API keys...
✅ RAPIDAPI_KEY configured

3. Checking API quota...
✅ API quota available

4. Checking core functions...
✅ Core functions available

5. Checking cache...
✅ Cache working

======================================================================
DIAGNOSTIC: 5/5 checks passed
======================================================================

✅ SYSTEM HEALTHY - All checks passed!
```

---

**Last Updated:** November 17, 2025
**Version:** 1.0.0
**Status:** Complete - Ready for testing
