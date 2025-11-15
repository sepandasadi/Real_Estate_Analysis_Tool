/**
 * Get all secure keys from Script Properties
 */
function getApiKeys() {
  const props = PropertiesService.getScriptProperties();
  return {
    BRIDGE_API_KEY: props.getProperty('BRIDGE_API_KEY'),
    BRIDGE_BASE_URL: props.getProperty('BRIDGE_BASE_URL'),
    GEMINI_API_KEY: props.getProperty('GEMINI_API_KEY'),
    OPENAI_API_KEY: props.getProperty('OPENAI_API_KEY')
  };
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
 * Fetch comps data using hybrid API strategy
 * Phase 3: Hybrid approach - Bridge for market data, Gemini for property comps
 *
 * @param {Object} data - Property data including address, city, state, zip
 * @param {boolean} forceRefresh - If true, bypass cache and fetch fresh data
 * @returns {Array} Array of comparable properties
 */
function fetchCompsData(data, forceRefresh = false) {
  const { BRIDGE_API_KEY, BRIDGE_BASE_URL, GEMINI_API_KEY } = getApiKeys();
  let comps = [];

  // Phase 3: Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cachedComps = getCachedComps(data.address, data.city, data.state, data.zip);
    if (cachedComps && cachedComps.length > 0) {
      Logger.log(`📦 Using cached comps (${cachedComps.length} properties)`);
      return cachedComps;
    }
  } else {
    Logger.log("🔄 Force refresh requested, bypassing cache");
  }

  try {
    // Hybrid Strategy: Use Gemini for property comps
    Logger.log("🤖 Using Gemini AI for property comps");
    comps = retryWithBackoff(() => fetchCompsFromGemini(data, GEMINI_API_KEY));
    Logger.log(`✅ Gemini returned ${comps.length} comps`);

    // Optional: Try to enrich with Bridge market data if available
    // (Bridge zgecon dataset provides market trends, not individual properties)
    try {
      const marketData = fetchBridgeMarketData(data, BRIDGE_API_KEY, BRIDGE_BASE_URL);
      if (marketData) {
        Logger.log("📊 Enriched comps with Bridge market data");
        comps = enrichCompsWithMarketData(comps, marketData);
      }
    } catch (bridgeErr) {
      Logger.log("⚠️ Bridge market data unavailable, using Gemini comps only: " + bridgeErr);
    }

    // Validate comps data
    if (!Array.isArray(comps)) {
      Logger.log("⚠️ Invalid comps format, returning empty array");
      comps = [];
    }

    // Filter out invalid comps
    comps = comps.filter(c => c && c.price && c.price > 0);

    // Phase 3: Cache the results if we got valid data
    if (comps.length > 0) {
      setCachedComps(data.address, data.city, data.state, data.zip, comps);
    }

  } catch (err) {
    Logger.log("❌ fetchCompsData error: " + err);
    SpreadsheetApp.getUi().alert(`⚠️ API Error: ${err.message}\n\nProceeding with estimated values.`);
    comps = [];
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
 * Use Gemini API (via Google Generative Language API)
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
