# API Endpoint Discovery Document

## Private Zillow API (oneapiproject)
**Base URL:** `https://private-zillow.p.rapidapi.com`
**Quota:** 250 requests/month

### Endpoints to Discover & Test

| Old Endpoint (zillow-com1) | Function Needed | Private Zillow Endpoint | Status |
|---------------------------|-----------------|------------------------|---------|
| `/zestimate` | Property value estimate | TBD | ⏳ Pending |
| `/propertyComps` | Comparable properties | TBD | ⏳ Pending |
| `/priceAndTaxHistory` | Price & tax history | TBD | ⏳ Pending |
| `/valueHistory/zestimatePercentChange` | Market trends | TBD | ⏳ Pending |
| `/walkAndTransitScore` | Walk/Transit scores | TBD | ⏳ Pending |
| `/rentEstimate` | Rent estimates | TBD | ⏳ Pending |
| `/property` | Property details | TBD | ⏳ Pending |

### Testing Checklist
- [ ] Test each endpoint with sample property data
- [ ] Verify X-RapidAPI-Requests-Limit header present (must be a number)
- [ ] Verify X-RapidAPI-Requests-Remaining header present (must be a number)
- [ ] Confirm headers update with each request (remaining should decrease)
- [ ] Document required parameters (mark which are mandatory)
- [ ] Document optional parameters
- [ ] Document response structure (JSON format)
- [ ] Test with both ZPID and address-based queries
- [ ] Verify error handling (test with invalid data)
- [ ] Note any rate limiting behavior (429 status code)
- [ ] Check response time (should be < 3 seconds)
- [ ] Verify data quality (compare with known property values)

---

## Redfin Base US API (tvhaudev)
**Base URL:** `https://redfin-base-us.p.rapidapi.com`
**Quota:** 111 requests/month (hard limit)

### Endpoints to Discover & Test

| Function Needed | Redfin Endpoint | Status |
|-----------------|-----------------|--------|
| Property search (for-sale) | TBD | ⏳ Pending |
| Property search (sold) | TBD | ⏳ Pending |
| Property search (rentals) | TBD | ⏳ Pending |
| Property details | TBD | ⏳ Pending |
| Comparable properties | TBD | ⏳ Pending |
| Market insights | TBD | ⏳ Pending |

### Testing Checklist
- [ ] Test each endpoint with sample property data
- [ ] Verify X-RapidAPI-Requests-Limit header present (should be 111)
- [ ] Verify X-RapidAPI-Requests-Remaining header present (must be a number)
- [ ] Confirm headers update with each request (remaining should decrease)
- [ ] Document required parameters (mark which are mandatory)
- [ ] Document optional parameters
- [ ] Document response structure (JSON format)
- [ ] Test with multiple cities/states
- [ ] Verify error handling (test with invalid data)
- [ ] Note any rate limiting behavior (429 status code)
- [ ] Check response time (should be < 3 seconds)
- [ ] Compare data quality with Private Zillow & US Real Estate
- [ ] Verify listing agent information is included
- [ ] Check days on market data accuracy

---

## US Real Estate API (datascraper) - Already Integrated
**Base URL:** `https://us-real-estate.p.rapidapi.com`
**Quota:** 300 requests/month

### Verify Existing Endpoints Still Work

- [ ] `/for-sale/home-estimate-value` - Home estimate
- [ ] `/for-sale/similiar-homes` - Similar homes
- [ ] `/sold-homes` - Sold homes with filters
- [ ] `/location/schools` - School data
- [ ] `/location/noise-score` - Noise scores
- [ ] `/for-rent` - Rental comps
- [ ] `/for-rent-by-zipcode` - Rental comps by zip
- [ ] `/finance/average-rate` - Average mortgage rate
- [ ] `/finance/rate-trends` - Rate trends
- [ ] `/finance/mortgage-calculate` - Mortgage calculator

