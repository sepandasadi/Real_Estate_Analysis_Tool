/**
 * Get all secure keys from Script Properties
 */
function getApiKeys() {
  const props = PropertiesService.getScriptProperties();
  return {
    RAPIDAPI_KEY: props.getProperty('RAPIDAPI_KEY'),
    GEMINI_API_KEY: props.getProperty('GEMINI_API_KEY'),
    BRIDGE_API_KEY: props.getProperty('BRIDGE_API_KEY'),
    BRIDGE_BASE_URL: props.getProperty('BRIDGE_BASE_URL')
  };
}

/**
 * Get API quota limits from Script Properties
 * Set these in: Project Settings → Script Properties
 */
function getApiQuotas() {
  const props = PropertiesService.getScriptProperties();
  return {
    ZILLOW_MONTHLY_LIMIT: parseInt(props.getProperty('ZILLOW_MONTHLY_LIMIT') || '100'),
    ZILLOW_THRESHOLD: parseInt(props.getProperty('ZILLOW_THRESHOLD') || '90'),

    US_REAL_ESTATE_MONTHLY_LIMIT: parseInt(props.getProperty('US_REAL_ESTATE_MONTHLY_LIMIT') || '100'),
    US_REAL_ESTATE_THRESHOLD: parseInt(props.getProperty('US_REAL_ESTATE_THRESHOLD') || '90'),

    GEMINI_DAILY_LIMIT: parseInt(props.getProperty('GEMINI_DAILY_LIMIT') || '1500'),
    GEMINI_THRESHOLD: parseInt(props.getProperty('GEMINI_THRESHOLD') || '1400')
  };
}

/**
 * Check if API quota is available
 * @param {string} apiName - Name of the API (zillow, us_real_estate, gemini)
 * @param {string} period - 'month' or 'day'
 * @returns {boolean} - True if quota available, false if exceeded
 */
function checkQuotaAvailable(apiName, period = 'month') {
  const props = PropertiesService.getScriptProperties();
  const quotas = getApiQuotas();

  // Get current period key (YYYY-MM for month, YYYY-MM-DD for day)
  const now = new Date();
  const periodKey = period === 'month'
    ? now.toISOString().slice(0, 7)  // "2025-11"
    : now.toISOString().slice(0, 10); // "2025-11-15"

  // Get current usage
  const usageKey = `api_usage_${apiName}_${periodKey}`;
  const currentUsage = parseInt(props.getProperty(usageKey) || '0');

  // Get limit and threshold
  const limitKey = `${apiName.toUpperCase()}_${period.toUpperCase()}_LIMIT`;
  const thresholdKey = `${apiName.toUpperCase()}_THRESHOLD`;
  const limit = quotas[limitKey] || 100;
  const threshold = quotas[thresholdKey] || (limit * 0.9);

  // Check if under threshold
  const available = currentUsage < threshold;

  Logger.log(`📊 ${apiName} quota: ${currentUsage}/${limit} (threshold: ${threshold}) - ${available ? 'AVAILABLE' : 'EXCEEDED'}`);

  return available;
}

/**
 * Display current API usage and quotas
 * Run this from: REI Tools > Advanced Tools > Check API Usage
 */
