# CORS Fix for Local Development

## Problem
Google Apps Script doesn't allow CORS requests from localhost, which prevents the web app from connecting to the backend during local development.

## Solution Options

### Option 1: Use Proxy (Recommended for Development)
The proxy approach won't work with Google Apps Script because it requires the full URL path including the script ID. Instead, we need to use one of the other options below.

### Option 2: Deploy Google Apps Script as Web App with CORS Headers (BEST SOLUTION)

1. **Update the Google Apps Script to handle CORS properly:**
   - The `doGet()` and `doPost()` functions in `API_webAppEndpoint.js` need to return proper CORS headers
   - However, Google Apps Script has limitations with CORS headers

2. **Deploy the Web App with proper settings:**
   - In Google Apps Script Editor: Deploy > New deployment
   - Type: Web app
   - Execute as: **Me** (your account)
   - Who has access: **Anyone** (this is important for CORS)
   - Click Deploy and copy the Web App URL

3. **Update your `.env.local` file:**
   ```
   REACT_APP_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

### Option 3: Use a Browser Extension (Quick Fix for Testing)

Install a CORS browser extension to bypass CORS during development:
- Chrome: "CORS Unblock" or "Allow CORS: Access-Control-Allow-Origin"
- Firefox: "CORS Everywhere"

**⚠️ Warning:** Only use this for development. Disable it when browsing other sites.

### Option 4: Deploy to Production (Vercel)

The CORS issue only affects local development. When deployed to production (Vercel), the app will work correctly because:
1. The app will be served over HTTPS
2. Google Apps Script allows CORS from any HTTPS origin when deployed with "Anyone" access

**To deploy to Vercel:**
```bash
cd web-app
npm run build
# Then deploy the build folder to Vercel
```

## Current Setup

We've added:
1. ✅ `setupProxy.js` - Proxy configuration (won't work with Google Apps Script)
2. ✅ `http-proxy-middleware` package installed
3. ✅ Proxy setting in `package.json`

## Recommended Next Steps

1. **For immediate testing:** Use Option 3 (Browser Extension)
2. **For proper development:** Use Option 4 (Deploy to Vercel)
3. **Long-term solution:** Consider creating a custom backend API that acts as a proxy to Google Apps Script

## Testing Without Backend

You can also test the UI without the backend by:
1. Commenting out the API calls in `App.tsx`
2. Using mock data for testing the UI components
3. Uncommenting when ready to test with real backend

## Alternative: Mock API for Development

Create a mock API service for local development:

```typescript
// src/services/mockApi.ts
export const mockAnalyzeProperty = (data: PropertyFormData) => {
  return {
    success: true,
    data: {
      property: {
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip
      },
      flip: {
        purchasePrice: data.purchasePrice,
        rehabCost: data.rehabCost || 0,
        arv: data.arv || 0,
        totalInvestment: data.purchasePrice + (data.rehabCost || 0),
        sellingCosts: (data.arv || 0) * 0.08,
        netProfit: (data.arv || 0) - data.purchasePrice - (data.rehabCost || 0) - ((data.arv || 0) * 0.08),
        roi: 15.5,
        holdingMonths: data.holdingMonths || 6,
        timeline: `${data.holdingMonths || 6} months`
      },
      // ... more mock data
    }
  };
};
```

Then use this in development mode instead of the real API.
