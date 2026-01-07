/**
 * ===============================
 * API BASE URLS - CORRECT PRIORITY
 * ===============================
 *
 * Priority Order:
 * 1. PRIVATE_ZILLOW (250 calls/month) - oneapiproject
 * 2. US_REAL_ESTATE (300 calls/month) - datascraper
 * 3. REDFIN (111 calls/month) - tvhaudev
 * 4. GEMINI (1500 calls/day) - Fallback only
 *
 * NOTE: zillow-com1.p.rapidapi.com NO LONGER EXISTS
 */
const PRIVATE_ZILLOW_BASE_URL = 'https://private-zillow.p.rapidapi.com';
const US_REAL_ESTATE_BASE_URL = 'https://us-real-estate.p.rapidapi.com';
const REDFIN_BASE_URL = 'https://redfin-base-us.p.rapidapi.com';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com';
// DEPRECATED: Old Zillow API (zillow-com1) no longer exists
const ZILLOW_BASE_URL = null; // Will cause errors if legacy functions are called

/**
 * Get all secure keys from Script Properties
 * MIGRATED: Phase 0.6 - Now uses QuotaManager adapter
 */
function getApiKeys() {
  return QuotaManager.getAPIKeys();
}

/**
 * Get API quota limits from Script Properties
 * Set these in: Project Settings → Script Properties
 * MIGRATED: Phase 0.6 - Now uses QuotaManager adapter
 */
function getApiQuotas() {
  return QuotaManager.getQuotaLimits();
}

/**
 * Check if API quota is available
 * MIGRATED: Phase 0.6 - Now uses QuotaManager adapter
 * @param {string} apiName - Name of the API (zillow, us_real_estate, gemini)
 * @param {string} period - 'month' or 'day'
 * @returns {boolean} - True if quota available, false if exceeded
 */
function checkQuotaAvailable(apiName, period = 'month') {
  const quotas = getApiQuotas();

  // Get current period key (YYYY-MM for month, YYYY-MM-DD for day)
  const now = new Date();
  const periodKey = period === 'month'
    ? now.toISOString().slice(0, 7)  // "2025-11"
    : now.toISOString().slice(0, 10); // "2025-11-15"

  // Get current usage
  const currentUsage = QuotaManager.getUsage(apiName, periodKey);

  // Get limit and threshold
  const limitKey = `${apiName.toUpperCase()}_${period.toUpperCase()}_LIMIT`;
  const thresholdKey = `${apiName.toUpperCase()}_THRESHOLD`;
  const limit = quotas[limitKey] || 100;

  // Use specific threshold if set, otherwise calculate from global threshold percentage (default 90%)
  const thresholdPercent = quotas.THRESHOLD_PERCENT || 0.9;
  const threshold = quotas[thresholdKey] || Math.floor(limit * thresholdPercent);

  // Check if under threshold
  const available = currentUsage < threshold;

  // Enhanced logging with percentage
  const usagePercent = limit > 0 ? Math.round((currentUsage / limit) * 100) : 0;
  PlatformLogger.info(
    `📊 ${apiName}: ${currentUsage}/${limit} (${usagePercent}%) | ` +
    `Threshold: ${threshold} (${Math.round(thresholdPercent * 100)}%) | ` +
    `Status: ${available ? '✅ Available' : '⚠️ Threshold Exceeded'}`
  );

  return available;
}

/**
 * Display current API usage from RapidAPI response headers
 * Run this from: REI Tools > Advanced Tools > Check API Usage
 * UPDATED: Now uses header-based real-time tracking
 */
function showAPIUsage() {
  const cache = CacheService.getScriptCache();

  // Get cached usage from response headers
  const privateZillowUsage = JSON.parse(cache.get('private_zillow_usage') || 'null');
  const usRealEstateUsage = JSON.parse(cache.get('us_real_estate_usage') || 'null');
  const redfinUsage = JSON.parse(cache.get('redfin_usage') || 'null');
  const geminiUsage = JSON.parse(cache.get('gemini_usage') || 'null');

  // Get last success info
  const lastSuccess = QuotaManager.getLastSuccess();

  // Build message
  const message = `
📊 API Usage Report (Real-time from RapidAPI Headers)

🔹 Private Zillow (Priority 1)
   ${privateZillowUsage ?
     `Used: ${privateZillowUsage.used}/${privateZillowUsage.limit} (${privateZillowUsage.percentage.toFixed(1)}%)
   Remaining: ${privateZillowUsage.remaining}` :
     'No recent calls - usage unknown'}

🔹 US Real Estate (Priority 2)
   ${usRealEstateUsage ?
     `Used: ${usRealEstateUsage.used}/${usRealEstateUsage.limit} (${usRealEstateUsage.percentage.toFixed(1)}%)
   Remaining: ${usRealEstateUsage.remaining}` :
     'No recent calls - usage unknown'}

🔹 Redfin Base US (Priority 3)
   ${redfinUsage ?
     `Used: ${redfinUsage.used}/${redfinUsage.limit} (${redfinUsage.percentage.toFixed(1)}%)
   Remaining: ${redfinUsage.remaining}` :
     'No recent calls - usage unknown'}

🔹 Gemini AI (Priority 4 - Fallback)
   ${geminiUsage ?
     `Used: ${geminiUsage.used}/${geminiUsage.limit} (${geminiUsage.percentage.toFixed(1)}%)
   Remaining: ${geminiUsage.remaining}` :
     'No recent calls - usage unknown'}

Last Successful API: ${lastSuccess.api}
Last Success Time: ${lastSuccess.time}

ℹ️ Usage data is updated in real-time from API response headers.
ℹ️ Data is cached for 1 hour. Make an API call to refresh.
  `;

  SpreadsheetApp.getUi().alert('API Usage Report', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Track API usage for monitoring and optimization
 * MIGRATED: Phase 0.6 - Now uses QuotaManager adapter
 */
function trackAPIUsage(source, success) {
  try {
    const now = new Date();
    const periodKey = source === 'gemini'
      ? now.toISOString().slice(0, 10)  // Daily for Gemini
      : now.toISOString().slice(0, 7);   // Monthly for others

    const newUsage = QuotaManager.incrementUsage(source, periodKey);

    if (success) {
      QuotaManager.trackSuccess(source);
    }

    PlatformLogger.logAPI(source, success ? 'SUCCESS' : 'FAILED');
    PlatformLogger.info(`Total this period: ${newUsage}`);
  } catch (e) {
    PlatformLogger.warn(`Failed to track API usage: ${e}`);
  }
}

/**
 * Retry a function with exponential backoff
 * MIGRATED: Phase 0.6 - Now uses HttpClient.retryWithBackoff for HTTP calls
 * This version is kept for non-HTTP retry logic
 */
function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return fn();
    } catch (err) {
      lastError = err;
      PlatformLogger.warn(`Attempt ${i + 1} failed: ${err}. Retrying...`);
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        Utilities.sleep(delay);
      }
    }
  }
  throw new Error(`Failed after ${maxRetries} attempts: ${lastError}`);
}

/**
 * Fetch comps data using waterfall API strategy with quota management
 * Priority: US Real Estate → Zillow → Gemini → Bridge
 * UPDATED: Phase 1.1 - Swapped API priority (US Real Estate now Priority 1 for 3x capacity)
 * UPDATED: Phase 1.4 - Now uses AI-matched similar homes (propertyComps & similarHomes)
 * UPDATED: Phase 2.5 - Added analysisMode parameter for mode-based conditional logic
 * MIGRATED: Phase 0.6 - Now uses CacheManager, QuotaManager, and PlatformLogger
 *
 * @param {Object} data - Property data including address, city, state, zip, zpid (optional)
 * @param {boolean} forceRefresh - If true, bypass cache and fetch fresh data
 * @param {string} analysisMode - Analysis mode (BASIC, STANDARD, DEEP) - defaults to current mode
 * @returns {Array} Array of comparable properties
 */
