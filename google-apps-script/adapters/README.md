# Google Apps Script Platform Adapter

This directory contains the platform adapter for Google Apps Script, which bridges the shared-core functions with Google Apps Script platform APIs.

## Overview

The adapter provides a consistent interface between platform-agnostic shared-core functions and Google Apps Script's platform-specific APIs.

## Architecture

```
┌─────────────────────────────────────┐
│   Existing Code (SHARED_*.js)      │
│   (API Bridge, Cache, etc.)        │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│   Platform Adapter (coreAdapter.js) │
│   - HttpClient                      │
│   - CacheManager                    │
│   - QuotaManager                    │
│   - PlatformLogger                  │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│   Shared Core Functions             │
│   (shared-core/api/*.js)            │
│   (shared-core/calculations/*.js)   │
│   (shared-core/utils/*.js)          │
└─────────────────────────────────────┘
```

## Components

### 1. HttpClient

Wraps `UrlFetchApp` to provide consistent HTTP request interface.

**Methods:**
- `get(url, options)` - Make HTTP GET request
- `post(url, options)` - Make HTTP POST request
- `retryWithBackoff(requestFn, maxRetries, initialDelay)` - Retry with exponential backoff

**Example:**
```javascript
var response = HttpClient.get('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer token123'
  }
});

if (response.success) {
  var data = JSON.parse(response.body);
  // Process data
}
```

### 2. CacheManager

Wraps `CacheService` to provide consistent caching interface.

**Methods:**
- `get(key)` - Get cached data
- `set(key, data, expirationInSeconds)` - Set cached data
- `remove(key)` - Remove cached data
- `clearByPrefix(prefix)` - Clear cache entries by prefix (limited support)
- `has(key)` - Check if cache entry exists

**Limitations:**
- Maximum cache entry size: 100KB
- Maximum cache duration: 6 hours (CacheService limit)
- No prefix-based removal support

**Example:**
```javascript
// Set cache
var cacheEntry = {
  data: comps,
  timestamp: new Date().getTime(),
  source: 'zillow'
};
CacheManager.set('comps_123_main_st', cacheEntry, 21600); // 6 hours

// Get cache
var cached = CacheManager.get('comps_123_main_st');
if (cached) {
  var comps = cached.data;
}
```

### 3. QuotaManager

Wraps `PropertiesService` to provide consistent quota management interface.

**Methods:**
- `getAPIKeys()` - Get API keys from Script Properties
- `getQuotaLimits()` - Get quota limits from Script Properties
- `getUsage(apiName, periodKey)` - Get current API usage
- `setUsage(apiName, periodKey, usage)` - Set API usage
- `incrementUsage(apiName, periodKey)` - Increment API usage
- `trackSuccess(apiName)` - Track successful API call
- `getLastSuccess()` - Get last successful API call

**Example:**
```javascript
// Get API keys
var keys = QuotaManager.getAPIKeys();
var rapidApiKey = keys.RAPIDAPI_KEY;

// Check and increment usage
var currentMonth = new Date().toISOString().slice(0, 7); // "2025-11"
var usage = QuotaManager.getUsage('zillow', currentMonth);
PlatformLogger.info('Zillow usage: ' + usage);

// Increment after successful call
QuotaManager.incrementUsage('zillow', currentMonth);
QuotaManager.trackSuccess('zillow');
```

### 4. PlatformLogger

Wraps `Logger` to provide consistent logging interface.

**Methods:**
- `info(message)` - Log info message
- `success(message)` - Log success message
- `warn(message)` - Log warning message
- `error(message)` - Log error message
- `debug(message)` - Log debug message
- `logAPI(apiName, status)` - Log API call
- `logQuota(apiName, usage, limit, available)` - Log quota status
- `logCache(operation, key)` - Log cache operation

**Example:**
```javascript
PlatformLogger.info('Starting property analysis');
PlatformLogger.success('Property details fetched successfully');
PlatformLogger.warn('Cache miss, fetching fresh data');
PlatformLogger.error('API request failed: ' + error);

PlatformLogger.logAPI('zillow', 'SUCCESS');
PlatformLogger.logQuota('zillow', 45, 100, true);
PlatformLogger.logCache('HIT', 'comps_123_main_st');
```

## Utilities

### safeJSONParse(jsonString, defaultValue)

Safely parse JSON with error handling.

```javascript
var data = safeJSONParse(response.body, []);
```

### safeJSONStringify(data, defaultValue)

Safely stringify JSON with error handling.