function showAPIUsage() {
  const props = PropertiesService.getScriptProperties();
  const quotas = getApiQuotas();
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const currentDay = now.toISOString().slice(0, 10);

  // Get usage
  const zillowUsage = parseInt(props.getProperty(`api_usage_zillow_${currentMonth}`) || '0');
  const usRealEstateUsage = parseInt(props.getProperty(`api_usage_us_real_estate_${currentMonth}`) || '0');
  const geminiUsage = parseInt(props.getProperty(`api_usage_gemini_${currentDay}`) || '0');

  // Build message
  const message = `
📊 API Usage Report (${currentMonth})

🏠 Zillow API:
   Used: ${zillowUsage} / ${quotas.ZILLOW_MONTHLY_LIMIT}
   Remaining: ${quotas.ZILLOW_MONTHLY_LIMIT - zillowUsage}
   Status: ${zillowUsage < quotas.ZILLOW_THRESHOLD ? '✅ Available' : '⚠️ Near Limit'}

🔑 US Real Estate API:
   Used: ${usRealEstateUsage} / ${quotas.US_REAL_ESTATE_MONTHLY_LIMIT}
   Remaining: ${quotas.US_REAL_ESTATE_MONTHLY_LIMIT - usRealEstateUsage}
   Status: ${usRealEstateUsage < quotas.US_REAL_ESTATE_THRESHOLD ? '✅ Available' : '⚠️ Near Limit'}

🤖 Gemini AI (Today):
   Used: ${geminiUsage} / ${quotas.GEMINI_DAILY_LIMIT}
   Remaining: ${quotas.GEMINI_DAILY_LIMIT - geminiUsage}
   Status: ${geminiUsage < quotas.GEMINI_THRESHOLD ? '✅ Available' : '⚠️ Near Limit'}

Last Successful API: ${props.getProperty('last_successful_api') || 'None'}
Last Success Time: ${props.getProperty('last_successful_api_time') || 'Never'}
  `;

  SpreadsheetApp.getUi().alert('API Usage Report', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Track API usage for monitoring and optimization
 */
function trackAPIUsage(source, success) {
  try {
    const props = PropertiesService.getScriptProperties();
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const key = `api_usage_${source}_${currentMonth}`;
    const current = parseInt(props.getProperty(key) || '0');
    props.setProperty(key, (current + 1).toString());

    if (success) {
      props.setProperty('last_successful_api', source);
      props.setProperty('last_successful_api_time', new Date().toISOString());
    }

    Logger.log(`📊 API Usage: ${source} - ${success ? 'SUCCESS' : 'FAILED'} (Total this month: ${current + 1})`);
  } catch (e) {
    Logger.log(`⚠️ Failed to track API usage: ${e}`);
  }
}

/**
 * Retry a function with exponential backoff
 */
function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return fn();
    } catch (err) {
      lastError = err;
      Logger.log(`Attempt ${i + 1} failed: ${err}. Retrying...`);
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
 * Priority: Zillow → US Real Estate → Gemini → Bridge
 *
 * @param {Object} data - Property data including address, city, state, zip
 * @param {boolean} forceRefresh - If true, bypass cache and fetch fresh data
 * @returns {Array} Array of comparable properties
 */
function fetchCompsData(data, forceRefresh = false) {
  let comps = [];

  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cachedComps = getCachedComps(data.address, data.city, data.state, data.zip);
    if (cachedComps && cachedComps.length > 0) {
      Logger.log(`📦 Using cached comps (${cachedComps.length} properties)`);
      return cachedComps;
    }
  } else {
    Logger.log("🔄 Force refresh requested, bypassing cache");
  }

  // Priority 1: Try Zillow (if quota available)
  if (checkQuotaAvailable('zillow', 'month')) {
    try {
      Logger.log("🏠 Trying Zillow API (Priority 1)...");
      comps = retryWithBackoff(() => fetchCompsFromZillow(data));
      if (comps && comps.length > 0) {
        Logger.log(`✅ Zillow SUCCESS: ${comps.length} comps`);
        trackAPIUsage('zillow', true);
        setCachedComps(data.address, data.city, data.state, data.zip, comps);
        return comps;
      }
    } catch (err) {
      Logger.log(`⚠️ Zillow failed: ${err.message}`);
      trackAPIUsage('zillow', false);
    }
  } else {
    Logger.log("⚠️ Zillow quota exceeded, skipping to next API");
  }

  // Priority 2: Try US Real Estate (if quota available)
  if (checkQuotaAvailable('us_real_estate', 'month')) {
    try {
      Logger.log("🔑 Trying US Real Estate API (Priority 2)...");
      comps = retryWithBackoff(() => fetchCompsFromRapidAPI(data));
      if (comps && comps.length > 0) {
        Logger.log(`✅ US Real Estate SUCCESS: ${comps.length} comps`);
        trackAPIUsage('us_real_estate', true);
        setCachedComps(data.address, data.city, data.state, data.zip, comps);
        return comps;
      }
    } catch (err) {
      Logger.log(`⚠️ US Real Estate failed: ${err.message}`);
      trackAPIUsage('us_real_estate', false);
    }
  } else {
    Logger.log("⚠️ US Real Estate quota exceeded, skipping to next API");
  }

  // Priority 3: Try Gemini AI (if quota available)
  if (checkQuotaAvailable('gemini', 'day')) {
    try {
      Logger.log("🤖 Trying Gemini AI (Priority 3)...");
      const { GEMINI_API_KEY } = getApiKeys();
      comps = retryWithBackoff(() => fetchCompsFromGemini(data, GEMINI_API_KEY));
      if (comps && comps.length > 0) {
        Logger.log(`✅ Gemini SUCCESS: ${comps.length} comps`);
        trackAPIUsage('gemini', true);
        setCachedComps(data.address, data.city, data.state, data.zip, comps);
        return comps;
      }
    } catch (err) {
      Logger.log(`⚠️ Gemini failed: ${err.message}`);
      trackAPIUsage('gemini', false);
    }
  } else {
    Logger.log("⚠️ Gemini quota exceeded, skipping to next API");
  }

  // Priority 4: Try Bridge Dataset (no quota check - fallback)
  try {
    Logger.log("🌉 Trying Bridge Dataset (Priority 4)...");
    const { BRIDGE_API_KEY, BRIDGE_BASE_URL } = getApiKeys();
    const marketData = fetchBridgeMarketData(data, BRIDGE_API_KEY, BRIDGE_BASE_URL);
    if (marketData) {
      Logger.log("📊 Bridge market data available, generating estimated comps");
      comps = generateCompsFromMarketData(data, marketData);
      trackAPIUsage('bridge', true);
      setCachedComps(data.address, data.city, data.state, data.zip, comps);
      return comps;
    }
  } catch (err) {
    Logger.log(`⚠️ Bridge failed: ${err.message}`);
    trackAPIUsage('bridge', false);
  }

  // All APIs failed or exceeded quota
  Logger.log("❌ All API sources failed or exceeded quota");
  SpreadsheetApp.getUi().alert("⚠️ All API sources failed or exceeded quota.\n\nPlease check your API keys or wait for quota reset.");
  return [];
}

/**
 * Generate basic comps from Bridge market data
 */
function generateCompsFromMarketData(data, marketData) {
  const basePrice = marketData.medianHomeValue || 500000;
  const comps = [];

  for (let i = 0; i < 6; i++) {
    const variance = (Math.random() - 0.5) * 0.2; // ±10% variance
    comps.push({
      address: `Comparable ${i + 1} near ${data.city}, ${data.state}`,
      price: Math.round(basePrice * (1 + variance)),
      sqft: Math.round(1500 + (Math.random() - 0.5) * 500),
      saleDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      distance: Math.round(Math.random() * 2 * 10) / 10,
      condition: i < 3 ? "unremodeled" : "remodeled"
    });
  }

  return comps;
}

/**
 * Fetch market data from Bridge API (zgecon dataset)
 * This provides regional market trends, not individual properties
 */
function fetchBridgeMarketData(data, BRIDGE_API_KEY, BRIDGE_BASE_URL) {
  try {
    // Bridge zgecon provides market-level data
    // This is a placeholder - actual endpoint depends on Bridge API documentation
    const endpoint = `${BRIDGE_BASE_URL}/api/v2/zgecon?state=${encodeURIComponent(data.state)}&city=${encodeURIComponent(data.city)}`;
    const options = {
      method: 'get',
      headers: {
        Authorization: `Bearer ${BRIDGE_API_KEY}`,
        Accept: 'application/json'
      },
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(endpoint, options);
    const statusCode = response.getResponseCode();

    if (statusCode === 200) {
      const json = JSON.parse(response.getContentText() || '{}');
      return json;
    }
    return null;
  } catch (err) {
    Logger.log("Bridge market data fetch failed: " + err);
    return null;
  }
}

/**
 * Enrich Gemini comps with Bridge market data
 */
function enrichCompsWithMarketData(comps, marketData) {
  // Add market context to comps if available
  if (marketData && marketData.medianHomeValue) {
    comps.forEach(comp => {
      comp.marketMedian = marketData.medianHomeValue;
      comp.marketTrend = marketData.trend || "stable";
    });
  }
  return comps;
}

// TESTING
// /**
//  * TEMP: Force sample comps data for testing the sheet
//  */
// function fetchCompsData(data) {
//   Logger.log("⚙️ Using sample comps data (mock mode)");
//   const comps = [
//     { address: "123 Main St", price: 820000, sqft: 1600 },
//     { address: "125 Main St", price: 835000, sqft: 1650 },
//     { address: "129 Main St", price: 812000, sqft: 1550 },
//   ];
//   return comps;
// }

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
 * Fetch property details (beds, baths, sqft) from Zillow API
 * Used for ARV calculation and rental estimates
 */
function fetchPropertyDetails(data) {
  const { RAPIDAPI_KEY } = getApiKeys();

  if (!RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY not found in Script Properties");
  }

  const fullAddress = `${data.address}, ${data.city}, ${data.state} ${data.zip}`.trim();
  Logger.log("🏠 Fetching property details for: " + fullAddress);

  // Try to get property details from Zillow
  const url = `https://zillow-com1.p.rapidapi.com/property?address=${encodeURIComponent(fullAddress)}`;

  const options = {
    method: 'get',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
    },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();

    if (statusCode === 200) {
      const json = JSON.parse(responseText);

      // Extract property details
      const propertyDetails = {
        beds: json.bedrooms || json.beds || 3,
        baths: json.bathrooms || json.baths || 2,
        sqft: json.livingArea || json.sqft || 1500,
        yearBuilt: json.yearBuilt || null,
        lotSize: json.lotSize || null,
        propertyType: json.propertyType || json.homeType || 'Single Family'
      };

      Logger.log(`✅ Property details: ${propertyDetails.beds} bed, ${propertyDetails.baths} bath, ${propertyDetails.sqft} sqft`);
      return propertyDetails;
    }
  } catch (e) {
    Logger.log(`⚠️ Failed to fetch property details: ${e.message}`);
  }

  // Fallback to default values if API fails
  Logger.log("⚠️ Using default property details");
  return {
    beds: 3,
    baths: 2,
    sqft: 1500,
    yearBuilt: null,
    lotSize: null,
    propertyType: 'Single Family'
  };
}

/**
 * Fetch comps from Zillow API
 * Priority 1 in waterfall
 */
function fetchCompsFromZillow(data) {
  const { RAPIDAPI_KEY } = getApiKeys();

  if (!RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY not found in Script Properties");
  }

  const fullAddress = `${data.address}, ${data.city}, ${data.state} ${data.zip}`.trim();
  Logger.log("🏠 Calling Zillow API for: " + fullAddress);

  // Zillow API endpoint for property search
  const location = `${data.city}, ${data.state}`;
  const url = `https://zillow-com1.p.rapidapi.com/propertyExtendedSearch?location=${encodeURIComponent(location)}&status_type=RecentlySold&home_type=Houses&sort=Newest`;

  const options = {
    method: 'get',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
    },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const statusCode = response.getResponseCode();
  const responseText = response.getContentText();

  Logger.log("Zillow API status: " + statusCode);

  if (statusCode !== 200) {
    Logger.log("Zillow API error response: " + responseText);
    throw new Error(`Zillow API returned status ${statusCode}`);
  }

  try {
    const json = JSON.parse(responseText);

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
        longitude: prop.longitude || prop.lng || null
      };
    });

    Logger.log(`✅ Zillow returned ${comps.length} comps`);
    return comps;
  } catch (e) {
    Logger.log("❌ Zillow parsing error: " + e);
    Logger.log("Raw response: " + responseText);
    throw new Error("Failed to parse Zillow response: " + e.message);
  }
}