function fetchCompsData(data, forceRefresh = false, analysisMode = null) {
  // Get analysis mode if not provided
  const mode = analysisMode || getAnalysisMode();

  // Check if comps fetching is enabled for this mode
  if (!isFeatureEnabled('compsData', mode)) {
    PlatformLogger.info(`📊 Comps fetching disabled for ${mode} mode`);
    return [];
  }

  let comps = [];

  // Priority 1: Private Zillow (250 requests/month)
  const privateZillowQuotaAvailable = checkQuotaAvailable('private_zillow', 'month');
  if (privateZillowQuotaAvailable) {
    try {
      PlatformLogger.info("🏠 Priority 1: Trying Private Zillow for comps (250/month)...");
      comps = retryWithBackoff(() => fetchCompsFromPrivateZillow(data));
      if (comps && comps.length > 0) {
        PlatformLogger.success(`✅ Private Zillow SUCCESS: ${comps.length} comps`);
        trackAPIUsage('private_zillow', true);
        return comps;
      }
    } catch (err) {
      PlatformLogger.warn(`Private Zillow comps failed: ${err.message}`);
      trackAPIUsage('private_zillow', false);
    }
  } else {
    PlatformLogger.warn("Private Zillow quota exceeded, skipping");
  }

  // Priority 2: US Real Estate (300 requests/month)
  if (checkQuotaAvailable('us_real_estate', 'month')) {
    try {
      PlatformLogger.info("🔑 Priority 2: Trying US Real Estate for comps (300/month)...");
      comps = retryWithBackoff(() => fetchCompsFromUSRealEstate(data));
      if (comps && comps.length > 0) {
        PlatformLogger.success(`✅ US Real Estate SUCCESS: ${comps.length} comps`);
        trackAPIUsage('us_real_estate', true);
        return comps;
      }
    } catch (err) {
      PlatformLogger.warn(`US Real Estate comps failed: ${err.message}`);
      trackAPIUsage('us_real_estate', false);
    }
  } else {
    PlatformLogger.warn("US Real Estate quota exceeded, skipping");
  }

  // Priority 3: Redfin (111 requests/month)
  if (checkQuotaAvailable('redfin', 'month')) {
    try {
      PlatformLogger.info("🏘️ Priority 3: Trying Redfin for comps (111/month)...");
      comps = retryWithBackoff(() => fetchCompsFromRedfin(data));
      if (comps && comps.length > 0) {
        PlatformLogger.success(`✅ Redfin SUCCESS: ${comps.length} comps`);
        trackAPIUsage('redfin', true);
        return comps;
      }
    } catch (err) {
      PlatformLogger.warn(`Redfin comps failed: ${err.message}`);
      trackAPIUsage('redfin', false);
    }
  } else {
    PlatformLogger.warn("Redfin quota exceeded, skipping");
  }

  // Priority 4: Gemini AI Fallback (1500 requests/day)
  if (checkQuotaAvailable('gemini', 'day')) {
    try {
      PlatformLogger.info("🤖 Priority 4 (Fallback): Trying Gemini AI (1500/day)...");
      const { GEMINI_API_KEY } = getApiKeys();
      if (GEMINI_API_KEY) {
      comps = retryWithBackoff(() => fetchCompsFromGemini(data, GEMINI_API_KEY));
      if (comps && comps.length > 0) {
          PlatformLogger.success(`✅ Gemini SUCCESS: ${comps.length} comps`);
        trackAPIUsage('gemini', true);
        return comps;
        }
      }
    } catch (err) {
      PlatformLogger.warn(`Gemini failed: ${err.message}`);
      trackAPIUsage('gemini', false);
    }
  } else {
    PlatformLogger.warn("Gemini quota exceeded");
  }

  // All APIs failed or exceeded quota
  PlatformLogger.error("❌ All API sources failed or exceeded quota");
  PlatformLogger.warn("💡 Try using Basic Mode and provide comparable sales manually");
  return [];
}

/**
 * Fetch comps from Private Zillow API
 * NOTE: Will try multiple endpoint patterns to find working one
 */
function fetchCompsFromPrivateZillow(data) {
  const { RAPIDAPI_KEY } = getApiKeys();

  if (!RAPIDAPI_KEY || !data.zip) {
    return [];
  }

  const location = data.zip;

  // Try multiple endpoint patterns
  const endpoints = [
    `/propertyExtendedSearch?location=${encodeURIComponent(location)}&status_type=RecentlySold&home_type=Houses&sort=Newest`,
    `/comps?location=${encodeURIComponent(location)}&status=sold`,
    `/soldHomes?zip=${encodeURIComponent(location)}`,
    `/recentlySold?zipcode=${encodeURIComponent(location)}`
  ];

  for (let endpoint of endpoints) {
    try {
      const url = `${PRIVATE_ZILLOW_BASE_URL}${endpoint}`;

      const options = {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'private-zillow.p.rapidapi.com'
        }
      };

      const response = HttpClient.get(url, options);

      if (response.success && response.statusCode === 200) {
        const json = JSON.parse(response.body);
        const props = json.props || json.properties || json.results || [];

        if (props.length > 0) {
          PlatformLogger.success(`Found Private Zillow endpoint: ${endpoint}`);

          return props.slice(0, 10).map(prop => {
            let formattedDate = "—";
            if (prop.dateSold || prop.soldDate) {
              try {
                const timestamp = prop.dateSold || prop.soldDate;
                const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
                formattedDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
              } catch (e) {
                formattedDate = "—";
              }
            }

            return {
              address: prop.address || prop.streetAddress || 'Unknown',
              city: prop.city || data.city,
              state: prop.state || data.state,
              zip: prop.zip || prop.zipcode || data.zip,
              price: prop.price || prop.soldPrice || 0,
              beds: prop.bedrooms || prop.beds || 0,
              baths: prop.bathrooms || prop.baths || 0,
              sqft: prop.livingArea || prop.sqft || 0,
              yearBuilt: prop.yearBuilt || null,
              saleDate: formattedDate,
              distance: prop.distance || 0,
              propertyUrl: prop.hdpUrl || prop.url || '',
              condition: prop.condition || 'unknown',
              dataSource: 'private_zillow',
              isReal: true
            };
          });
        }
      }
    } catch (e) {
      PlatformLogger.warn(`Private Zillow endpoint ${endpoint} failed: ${e.message}`);
    }
  }

  return [];
}

/**
 * Fetch comps from Redfin API
 * NOTE: Will try multiple endpoint patterns to find working one
 */
function fetchCompsFromRedfin(data) {
  const { RAPIDAPI_KEY } = getApiKeys();

  if (!RAPIDAPI_KEY) {
    return [];
  }

  // Try multiple endpoint patterns
  const endpoints = [
    `/soldHomes?city=${encodeURIComponent(data.city)}&state=${encodeURIComponent(data.state)}`,
    `/comps?zip=${encodeURIComponent(data.zip)}`,
    `/recentlySold?location=${encodeURIComponent(data.city)},${encodeURIComponent(data.state)}`,
    `/properties/sold?zipcode=${encodeURIComponent(data.zip)}`
  ];

  for (let endpoint of endpoints) {
    try {
      const url = `${REDFIN_BASE_URL}${endpoint}`;

    const options = {
      headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'redfin-base-us.p.rapidapi.com'
      }
    };

      const response = HttpClient.get(url, options);

    if (response.success && response.statusCode === 200) {
        const json = JSON.parse(response.body);
        const props = json.homes || json.properties || json.results || [];

        if (props.length > 0) {
          PlatformLogger.success(`Found Redfin endpoint: ${endpoint}`);

          return props.slice(0, 10).map(prop => {
            return {
              address: prop.address || prop.streetAddress || 'Unknown',
              city: prop.city || data.city,
              state: prop.state || data.state,
              zip: prop.zip || prop.zipcode || data.zip,
              price: prop.price || prop.soldPrice || 0,
              beds: prop.beds || prop.bedrooms || 0,
              baths: prop.baths || prop.bathrooms || 0,
              sqft: prop.sqft || prop.livingArea || 0,
              yearBuilt: prop.yearBuilt || prop.year_built || null,
              saleDate: prop.saleDate || prop.soldDate || '—',
              distance: prop.distance || 0,
              propertyUrl: prop.url || prop.link || '',
              condition: prop.condition || 'unknown',
              dataSource: 'redfin',
              isReal: true
            };
          });
        }
      }
    } catch (e) {
      PlatformLogger.warn(`Redfin endpoint ${endpoint} failed: ${e.message}`);
    }
  }

  return [];
}

/**
 * Fetch comps from US Real Estate API (working, known endpoints)
 */
function fetchCompsFromUSRealEstate(data) {
  const { RAPIDAPI_KEY } = getApiKeys();

  if (!RAPIDAPI_KEY) {
    return [];
  }

  // Use similar homes endpoint for best comp matching (v3)
  const url = `${US_REAL_ESTATE_BASE_URL}/v3/for-sale/similiar-homes`;

  const options = {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'us-real-estate.p.rapidapi.com',
      'Content-Type': 'application/json'
    }
  };

  const payload = {
    address: data.address || '',
    city: data.city,
    state_code: data.state,
    zip_code: data.zip
  };

  try {
    const response = HttpClient.post(url, Object.assign({}, options, {
      payload: JSON.stringify(payload)
    }));

    if (response.success && response.statusCode === 200) {
      const json = JSON.parse(response.body);
      const homes = json.data?.home_search?.results || [];

      return homes.slice(0, 10).map(home => {
        return {
          address: home.location?.address?.line || 'Unknown',
          city: home.location?.address?.city || data.city,
          state: home.location?.address?.state_code || data.state,
          zip: home.location?.address?.postal_code || data.zip,
          price: home.list_price || 0,
          beds: home.description?.beds || 0,
          baths: home.description?.baths || 0,
          sqft: home.description?.sqft || 0,
          yearBuilt: home.description?.year_built || null,
          saleDate: home.list_date || '—',
          distance: 0,
          propertyUrl: home.href || '',
          condition: 'unknown',
          dataSource: 'us_real_estate',
          isReal: true
        };
      });
    }
  } catch (e) {
    PlatformLogger.error("US Real Estate response error: " + e);
  }

  return [];
}

/**
 * ===============================
 * LEGACY / DEPRECATED FUNCTIONS
 * ===============================
 * These functions are kept for backwards compatibility but should not be used
 * TODO: Remove after full migration to new API structure
 */

// DEPRECATED: Use fetchCompsFromZillowCom1() and fetchCompsFromUSRealEstate() instead
// function fetchRecentlySoldByZip(data, source = 'zillow') { ... }

/**
 * Use OpenAI API to analyze comps or generate ARV summary
 */