```javascript
var json = safeJSONStringify(comps, '[]');
```

### getPlatformInfo()

Get platform information.

```javascript
var info = getPlatformInfo();
// { platform: 'google-apps-script', version: '1.0.0', capabilities: {...} }
```

## Integration with Shared Core

The adapter is designed to work seamlessly with shared-core functions:

1. **API Functions** (`shared-core/api/*.js`) return configuration objects
2. **Adapter** uses HttpClient to execute the actual HTTP requests
3. **Cache utilities** (`shared-core/utils/cache.js`) provide cache key generation
4. **Adapter** uses CacheManager to store/retrieve cached data
5. **Quota utilities** (`shared-core/utils/quota.js`) provide quota logic
6. **Adapter** uses QuotaManager to track usage

## Usage Example

```javascript
// 1. Load shared-core functions
// (These are already included in your project)

// 2. Use adapter to make API call
var keys = QuotaManager.getAPIKeys();
var currentMonth = new Date().toISOString().slice(0, 7);

// Check quota
var usage = QuotaManager.getUsage('zillow', currentMonth);
var limits = QuotaManager.getQuotaLimits();

if (usage < limits.ZILLOW_THRESHOLD) {
  // Make API call
  var response = HttpClient.get('https://api.zillow.com/...', {
    headers: {
      'X-RapidAPI-Key': keys.RAPIDAPI_KEY
    }
  });

  if (response.success) {
    // Parse and cache
    var data = safeJSONParse(response.body, []);

    var cacheEntry = {
      data: data,
      timestamp: new Date().getTime(),
      source: 'zillow'
    };

    CacheManager.set('zillow_data', cacheEntry, 21600);

    // Track usage
    QuotaManager.incrementUsage('zillow', currentMonth);
    QuotaManager.trackSuccess('zillow');

    PlatformLogger.logAPI('zillow', 'SUCCESS');
  }
}
```

## Configuration

The adapter reads configuration from Script Properties:

### API Keys
- `RAPIDAPI_KEY` - RapidAPI key for Zillow and US Real Estate APIs
- `GEMINI_API_KEY` - Google Gemini API key
- `BRIDGE_API_KEY` - Bridge Dataset API key
- `BRIDGE_BASE_URL` - Bridge Dataset base URL

### Quota Limits
- `ZILLOW_MONTHLY_LIMIT` - Zillow monthly limit (default: 100)
- `ZILLOW_THRESHOLD` - Zillow threshold (default: 90)
- `US_REAL_ESTATE_MONTHLY_LIMIT` - US Real Estate monthly limit (default: 300)
- `US_REAL_ESTATE_THRESHOLD` - US Real Estate threshold (default: 270)
- `GEMINI_DAILY_LIMIT` - Gemini daily limit (default: 1500)
- `GEMINI_THRESHOLD` - Gemini threshold (default: 1400)

Set these in: **Project Settings → Script Properties**

## Testing

Test the adapter components:

```javascript
function testAdapter() {
  // Test HTTP Client
  var response = HttpClient.get('https://httpbin.org/get');
  Logger.log('HTTP Test: ' + response.success);

  // Test Cache Manager
  CacheManager.set('test_key', { value: 'test' }, 3600);
  var cached = CacheManager.get('test_key');
  Logger.log('Cache Test: ' + (cached !== null));

  // Test Quota Manager
  var keys = QuotaManager.getAPIKeys();
  Logger.log('Keys Test: ' + (keys.RAPIDAPI_KEY !== undefined));

  // Test Logger
  PlatformLogger.info('Logger test');
  PlatformLogger.logAPI('test', 'SUCCESS');
}
```

## Migration Guide

To migrate existing code to use the adapter:

### Before (Old Code)
```javascript
var response = UrlFetchApp.fetch(url, options);
var cache = CacheService.getScriptCache();
var props = PropertiesService.getScriptProperties();
Logger.log('Message');
```

### After (With Adapter)
```javascript
var response = HttpClient.get(url, options);
var cached = CacheManager.get(key);
var keys = QuotaManager.getAPIKeys();
PlatformLogger.info('Message');
```

## Next Steps

1. **Phase 0.6**: Migrate existing code to use adapter
2. **Testing**: Verify adapter works with all shared-core functions
3. **Documentation**: Update existing code documentation
4. **Optimization**: Profile and optimize adapter performance

## Support

For issues or questions about the adapter:
1. Check the shared-core documentation
2. Review the adapter source code
3. Test individual components
4. Check Script Properties configuration