/**
 * Fetch comps from RapidAPI (using a real estate API)
 * Priority 2 in waterfall
 */
function fetchCompsFromRapidAPI(data) {
  const { RAPIDAPI_KEY } = getApiKeys();

  if (!RAPIDAPI_KEY) {
    throw new Error("RAPIDAPI_KEY not found in Script Properties");
  }

  const fullAddress = `${data.address}, ${data.city}, ${data.state} ${data.zip}`.trim();
  Logger.log("🔑 Calling RapidAPI for: " + fullAddress);

  // Using US Real Estate API on RapidAPI as an example
  // You can change this to any real estate API available on RapidAPI
  const url = `https://us-real-estate.p.rapidapi.com/v2/sold-homes?city=${encodeURIComponent(data.city)}&state_code=${encodeURIComponent(data.state)}&limit=6`;

  const options = {
    method: 'get',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'us-real-estate.p.rapidapi.com'
    },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const statusCode = response.getResponseCode();
  const responseText = response.getContentText();

  Logger.log("RapidAPI status: " + statusCode);

  if (statusCode !== 200) {
    Logger.log("RapidAPI error response: " + responseText);
    throw new Error(`RapidAPI returned status ${statusCode}`);
  }

  try {
    const json = JSON.parse(responseText);

    // Transform RapidAPI data to our format
    const comps = (json.data?.home_search?.results || []).slice(0, 6).map(home => ({
      address: home.location?.address?.line || "Unknown",
      price: home.list_price || home.price || 0,
      sqft: home.description?.sqft || 0,
      saleDate: home.list_date || new Date().toISOString().slice(0, 10),
      distance: 0,
      condition: "unknown"
    }));

    Logger.log(`✅ RapidAPI returned ${comps.length} comps`);
    return comps;
  } catch (e) {
    Logger.log("❌ RapidAPI parsing error: " + e);
    Logger.log("Raw response: " + responseText);
    throw new Error("Failed to parse RapidAPI response: " + e.message);
  }
}