function fetchCompsFromOpenAI(data, OPENAI_API_KEY) {
  const prompt = `
  Analyze recent comparable sales near ${data.address}, ${data.city}, ${data.state} ${data.zip}.
  Provide 3 nearby sold homes with address, price, and square footage.
  Estimate ARV and brief reasoning. Return JSON array [{address, price, sqft, notes}].
  `;
  const url = "https://api.openai.com/v1/chat/completions";
  const payload = {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3
  };

  const res = UrlFetchApp.fetch(url, {
    method: "post",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  try {
    const text = JSON.parse(res.getContentText());
    const jsonStr = text.choices?.[0]?.message?.content || "[]";
    return JSON.parse(jsonStr);
  } catch (e) {
    Logger.log("OpenAI error: " + e);
    return [];
  }
}

/**
 * Fetch property details (beds, baths, sqft) with API priority fallback
 * Priority: Private Zillow → US Real Estate → Redfin → Defaults
 * UPDATED: Correct API priority (zillow-com1 NO LONGER EXISTS)
 */
function fetchPropertyDetails(data) {
  PlatformLogger.info(`🏠 Fetching property details for: ${data.address}, ${data.city}, ${data.state}`);

  // If user provided property details in Basic Mode, use those
  if (data.beds && data.baths && data.sqft) {
    PlatformLogger.info("✅ Using user-provided property details");
    return {
      beds: data.beds,
      baths: data.baths,
      sqft: data.sqft,
      yearBuilt: data.yearBuilt || null,
      lotSize: data.lotSize || null,
      propertyType: data.propertyType || 'Single Family',
      zpid: null
    };
  }

  const { RAPIDAPI_KEY } = getApiKeys();
  if (!RAPIDAPI_KEY) {
    PlatformLogger.warn("⚠️ No RAPIDAPI_KEY found, using defaults");
    return getDefaultPropertyDetails();
  }

  // Priority 1: Try Private Zillow
  try {
    if (checkQuotaAvailable('private_zillow', 'month')) {
      PlatformLogger.info("📍 Priority 1: Trying Private Zillow for property details...");
      const details = fetchPropertyDetailsFromPrivateZillow(data, RAPIDAPI_KEY);
      if (details) {
        PlatformLogger.success("✅ Got property details from Private Zillow");
        trackAPIUsage('private_zillow', true);
        return details;
      }
    }
  } catch (e) {
    PlatformLogger.warn(`Private Zillow property details failed: ${e.message}`);
    trackAPIUsage('private_zillow', false);
  }

  // Priority 2: Try US Real Estate
  try {
    if (checkQuotaAvailable('us_real_estate', 'month')) {
      PlatformLogger.info("🔑 Priority 2: Trying US Real Estate for property details...");
      const details = fetchPropertyDetailsFromUSRealEstate(data, RAPIDAPI_KEY);
      if (details) {
        PlatformLogger.success("✅ Got property details from US Real Estate");
        trackAPIUsage('us_real_estate', true);
        return details;
      }
    }
  } catch (e) {
    PlatformLogger.warn(`US Real Estate property details failed: ${e.message}`);
    trackAPIUsage('us_real_estate', false);
  }

  // Priority 3: Try Redfin
  try {
    if (checkQuotaAvailable('redfin', 'month')) {
      PlatformLogger.info("🏘️ Priority 3: Trying Redfin for property details...");
      const details = fetchPropertyDetailsFromRedfin(data, RAPIDAPI_KEY);
      if (details) {
        PlatformLogger.success("✅ Got property details from Redfin");
        trackAPIUsage('redfin', true);
        return details;
      }
    }
  } catch (e) {
    PlatformLogger.warn(`Redfin property details failed: ${e.message}`);
    trackAPIUsage('redfin', false);
  }

  // Fallback to defaults with helpful message
  PlatformLogger.warn("⚠️ All property details APIs failed, using defaults");
  PlatformLogger.warn("💡 For accurate details, use Basic Mode and enter property info manually");

  return getDefaultPropertyDetails();
}

/**
 * Fetch property details from Private Zillow API
 * NOTE: Endpoint path may need adjustment based on API documentation
 */
function fetchPropertyDetailsFromPrivateZillow(data, apiKey) {
  const fullAddress = `${data.address}, ${data.city}, ${data.state} ${data.zip}`.trim();

  // Try common endpoint patterns
  const endpoints = [
    `/property?address=${encodeURIComponent(fullAddress)}`,
    `/propertyDetails?address=${encodeURIComponent(fullAddress)}`,
    `/property-details?address=${encodeURIComponent(fullAddress)}`
  ];

  for (let endpoint of endpoints) {
    try {
      const url = `${PRIVATE_ZILLOW_BASE_URL}${endpoint}`;

  const options = {
    headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'private-zillow.p.rapidapi.com'
    }
  };

    const response = HttpClient.get(url, options);

    if (response.success && response.statusCode === 200) {
      const json = JSON.parse(response.body);

        // Private Zillow may have different field names
        if (json.bedrooms || json.beds || json.livingArea || json.sqft) {
          return {
        beds: json.bedrooms || json.beds || 3,
        baths: json.bathrooms || json.baths || 2,
        sqft: json.livingArea || json.sqft || 1500,
        yearBuilt: json.yearBuilt || null,
        lotSize: json.lotSize || null,
        propertyType: json.propertyType || json.homeType || 'Single Family',
            zpid: json.zpid || null
          };
        }
      }
    } catch (e) {
      PlatformLogger.warn(`Private Zillow endpoint ${endpoint} failed: ${e.message}`);
    }
  }

  return null;
}

/**
 * Fetch property details from Redfin API
 * NOTE: Endpoint path may need adjustment based on API documentation
 */
function fetchPropertyDetailsFromRedfin(data, apiKey) {
  const fullAddress = `${data.address}, ${data.city}, ${data.state} ${data.zip}`.trim();

  // Try common endpoint patterns
  const endpoints = [
    `/property?address=${encodeURIComponent(fullAddress)}`,
    `/propertyDetails?address=${encodeURIComponent(fullAddress)}`,
    `/property-details?address=${encodeURIComponent(fullAddress)}`
  ];

  for (let endpoint of endpoints) {
    try {
      const url = `${REDFIN_BASE_URL}${endpoint}`;

      const options = {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'redfin-base-us.p.rapidapi.com'
        }
      };

      const response = HttpClient.get(url, options);

      if (response.success && response.statusCode === 200) {
        const json = JSON.parse(response.body);

        // Redfin may have different field names
        if (json.beds || json.bedrooms || json.sqft || json.livingArea) {
          return {
            beds: json.beds || json.bedrooms || 3,
            baths: json.baths || json.bathrooms || 2,
            sqft: json.sqft || json.livingArea || 1500,
            yearBuilt: json.yearBuilt || json.year_built || null,
            lotSize: json.lotSize || json.lot_size || null,
            propertyType: json.propertyType || json.homeType || 'Single Family',
            zpid: null
          };
        }
    }
  } catch (e) {
      PlatformLogger.warn(`Redfin endpoint ${endpoint} failed: ${e.message}`);
    }
  }

  return null;
}

/**
 * Get default property details when APIs fail
 */
function getDefaultPropertyDetails() {
  return {
    beds: 3,
    baths: 2,
    sqft: 1500,
    yearBuilt: null,
    lotSize: null,
    propertyType: 'Single Family',
    zpid: null
  };
}

/**
 * Fetch Zillow Zestimate (automated home value estimate)
 * Phase 1.2: ARV validation with Zestimate
 * ADDED: Phase 1.2 - Zillow Zestimate for ARV validation
 *
 * @param {string} zpid - Zillow Property ID
 * @returns {Object} { zestimate: number, valuationRange: { low: number, high: number } } or null
 */
function fetchZillowZestimate(zpid) {
  if (!zpid) {
    PlatformLogger.warn("No zpid provided for Zestimate lookup");
    return null;
  }

  const { RAPIDAPI_KEY } = getApiKeys();

  if (!RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY not found in Script Properties");
  }

  // DEPRECATED: Old Zillow API (zillow-com1) no longer exists
  PlatformLogger.warn(`❌ DEPRECATED: fetchZestimate called but old Zillow API no longer exists`);
  return null; // Skip deprecated API call

  const options = {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
    }
  };

  try {
    const response = HttpClient.get(url, options);

    if (response.success && response.statusCode === 200) {
      const json = JSON.parse(response.body);

      // Extract Zestimate value
      const zestimate = json.zestimate || json.price || null;
      const valuationRange = {
        low: json.valuationRange?.low || json.zestimateLowPercent || null,
        high: json.valuationRange?.high || json.zestimateHighPercent || null
      };

      if (zestimate) {
        PlatformLogger.success(`Zillow Zestimate: $${zestimate.toLocaleString()}`);
        return {
          zestimate: zestimate,
          valuationRange: valuationRange,
          source: 'zillow'
        };
      } else {
        PlatformLogger.warn("No Zestimate value found in response");
        return null;
      }
    } else {
      PlatformLogger.warn(`Zestimate API returned status ${response.statusCode}`);
      return null;
    }
  } catch (e) {
    PlatformLogger.warn(`Failed to fetch Zestimate: ${e.message}`);
    return null;
  }
}

/**
 * Fetch US Real Estate home value estimate
 * Phase 1.3: ARV validation with US Real Estate estimate
 * ADDED: Phase 1.3 - US Real Estate home estimate for ARV validation
 *
 * @param {string} propertyId - Property ID from US Real Estate API
 * @returns {Object} { estimate: number, source: 'us_real_estate' } or null
 */
