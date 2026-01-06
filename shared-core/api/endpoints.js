/**
 * ===============================
 * API ENDPOINT DEFINITIONS
 * ===============================
 *
 * Centralized API endpoint configuration for all external APIs
 * Used by both Google Sheets (Apps Script) and Web App (TypeScript)
 *
 * @module shared-core/api/endpoints
 */

/**
 * API Priority Order (UPDATED - Quality-Based)
 * Priority 1: Private Zillow API (250/month) - Highest quality data
 * Priority 2: US Real Estate API (300/month) - High quality data
 * Priority 3: Redfin Base US API (111/month) - Good quality data
 * Priority 4: Gemini AI (1500/day) - Fallback only
 *
 * Usage Tracking: Real-time via X-RapidAPI-* response headers
 */

/**
 * Private Zillow API Endpoints (via RapidAPI)
 * Host: private-zillow.p.rapidapi.com
 * NOTE: Endpoints to be discovered via MCP server testing
 * See ENDPOINT_DISCOVERY.md for testing progress
 */
const PRIVATE_ZILLOW_ENDPOINTS = {
  // To be filled after MCP server discovery
  // Expected endpoints:
  // ZESTIMATE: '/endpoint-tbd',
  // PROPERTY_COMPS: '/endpoint-tbd',
  // PRICE_TAX_HISTORY: '/endpoint-tbd',
  // ZESTIMATE_PERCENT_CHANGE: '/endpoint-tbd',
  // WALK_TRANSIT_SCORE: '/endpoint-tbd',
  // RENT_ESTIMATE: '/endpoint-tbd',
  // PROPERTY_DETAILS: '/endpoint-tbd'
};

/**
 * Redfin Base US API Endpoints (via RapidAPI)
 * Host: redfin-base-us.p.rapidapi.com
 * NOTE: Endpoints to be discovered via MCP server testing
 * See ENDPOINT_DISCOVERY.md for testing progress
 */
const REDFIN_ENDPOINTS = {
  // To be filled after MCP server discovery
  // Expected endpoints:
  // PROPERTY_SEARCH: '/endpoint-tbd',
  // PROPERTY_DETAILS: '/endpoint-tbd',
  // SOLD_HOMES: '/endpoint-tbd',
  // FOR_RENT: '/endpoint-tbd',
  // COMPS: '/endpoint-tbd'
};

/**
 * US Real Estate API Endpoints (via RapidAPI)
 * Host: us-real-estate.p.rapidapi.com
 */
const US_REAL_ESTATE_ENDPOINTS = {
  // Phase 1.3: Home estimate for ARV validation
  HOME_ESTIMATE: '/for-sale/home-estimate-value',

  // Phase 1.4: AI-matched similar homes (replaces generic search)
  SIMILAR_HOMES: '/for-sale/similiar-homes',

  // Phase 2.4: Advanced comps search with filters
  SOLD_HOMES: '/sold-homes',

  // Phase 3.1: School quality data
  SCHOOLS: '/location/schools',

  // Phase 3.3: Noise score assessment
  NOISE_SCORE: '/location/noise-score',

  // Phase 3.5: Rental comps
  FOR_RENT: '/for-rent',
  FOR_RENT_BY_ZIPCODE: '/for-rent-by-zipcode',

  // Phase 3.6: Financial tools
  AVERAGE_RATE: '/finance/average-rate',
  RATE_TRENDS: '/finance/rate-trends',
  MORTGAGE_CALCULATE: '/finance/mortgage-calculate'
};

/**
 * Gemini AI API Endpoints
 * Host: generativelanguage.googleapis.com
 */
const GEMINI_ENDPOINTS = {
  // Generate content (comps, analysis, etc.)
  GENERATE_CONTENT: '/v1beta/models/gemini-2.0-flash-exp:generateContent',

  // Fallback model
  GENERATE_CONTENT_PRO: '/v1beta/models/gemini-pro:generateContent'
};

/**
 * API Quota Limits (UPDATED for new APIs)
 * NOTE: Actual usage tracked via X-RapidAPI-* response headers
 */
const API_QUOTAS = {
  // Priority 1: Private Zillow (250/month)
  PRIVATE_ZILLOW_MONTHLY_LIMIT: 250,
  PRIVATE_ZILLOW_THRESHOLD: 225, // 90% threshold

  // Priority 2: US Real Estate (300/month)
  US_REAL_ESTATE_MONTHLY_LIMIT: 300,
  US_REAL_ESTATE_THRESHOLD: 270, // 90% threshold

  // Priority 3: Redfin (111/month - hard limit)
  REDFIN_MONTHLY_LIMIT: 111,
  REDFIN_THRESHOLD: 100, // 90% threshold

  // Priority 4: Gemini (1500/day)
  GEMINI_DAILY_LIMIT: 1500,
  GEMINI_THRESHOLD: 1400 // 93% threshold
};

/**
 * Get Private Zillow endpoint URL
 * @param {string} endpoint - Endpoint key from PRIVATE_ZILLOW_ENDPOINTS
 * @returns {string} Full endpoint path
 */
function getPrivateZillowEndpoint(endpoint) {
  return PRIVATE_ZILLOW_ENDPOINTS[endpoint] || '';
}

/**
 * Get Redfin endpoint URL
 * @param {string} endpoint - Endpoint key from REDFIN_ENDPOINTS
 * @returns {string} Full endpoint path
 */
function getRedfinEndpoint(endpoint) {
  return REDFIN_ENDPOINTS[endpoint] || '';
}

/**
 * Get US Real Estate endpoint URL
 * @param {string} endpoint - Endpoint key from US_REAL_ESTATE_ENDPOINTS
 * @returns {string} Full endpoint path
 */
function getUSRealEstateEndpoint(endpoint) {
  return US_REAL_ESTATE_ENDPOINTS[endpoint] || '';
}

/**
 * Get Gemini endpoint URL
 * @param {string} endpoint - Endpoint key from GEMINI_ENDPOINTS
 * @returns {string} Full endpoint path
 */
function getGeminiEndpoint(endpoint) {
  return GEMINI_ENDPOINTS[endpoint] || '';
}

/**
 * Get API quota limit
 * @param {string} apiName - API name (private_zillow, us_real_estate, redfin, gemini)
 * @param {string} period - Period (month, day)
 * @returns {number} Quota limit
 */
function getAPIQuotaLimit(apiName, period) {
  const key = `${apiName.toUpperCase()}_${period.toUpperCase()}_LIMIT`;
  return API_QUOTAS[key] || 0;
}

/**
 * Get API quota threshold
 * @param {string} apiName - API name (private_zillow, us_real_estate, redfin, gemini)
 * @returns {number} Quota threshold
 */
function getAPIQuotaThreshold(apiName) {
  const key = `${apiName.toUpperCase()}_THRESHOLD`;
  return API_QUOTAS[key] || 0;
}
