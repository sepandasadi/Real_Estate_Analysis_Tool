# Web App Platform Adapter

This directory contains the platform adapter for the Web App, which bridges the shared-core functions with Web App platform APIs.

## Overview

The adapter provides a consistent interface between platform-agnostic shared-core functions and the Web App's platform-specific APIs (fetch, localStorage, console).

## Architecture

```
┌─────────────────────────────────────┐
│   React Components & Services       │
│   (api.ts, mockApi.ts, etc.)       │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│   Platform Adapter (coreAdapter.ts) │
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

Wraps the `fetch` API to provide consistent HTTP request interface.

**Methods:**
- `get(url, options)` - Make HTTP GET request (async)
- `post(url, options)` - Make HTTP POST request (async)
- `retryWithBackoff(requestFn, maxRetries, initialDelay)` - Retry with exponential backoff (async)

**Example:**
```typescript
import { HttpClient } from './adapters/coreAdapter';

const response = await HttpClient.get('https://api.example.com/data', {
  headers: {
    'Authorization': 'Bearer token123'
  }
});

if (response.success) {
  const data = JSON.parse(response.body);
  // Process data
}
```

### 2. CacheManager

Uses `localStorage` for caching (can be upgraded to IndexedDB for larger datasets).

**Methods:**
- `get(key)` - Get cached data
- `set(key, data, expirationInSeconds?)` - Set cached data
- `remove(key)` - Remove cached data
- `clearByPrefix(prefix)` - Clear cache entries by prefix
- `has(key)` - Check if cache entry exists

**Limitations:**
- localStorage has ~5-10MB limit (varies by browser)
- No automatic expiration (must be handled by application logic)
- Synchronous operations

**Example:**
```typescript
import { CacheManager } from './adapters/coreAdapter';

// Set cache
const cacheEntry = {
  data: comps,
  timestamp: new Date().getTime(),
  source: 'zillow'
};
CacheManager.set('comps_123_main_st', cacheEntry);

// Get cache
const cached = CacheManager.get('comps_123_main_st');
if (cached) {
  const comps = cached.data;
}

// Clear by prefix
CacheManager.clearByPrefix('comps_');
```

### 3. QuotaManager

Uses `localStorage` for quota tracking and management.

**Methods:**
- `getAPIKeys()` - Get API keys from localStorage or environment variables
- `setAPIKeys(keys)` - Set API keys in localStorage
- `getQuotaLimits()` - Get quota limits from localStorage
- `setQuotaLimits(limits)` - Set quota limits in localStorage
- `getUsage(apiName, periodKey)` - Get current API usage
- `setUsage(apiName, periodKey, usage)` - Set API usage
- `incrementUsage(apiName, periodKey)` - Increment API usage
- `trackSuccess(apiName)` - Track successful API call
- `getLastSuccess()` - Get last successful API call

**Example:**
```typescript
import { QuotaManager } from './adapters/coreAdapter';

// Get API keys (from localStorage or .env)
const keys = QuotaManager.getAPIKeys();
const rapidApiKey = keys.RAPIDAPI_KEY;

// Check and increment usage
const currentMonth = new Date().toISOString().slice(0, 7); // "2025-11"
const usage = QuotaManager.getUsage('zillow', currentMonth);
console.log('Zillow usage:', usage);

// Increment after successful call
QuotaManager.incrementUsage('zillow', currentMonth);
QuotaManager.trackSuccess('zillow');
```

### 4. PlatformLogger

Wraps `console` to provide consistent logging interface.

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
```typescript
import { PlatformLogger } from './adapters/coreAdapter';

PlatformLogger.info('Starting property analysis');
PlatformLogger.success('Property details fetched successfully');
PlatformLogger.warn('Cache miss, fetching fresh data');
PlatformLogger.error('API request failed: ' + error);

PlatformLogger.logAPI('zillow', 'SUCCESS');
PlatformLogger.logQuota('zillow', 45, 100, true);
PlatformLogger.logCache('HIT', 'comps_123_main_st');
```

## Utilities

### safeJSONParse<T>(jsonString, defaultValue?)

Safely parse JSON with error handling and TypeScript support.

```typescript
import { safeJSONParse } from './adapters/coreAdapter';

const data = safeJSONParse<CompsData[]>(response.body, []);
```

### safeJSONStringify(data, defaultValue?)

Safely stringify JSON with error handling.

```typescript
import { safeJSONStringify } from './adapters/coreAdapter';

const json = safeJSONStringify(comps, '[]');
```

### getPlatformInfo()

Get platform information.

```typescript
import { getPlatformInfo } from './adapters/coreAdapter';

const info = getPlatformInfo();
// { platform: 'web-app', version: '1.0.0', capabilities: {...} }
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