function fetchUSRealEstateHomeEstimate(propertyId) {
  if (!propertyId) {
    PlatformLogger.warn("No property_id provided for US Real Estate home estimate lookup");
    return null;
  }

  const { RAPIDAPI_KEY } = getApiKeys();

  if (!RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY not found in Script Properties");
  }

  PlatformLogger.info(`🏡 Fetching US Real Estate home estimate for property_id: ${propertyId}`);

  const url = `${US_REAL_ESTATE_BASE_URL}/v3/for-sale/home-estimate-value?property_id=${encodeURIComponent(propertyId)}`;

  const options = {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'us-real-estate.p.rapidapi.com'
    }
  };

  try {
    const response = HttpClient.get(url, options);

    if (response.success && response.statusCode === 200) {
      const json = JSON.parse(response.body);

      // Extract home estimate value
      // API response structure may vary - adjust based on actual response
      const estimate = json.estimate || json.estimated_value || json.value || null;

      if (estimate && estimate > 0) {
        PlatformLogger.success(`US Real Estate Estimate: $${estimate.toLocaleString()}`);
        return {
          estimate: estimate,
          source: 'us_real_estate'
        };
      } else {
        PlatformLogger.warn("No home estimate value found in response");
        return null;
      }
    } else {
      PlatformLogger.warn(`US Real Estate home estimate API returned status ${response.statusCode}`);
      return null;
    }
  } catch (e) {
    PlatformLogger.warn(`Failed to fetch US Real Estate home estimate: ${e.message}`);
    return null;
  }
}

/**
 * Get property_id from US Real Estate API by address
 * Helper function to lookup property_id needed for home estimate
 * Phase 1.3: Support function for fetchUSRealEstateHomeEstimate
 *
 * @param {Object} data - Property data including address, city, state, zip
 * @returns {string|null} - Property ID or null if not found
 */
function getUSRealEstatePropertyId(data) {
  const { RAPIDAPI_KEY } = getApiKeys();

  if (!RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY not found in Script Properties");
  }

  const fullAddress = `${data.address}, ${data.city}, ${data.state} ${data.zip}`.trim();
  PlatformLogger.info(`🔍 Looking up property_id for: ${fullAddress}`);

  // Search for the property using v3/for-sale endpoint
  const url = `${US_REAL_ESTATE_BASE_URL}/v3/for-sale?city=${encodeURIComponent(data.city)}&state_code=${encodeURIComponent(data.state)}&limit=10`;

  const options = {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'us-real-estate.p.rapidapi.com'
    }
  };

  try {
    const response = HttpClient.get(url, options);

    if (response.success && response.statusCode === 200) {
      const json = JSON.parse(response.body);
      const results = json.data?.home_search?.results || [];

      // Try to find matching property by address
      const normalizedAddress = data.address.toLowerCase().trim();

      for (const property of results) {
        const propAddress = (property.location?.address?.line || '').toLowerCase().trim();

        // Check if addresses match (fuzzy match)
        if (propAddress.includes(normalizedAddress) || normalizedAddress.includes(propAddress)) {
          const propertyId = property.property_id;
          if (propertyId) {
            PlatformLogger.success(`Found property_id: ${propertyId}`);
            return propertyId;
          }
        }
      }

      PlatformLogger.warn("No matching property_id found in search results");
      return null;
    } else {
      PlatformLogger.warn(`Property search API returned status ${response.statusCode}`);
      return null;
    }
  } catch (e) {
    PlatformLogger.warn(`Failed to lookup property_id: ${e.message}`);
    return null;
  }
}

/**
 * Fetch recently sold properties by zip code
 * UPDATED: Phase 3.0 - Search by zip code only to get real sold properties
 *
 * @param {Object} data - Property data including zip code
 * @param {string} source - API source ('zillow' or 'us_real_estate')
 * @returns {Array} Array of recently sold properties in the zip code
 */
function fetchRecentlySoldByZip(data, source = 'zillow') {
  const { RAPIDAPI_KEY } = getApiKeys();

  if (!RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY not found in Script Properties");
  }

  if (!data.zip) {
    throw new Error("Zip code is required to fetch comps");
  }

  let url, host;

  if (source === 'zillow') {
    // DEPRECATED: Old Zillow API (zillow-com1) no longer exists
    PlatformLogger.warn(`❌ DEPRECATED: Zillow source requested but old API no longer exists. Returning empty array.`);
    return [];
  } else {
    // US Real Estate API - search by zip code for sold homes
    PlatformLogger.info(`🔑 Fetching US Real Estate sold homes in zip: ${data.zip}`);
    url = `${US_REAL_ESTATE_BASE_URL}/sold-homes?postal_code=${encodeURIComponent(data.zip)}&limit=10&offset=0`;
    host = 'us-real-estate.p.rapidapi.com';
  }

  const options = {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': host
    }
  };

  try {
    const response = HttpClient.get(url, options);

    if (!response.success || response.statusCode !== 200) {
      PlatformLogger.warn(`${source} API returned status ${response.statusCode}`);
      return [];
    }

    const json = JSON.parse(response.body);
    let comps = [];

    if (source === 'zillow') {
      // Parse Zillow response
      const props = json.props || [];
      comps = props.slice(0, 10).map(prop => {
        let formattedDate = "—";
        if (prop.dateSold) {
          try {
            const date = new Date(prop.dateSold * 1000);
            formattedDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
          } catch (e) {
            PlatformLogger.warn(`Date conversion error: ${e}`);
          }
        }

        const propertyLink = prop.detailUrl || prop.hdpUrl || `https://www.zillow.com/homedetails/${prop.zpid}_zpid/`;

        return {
          address: prop.address || prop.streetAddress || "Unknown",
          city: prop.addressCity || data.city || "",
          state: prop.addressState || data.state || "",
          zip: prop.addressZipcode || data.zip || "",
          price: prop.price || 0,
          sqft: prop.livingArea || prop.sqft || 0,
          beds: prop.bedrooms || prop.beds || 0,
          baths: prop.bathrooms || prop.baths || 0,
          yearBuilt: prop.yearBuilt || null,
          saleDate: formattedDate,
          distance: 0,
          condition: "unknown",
          propertyUrl: propertyLink,
          latitude: prop.latitude || prop.lat || null,
          longitude: prop.longitude || prop.lng || null,
          dataSource: 'zillow',
          isReal: true,
          qualityScore: 90
        };
      });
    } else {
      // Parse US Real Estate response
      const homes = json.data?.home_search?.results || json.results || [];
      comps = homes.slice(0, 10).map(home => {
        const location = home.location || {};
        const address = location.address || {};
        const description = home.description || {};

        return {
          address: address.line || "Unknown",
          city: address.city || data.city || "",
          state: address.state_code || data.state || "",
          zip: address.postal_code || data.zip || "",
          price: home.list_price || home.price || home.sold_price || 0,
          sqft: description.sqft || 0,
          beds: description.beds || 0,
          baths: description.baths || 0,
          yearBuilt: description.year_built || null,
          saleDate: home.list_date || home.sold_date || new Date().toISOString().slice(0, 10),
          distance: 0,
          condition: "unknown",
          propertyUrl: home.href || null,
          latitude: location.coordinate?.lat || null,
          longitude: location.coordinate?.lon || null,
          property_id: home.property_id || null,
          dataSource: 'us_real_estate',
          isReal: true,
          qualityScore: 90
        };
      });
    }

    PlatformLogger.success(`${source} returned ${comps.length} real sold properties in zip ${data.zip}`);
    return comps;
  } catch (e) {
    PlatformLogger.warn(`Failed to fetch from ${source}: ${e.message}`);
    return [];
  }
}

/**
 * Fetch AI-matched property comps from Zillow API
 * Phase 1.4: Uses /propertyComps endpoint for better quality matches
 * ADDED: Phase 1.4 - AI-matched property comps (replaces generic search)
 * MIGRATED: Phase 0.6 - Now uses HttpClient adapter
 * NOTE: This is now a fallback - we prefer zip-based search for real addresses
 *
 * @param {Object} data - Property data including address, city, state, zip, zpid (optional)
 * @returns {Array} Array of AI-matched comparable properties
 */