/**
 * Use Gemini API (via Google Generative Language API)
 * Priority 3 in waterfall
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

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY;
  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  Logger.log("🔍 Calling Gemini API for: " + fullAddress);

  const res = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });

  const responseText = res.getContentText();
  const statusCode = res.getResponseCode();

  Logger.log("Gemini API status: " + statusCode);

  if (statusCode !== 200) {
    Logger.log("Gemini API error response: " + responseText);
    throw new Error(`Gemini API returned status ${statusCode}: ${responseText}`);
  }

  try {
    const json = JSON.parse(responseText);

    // Check for API errors
    if (json.error) {
      throw new Error(`Gemini API error: ${json.error.message}`);
    }

    let textBlock = json?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    // Remove markdown code fences if present
    textBlock = textBlock.replace(/```json|```/gi, "").trim();

    Logger.log("Gemini raw response: " + textBlock);

    const comps = JSON.parse(textBlock);
    Logger.log("✅ Parsed " + comps.length + " comps from Gemini");

    return comps;
  } catch (e) {
    Logger.log("❌ Gemini parsing error: " + e);
    Logger.log("Raw response: " + responseText);
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
 * Fetch rental comps data (separate from sale comps)
 * Phase 3.4: Rental comps fetching
 *
 * @param {Object} data - Property data including address, city, state, zip
 * @param {boolean} forceRefresh - If true, bypass cache and fetch fresh data
 * @returns {Array} Array of rental comparable properties
 */
