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
 * Fetch comps data from Bridge Dataset (using secure key)
 */
function fetchCompsData(data) {
  const { BRIDGE_API_KEY, BRIDGE_BASE_URL, GEMINI_API_KEY, OPENAI_API_KEY } = getApiKeys();
  const source = data.apiSource.toLowerCase();
  let comps = [];

  try {
    if (source === 'bridge') {
      comps = retryWithBackoff(() => {
        const endpoint = `${BRIDGE_BASE_URL}/api/v2/zestimates?address=${encodeURIComponent(data.address)}&city=${encodeURIComponent(data.city)}&state=${encodeURIComponent(data.state)}&postalcode=${encodeURIComponent(data.zip)}`;
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
          throw new Error(`Bridge API returned status ${statusCode}: ${response.getContentText()}`);
        }

        const json = JSON.parse(response.getContentText() || '{}');
        const properties = json.properties || [];

        if (!Array.isArray(properties)) {
          throw new Error('Invalid response format from Bridge API');
        }

        Logger.log(`Bridge API returned ${properties.length} comps`);
        return properties;
      });
    }

    if (source === 'openai') {
      comps = retryWithBackoff(() => fetchCompsFromOpenAI(data, OPENAI_API_KEY));
      Logger.log(`OpenAI returned ${comps.length} comps`);
    }

    if (source === 'gemini') {
      comps = retryWithBackoff(() => fetchCompsFromGemini(data, GEMINI_API_KEY));
      Logger.log(`Gemini returned ${comps.length} comps`);
    }

    // Validate comps data
    if (!Array.isArray(comps)) {
      Logger.log("⚠️ Invalid comps format, returning empty array");
      comps = [];
    }

    // Filter out invalid comps
    comps = comps.filter(c => c && c.price && c.price > 0);

  } catch (err) {
    Logger.log("❌ fetchCompsData error: " + err);
    SpreadsheetApp.getUi().alert(`⚠️ API Error: ${err.message}\n\nProceeding with estimated values.`);
    comps = [];
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
  const fullAddress = `${data.address}, ${data.city}, ${data.state} ${data.zip}`.trim();

  const prompt = `
  Generate 3 comparable homes near ${fullAddress}.
  Return a valid JSON array only, like:
  [{"address":"123 Main St","price":825000,"sqft":1600}]
  Do NOT include markdown or explanations.
  `;

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY;
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
    Logger.log("Gemini error: " + e);
    return [];
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