```typescript
import { HttpClient, CacheManager, QuotaManager, PlatformLogger } from './adapters/coreAdapter';

async function fetchPropertyData(address: string) {
  // 1. Get API keys
  const keys = QuotaManager.getAPIKeys();
  const currentMonth = new Date().toISOString().slice(0, 7);

  // 2. Check quota
  const usage = QuotaManager.getUsage('zillow', currentMonth);
  const limits = QuotaManager.getQuotaLimits();

  if (usage < limits.ZILLOW_THRESHOLD) {
    // 3. Make API call
    const response = await HttpClient.get('https://api.zillow.com/...', {
      headers: {
        'X-RapidAPI-Key': keys.RAPIDAPI_KEY
      }
    });

    if (response.success) {
      // 4. Parse and cache
      const data = safeJSONParse(response.body, []);

      const cacheEntry = {
        data: data,
        timestamp: new Date().getTime(),
        source: 'zillow'
      };

      CacheManager.set('zillow_data', cacheEntry);

      // 5. Track usage
      QuotaManager.incrementUsage('zillow', currentMonth);
      QuotaManager.trackSuccess('zillow');

      PlatformLogger.logAPI('zillow', 'SUCCESS');

      return data;
    }
  }

  return null;
}
```

## Configuration

### Environment Variables (.env)

The adapter reads API keys from environment variables:

```env
VITE_RAPIDAPI_KEY=your_rapidapi_key
VITE_GEMINI_API_KEY=your_gemini_key
VITE_BRIDGE_API_KEY=your_bridge_key
VITE_BRIDGE_BASE_URL=https://api.bridgedataoutput.com
```

### localStorage Configuration

API keys and quota limits can also be stored in localStorage:

```typescript
import { QuotaManager } from './adapters/coreAdapter';

// Set API keys
QuotaManager.setAPIKeys({
  RAPIDAPI_KEY: 'your_key',
  GEMINI_API_KEY: 'your_key',
  BRIDGE_API_KEY: 'your_key',
  BRIDGE_BASE_URL: 'https://api.bridgedataoutput.com'
});

// Set quota limits
QuotaManager.setQuotaLimits({
  ZILLOW_MONTHLY_LIMIT: 100,
  ZILLOW_THRESHOLD: 90,
  US_REAL_ESTATE_MONTHLY_LIMIT: 300,
  US_REAL_ESTATE_THRESHOLD: 270,
  GEMINI_DAILY_LIMIT: 1500,
  GEMINI_THRESHOLD: 1400
});
```

## TypeScript Support

The adapter is fully typed with TypeScript interfaces:

```typescript
interface HttpResponse {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
  success: boolean;
  error?: string;
}

interface APIKeys {
  RAPIDAPI_KEY?: string;
  GEMINI_API_KEY?: string;
  BRIDGE_API_KEY?: string;
  BRIDGE_BASE_URL?: string;
}

interface QuotaLimits {
  ZILLOW_MONTHLY_LIMIT: number;
  ZILLOW_THRESHOLD: number;
  US_REAL_ESTATE_MONTHLY_LIMIT: number;
  US_REAL_ESTATE_THRESHOLD: number;
  GEMINI_DAILY_LIMIT: number;
  GEMINI_THRESHOLD: number;
}
```

## Testing

Test the adapter components:

```typescript
import { HttpClient, CacheManager, QuotaManager, PlatformLogger } from './adapters/coreAdapter';

async function testAdapter() {
  // Test HTTP Client
  const response = await HttpClient.get('https://httpbin.org/get');
  console.log('HTTP Test:', response.success);

  // Test Cache Manager
  CacheManager.set('test_key', { value: 'test' });
  const cached = CacheManager.get('test_key');
  console.log('Cache Test:', cached !== null);

  // Test Quota Manager
  const keys = QuotaManager.getAPIKeys();
  console.log('Keys Test:', keys.RAPIDAPI_KEY !== undefined);

  // Test Logger
  PlatformLogger.info('Logger test');
  PlatformLogger.logAPI('test', 'SUCCESS');
}
```

## Migration Guide

To migrate existing code to use the adapter:

### Before (Old Code)
```typescript
const response = await fetch(url, options);
const cached = localStorage.getItem(key);
const keys = { RAPIDAPI_KEY: import.meta.env.VITE_RAPIDAPI_KEY };
console.log('Message');
```

### After (With Adapter)
```typescript
import { HttpClient, CacheManager, QuotaManager, PlatformLogger } from './adapters/coreAdapter';

const response = await HttpClient.get(url, options);
const cached = CacheManager.get(key);
const keys = QuotaManager.getAPIKeys();
PlatformLogger.info('Message');
```

## Upgrading to IndexedDB

For larger datasets, consider upgrading CacheManager to use IndexedDB:

```typescript
// Future enhancement: IndexedDB adapter
export const IndexedDBCache = {
  async get(key: string): Promise<any> {
    // IndexedDB implementation
  },
  async set(key: string, data: any): Promise<boolean> {
    // IndexedDB implementation
  }
};
```

## Next Steps

1. **Phase 0.6**: Migrate existing code to use adapter
2. **Testing**: Verify adapter works with all shared-core functions
3. **Documentation**: Update existing code documentation
4. **Optimization**: Consider IndexedDB for larger datasets

## Support

For issues or questions about the adapter:
1. Check the shared-core documentation
2. Review the adapter source code
3. Test individual components
4. Check environment variables and localStorage configuration
