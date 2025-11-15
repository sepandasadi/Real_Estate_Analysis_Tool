# Google Apps Script Web App Deployment Guide

This guide explains how to deploy the Google Apps Script backend as a Web App to provide a REST API for the PWA frontend.

## Prerequisites

- Google account with access to Google Apps Script
- All source files uploaded to Apps Script project
- API keys configured in Script Properties

## Deployment Steps

### 1. Open Apps Script Project

1. Go to [Google Apps Script](https://script.google.com)
2. Open your Real Estate Analysis Tool project
3. Ensure all files from `google-apps-script/src/` are uploaded

### 2. Verify Script Properties

Before deploying, ensure all API keys are configured:

1. Click **Project Settings** (gear icon) in the left sidebar
2. Scroll to **Script Properties**
3. Verify these properties exist:
   - `RAPIDAPI_KEY` - Your RapidAPI key
   - `GEMINI_API_KEY` - Your Gemini API key
   - `BRIDGE_API_KEY` - Your Bridge Dataset API key (if applicable)

### 3. Deploy as Web App

1. Click **Deploy** > **New deployment** in the top right
2. Click the gear icon next to "Select type"
3. Select **Web app**
4. Configure deployment settings:
   - **Description**: "Real Estate Analysis Tool API v3.0"
   - **Execute as**: **Me** (your Google account)
   - **Who has access**: **Anyone** (required for PWA to access)
5. Click **Deploy**
6. Review permissions:
   - Click **Authorize access**
   - Select your Google account
   - Click **Advanced** > **Go to [Project Name] (unsafe)**
   - Click **Allow**
7. Copy the **Web App URL** (you'll need this for the PWA frontend)
   - Format: `https://script.google.com/macros/s/SCRIPT_ID/exec`

### 4. Test the Deployment

#### Test with curl (GET request - health check):

```bash
curl https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

Expected response:
```json
{
  "status": "ok",
  "message": "Real Estate Analysis Tool API",
  "version": "3.0",
  "timestamp": "2025-11-15T19:00:00.000Z"
}
```

#### Test with curl (POST request - API usage):

```bash
curl -X POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec \
  -H "Content-Type: application/json" \
  -d '{
    "action": "getApiUsage",
    "data": {}
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "zillow": {
      "used": 0,
      "limit": 100,
      "remaining": 100,
      "period": "monthly",
      "resetDate": "2025-11-30"
    },
    "usRealEstate": {
      "used": 0,
      "limit": 100,
      "remaining": 100,
      "period": "monthly",
      "resetDate": "2025-11-30"
    },
    "gemini": {
      "used": 0,
      "limit": 1500,
      "remaining": 1500,
      "period": "daily",
      "resetDate": "2025-11-16"
    }
  },
  "timestamp": "2025-11-15T19:00:00.000Z"
}
```

#### Test with curl (POST request - calculate flip):

```bash
curl -X POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec \
  -H "Content-Type: application/json" \
  -d '{
    "action": "calculateFlip",
    "data": {
      "purchasePrice": 200000,
      "rehabCost": 50000,
      "arv": 300000,
      "holdingMonths": 6
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "purchasePrice": 200000,
    "rehabCost": 50000,
    "arv": 300000,
    "totalInvestment": 250000,
    "sellingCosts": 24000,
    "netProfit": 26000,
    "roi": 10.4,
    "holdingMonths": 6,
    "timeline": "6 months"
  },
  "timestamp": "2025-11-15T19:00:00.000Z"
}
```

### 5. Update Deployment (When Making Changes)

When you make changes to the code:

1. Click **Deploy** > **Manage deployments**
2. Click the pencil icon (Edit) next to your active deployment
3. Change **Version** to "New version"
4. Add a description of changes
5. Click **Deploy**
6. The Web App URL remains the same

## API Endpoints

### Available Actions

The Web App supports the following actions via POST requests:

#### 1. `analyze` - Full Property Analysis

Request:
```json
{
  "action": "analyze",
  "data": {
    "address": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "zip": "90001",
    "purchasePrice": 500000,
    "rehabCost": 50000,
    "arv": 650000,
    "monthlyRent": 3000,
    "downPayment": 125000,
    "interestRate": 7.0,
    "loanTerm": 30
  }
}
```

Response includes: property info, comps, flip analysis, rental analysis, score, alerts, insights

#### 2. `fetchComps` - Get Comparable Properties

Request:
```json
{
  "action": "fetchComps",
  "data": {
    "address": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "zip": "90001",
    "forceRefresh": false
  }
}
```

#### 3. `calculateFlip` - Calculate Flip Analysis

Request:
```json
{
  "action": "calculateFlip",
  "data": {
    "purchasePrice": 200000,
    "rehabCost": 50000,
    "arv": 300000,
    "holdingMonths": 6
  }
}
```

#### 4. `calculateRental` - Calculate Rental Analysis

Request:
```json
{
  "action": "calculateRental",
  "data": {
    "purchasePrice": 200000,
    "monthlyRent": 2000,
    "downPayment": 50000,
    "interestRate": 7.0,
    "loanTerm": 30
  }
}
```

#### 5. `getApiUsage` - Get API Usage Statistics

Request:
```json
{
  "action": "getApiUsage",
  "data": {}
}
```

## Troubleshooting

### Error: "Authorization required"

- Redeploy and re-authorize the script
- Ensure "Execute as: Me" is selected
- Ensure "Who has access: Anyone" is selected

### Error: "Script function not found"

- Verify all source files are uploaded to Apps Script
- Check that `webAppEndpoint.js` contains `doGet()` and `doPost()` functions
- Redeploy with a new version

### Error: "Missing required field"

- Check the request body includes all required fields
- Verify JSON is properly formatted
- Check the API documentation for required fields

### Error: "All API sources failed"

- Verify API keys are configured in Script Properties
- Check API quota limits (use `getApiUsage` action)
- Verify APIs are active on RapidAPI dashboard

### CORS Issues (from PWA frontend)

- Google Apps Script Web Apps don't support traditional CORS headers
- The frontend must handle this by:
  - Using the Web App URL directly (not through a proxy)
  - Accepting that credentials cannot be sent
  - Handling responses appropriately

## Security Notes

- **Execute as "Me"**: The script runs with your Google account permissions
- **Who has access "Anyone"**: Anyone with the URL can call the API
  - This is required for the PWA to access the API
  - Consider implementing authentication in the future
  - Monitor API usage to detect abuse
- **API Keys**: Stored in Script Properties (not exposed to frontend)
- **Rate Limiting**: Implemented via quota management system

## Next Steps

1. Copy the Web App URL
2. Save it for PWA frontend configuration
3. Test all endpoints with curl or Postman
4. Proceed to Phase 3: Build PWA Frontend

## Support

For issues or questions:
- Check Apps Script execution logs: **Executions** tab in left sidebar
- Review error messages in responses
- Verify API keys and quotas
- Check MIGRATION_PLAN.md for project context
