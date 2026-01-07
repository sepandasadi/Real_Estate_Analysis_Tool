# Quota Threshold Configuration Guide

## Overview

The system now includes a **dynamic quota threshold** system that prevents using an API once it reaches a configurable percentage of its monthly/daily limit (default: **90%**).

## How It Works

When checking if an API is available, the system:
1. Gets the current usage count
2. Compares it to the threshold (not the limit)
3. Blocks the API if usage >= threshold

**Example:** If Private Zillow has a limit of 250/month and threshold is 90%:
- ✅ Available at 224/250 (89.6%)
- ⚠️ Blocked at 225/250 (90%)
- The remaining 25 calls are reserved as buffer

## Configuration Options

### Option 1: Global Threshold Percentage (Recommended)

Set a single percentage that applies to **all APIs**:

**In Google Apps Script:**
1. Go to Project Settings → Script Properties
2. Add property: `QUOTA_THRESHOLD_PERCENT` = `90` (for 90%)
3. Change to `85` for 85%, `95` for 95%, etc.

This automatically calculates thresholds for all APIs:
- Private Zillow (250 limit) → 225 threshold at 90%
- US Real Estate (300 limit) → 270 threshold at 90%
- Redfin (111 limit) → 99 threshold at 90%
- Gemini (1500 limit) → 1350 threshold at 90%

### Option 2: Per-API Thresholds

Set specific thresholds for individual APIs:

**Script Properties:**
- `PRIVATE_ZILLOW_THRESHOLD` = `225` (max calls before stopping)
- `US_REAL_ESTATE_THRESHOLD` = `270`
- `REDFIN_THRESHOLD` = `99`
- `GEMINI_THRESHOLD` = `1350`

**Note:** Per-API thresholds override the global percentage.

## Default Values

If no properties are set:
- **Global Threshold:** 90%
- **Private Zillow:** 250/month → 225 threshold
- **US Real Estate:** 300/month → 270 threshold
- **Redfin:** 111/month → 99 threshold
- **Gemini:** 1500/day → 1350 threshold

## Monitoring

The system logs quota status on every API call:

```
📊 private_zillow: 180/250 (72%) | Threshold: 225 (90%) | Status: ✅ Available
📊 us_real_estate: 285/300 (95%) | Threshold: 270 (90%) | Status: ⚠️ Threshold Exceeded
```

## When to Adjust Thresholds

**Lower threshold (e.g., 85%):**
- ✅ More conservative, larger safety buffer
- ✅ Better for critical production apps
- ⚠️ Wastes some quota

**Higher threshold (e.g., 95%):**
- ✅ Maximizes quota usage
- ⚠️ Less safety margin
- ⚠️ Risk of hitting hard limits during usage spikes

## Example Configurations

### Conservative (Production)
```
QUOTA_THRESHOLD_PERCENT = 80
```
Stops at 80% across all APIs, large safety buffer.

### Balanced (Recommended)
```
QUOTA_THRESHOLD_PERCENT = 90
```
Default setting, good balance of usage and safety.

### Aggressive (Development/Testing)
```
QUOTA_THRESHOLD_PERCENT = 95
```
Maximizes usage, minimal buffer.

### Custom Per-API
```
QUOTA_THRESHOLD_PERCENT = 90
PRIVATE_ZILLOW_THRESHOLD = 200  (80% - more conservative for primary API)
GEMINI_THRESHOLD = 1425         (95% - less critical, fallback only)
```

## Updating Configuration

1. **In Google Apps Script Editor:**
   - Click ⚙️ Project Settings
   - Scroll to Script Properties
   - Click "Add script property"
   - Add `QUOTA_THRESHOLD_PERCENT` with your desired value
   - Save

2. **Changes take effect immediately** on the next API call

3. **No code deployment needed** - this is a runtime configuration

## Troubleshooting

**Q: APIs are being blocked too early**
- Increase `QUOTA_THRESHOLD_PERCENT` (e.g., from 90 to 95)

**Q: Getting near quota limits unexpectedly**
- Lower `QUOTA_THRESHOLD_PERCENT` (e.g., from 90 to 85)

**Q: Want different thresholds for different APIs**
- Set individual `[API_NAME]_THRESHOLD` properties

**Q: How to check current usage?**
- Look at the logs: `📊 api_name: X/Y (Z%)`
- Or check Script Properties: `api_usage_[api_name]_[period]`