function fetchRentalComps(data, forceRefresh = false) {
  const { BRIDGE_API_KEY, BRIDGE_BASE_URL, GEMINI_API_KEY, OPENAI_API_KEY } = getApiKeys();
  const source = data.apiSource.toLowerCase();
  let rentalComps = [];

  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cacheKey = `rental_${data.address}_${data.city}_${data.state}_${data.zip}`;
    const cached = getCachedComps(cacheKey, "", "", "");
    if (cached && cached.length > 0) {
      Logger.log(`📦 Using cached rental comps (${cached.length} properties)`);
      return cached;
    }
  }

  try {
    if (source === 'bridge') {
      rentalComps = retryWithBackoff(() => {
        const endpoint = `${BRIDGE_BASE_URL}/api/v2/rentals?address=${encodeURIComponent(data.address)}&city=${encodeURIComponent(data.city)}&state=${encodeURIComponent(data.state)}&postalcode=${encodeURIComponent(data.zip)}`;
        const options = {
          method: 'get',
          headers: {
            Authorization: `Bearer ${BRIDGE_API_KEY}`,
            Accept: 'application/json'
          },
          muteHttpExceptions: true
        };

        const response = UrlFetchApp.fetch(endpoint, options);
        const statusCode = response.getResponseCode();

        if (statusCode !== 200) {
          throw new Error(`Bridge API returned status ${statusCode}`);
        }

        const json = JSON.parse(response.getContentText() || '{}');
        const properties = json.rentals || json.properties || [];

        Logger.log(`Bridge API returned ${properties.length} rental comps`);
        return properties;
      });
    }

    if (source === 'openai') {
      rentalComps = retryWithBackoff(() => fetchRentalCompsFromOpenAI(data, OPENAI_API_KEY));
      Logger.log(`OpenAI returned ${rentalComps.length} rental comps`);
    }

    if (source === 'gemini') {
      rentalComps = retryWithBackoff(() => fetchRentalCompsFromGemini(data, GEMINI_API_KEY));
      Logger.log(`Gemini returned ${rentalComps.length} rental comps`);
    }

    // Validate and filter
    if (!Array.isArray(rentalComps)) {
      rentalComps = [];
    }
    rentalComps = rentalComps.filter(c => c && c.rent && c.rent > 0);

    // Cache the results
    if (rentalComps.length > 0) {
      const cacheKey = `rental_${data.address}_${data.city}_${data.state}_${data.zip}`;
      setCachedComps(cacheKey, "", "", "", rentalComps);
    }

  } catch (err) {
    Logger.log("❌ fetchRentalComps error: " + err);
    rentalComps = [];
  }

  return rentalComps;
}

/**
 * Fetch rental comps from OpenAI
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
    Logger.log("OpenAI rental comps error: " + e);
    return [];
  }
}

/**
 * Fetch rental comps from Gemini
 */
function fetchRentalCompsFromGemini(data, GEMINI_API_KEY) {
  const fullAddress = `${data.address}, ${data.city}, ${data.state} ${data.zip}`.trim();

  const prompt = `
  Generate 5 rental properties near ${fullAddress}.
  Return a valid JSON array only, like:
  [{"address":"123 Main St","rent":2500,"beds":3,"baths":2,"sqft":1600}]
  Do NOT include markdown or explanations.
  `;

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY;
  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const res = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });

  try {
    const json = JSON.parse(res.getContentText());
    const textBlock = json?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    return JSON.parse(textBlock);
  } catch (e) {
    Logger.log("Gemini rental comps error: " + e);
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