function fetchZillowPropertyComps(data) {
  const { RAPIDAPI_KEY } = getApiKeys();

  if (!RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY not found in Script Properties");
  }

  // First, get zpid if not provided
  let zpid = data.zpid;
  if (!zpid) {
    PlatformLogger.info("No zpid provided, fetching property details first...");
    const propertyDetails = fetchPropertyDetails(data);
    zpid = propertyDetails.zpid;
  }

  if (!zpid) {
    PlatformLogger.warn("❌ DEPRECATED: fetchCompsFromZillow called but old Zillow API no longer exists");
    return []; // Return empty array instead of calling deprecated function
  }

  PlatformLogger.warn("❌ DEPRECATED: Old Zillow API (zillow-com1) no longer exists. Use new API priority system instead.");
  return []; // Skip deprecated API call

  const options = {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
    }
  };

  try {
    const response = HttpClient.get(url, options);

    if (response.success && response.statusCode === 200) {
      const json = JSON.parse(response.body);

      // Extract comps from response
      const compsData = json.comps || json.properties || [];

      if (!compsData || compsData.length === 0) {
        PlatformLogger.warn("No property comps found, falling back to generic search");
        return fetchCompsFromZillow(data);
      }

      // Transform to our format
      const comps = compsData.slice(0, 10).map(prop => {
        // Convert Unix timestamp to readable date if present
        let formattedDate = "—";
        if (prop.dateSold) {
          try {
            const date = new Date(prop.dateSold * 1000);
            formattedDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
          } catch (e) {
            PlatformLogger.warn(`Date conversion error: ${e}`);
          }
        }

        const propertyLink = prop.detailUrl || prop.hdpUrl || `https://www.zillow.com/homedetails/${prop.zpid}_zpid/`;

        return {
          address: prop.address || prop.streetAddress || "Unknown",
          price: prop.price || 0,
          sqft: prop.livingArea || prop.sqft || 0,
          beds: prop.bedrooms || prop.beds || 0,
          baths: prop.bathrooms || prop.baths || 0,
          saleDate: formattedDate,
          distance: prop.distance || 0,
          condition: "unknown",
          link: propertyLink,
          latitude: prop.latitude || prop.lat || null,
          longitude: prop.longitude || prop.lng || null,
          dataSource: 'zillow_property_comps',
          isReal: true,
          qualityScore: 95  // Higher quality than generic search
        };
      });

      PlatformLogger.success(`Zillow Property Comps returned ${comps.length} AI-matched comps`);
      return comps;
    } else {
      PlatformLogger.warn(`Property Comps API returned status ${response.statusCode}, falling back`);
      return fetchCompsFromZillow(data);
    }
  } catch (e) {
    PlatformLogger.warn(`Failed to fetch property comps: ${e.message}, falling back`);
    return fetchCompsFromZillow(data);
  }
}

/**
 * Fetch AI-matched similar homes from US Real Estate API
 * Phase 1.4: Uses /v3/for-sale/similiar-homes endpoint for better quality matches
 * ADDED: Phase 1.4 - AI-matched similar homes (replaces generic search)
 * MIGRATED: Phase 0.6 - Now uses HttpClient adapter
 *
 * @param {Object} data - Property data including address, city, state, zip
 * @returns {Array} Array of AI-matched similar properties
 */
function fetchUSRealEstateSimilarHomes(data) {
  const { RAPIDAPI_KEY } = getApiKeys();

  if (!RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY not found in Script Properties");
  }

  const fullAddress = `${data.address}, ${data.city}, ${data.state} ${data.zip}`.trim();
  PlatformLogger.info("🔑 Fetching US Real Estate Similar Homes for: " + fullAddress);

  // Build query parameters (URLSearchParams not available in Apps Script)
  const queryParams = [
    `city=${encodeURIComponent(data.city)}`,
    `state_code=${encodeURIComponent(data.state)}`,
    `offset=0`,
    `limit=10`,
    `sort=relevance`
  ].join('&');

  const url = `${US_REAL_ESTATE_BASE_URL}/v3/for-sale/similiar-homes?${queryParams}`;

  const options = {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'us-real-estate.p.rapidapi.com'
    }
  };

  try {
    const response = HttpClient.get(url, options);

    if (response.success && response.statusCode === 200) {
      const json = JSON.parse(response.body);

      // Extract similar homes from response
      const homes = json.data?.home_search?.results || json.results || [];

      if (!homes || homes.length === 0) {
        PlatformLogger.warn("No similar homes found, falling back to sold homes search");
        return fetchCompsFromRapidAPI(data);
      }

      // Transform to our format
      const comps = homes.slice(0, 10).map(home => {
        const location = home.location || {};
        const address = location.address || {};
        const description = home.description || {};

        return {
          address: address.line || "Unknown",
          price: home.list_price || home.price || 0,
          sqft: description.sqft || 0,
          beds: description.beds || 0,
          baths: description.baths || 0,
          saleDate: home.list_date || new Date().toISOString().slice(0, 10),
          distance: 0,  // API doesn't provide distance
          condition: "unknown",
          link: home.href || null,
          latitude: location.coordinate?.lat || null,
          longitude: location.coordinate?.lon || null,
          property_id: home.property_id || null,
          dataSource: 'us_real_estate_similar_homes',
          isReal: true,
          qualityScore: 95  // Higher quality than generic search
        };
      });

      PlatformLogger.success(`US Real Estate Similar Homes returned ${comps.length} AI-matched comps`);
      return comps;
    } else {
      PlatformLogger.warn(`Similar Homes API returned status ${response.statusCode}, falling back`);
      return fetchCompsFromRapidAPI(data);
    }
  } catch (e) {
    PlatformLogger.warn(`Failed to fetch similar homes: ${e.message}, falling back`);
    return fetchCompsFromRapidAPI(data);
  }
}

/**
 * Fetch comps from Zillow API (generic search - fallback)
 * MIGRATED: Phase 0.6 - Now uses HttpClient adapter
 * NOTE: This is now a fallback when AI-matched comps fail
 */
function fetchCompsFromZillow(data) {
  // DEPRECATED: Old Zillow API (zillow-com1) no longer exists
  PlatformLogger.warn("❌ DEPRECATED: fetchCompsFromZillow called but old Zillow API no longer exists. Returning empty array.");
  return []; // Skip deprecated API call

  const options = {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
    }
  };

  const response = HttpClient.get(url, options);

  PlatformLogger.info("Zillow API status: " + response.statusCode);

  if (!response.success || response.statusCode !== 200) {
    PlatformLogger.error("Zillow API error response: " + response.body);
    throw new Error(`Zillow API returned status ${response.statusCode}`);
  }

  try {
    const json = JSON.parse(response.body);

    // Transform Zillow data to our format
    const props = json.props || [];
    const comps = props.slice(0, 6).map(prop => {
      // Convert Unix timestamp to readable date (MM/DD/YYYY)
      let formattedDate = "—";
      if (prop.dateSold) {
        try {
          // Zillow returns Unix timestamp in seconds, JavaScript uses milliseconds
          const date = new Date(prop.dateSold * 1000);
          formattedDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
        } catch (e) {
          Logger.log(`⚠️ Date conversion error: ${e}`);
        }
      }

      // Extract property link
      const propertyLink = prop.detailUrl || prop.hdpUrl || `https://www.zillow.com/homedetails/${prop.zpid}_zpid/`;

      return {
        address: prop.address || prop.streetAddress || "Unknown",
        price: prop.price || 0,
        sqft: prop.livingArea || prop.sqft || 0,
        beds: prop.bedrooms || prop.beds || 0,
        baths: prop.bathrooms || prop.baths || 0,
        saleDate: formattedDate,
        distance: prop.distance || 0,
        condition: "unknown",
        link: propertyLink,
        latitude: prop.latitude || prop.lat || null,
        longitude: prop.longitude || prop.lng || null,
        dataSource: 'zillow',
        isReal: true,
        qualityScore: 100
      };
    });

    PlatformLogger.success(`Zillow returned ${comps.length} comps`);
    return comps;
  } catch (e) {
    PlatformLogger.error("Zillow parsing error: " + e);
    PlatformLogger.debug("Raw response: " + response.body);
    throw new Error("Failed to parse Zillow response: " + e.message);
  }
}

/**
 * Fetch comps from RapidAPI (using a real estate API)
 * Priority 2 in waterfall
 * MIGRATED: Phase 0.6 - Now uses HttpClient adapter
 * UPDATED: Phase 1.3 - Now captures property_id for home estimate lookup
 */
function fetchCompsFromRapidAPI(data) {
  const { RAPIDAPI_KEY } = getApiKeys();

  if (!RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY not found in Script Properties");
  }

  const fullAddress = `${data.address}, ${data.city}, ${data.state} ${data.zip}`.trim();
  PlatformLogger.info("🔑 Calling RapidAPI for: " + fullAddress);

  // Using US Real Estate API on RapidAPI - sold-homes endpoint
  // Note: This API uses /sold-homes (not /for-sale/sold-homes or /v2/sold-homes)
  const url = `${US_REAL_ESTATE_BASE_URL}/sold-homes?city=${encodeURIComponent(data.city)}&state_code=${encodeURIComponent(data.state)}&limit=6`;

  const options = {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'us-real-estate.p.rapidapi.com'
    }
  };

  const response = HttpClient.get(url, options);

  PlatformLogger.info("RapidAPI status: " + response.statusCode);

  if (!response.success || response.statusCode !== 200) {
    PlatformLogger.error("RapidAPI error response: " + response.body);
    throw new Error(`RapidAPI returned status ${response.statusCode}`);
  }

  try {
    const json = JSON.parse(response.body);

    // Transform RapidAPI data to our format
    const comps = (json.data?.home_search?.results || []).slice(0, 6).map(home => ({
      address: home.location?.address?.line || "Unknown",
      price: home.list_price || home.price || 0,
      sqft: home.description?.sqft || 0,
      saleDate: home.list_date || new Date().toISOString().slice(0, 10),
      distance: 0,
      condition: "unknown",
      property_id: home.property_id || null  // Store property_id for home estimate lookup
    }));

    PlatformLogger.success(`RapidAPI returned ${comps.length} comps`);
    return comps;
  } catch (e) {
    PlatformLogger.error("RapidAPI parsing error: " + e);
    PlatformLogger.debug("Raw response: " + response.body);
    throw new Error("Failed to parse RapidAPI response: " + e.message);
  }
}