### Verify Response Headers
- [ ] Confirm X-RapidAPI-Requests-Limit header format (should be 300)
- [ ] Confirm X-RapidAPI-Requests-Remaining header format (number, decreases with each call)
- [ ] Test header extraction in code (verify parsing works)
- [ ] Confirm headers work for all endpoints (not just some)

---

## Test Property Data

Use this sample data for testing all APIs:

```json
{
  "address": "1600 Amphitheatre Parkway",
  "city": "Mountain View",
  "state": "CA",
  "zip": "94043",
  "zpid": "19508628"
}
```

Alternative test property:
```json
{
  "address": "742 Evergreen Terrace",
  "city": "Springfield",
  "state": "OR",
  "zip": "97475"
}
```

---

## Instructions for MCP Server Testing

### Testing Procedure

For each API and endpoint:

#### Step 1: Setup Test Request
```javascript
// Example test using MCP server
{
  "method": "GET",
  "url": "https://private-zillow.p.rapidapi.com/[ENDPOINT]",
  "headers": {
    "X-RapidAPI-Key": "YOUR_KEY",
    "X-RapidAPI-Host": "private-zillow.p.rapidapi.com"
  },
  "params": {
    // Add your test parameters here
  }
}
```

#### Step 2: Send Request & Capture Response
- Send the request via your MCP server
- Capture full response including headers
- Note the status code (should be 200 for success)

#### Step 3: Verify Response Headers
Check for these headers in the response:
```
X-RapidAPI-Requests-Limit: [number]
X-RapidAPI-Requests-Remaining: [number]
X-RapidAPI-Proxy-Response: ms
Content-Type: application/json
```

#### Step 4: Document Findings
For each endpoint, record:

**✅ Endpoint Path:** `/actual/endpoint/path`
**✅ HTTP Method:** GET, POST, etc.
**✅ Required Parameters:**
- `param1` (type) - description
- `param2` (type) - description

**✅ Optional Parameters:**
- `param3` (type) - description

**✅ Response Structure:**
```json
{
  "field1": "value",
  "field2": "value"
}
```

**✅ Response Headers:**
- X-RapidAPI-Requests-Limit: 250
- X-RapidAPI-Requests-Remaining: 248

**✅ Notes:**
- Any special behaviors
- Error codes encountered
- Rate limiting observations

#### Step 5: Test Error Conditions
Test each endpoint with:
- [ ] Missing required parameters (expect 400 error)
- [ ] Invalid parameter values (expect 400 error)
- [ ] Non-existent property (expect 404 or empty results)
- [ ] Malformed request (expect 400 error)

#### Step 6: Verify Header-Based Tracking
- [ ] Make first call, note remaining quota
- [ ] Make second call, verify remaining decreased by 1
- [ ] Confirm limit stays constant
- [ ] Verify percentage calculation: (limit - remaining) / limit * 100

---

## Results Template

Use this template to document your findings:

```markdown
## [API Name] Test Results

**Date Tested:** YYYY-MM-DD
**Tester:** Your Name
**MCP Server Used:** [Server Name/Version]

### Endpoint: [Endpoint Name]
- **Path:** `/actual/path`
- **Method:** GET/POST
- **Status:** ✅ Working / ❌ Failed / ⚠️ Partial

**Required Parameters:**
- `param1`: string - Property address
- `param2`: string - City name

**Response Sample:**
```json
{
  "example": "response"
}
```

**Headers Verified:**
- ✅ X-RapidAPI-Requests-Limit: 250
- ✅ X-RapidAPI-Requests-Remaining: 248
- ✅ Headers update correctly: Yes

**Issues/Notes:**
- Any problems encountered
- Performance observations
- Data quality assessment

---
```

## Next Steps After Testing

### 1. Update Endpoint Definitions
Once you've discovered the actual endpoints:

**File:** `shared-core/api/endpoints.js`
```javascript
const PRIVATE_ZILLOW_ENDPOINTS = {
  ZESTIMATE: '/actual/zestimate/path',  // Update with real path
  PROPERTY_COMPS: '/actual/comps/path',  // Update with real path
  // ... etc
};

const REDFIN_ENDPOINTS = {
  PROPERTY_DETAILS: '/actual/details/path',  // Update with real path
  // ... etc
};
```

