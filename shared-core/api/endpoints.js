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
 * API Priority Order (Phase 1.1 - UPDATED)
 * Priority 1: US Real Estate API (300/month) - Higher quota
 * Priority 2: Zillow API (100/month) - Lower quota
 * Priority 3: Gemini AI (1500/day) - Fallback
 * Priority 4: Bridge Dataset (no limit) - Last resort
 */

/**
 * Zillow API Endpoints (via RapidAPI)
 * Host: zillow-com1.p.rapidapi.com
 */
const ZILLOW_ENDPOINTS = {
  // Phase 1.2: Zestimate for ARV validation
  ZESTIMATE: '/zestimate',

  // Phase 1.4: AI-matched property comps (replaces generic search)
  PROPERTY_COMPS: '/propertyComps',

  // Phase 2.1: Historical price and tax data
  PRICE_TAX_HISTORY: '/priceAndTaxHistory',

  // Phase 2.2: Market trend analysis
  ZESTIMATE_PERCENT_CHANGE: '/valueHistory/zestimatePercentChange',
  LOCAL_HOME_VALUES: '/valueHistory/localHomeValues',

  // Phase 3.2: Walkability and transit scores
  WALK_TRANSIT_SCORE: '/walkAndTransitScore',

  // Phase 3.5: Rental estimates
  RENT_ESTIMATE: '/rentEstimate',
  LOCAL_RENTAL_RATES: '/valueHistory/localRentalRates',

  // Existing: Property details and generic search
  PROPERTY_DETAILS: '/property',
  PROPERTY_EXTENDED_SEARCH: '/propertyExtendedSearch'
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
 * Bridge Dataset API Endpoints
 * Host: Configured via BRIDGE_BASE_URL
 */
const BRIDGE_ENDPOINTS = {
  // Market data
  MARKET_DATA: '/api/v2/zgecon',

  // Rental data
  RENTALS: '/api/v2/rentals',

  // Property data (if available)
  PROPERTIES: '/api/v2/properties'
};

/**
 * API Quota Limits (Phase 1.1 - UPDATED)
 */
const API_QUOTAS = {
  // Priority 1: US Real Estate (300/month)
  US_REAL_ESTATE_MONTHLY_LIMIT: 300,
  US_REAL_ESTATE_THRESHOLD: 270, // 90% threshold

  // Priority 2: Zillow (100/month)
  ZILLOW_MONTHLY_LIMIT: 100,
  ZILLOW_THRESHOLD: 90, // 90% threshold

  // Priority 3: Gemini (1500/day)
  GEMINI_DAILY_LIMIT: 1500,
  GEMINI_THRESHOLD: 1400 // 93% threshold
};

/**
 * Cache Duration Settings (Phase 2.5)
 */
const CACHE_DURATIONS = {
  // Property-specific data (7 days)
  PROPERTY_DETAILS: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  COMPS: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  ESTIMATES: 7 * 24 * 60 * 60 * 1000, // 7 days in ms

  // Location data (30 days)
  SCHOOLS: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  WALK_SCORE: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  NOISE_SCORE: 30 * 24 * 60 * 60 * 1000, // 30 days in ms

  // Market data (1 day - changes frequently)
  MARKET_RATES: 24 * 60 * 60 * 1000, // 1 day in ms
  RENTAL_RATES: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
};

/**
 * Get Zillow endpoint URL
 * @param {string} endpoint - Endpoint key from ZILLOW_ENDPOINTS
 * @returns {string} Full endpoint path
 */
function getZillowEndpoint(endpoint) {
  return ZILLOW_ENDPOINTS[endpoint] || '';
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
 * Get Bridge endpoint URL
 * @param {string} endpoint - Endpoint key from BRIDGE_ENDPOINTS
 * @returns {string} Full endpoint path
 */
function getBridgeEndpoint(endpoint) {
  return BRIDGE_ENDPOINTS[endpoint] || '';
}

/**
 * Get API quota limit
 * @param {string} apiName - API name (zillow, us_real_estate, gemini)
 * @param {string} period - Period (month, day)
 * @returns {number} Quota limit
 */
function getAPIQuotaLimit(apiName, period) {
  const key = `${apiName.toUpperCase()}_${period.toUpperCase()}_LIMIT`;
  return API_QUOTAS[key] || 0;
}

/**
 * Get API quota threshold
 * @param {string} apiName - API name (zillow, us_real_estate, gemini)
 * @returns {number} Quota threshold
 */
function getAPIQuotaThreshold(apiName) {
  const key = `${apiName.toUpperCase()}_THRESHOLD`;
  return API_QUOTAS[key] || 0;
}

/**
 * Get cache duration for data type
 * @param {string} dataType - Data type key from CACHE_DURATIONS
 * @returns {number} Cache duration in milliseconds
 */
function getCacheDuration(dataType) {
  return CACHE_DURATIONS[dataType] || CACHE_DURATIONS.PROPERTY_DETAILS;
}
