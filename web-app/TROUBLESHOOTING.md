# Troubleshooting: "Flip analysis data not available"

## Problem
After running an analysis, you see "Flip analysis data not available" and other tabs show no data.

## Quick Fix: Switch to Mock Mode

If you need to test the interface immediately, switch to Mock Mode:

### Option 1: Rename .env files (Temporary)
```bash
cd web-app
mv .env .env.backup
mv .env.local .env.local.backup
```

Then restart the dev server:
```bash
npm run dev
```

The app will automatically use Mock Mode with simulated data.

### Option 2: Clear VITE_API_URL
Edit `web-app/.env` and set:
```
VITE_API_URL=
```

## Root Cause Analysis

The issue happens when:
1. **Real API is configured** (VITE_API_URL is set in .env)
2. **Backend fails to fetch property data** from external APIs
3. **No ARV (After Repair Value) is calculated**
4. **Without ARV, flip and rental analysis cannot be computed**

## Diagnostic Steps

### 1. Check Browser Console
Open browser DevTools (F12) and look for:
- `🔍 Using API: REAL API` or `MOCK API`
- `🔍 API Response:` - Check if data is present
- `❌ CRITICAL: No flip or rental data in response!`

### 2. Check Google Apps Script Logs
If using Real API:
1. Open your Google Apps Script project
2. Go to Executions
3. Look for recent executions
4. Check for errors like:
   - "Failed to fetch property details"
   - "No comps found"
   - "ARV calculation failed"

### 3. Verify API Keys
Check that your RapidAPI keys are configured in Google Apps Script:
- Go to Script Properties
- Verify `RAPIDAPI_KEY` is set
- Verify `GEMINI_API_KEY` is set (if using Deep Mode)

## Solutions

### Solution 1: Use Mock Mode (Immediate)
Best for testing the interface without real API calls.

```bash
# Remove or rename .env files
cd web-app
mv .env .env.disabled
mv .env.local .env.local.disabled

# Restart dev server
npm run dev
```

### Solution 2: Use Basic Mode with Manual Data
If you need real analysis but APIs are failing:
1. Switch to **Basic Mode** in the form
2. Provide property details manually:
   - Beds, baths, sqft
   - ARV (After Repair Value)
   - Or provide comparable sales

### Solution 3: Fix Real API Configuration
If you want to use the real API:

1. **Verify Google Apps Script Deployment**
   ```bash
   cd google-apps-script
   clasp push
   clasp deploy
   ```

2. **Check API Keys in Script Properties**
   - Open Google Apps Script Editor
   - File > Project Properties > Script Properties
   - Add: `RAPIDAPI_KEY` = your RapidAPI key
   - Add: `GEMINI_API_KEY` = your Gemini key (optional)

3. **Update .env with correct URL**
   ```
   VITE_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

4. **Test the API endpoint**
   ```bash
   cd web-app
   node test-api-connection.js
   ```

### Solution 4: Backend Fallback (Already Implemented)
The backend now includes fallback logic:
- If ARV can't be calculated from comps, it uses: `Purchase Price × 1.15`
- This ensures flip analysis is always generated

However, you need to redeploy the backend:
```bash
npm run clasp:push
```

## Understanding the Data Flow

```
User submits form
  ↓
Frontend calls API (Real or Mock)
  ↓
Backend fetches property details (Real API only)
  ↓
Backend fetches comparable sales (Real API only)
  ↓
Backend calculates ARV from comps
  ↓
Backend calculates flip analysis (needs ARV)
  ↓
Backend calculates rental analysis (needs ARV)
  ↓
Frontend displays results
```

**If any step fails in Real API mode, flip/rental data won't be available.**

## Prevention

1. **Always test in Mock Mode first** before configuring real APIs
2. **Use Basic Mode** when APIs are unreliable
3. **Monitor API usage** to avoid hitting rate limits
4. **Keep backup .env files** for quick switching

## Still Having Issues?

Check the browser console for detailed error messages:
```javascript
// Look for these debug messages:
🔍 Using API: REAL API or MOCK API
🔍 Form Data: {...}
🔍 API Response: {...}
🔍 Analysis Response: {...}
🔍 Flip Data: {...}
🔍 Rental Data: {...}
```

If flip/rental data is `undefined`, the backend failed to calculate it.