/**
 * Use Gemini API (via Google Generative Language API)
 * Priority 3 in waterfall
 * MIGRATED: Phase 0.6 - Now uses HttpClient adapter
 */
function fetchCompsFromGemini(data, GEMINI_API_KEY) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not found in Script Properties. Please add it in Project Settings → Script Properties.");
  }

  const fullAddress = `${data.address}, ${data.city}, ${data.state} ${data.zip}`.trim();

  const prompt = `
  Generate 6 comparable homes that recently sold near ${fullAddress}:
  - 3 unremodeled/as-is properties (lower prices)
  - 3 recently remodeled/renovated properties (higher prices)

  Include realistic sale dates from the past 6 months, approximate distances, and condition status.
  Return a valid JSON array only, like:
  [{"address":"123 Main St","price":825000,"sqft":1600,"saleDate":"2024-08-15","distance":0.5,"condition":"remodeled"}]

  Condition should be either "unremodeled" or "remodeled".
  Do NOT include markdown or explanations.
  `;

  const url = `${GEMINI_BASE_URL}/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  PlatformLogger.info("🔍 Calling Gemini API for: " + fullAddress);

  const response = HttpClient.post(url, {
    contentType: "application/json",
    payload: JSON.stringify(body)
  });

  PlatformLogger.info("Gemini API status: " + response.statusCode);

  if (!response.success || response.statusCode !== 200) {
    PlatformLogger.error("Gemini API error response: " + response.body);
    throw new Error(`Gemini API returned status ${response.statusCode}: ${response.body}`);
  }

  try {
    const json = JSON.parse(response.body);

    // Check for API errors
    if (json.error) {
      throw new Error(`Gemini API error: ${json.error.message}`);
    }

    let textBlock = json?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    // Remove markdown code fences if present
    textBlock = textBlock.replace(/```json|```/gi, "").trim();

    PlatformLogger.debug("Gemini raw response: " + textBlock);

    const comps = JSON.parse(textBlock);
    PlatformLogger.success("Parsed " + comps.length + " comps from Gemini");

    return comps;
  } catch (e) {
    PlatformLogger.error("Gemini parsing error: " + e);
    PlatformLogger.debug("Raw response: " + response.body);
    throw new Error("Failed to parse Gemini response: " + e.message);
  }
}

/**
 * Placeholder AI function for comps analysis
 */
function getCompsFromAI(data) {
  // You can integrate OpenAI or Gemini APIs here
  return [
    { address: "123 Main St", price: 825000, sqft: 1600 },
    { address: "129 Main St", price: 810000, sqft: 1550 }
  ];
}

/**
 * Fetch price and tax history from Zillow API
 * Phase 2.1: Historical data for ARV validation
 * ADDED: Phase 2.1 - Price & tax history for appreciation calculation
 *
 * @param {string} zpid - Zillow Property ID
 * @returns {Object} { priceHistory: Array, taxHistory: Array, appreciationRate: number } or null
 */
function fetchPriceAndTaxHistory(zpid) {
  // DEPRECATED: Old Zillow API (zillow-com1) no longer exists
  PlatformLogger.warn("❌ DEPRECATED: fetchPriceAndTaxHistory called but old Zillow API no longer exists");
  return null; // Skip deprecated API call

  const options = {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
    }
  };

  try {
    const response = HttpClient.get(url, options);

    if (response.success && response.statusCode === 200) {
      const json = JSON.parse(response.body);

      // Extract price history
      const priceHistory = json.priceHistory || [];
      const taxHistory = json.taxHistory || [];

      if (priceHistory.length === 0) {
        PlatformLogger.warn("No price history found");
        return null;
      }

      // Calculate historical appreciation rate
      const appreciationRate = calculateHistoricalAppreciation(priceHistory);

      // Identify sale patterns (flips vs long-term holds)
      const salePattern = identifySalePattern(priceHistory);

      PlatformLogger.success(`Price history: ${priceHistory.length} records, Appreciation: ${(appreciationRate * 100).toFixed(2)}%/year`);

      return {
        priceHistory: priceHistory,
        taxHistory: taxHistory,
        appreciationRate: appreciationRate,
        salePattern: salePattern,
        source: 'zillow'
      };
    } else {
      PlatformLogger.warn(`Price/Tax History API returned status ${response.statusCode}`);
      return null;
    }
  } catch (e) {
    PlatformLogger.warn(`Failed to fetch price/tax history: ${e.message}`);
    return null;
  }
}

/**
 * Calculate historical appreciation rate from price history
 * Helper function for fetchPriceAndTaxHistory
 * Phase 2.1: Calculate appreciation rate
 *
 * @param {Array} priceHistory - Array of price history records
 * @returns {number} Annual appreciation rate (e.g., 0.05 for 5%)
 */
function calculateHistoricalAppreciation(priceHistory) {
  if (!priceHistory || priceHistory.length < 2) {
    return 0;
  }

  // Sort by date (oldest first)
  const sorted = priceHistory.slice().sort((a, b) => {
    const dateA = new Date(a.date || a.time);
    const dateB = new Date(b.date || b.time);
    return dateA - dateB;
  });

  // Get first and last sale
  const firstSale = sorted[0];
  const lastSale = sorted[sorted.length - 1];

  const firstPrice = firstSale.price || firstSale.value || 0;
  const lastPrice = lastSale.price || lastSale.value || 0;

  if (firstPrice === 0 || lastPrice === 0) {
    return 0;
  }

  // Calculate time difference in years
  const firstDate = new Date(firstSale.date || firstSale.time);
  const lastDate = new Date(lastSale.date || lastSale.time);
  const yearsDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 365.25);

  if (yearsDiff <= 0) {
    return 0;
  }

  // Calculate compound annual growth rate (CAGR)
  const cagr = Math.pow(lastPrice / firstPrice, 1 / yearsDiff) - 1;

  return cagr;
}

/**
 * Identify sale pattern (flip vs long-term hold)
 * Helper function for fetchPriceAndTaxHistory
 * Phase 2.1: Identify investment patterns
 *
 * @param {Array} priceHistory - Array of price history records
 * @returns {Object} { pattern: string, holdingPeriod: number, flipCount: number }
 */
function identifySalePattern(priceHistory) {
  if (!priceHistory || priceHistory.length < 2) {
    return { pattern: 'unknown', holdingPeriod: 0, flipCount: 0 };
  }

  // Sort by date (oldest first)
  const sorted = priceHistory.slice().sort((a, b) => {
    const dateA = new Date(a.date || a.time);
    const dateB = new Date(b.date || b.time);
    return dateA - dateB;
  });

  const flipCount = sorted.length - 1; // Number of sales

  // Calculate average holding period
  let totalHoldingDays = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1].date || sorted[i - 1].time);
    const currDate = new Date(sorted[i].date || sorted[i].time);
    const daysDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);
    totalHoldingDays += daysDiff;
  }

  const avgHoldingDays = totalHoldingDays / flipCount;
  const avgHoldingYears = avgHoldingDays / 365.25;

  // Classify pattern
  let pattern = 'unknown';
  if (avgHoldingYears < 2) {
    pattern = 'flip'; // Short-term flip
  } else if (avgHoldingYears < 7) {
    pattern = 'medium-term'; // Medium-term hold
  } else {
    pattern = 'long-term'; // Long-term hold
  }

  return {
    pattern: pattern,
    holdingPeriod: avgHoldingYears,
    flipCount: flipCount
  };
}

/**
 * Fetch Zestimate percent change over time from Zillow API
 * Phase 2.2: Market trend analysis
 * ADDED: Phase 2.2 - Zestimate percent change for market trends
 *
 * @param {string} zpid - Zillow Property ID
 * @returns {Object} { percentChange: Object, trend: string } or null
 */
function fetchZestimatePercentChange(zpid) {
  // DEPRECATED: Old Zillow API (zillow-com1) no longer exists
  PlatformLogger.warn("❌ DEPRECATED: fetchZestimatePercentChange called but old Zillow API no longer exists");
  return null; // Skip deprecated API call

  const options = {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
    }
  };

  try {
    const response = HttpClient.get(url, options);

    if (response.success && response.statusCode === 200) {
      const json = JSON.parse(response.body);

      // Extract percent changes
      const percentChange = {
        thirtyDay: json.thirtyDayChange || json['30DayChange'] || null,
        oneYear: json.oneYearChange || json['1YearChange'] || null,
        fiveYear: json.fiveYearChange || json['5YearChange'] || null,
        tenYear: json.tenYearChange || json['10YearChange'] || null
      };

      // Classify market trend based on 1-year change
      let trend = 'stable';
      if (percentChange.oneYear !== null) {
        if (percentChange.oneYear > 5) {
          trend = 'hot';
        } else if (percentChange.oneYear > 2) {
          trend = 'rising';
        } else if (percentChange.oneYear < -2) {
          trend = 'declining';
        }
      }

      PlatformLogger.success(`Zestimate change: 1yr=${percentChange.oneYear}%, Trend: ${trend}`);

      return {
        percentChange: percentChange,
        trend: trend,
        source: 'zillow'
      };
    } else {
      PlatformLogger.warn(`Zestimate Percent Change API returned status ${response.statusCode}`);
      return null;
    }
  } catch (e) {
    PlatformLogger.warn(`Failed to fetch Zestimate percent change: ${e.message}`);
    return null;
  }
}

/**
 * Fetch local home values from Zillow API
 * Phase 2.2: Market trend analysis
 * ADDED: Phase 2.2 - Local home values for market context
 *
 * @param {string} location - Location string (e.g., "San Diego, CA")
 * @returns {Object} { medianHomeValue: number, medianRent: number, trend: string } or null
 */
function fetchLocalHomeValues(location) {
  // DEPRECATED: Old Zillow API (zillow-com1) no longer exists
  PlatformLogger.warn("❌ DEPRECATED: fetchLocalHomeValues called but old Zillow API no longer exists");
  return null; // Skip deprecated API call

  const options = {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
    }
  };

  try {
    const response = HttpClient.get(url, options);

    if (response.success && response.statusCode === 200) {
      const json = JSON.parse(response.body);

      // Extract local market data
      const medianHomeValue = json.medianHomeValue || json.median_home_value || null;
      const medianRent = json.medianRent || json.median_rent || null;
      const valueChange = json.valueChange || json.value_change || null;

      // Classify market trend
      let trend = 'stable';
      if (valueChange !== null) {
        if (valueChange > 5) {
          trend = 'hot';
        } else if (valueChange > 2) {
          trend = 'rising';
        } else if (valueChange < -2) {
          trend = 'declining';
        }
      }

      PlatformLogger.success(`Local values: Median=$${medianHomeValue?.toLocaleString() || 'N/A'}, Trend: ${trend}`);

      return {
        medianHomeValue: medianHomeValue,
        medianRent: medianRent,
        valueChange: valueChange,
        trend: trend,
        location: location,
        source: 'zillow'
      };
    } else {
      PlatformLogger.warn(`Local Home Values API returned status ${response.statusCode}`);
      return null;
    }
  } catch (e) {
    PlatformLogger.warn(`Failed to fetch local home values: ${e.message}`);
    return null;
  }
}

/**
 * Validate ARV against market trends and historical data
 * Phase 2.3: Historical ARV validation
 * ADDED: Phase 2.3 - Validate estimated ARV against historical trends
 *
 * @param {number} estimatedARV - The calculated ARV estimate
 * @param {string} zpid - Zillow Property ID
 * @param {string} location - Location string (e.g., "San Diego, CA")
 * @returns {Object} { isValid: boolean, deviation: number, warnings: Array, historicalARV: number }
 */
function validateARVAgainstMarketTrends(estimatedARV, zpid, location) {
  if (!estimatedARV || estimatedARV <= 0) {
    PlatformLogger.warn("Invalid ARV provided for validation");
    return {
      isValid: false,
      deviation: 0,
      warnings: ["Invalid ARV value"],
      historicalARV: null
    };
  }

  const warnings = [];
  let historicalARV = null;
  let deviation = 0;

  try {
    // Fetch historical data
    const priceHistory = zpid ? fetchPriceAndTaxHistory(zpid) : null;
    const marketTrends = location ? fetchLocalHomeValues(location) : null;
    const zestimateChange = zpid ? fetchZestimatePercentChange(zpid) : null;

    // Calculate expected ARV based on historical appreciation
    if (priceHistory && priceHistory.priceHistory.length > 0) {
      const latestPrice = priceHistory.priceHistory[priceHistory.priceHistory.length - 1].price || priceHistory.priceHistory[priceHistory.priceHistory.length - 1].value;
      const appreciationRate = priceHistory.appreciationRate || 0;

      // Project forward based on historical appreciation
      // Assume 1 year forward projection
      historicalARV = latestPrice * (1 + appreciationRate);

      // Calculate deviation
      deviation = (estimatedARV - historicalARV) / historicalARV;

      PlatformLogger.info(`📊 Historical ARV: $${historicalARV.toLocaleString()} (based on ${(appreciationRate * 100).toFixed(2)}% appreciation)`);
      PlatformLogger.info(`📊 Estimated ARV: $${estimatedARV.toLocaleString()}`);
      PlatformLogger.info(`📊 Deviation: ${(deviation * 100).toFixed(2)}%`);

      // Flag deviations > 15%
      if (Math.abs(deviation) > 0.15) {
        const deviationType = deviation > 0 ? "higher" : "lower";
        warnings.push(`⚠️ ARV is ${Math.abs(deviation * 100).toFixed(1)}% ${deviationType} than historical projection`);
        PlatformLogger.warn(`ARV deviation: ${(deviation * 100).toFixed(2)}% (threshold: ±15%)`);
      }

      // Check sale pattern
      if (priceHistory.salePattern.pattern === 'flip' && priceHistory.salePattern.flipCount > 2) {
        warnings.push(`⚠️ Property has been flipped ${priceHistory.salePattern.flipCount} times (avg holding: ${priceHistory.salePattern.holdingPeriod.toFixed(1)} years)`);
        PlatformLogger.warn(`Property flip pattern detected: ${priceHistory.salePattern.flipCount} flips`);
      }
    }

    // Check market trends
    if (marketTrends) {
      const marketMedian = marketTrends.medianHomeValue;
      if (marketMedian && estimatedARV > marketMedian * 1.5) {
        warnings.push(`⚠️ ARV is ${((estimatedARV / marketMedian - 1) * 100).toFixed(1)}% above local median ($${marketMedian.toLocaleString()})`);
        PlatformLogger.warn(`ARV significantly above market median`);
      }

      // Check market trend
      if (marketTrends.trend === 'declining') {
        warnings.push(`⚠️ Market is declining (${marketTrends.valueChange}% change)`);
        PlatformLogger.warn(`Declining market detected`);
      } else if (marketTrends.trend === 'hot') {
        PlatformLogger.info(`🔥 Hot market detected (${marketTrends.valueChange}% change)`);
      }
    }

    // Check Zestimate trends
    if (zestimateChange && zestimateChange.percentChange.oneYear !== null) {
      const oneYearChange = zestimateChange.percentChange.oneYear;
      if (oneYearChange < -5) {
        warnings.push(`⚠️ Property value declined ${Math.abs(oneYearChange).toFixed(1)}% in past year`);
        PlatformLogger.warn(`Negative price trend detected`);
      }
    }

    // Determine if ARV is valid
    const isValid = warnings.length === 0 || Math.abs(deviation) <= 0.15;

    if (isValid) {
      PlatformLogger.success(`✅ ARV validation passed`);
    } else {
      PlatformLogger.warn(`⚠️ ARV validation raised ${warnings.length} warning(s)`);
    }

    return {
      isValid: isValid,
      deviation: deviation,
      warnings: warnings,
      historicalARV: historicalARV,
      marketTrend: marketTrends?.trend || 'unknown',
      appreciationRate: priceHistory?.appreciationRate || 0
    };

  } catch (e) {
    PlatformLogger.error(`Failed to validate ARV: ${e.message}`);
    return {
      isValid: true, // Don't block on validation errors
      deviation: 0,
      warnings: [`Validation error: ${e.message}`],
      historicalARV: null
    };
  }
}

/**
 * Fetch targeted comps with advanced filters
 * Phase 2.4: Advanced comps filtering
 * ADDED: Phase 2.4 - Fetch comps with specific filters for better matches
 *
 * @param {Object} propertyData - Property data including beds, baths, sqft, city, state
 * @returns {Array} Array of filtered comparable properties
 */
function fetchTargetedComps(propertyData) {
  const { RAPIDAPI_KEY } = getApiKeys();

  if (!RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY not found in Script Properties");
  }

  PlatformLogger.info(`🎯 Fetching targeted comps for: ${propertyData.city}, ${propertyData.state}`);

  // Calculate filter ranges (±20% for sqft, ±1 for beds/baths)
  const sqftMin = Math.floor(propertyData.sqft * 0.8);
  const sqftMax = Math.ceil(propertyData.sqft * 1.2);
  const bedsMin = Math.max(1, propertyData.beds - 1);
  const bedsMax = propertyData.beds + 1;
  const bathsMin = Math.max(1, propertyData.baths - 1);
  const bathsMax = propertyData.baths + 1;

  // Calculate sold_within_days (last 365 days)
  const soldWithinDays = 365;

  // Build query parameters
  const queryParams = [
    `city=${encodeURIComponent(propertyData.city)}`,
    `state_code=${encodeURIComponent(propertyData.state)}`,
    `beds_min=${bedsMin}`,
    `beds_max=${bedsMax}`,
    `baths_min=${bathsMin}`,
    `baths_max=${bathsMax}`,
    `sqft_min=${sqftMin}`,
    `sqft_max=${sqftMax}`,
    `sold_within_days=${soldWithinDays}`,
    `sort=relevance`,
    `limit=10`
  ].join('&');

  const url = `${US_REAL_ESTATE_BASE_URL}/sold-homes?${queryParams}`;

  const options = {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'us-real-estate.p.rapidapi.com'
    }
  };

  try {
    const response = HttpClient.get(url, options);

    if (response.success && response.statusCode === 200) {
      const json = JSON.parse(response.body);

      // Extract comps from response
      const homes = json.data?.home_search?.results || [];

      if (!homes || homes.length === 0) {
        PlatformLogger.warn("No targeted comps found with filters");
        return [];
      }

      // Transform to our format
      const comps = homes.map(home => {
        const location = home.location || {};
        const address = location.address || {};
        const description = home.description || {};

        return {
          address: address.line || "Unknown",
          price: home.list_price || home.price || 0,
          sqft: description.sqft || 0,
          beds: description.beds || 0,
          baths: description.baths || 0,
          saleDate: home.list_date || home.sold_date || new Date().toISOString().slice(0, 10),
          distance: 0,
          condition: "unknown",
          link: home.href || null,
          latitude: location.coordinate?.lat || null,
          longitude: location.coordinate?.lon || null,
          property_id: home.property_id || null,
          dataSource: 'us_real_estate_targeted',
          isReal: true,
          qualityScore: 98  // Higher quality due to targeted filters
        };
      });

      PlatformLogger.success(`🎯 Targeted comps returned ${comps.length} highly relevant matches`);
      PlatformLogger.info(`   Filters: ${bedsMin}-${bedsMax} beds, ${bathsMin}-${bathsMax} baths, ${sqftMin}-${sqftMax} sqft`);

      return comps;
    } else {
      PlatformLogger.warn(`Targeted comps API returned status ${response.statusCode}`);
      return [];
    }
  } catch (e) {
    PlatformLogger.warn(`Failed to fetch targeted comps: ${e.message}`);
    return [];
  }
}

/**
 * Fetch rental comps data (separate from sale comps)
 * Phase 3.4: Rental comps fetching
 * MIGRATED: Phase 0.6 - Now uses HttpClient, CacheManager, and PlatformLogger
 *
 * @param {Object} data - Property data including address, city, state, zip
 * @param {boolean} forceRefresh - If true, bypass cache and fetch fresh data
 * @returns {Array} Array of rental comparable properties
 */
function fetchRentalComps(data, forceRefresh = false) {
  const { BRIDGE_API_KEY, BRIDGE_BASE_URL, GEMINI_API_KEY, OPENAI_API_KEY } = getApiKeys();
  const source = data.apiSource.toLowerCase();
  let rentalComps = [];

  try {
    if (source === 'bridge') {
      rentalComps = retryWithBackoff(() => {
        const endpoint = `${BRIDGE_BASE_URL}/api/v2/rentals?address=${encodeURIComponent(data.address)}&city=${encodeURIComponent(data.city)}&state=${encodeURIComponent(data.state)}&postalcode=${encodeURIComponent(data.zip)}`;
        const options = {
          headers: {
            Authorization: `Bearer ${BRIDGE_API_KEY}`,
            Accept: 'application/json'
          }
        };

        const response = HttpClient.get(endpoint, options);

        if (!response.success || response.statusCode !== 200) {
          throw new Error(`Bridge API returned status ${response.statusCode}`);
        }

        const json = JSON.parse(response.body || '{}');
        const properties = json.rentals || json.properties || [];

        PlatformLogger.info(`Bridge API returned ${properties.length} rental comps`);
        return properties;
      });
    }

    if (source === 'openai') {
      rentalComps = retryWithBackoff(() => fetchRentalCompsFromOpenAI(data, OPENAI_API_KEY));
      PlatformLogger.info(`OpenAI returned ${rentalComps.length} rental comps`);
    }

    if (source === 'gemini') {
      rentalComps = retryWithBackoff(() => fetchRentalCompsFromGemini(data, GEMINI_API_KEY));
      PlatformLogger.info(`Gemini returned ${rentalComps.length} rental comps`);
    }

    // Validate and filter
    if (!Array.isArray(rentalComps)) {
      rentalComps = [];
    }
    rentalComps = rentalComps.filter(c => c && c.rent && c.rent > 0);

  } catch (err) {
    PlatformLogger.error("fetchRentalComps error: " + err);
    rentalComps = [];
  }

  return rentalComps;
}

/**
 * Fetch rental comps from OpenAI
 * MIGRATED: Phase 0.6 - Now uses HttpClient adapter
 */
function fetchRentalCompsFromOpenAI(data, OPENAI_API_KEY) {
  const prompt = `
  Analyze recent rental listings near ${data.address}, ${data.city}, ${data.state} ${data.zip}.
  Provide 5 nearby rental properties with address, monthly rent, bedrooms, bathrooms, and square footage.
  Return JSON array [{address, rent, beds, baths, sqft}].
  `;
  const url = "https://api.openai.com/v1/chat/completions";
  const payload = {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3
  };

  const response = HttpClient.post(url, {
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    payload: JSON.stringify(payload)
  });

  try {
    const text = JSON.parse(response.body);
    const jsonStr = text.choices?.[0]?.message?.content || "[]";
    return JSON.parse(jsonStr);
  } catch (e) {
    PlatformLogger.error("OpenAI rental comps error: " + e);
    return [];
  }
}

/**
 * Fetch rental comps from Gemini
 * MIGRATED: Phase 0.6 - Now uses HttpClient adapter
 */
function fetchRentalCompsFromGemini(data, GEMINI_API_KEY) {
  const fullAddress = `${data.address}, ${data.city}, ${data.state} ${data.zip}`.trim();

  const prompt = `
  Generate 5 rental properties near ${fullAddress}.
  Return a valid JSON array only, like:
  [{"address":"123 Main St","rent":2500,"beds":3,"baths":2,"sqft":1600}]
  Do NOT include markdown or explanations.
  `;

  const url = `${GEMINI_BASE_URL}/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const response = HttpClient.post(url, {
    contentType: "application/json",
    payload: JSON.stringify(body)
  });

  try {
    const json = JSON.parse(response.body);
    const textBlock = json?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    return JSON.parse(textBlock);
  } catch (e) {
    PlatformLogger.error("Gemini rental comps error: " + e);
    return [];
  }
}

