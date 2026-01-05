# Google Apps Script Web App Testing Guide

This guide provides comprehensive testing instructions for the Google Apps Script Web App endpoint that powers the PWA frontend.

## Prerequisites

- Google Apps Script project deployed as Web App
- Web App URL copied from deployment
- API keys configured in Script Properties
- `curl` or Postman installed for testing

## Testing Checklist

### ✅ Phase 1: Basic Connectivity

#### Test 1.1: Health Check (GET Request)

**Purpose**: Verify the Web App is accessible and responding.

```bash
curl https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

**Expected Response**:
```json
{
  "status": "ok",
  "message": "Real Estate Analysis Tool API",
  "version": "3.0",
  "timestamp": "2025-11-16T18:15:00.000Z"
}
```

**Success Criteria**:
- ✅ HTTP 200 status code
- ✅ Valid JSON response
- ✅ Correct version number
- ✅ Recent timestamp

---

### ✅ Phase 2: API Usage Endpoint

#### Test 2.1: Get API Usage Statistics

**Purpose**: Verify quota tracking is working.

```bash
curl -X POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec \
  -H "Content-Type: application/json" \
  -d '{
    "action": "getApiUsage",
    "data": {}
  }'
```

**Expected Response**:
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
      "resetDate": "2025-11-17"
    }
  },
  "timestamp": "2025-11-16T18:15:00.000Z"
}
```

**Success Criteria**:
- ✅ `success: true`
- ✅ All three API sources present
- ✅ Correct quota limits
- ✅ Valid reset dates

---

### ✅ Phase 3: Calculation Endpoints

#### Test 3.1: Calculate Flip Analysis

**Purpose**: Verify flip calculation logic.

```bash
curl -X POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec \
  -H "Content-Type: application/json" \
  -d '{
    "action": "calculateFlip",
    "data": {
      "purchasePrice": 200000,
      "rehabCost": 50000,
      "arv": 300000,
      "closingCosts": 5000,
      "holdingMonths": 6
    }
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "purchasePrice": 200000,
    "rehabCost": 50000,
    "arv": 300000,
    "closingCosts": 5000,
    "totalInvestment": 255000,
    "sellingCosts": 24000,
    "netProfit": 21000,
    "roi": 8.24,
    "holdingMonths": 6,
    "timeline": "6 months"
  },
  "timestamp": "2025-11-16T18:15:00.000Z"
}
```

**Success Criteria**:
- ✅ `success: true`
- ✅ Correct calculations (verify manually)
- ✅ All expected fields present
- ✅ ROI is a percentage (not decimal)

#### Test 3.2: Calculate Rental Analysis

**Purpose**: Verify rental calculation logic.

```bash
curl -X POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec \
  -H "Content-Type: application/json" \
  -d '{
    "action": "calculateRental",
    "data": {
      "purchasePrice": 200000,
      "monthlyRent": 2000,
      "downPayment": 50000,
      "interestRate": 7.0,
      "loanTerm": 30,
      "propertyTax": 200,
      "insurance": 100,
      "hoaFees": 0,
      "maintenance": 100,
      "vacancy": 160
    }
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "purchasePrice": 200000,
    "downPayment": 50000,
    "loanAmount": 150000,
    "monthlyRent": 2000,
    "monthlyPayment": 997.95,
    "propertyTax": 200,
    "insurance": 100,
    "hoaFees": 0,
    "maintenance": 100,
    "vacancy": 160,
    "totalExpenses": 1557.95,
    "cashFlow": 442.05,
    "capRate": 6.0,
    "cashOnCashReturn": 10.61
  },
  "timestamp": "2025-11-16T18:15:00.000Z"
}
```

**Success Criteria**:
- ✅ `success: true`
- ✅ Positive cash flow
- ✅ Reasonable cap rate (4-10%)
- ✅ All expense fields present

---

### ✅ Phase 4: Comps Fetching

#### Test 4.1: Fetch Comps (Cached)

**Purpose**: Verify comps fetching with cache.

