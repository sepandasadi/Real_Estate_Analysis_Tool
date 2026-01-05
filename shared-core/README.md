# 🏗️ Shared Core Library

**Version:** 1.0.0
**Status:** In Development
**Last Updated:** November 16, 2025

---

## 📖 Overview

The **Shared Core Library** is the single source of truth for all business logic in the Real Estate Analysis Tool. It provides a unified codebase that powers both the Google Sheets (Apps Script) and Web App (TypeScript/React) implementations.

### Key Benefits

- ✅ **Single Source of Truth** - Write once, use everywhere
- ✅ **Consistent Behavior** - Both platforms produce identical results
- ✅ **Easier Maintenance** - Fix bugs once, works everywhere
- ✅ **Better Testing** - Test core logic independently
- ✅ **Future-Proof** - Easy to add new platforms (mobile, CLI, etc.)

---

## 🏛️ Architecture

### Directory Structure

```
shared-core/
├── api/                      # External API integrations
│   ├── endpoints.js          # API endpoint definitions
│   ├── zillow.js             # Zillow API functions
│   ├── usRealEstate.js       # US Real Estate API functions
│   ├── gemini.js             # Gemini AI API functions
│   └── bridge.js             # Bridge Dataset API functions
├── calculations/             # Business logic & calculations
│   ├── arv.js                # ARV calculation algorithms
│   ├── comps.js              # Comps filtering & scoring
│   ├── rental.js             # Rental analysis calculations
│   └── flip.js               # Flip analysis calculations
├── utils/                    # Utility functions
│   ├── cache.js              # Caching logic
│   ├── quota.js              # API quota management
│   ├── validation.js         # Data validation
│   └── formatting.js         # Data formatting
└── types/                    # Type definitions
    └── index.js              # Shared type definitions
```

---

## 🎯 Design Principles

### 1. Platform Agnostic

All functions in shared-core are **pure JavaScript** with no platform-specific dependencies:

```javascript
// ✅ Good - Platform agnostic
function calculateEnhancedARV(estimates, propertyData) {
  const weightedARV = estimates.reduce((sum, e) =>
    sum + (e.value * e.weight), 0
  );
  return weightedARV;
}

// ❌ Bad - Platform specific
function calculateARV() {
  const data = SpreadsheetApp.getActiveSheet(); // Google Sheets only!
}
```

### 2. Pure Functions

Functions should be **pure** (no side effects) whenever possible:

```javascript
// ✅ Good - Pure function
function filterComps(comps, criteria) {
  return comps.filter(c => meetsCriteria(c, criteria));
}

// ❌ Bad - Side effects
function filterComps(comps, criteria) {
  Logger.log("Filtering comps..."); // Side effect!
  return comps.filter(c => meetsCriteria(c, criteria));
}
```

### 3. No ES6 Modules

Google Apps Script doesn't support ES6 modules, so use plain functions:

```javascript
// ✅ Good - Plain function (global scope)
function fetchZillowZestimate(zpid) {
  // Implementation
}

// ❌ Bad - ES6 module (won't work in Apps Script)
export function fetchZillowZestimate(zpid) {
  // Implementation
}
```

### 4. Descriptive Function Names

Use unique, descriptive names to avoid global namespace conflicts:

```javascript
// ✅ Good - Unique, descriptive names
function fetchZillowZestimate(zpid) { ... }
function fetchUSRealEstateHomeEstimate(address) { ... }
function calculateEnhancedARV(estimates) { ... }

// ❌ Bad - Generic names (conflict risk)
function fetchData() { ... }
function calculate() { ... }
function getData() { ... }
```

### 5. Synchronous Only