/**
 * ========== TESTING UTILITIES ==========
 */

/**
 * Test Bridge Dataset API call
 */
// function testBridgeAPI() {
//   const keys = getApiKeys();
//   const address = encodeURIComponent("414 1st Ave, Chula Vista, CA 91910");

//   // Adjust the dataset below if your Bridge plan uses 'mls', 'rets', or 'property'
//   const dataset = "zestimates"; // try changing to 'mls' or 'property' if needed

//   const url = `${keys.BRIDGE_BASE_URL}/api/v2/${dataset}?access_token=${keys.BRIDGE_API_KEY}&address=${address}&limit=3`;

//   const res = UrlFetchApp.fetch(url, {
//     method: "get",
//     muteHttpExceptions: true,
//   });

//   Logger.log("Bridge API test URL: " + url);
//   Logger.log("Bridge raw response: " + res.getContentText());
// }


/**
 * Test OpenAI API call
 */
// function testOpenAI() {
//   const keys = getApiKeys();
//   const prompt = `
//   Return 3 JSON comparable homes near 414 1st Ave, Chula Vista, CA 91910.
//   Each object should have: address, price, sqft.
//   Example format: [{"address":"123 Main St","price":825000,"sqft":1600}]
//   `;
//   const payload = {
//     model: "gpt-4o-mini",
//     messages: [{ role: "user", content: prompt }],
//     temperature: 0.3
//   };