### 2. Update API Function Files
**File:** `shared-core/api/privateZillow.js`
- Update the `endpoint` values in each function
- Adjust parameter names to match actual API
- Update response parsing based on actual structure

**File:** `shared-core/api/redfin.js`
- Update the `endpoint` values in each function
- Adjust parameter names to match actual API
- Update response parsing based on actual structure

### 3. Test Integration
- [ ] Run property analysis in web-app
- [ ] Run property analysis in Google Sheets
- [ ] Verify usage tracking displays correctly
- [ ] Test API failover (force one API to fail)
- [ ] Verify quota warnings trigger at thresholds

### 4. Update Documentation
- [ ] Mark all checklist items as complete in this file
- [ ] Update API_MIGRATION_SUMMARY.md with test results
- [ ] Document any API limitations or quirks found
- [ ] Create example requests/responses in documentation

---

## Quick Test Script

Use this to quickly test an endpoint and verify headers:

```javascript
// Test script for MCP server or browser console
async function testRapidAPIEndpoint(apiUrl, endpoint, params) {
  const url = new URL(endpoint, apiUrl);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': 'YOUR_KEY_HERE',
      'X-RapidAPI-Host': new URL(apiUrl).hostname
    }
  });

  // Extract headers
  const limit = response.headers.get('X-RapidAPI-Requests-Limit');
  const remaining = response.headers.get('X-RapidAPI-Requests-Remaining');

  console.log('Status:', response.status);
  console.log('Limit:', limit);
  console.log('Remaining:', remaining);
  console.log('Used:', limit - remaining);
  console.log('Percentage:', ((limit - remaining) / limit * 100).toFixed(1) + '%');

  const data = await response.json();
  console.log('Response:', data);

  return {
    status: response.status,
    headers: {
      limit: parseInt(limit),
      remaining: parseInt(remaining),
      used: parseInt(limit) - parseInt(remaining),
      percentage: ((parseInt(limit) - parseInt(remaining)) / parseInt(limit)) * 100
    },
    data: data
  };
}

// Example usage:
// Private Zillow Test
testRapidAPIEndpoint(
  'https://private-zillow.p.rapidapi.com',
  '/endpoint-to-test',  // Replace with actual endpoint
  { zpid: '19508628' }  // Replace with actual parameters
);

// Redfin Test
testRapidAPIEndpoint(
  'https://redfin-base-us.p.rapidapi.com',
  '/endpoint-to-test',  // Replace with actual endpoint
  { address: '1600 Amphitheatre Parkway', city: 'Mountain View', state: 'CA' }
);
```

## Validation Checklist

Before marking testing complete, verify:

### Private Zillow API
- [ ] All 7 endpoints discovered and documented
- [ ] Headers present on all endpoints
- [ ] Can fetch property data by ZPID
- [ ] Response structure documented
- [ ] Quality better than or equal to old zillow-com1

### Redfin Base US API
- [ ] At least 4 core endpoints discovered
- [ ] Headers present on all endpoints
- [ ] Can fetch property data by address
- [ ] Listing agent data available
- [ ] Days on market data available

### US Real Estate API
- [ ] All 10 existing endpoints still work
- [ ] Headers present and correct (limit: 300)
- [ ] Response structure unchanged
- [ ] No breaking changes

### Header-Based Tracking
- [ ] Headers parse correctly in code
- [ ] Usage decrements with each call
- [ ] Percentage calculations accurate
- [ ] Cache stores usage data correctly
- [ ] UI displays usage in real-time

## Notes

- All RapidAPI endpoints should include usage headers in responses
- Test with small sample sizes to preserve quota (each test costs 1 request)
- Verify error handling for rate limit exceeded scenarios
- Check if any endpoints require ZPID vs address parameters
- Document any API quirks or limitations found during testing
- Save sample responses for reference