```bash
curl -X POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec \
  -H "Content-Type: application/json" \
  -d '{
    "action": "fetchComps",
    "data": {
      "address": "123 Main St",
      "city": "Los Angeles",
      "state": "CA",
      "zip": "90001",
      "forceRefresh": false
    }
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "comps": [
      {
        "address": "456 Oak Ave",
        "price": 825000,
        "sqft": 1600,
        "beds": 3,
        "baths": 2,
        "saleDate": "11/15/2025",
        "distance": 0.5,
        "condition": "remodeled",
        "link": "https://www.zillow.com/...",
        "dataSource": "zillow"
      }
    ],
    "count": 6,
    "cached": false
  },
  "timestamp": "2025-11-16T18:15:00.000Z"
}
```

**Success Criteria**:
- ✅ `success: true`
- ✅ At least 3 comps returned
- ✅ Each comp has required fields (address, price, sqft)
- ✅ Sale dates are recent (last 2 years)
- ✅ Data source is identified

#### Test 4.2: Fetch Comps (Force Refresh)

**Purpose**: Verify cache bypass works.

```bash
curl -X POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec \
  -H "Content-Type: application/json" \
  -d '{
    "action": "fetchComps",
    "data": {
      "address": "123 Main St",
      "city": "Los Angeles",
      "state": "CA",
      "zip": "90001",
      "forceRefresh": true
    }
  }'
```

**Success Criteria**:
- ✅ `success: true`
- ✅ `cached: false` in response
- ✅ Fresh data from API

---

### ✅ Phase 5: Full Analysis

#### Test 5.1: Complete Property Analysis

**Purpose**: Verify end-to-end analysis workflow.

```bash
curl -X POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec \
  -H "Content-Type: application/json" \
  -d '{
    "action": "analyze",
    "data": {
      "address": "123 Main St",
      "city": "Los Angeles",
      "state": "CA",
      "zip": "90001",
      "purchasePrice": 500000
    }
  }'
```

**Expected Response Structure**:
```json
{
  "success": true,
  "data": {
    "property": {
      "address": "123 Main St",
      "city": "Los Angeles",
      "state": "CA",
      "zip": "90001",
      "beds": 3,
      "baths": 2,
      "sqft": 1500
    },
    "comps": [...],
    "flip": {
      "purchasePrice": 500000,
      "rehabCost": 0,
      "arv": 600000,
      "netProfit": 50000,
      "roi": 10.0
    },
    "rental": {
      "monthlyRent": 5000,
      "cashFlow": 500,
      "capRate": 6.0,
      "cashOnCashReturn": 8.0
    },
    "score": {
      "score": 75,
      "stars": 4,
      "rating": "Good"
    },
    "alerts": [...],
    "insights": [...]
  },
  "timestamp": "2025-11-16T18:15:00.000Z"
}
```

**Success Criteria**:
- ✅ `success: true`
- ✅ All sections present (property, comps, flip, rental, score, alerts, insights)
- ✅ Property details auto-fetched (beds, baths, sqft)
- ✅ ARV calculated from comps
- ✅ Rental estimates auto-calculated
- ✅ Score between 0-100
- ✅ Alerts and insights generated

---

### ✅ Phase 6: Error Handling

#### Test 6.1: Missing Required Fields

**Purpose**: Verify validation works.

```bash
curl -X POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec \
  -H "Content-Type: application/json" \
  -d '{
    "action": "analyze",
    "data": {
      "address": "123 Main St"
    }
  }'
```

**Expected Response**:
```json
{
  "success": false,
  "error": "Missing required field: city",
  "timestamp": "2025-11-16T18:15:00.000Z"
}
```

**Success Criteria**:
- ✅ `success: false`
- ✅ Clear error message
- ✅ Identifies missing field

#### Test 6.2: Invalid Action

**Purpose**: Verify unknown actions are handled.

```bash
curl -X POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec \
  -H "Content-Type: application/json" \
  -d '{
    "action": "invalidAction",
    "data": {}
  }'
```

**Expected Response**:
```json
{
  "success": false,
  "error": "Unknown action: invalidAction",
  "timestamp": "2025-11-16T18:15:00.000Z"
}
```

**Success Criteria**:
- ✅ `success: false`
- ✅ Clear error message

#### Test 6.3: Invalid Data Types

**Purpose**: Verify type validation.