//   const res = UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", {
//     method: "post",
//     headers: {
//       "Authorization": `Bearer ${keys.OPENAI_API_KEY}`,
//       "Content-Type": "application/json"
//     },
//     payload: JSON.stringify(payload),
//     muteHttpExceptions: true
//   });

//   const text = res.getContentText();
//   Logger.log("OpenAI raw response: " + text);

//   // Try parsing to confirm valid JSON
//   try {
//     const message = JSON.parse(text).choices[0].message.content;
//     const json = JSON.parse(message);
//     Logger.log("✅ Parsed JSON: " + JSON.stringify(json, null, 2));
//   } catch (e) {
//     Logger.log("❌ OpenAI parse error: " + e);
//   }
// }

/**
 * Test Gemini API call
 */
// function testGemini() {
//   const keys = getApiKeys();
//   const prompt = `
//   Generate 3 JSON comparable homes near 414 1st Ave, Chula Vista, CA 91910.
//   Format strictly as JSON: [{"address":"123 Main St","price":825000,"sqft":1600}]
//   `;

//   const GEMINI_API_KEY = keys.GEMINI_API_KEY;

//   const body = { contents: [{ parts: [{ text: prompt }] }] };
//   let model = "gemini-2.5-flash";
//   let url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

//   let res;
//   try {
//     res = UrlFetchApp.fetch(url, {
//       method: "post",
//       contentType: "application/json",
//       payload: JSON.stringify(body),
//       muteHttpExceptions: true
//     });
//     const status = JSON.parse(res.getContentText());
//     if (status.error && status.error.code === 503) {
//       Logger.log("⚠️ Gemini overloaded, retrying with gemini-pro...");
//       model = "gemini-pro";
//       url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
//       res = UrlFetchApp.fetch(url, {
//         method: "post",
//         contentType: "application/json",
//         payload: JSON.stringify(body),
//         muteHttpExceptions: true
//       });
//     }
//   } catch (e) {
//     Logger.log("Gemini request failed: " + e);
//   }

//   const text = res.getContentText();
//   Logger.log("Gemini raw response: " + text);

//   try {
//     const outer = JSON.parse(text);
//     let rawText = outer.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

//     // 🧹 Remove Markdown code fences like ```json ... ```
//     rawText = rawText.replace(/```json|```/gi, "").trim();

//     const parsed = JSON.parse(rawText);
//     Logger.log("✅ Parsed JSON: " + JSON.stringify(parsed, null, 2));
//   } catch (e) {
//     Logger.log("❌ Gemini parse error: " + e);
//     Logger.log("Raw text received:\n" + text);
//   }

// }