No async/await (Apps Script doesn't support it):

```javascript
// ✅ Good - Synchronous
function fetchData(url) {
  // Platform adapter will handle HTTP calls
  return data;
}

// ❌ Bad - Async/await
async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}
```

---

## 🔌 Platform Adapters

Platform-specific code lives in **adapters**, not in shared-core:

### Google Sheets Adapter
```javascript
// google-apps-script/adapters/coreAdapter.js
function calculateARVForSheets(propertyData) {
  // Platform-specific: Fetch using UrlFetchApp
  const zillowEstimate = fetchZillowZestimateViaAppsScript(propertyData.zpid);
  const usEstimate = fetchUSRealEstateEstimateViaAppsScript(propertyData);

  const estimates = [
    { value: zillowEstimate, weight: 0.25 },
    { value: usEstimate, weight: 0.25 }
  ];

  // Call shared core function (global scope)
  return calculateEnhancedARV(estimates, propertyData);
}
```

### Web App Adapter
```typescript
// web-app/src/adapters/coreAdapter.ts
export async function calculateARVForWebApp(propertyData: PropertyData) {
  // Platform-specific: Fetch using fetch API
  const zillowEstimate = await fetchZillowZestimateViaFetch(propertyData.zpid);
  const usEstimate = await fetchUSRealEstateEstimateViaFetch(propertyData);

  const estimates = [
    { value: zillowEstimate, weight: 0.25 },
    { value: usEstimate, weight: 0.25 }
  ];

  // Call shared core function (imported)
  return calculateEnhancedARV(estimates, propertyData);
}
```

---

## 📝 Code Style Guidelines

### JSDoc Comments

All functions must have JSDoc comments:

```javascript
/**
 * Calculate enhanced ARV using weighted average of multiple sources
 * @param {Array<{value: number, weight: number}>} estimates - Array of ARV estimates with weights
 * @param {Object} propertyData - Property information
 * @param {number} propertyData.purchasePrice - Purchase price
 * @param {number} propertyData.rehabCost - Rehab cost
 * @returns {{arv: number, sources: Array, confidence: number}} ARV result with metadata
 */
function calculateEnhancedARV(estimates, propertyData) {
  // Implementation
}
```

### Error Handling

Return error objects instead of throwing:

```javascript
// ✅ Good - Return error object
function fetchZillowZestimate(zpid) {
  if (!zpid) {
    return { error: true, message: "ZPID is required" };
  }

  try {
    // Fetch logic
    return { error: false, value: zestimate };
  } catch (e) {
    return { error: true, message: e.message };
  }
}

// ❌ Bad - Throw errors (harder to handle across platforms)
function fetchZillowZestimate(zpid) {
  if (!zpid) throw new Error("ZPID is required");
  // ...
}
```

### Validation

Validate inputs at the start of functions:

```javascript
function calculateEnhancedARV(estimates, propertyData) {
  // Validate inputs
  if (!Array.isArray(estimates) || estimates.length === 0) {
    return { error: true, message: "Estimates array is required" };
  }

  if (!propertyData || !propertyData.purchasePrice) {
    return { error: true, message: "Property data is required" };
  }

  // Proceed with calculation
  // ...
}
```

---

## 🧪 Testing

### Unit Tests

Test each function independently with known inputs/outputs:

```javascript
// Test calculateEnhancedARV
function testCalculateEnhancedARV() {
  const estimates = [
    { value: 800000, weight: 0.5 },
    { value: 820000, weight: 0.5 }
  ];

  const result = calculateEnhancedARV(estimates, {});

  // Expected: (800000 * 0.5) + (820000 * 0.5) = 810000
  console.assert(result.arv === 810000, "ARV calculation failed");
}
```

### Integration Tests

Test adapters with shared core:

```javascript
// Test Google Sheets adapter
function testSheetsAdapter() {
  const propertyData = {
    address: "123 Main St",
    city: "San Diego",
    state: "CA",
    zip: "92101"
  };

  const result = calculateARVForSheets(propertyData);
  console.assert(!result.error, "Adapter failed");
  console.assert(result.arv > 0, "ARV should be positive");
}
```

---

## 🚀 Usage

### In Google Sheets (Apps Script)

```javascript
// shared-core functions are globally available
function analyzeProperty() {
  const propertyData = getPropertyDataFromSheet();

  // Call shared core function directly
  const arvResult = calculateEnhancedARV(estimates, propertyData);

  // Display in sheet
  displayARVInSheet(arvResult);
}
```

### In Web App (TypeScript)

```typescript
// Import from shared-core
import { calculateEnhancedARV } from '@/shared-core/calculations/arv';

function analyzeProperty(propertyData: PropertyData) {
  // Call shared core function
  const arvResult = calculateEnhancedARV(estimates, propertyData);

  // Display in UI
  setARVState(arvResult);
}
```

---

## 📦 Deployment

### Google Sheets (via Clasp)

```bash
# Shared-core is symlinked or copied to google-apps-script/shared-core/
npm run clasp:push
```

### Web App (via Vite)

```bash
# Shared-core is imported directly from root
npm run build
```

---

## 🔄 Development Workflow

### Making Changes

1. **Edit shared-core files** at root level
2. **Test locally** with unit tests
3. **Push to Google Sheets** via clasp
4. **Test in both platforms** to ensure consistency
5. **Commit changes** to git

### Adding New Functions

1. **Create function** in appropriate file (api/, calculations/, utils/)
2. **Add JSDoc comments** with full documentation
3. **Add validation** for all inputs
4. **Return error objects** instead of throwing
5. **Test thoroughly** in both platforms
6. **Update this README** if needed

---

## 📚 API Reference

### API Functions (`api/`)

- **zillow.js** - Zillow API integration
  - `fetchZillowZestimate(zpid)` - Get Zestimate value
  - `fetchZillowPropertyComps(zpid)` - Get curated comps
  - `fetchPriceAndTaxHistory(zpid)` - Get historical data
  - `fetchWalkAndTransitScore(zpid)` - Get walkability scores

- **usRealEstate.js** - US Real Estate API integration
  - `fetchUSRealEstateHomeEstimate(address, city, state, zip)` - Get home estimate
  - `fetchUSRealEstateSimilarHomes(address, city, state, zip)` - Get similar properties
  - `fetchSchools(location)` - Get school ratings
  - `fetchNoiseScore(location)` - Get noise levels

### Calculation Functions (`calculations/`)

- **arv.js** - ARV calculation logic
  - `calculateEnhancedARV(estimates, propertyData)` - Multi-source weighted ARV
  - `calculateARVConfidenceInterval(estimates)` - Confidence ranges
  - `validateARVAgainstMarketTrends(estimatedARV, zpid, location)` - Historical validation

- **comps.js** - Comps filtering & scoring
  - `filterCompsByQuality(comps, criteria)` - Filter comps
  - `enrichCompWithQualityScore(comp)` - Add quality scores
  - `sortCompsByRelevance(comps, targetProperty)` - Sort by relevance

### Utility Functions (`utils/`)

- **cache.js** - Caching logic
  - `getCachedData(key)` - Retrieve cached data
  - `setCachedData(key, data, cacheType)` - Store with expiration
  - `clearCache(key)` - Invalidate cache

- **quota.js** - API quota management
  - `checkQuotaAvailable(apiName, period)` - Check if quota available
  - `trackAPIUsage(source, success)` - Track API calls
  - `getQuotaStatus()` - Get current usage

---

## 🤝 Contributing

### Guidelines

1. **Follow code style** - Use JSDoc, plain functions, descriptive names
2. **Write tests** - Add unit tests for all new functions
3. **Document changes** - Update README and inline comments
4. **Test both platforms** - Ensure Google Sheets and Web App work
5. **Keep it pure** - Avoid side effects and platform-specific code

### Pull Request Process

1. Create feature branch from `main`
2. Make changes in `shared-core/`
3. Add tests and documentation
4. Test in both platforms
5. Submit PR with clear description
6. Wait for review and approval

---

## 📞 Support

**Issues:** Use GitHub Issues for bug reports and feature requests
**Documentation:** See `API_IMPROVEMENT_PLAN.md` for implementation details
**Questions:** Contact project maintainers

---

## 📄 License

Same as parent project

---

**Last Updated:** November 16, 2025
**Version:** 1.0.0
**Status:** In Development