```bash
curl -X POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec \
  -H "Content-Type: application/json" \
  -d '{
    "action": "calculateFlip",
    "data": {
      "purchasePrice": "not a number",
      "rehabCost": 50000,
      "arv": 300000
    }
  }'
```

**Expected Response**:
```json
{
  "success": false,
  "error": "Purchase price must be a positive number",
  "timestamp": "2025-11-16T18:15:00.000Z"
}
```

**Success Criteria**:
- ✅ `success: false`
- ✅ Clear validation error

---

## Testing with Postman

### Setup

1. Open Postman
2. Create a new Collection: "Real Estate Analysis Tool API"
3. Add environment variable: `API_URL` = your Web App URL

### Test Collection

Import these tests into Postman:

#### 1. Health Check
- **Method**: GET
- **URL**: `{{API_URL}}`
- **Tests**:
```javascript
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has correct structure", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('status');
    pm.expect(jsonData).to.have.property('message');
    pm.expect(jsonData).to.have.property('version');
});
```

#### 2. Get API Usage
- **Method**: POST
- **URL**: `{{API_URL}}`
- **Body** (JSON):
```json
{
  "action": "getApiUsage",
  "data": {}
}
```
- **Tests**:
```javascript
pm.test("Success is true", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});

pm.test("Has all API sources", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('zillow');
    pm.expect(jsonData.data).to.have.property('usRealEstate');
    pm.expect(jsonData.data).to.have.property('gemini');
});
```

#### 3. Calculate Flip
- **Method**: POST
- **URL**: `{{API_URL}}`
- **Body** (JSON):
```json
{
  "action": "calculateFlip",
  "data": {
    "purchasePrice": 200000,
    "rehabCost": 50000,
    "arv": 300000,
    "closingCosts": 5000,
    "holdingMonths": 6
  }
}
```
- **Tests**:
```javascript
pm.test("Success is true", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});

pm.test("Has flip analysis data", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('netProfit');
    pm.expect(jsonData.data).to.have.property('roi');
});
```

---

## Troubleshooting

### Issue: "Authorization required"

**Solution**:
1. Redeploy the Web App
2. Ensure "Execute as: Me" is selected
3. Ensure "Who has access: Anyone" is selected
4. Re-authorize the script

### Issue: "Script function not found"

**Solution**:
1. Verify `API_webAppEndpoint.js` is uploaded to Apps Script
2. Check that `doGet()` and `doPost()` functions exist
3. Redeploy with a new version

### Issue: "All API sources failed"

**Solution**:
1. Check Script Properties for API keys
2. Verify API keys are valid on RapidAPI dashboard
3. Check quota limits with `getApiUsage` action
4. Review Apps Script execution logs

### Issue: CORS errors from frontend

**Note**: Google Apps Script Web Apps have limited CORS support. The frontend must:
- Use the Web App URL directly (not through a proxy)
- Handle redirects properly (`redirect: 'follow'`)
- Not send credentials

---

## Performance Testing

### Test Response Times

```bash
# Test 10 requests and measure average response time
for i in {1..10}; do
  time curl -X POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec \
    -H "Content-Type: application/json" \
    -d '{"action":"getApiUsage","data":{}}' \
    -o /dev/null -s
done
```

**Expected Performance**:
- Health check: < 1 second
- API usage: < 2 seconds
- Calculate flip/rental: < 2 seconds
- Fetch comps: 3-5 seconds (first call), < 1 second (cached)
- Full analysis: 5-10 seconds (first call), 2-3 seconds (cached)

---

## Monitoring

### Check Execution Logs

1. Open Apps Script Editor
2. Click **Executions** in left sidebar
3. Review recent executions for errors
4. Check execution time and status

### Monitor API Usage

Run this periodically:
```bash
curl -X POST https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec \
  -H "Content-Type: application/json" \
  -d '{"action":"getApiUsage","data":{}}'
```

Set up alerts when:
- Zillow usage > 90 requests/month
- US Real Estate usage > 90 requests/month
- Gemini usage > 1400 requests/day

---

## Next Steps

After all tests pass:
1. ✅ Update `web-app/.env.local` with Web App URL
2. ✅ Test frontend integration
3. ✅ Deploy to Vercel
4. ✅ Test production deployment

---

**Last Updated**: November 16, 2025
**Version**: 1.0
