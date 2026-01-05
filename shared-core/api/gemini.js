/**
 * ===============================
 * GEMINI AI API FUNCTIONS
 * ===============================
 *
 * Gemini AI API integration functions
 * Platform-agnostic - HTTP calls handled by platform adapters
 *
 * @module shared-core/api/gemini
 */

/**
 * Parse Gemini API response and handle errors
 * @param {Object} response - Raw API response
 * @param {string} endpoint - Endpoint name for logging
 * @returns {Object} Parsed response or error object
 */
function parseGeminiResponse(response, endpoint) {
  if (!response) {
    return { error: true, message: `No response from Gemini ${endpoint}` };
  }

  if (response.error) {
    return { error: true, message: response.error.message || 'Gemini API error' };
  }

  return { error: false, data: response };
}

/**
 * Generate comps using Gemini AI (fallback when other APIs fail)
 * @param {string} address - Street address
 * @param {string} city - City name
 * @param {string} state - State code
 * @param {string} zip - Zip code
 * @returns {Object} { error: boolean, comps?: Array, message?: string }
 */
function fetchCompsFromGemini(address, city, state, zip) {
  // Validate input
  if (!address || !city || !state || !zip) {
    return { error: true, message: 'Address, city, state, and zip are required' };
  }

  const fullAddress = address + ', ' + city + ', ' + state + ' ' + zip;

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

  return {
    endpoint: 'GENERATE_CONTENT',
    params: {
      prompt: prompt
    },
    parser: function(response) {
      const parsed = parseGeminiResponse(response, 'Generate Content');
      if (parsed.error) return parsed;

      try {
        // Extract text from Gemini response structure
        let textBlock = parsed.data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

        // Remove markdown code fences if present
        textBlock = textBlock.replace(/```json|```/gi, '').trim();

        // Parse JSON
        const comps = JSON.parse(textBlock);

        // Validate and normalize comps
        const normalizedComps = comps.map(function(comp) {
          return {
            address: comp.address || 'Unknown',
            price: comp.price || 0,
            sqft: comp.sqft || 0,
            beds: comp.beds || 0,
            baths: comp.baths || 0,
            saleDate: comp.saleDate || '',
            distance: comp.distance || 0,
            condition: comp.condition || 'unknown',
            link: '',
            latitude: null,
            longitude: null,
            dataSource: 'gemini_ai',
            isReal: false, // AI-generated, not real data
            qualityScore: 50 // Lower quality - AI-generated
          };
        });

        return {
          error: false,
          comps: normalizedComps,
          source: 'gemini_ai',
          address: fullAddress
        };
      } catch (e) {
        return {
          error: true,
          message: 'Failed to parse Gemini response: ' + e.message
        };
      }
    }
  };
}

/**
 * Generate rental comps using Gemini AI (fallback)
 * @param {string} address - Street address
 * @param {string} city - City name
 * @param {string} state - State code
 * @param {string} zip - Zip code
 * @returns {Object} { error: boolean, rentalComps?: Array, message?: string }
 */
function fetchRentalCompsFromGemini(address, city, state, zip) {
  // Validate input
  if (!address || !city || !state || !zip) {
    return { error: true, message: 'Address, city, state, and zip are required' };
  }

  const fullAddress = address + ', ' + city + ', ' + state + ' ' + zip;

  const prompt = `
Generate 5 rental properties near ${fullAddress}.
Return a valid JSON array only, like:
[{"address":"123 Main St","rent":2500,"beds":3,"baths":2,"sqft":1600}]
Do NOT include markdown or explanations.
`;

  return {
    endpoint: 'GENERATE_CONTENT',
    params: {
      prompt: prompt
    },
    parser: function(response) {
      const parsed = parseGeminiResponse(response, 'Generate Content');
      if (parsed.error) return parsed;

      try {
        // Extract text from Gemini response structure
        let textBlock = parsed.data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

        // Remove markdown code fences if present
        textBlock = textBlock.replace(/```json|```/gi, '').trim();

        // Parse JSON
        const rentalComps = JSON.parse(textBlock);

        // Validate and normalize rental comps
        const normalizedComps = rentalComps.map(function(comp) {
          return {
            address: comp.address || 'Unknown',
            rent: comp.rent || 0,
            beds: comp.beds || 0,
            baths: comp.baths || 0,
            sqft: comp.sqft || 0,
            link: '',
            dataSource: 'gemini_ai_rental'
          };
        });

        return {
          error: false,
          rentalComps: normalizedComps,
          source: 'gemini_ai_rental',
          address: fullAddress
        };
      } catch (e) {
        return {
          error: true,
          message: 'Failed to parse Gemini rental response: ' + e.message
        };
      }
    }
  };
}

/**
 * Analyze property condition using Gemini AI
 * @param {string} description - Property description
 * @param {Array} photos - Array of photo URLs (optional)
 * @returns {Object} { error: boolean, condition?: string, confidence?: number, message?: string }
 */
function analyzePropertyCondition(description, photos) {
  // Validate input
  if (!description) {
    return { error: true, message: 'Property description is required' };
  }

  const prompt = `
Analyze this property description and determine if it's "remodeled" or "unremodeled":

Description: ${description}

Return a JSON object with:
{
  "condition": "remodeled" or "unremodeled",
  "confidence": 0-100,
  "reasoning": "brief explanation"
}

Do NOT include markdown or explanations outside the JSON.
`;

  return {
    endpoint: 'GENERATE_CONTENT',
    params: {
      prompt: prompt
    },
    parser: function(response) {
      const parsed = parseGeminiResponse(response, 'Generate Content');
      if (parsed.error) return parsed;

      try {
        // Extract text from Gemini response structure
        let textBlock = parsed.data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

        // Remove markdown code fences if present
        textBlock = textBlock.replace(/```json|```/gi, '').trim();

        // Parse JSON
        const analysis = JSON.parse(textBlock);

        return {
          error: false,
          condition: analysis.condition || 'unknown',
          confidence: analysis.confidence || 50,
          reasoning: analysis.reasoning || '',
          source: 'gemini_ai_condition'
        };
      } catch (e) {
        return {
          error: true,
          message: 'Failed to parse Gemini condition analysis: ' + e.message
        };
      }
    }
  };
}

/**
 * Generate ARV estimate using Gemini AI (fallback)
 * @param {Object} propertyData - Property information
 * @param {Array} comps - Comparable properties
 * @returns {Object} { error: boolean, arv?: number, reasoning?: string, message?: string }
 */
function generateARVEstimate(propertyData, comps) {
  // Validate input
  if (!propertyData || !comps || comps.length === 0) {
    return { error: true, message: 'Property data and comps are required' };
  }

  const prompt = `
Analyze this property and comparable sales to estimate After Repair Value (ARV):

Property:
- Address: ${propertyData.address}
- Beds: ${propertyData.beds}
- Baths: ${propertyData.baths}
- Sqft: ${propertyData.sqft}
- Purchase Price: $${propertyData.purchasePrice}
- Rehab Cost: $${propertyData.rehabCost}

Comparable Sales:
${comps.map(function(c, i) {
  return (i + 1) + '. ' + c.address + ' - $' + c.price + ' (' + c.sqft + ' sqft, ' + c.condition + ')';
}).join('\n')}

Return a JSON object with:
{
  "arv": estimated ARV value (number),
  "reasoning": "brief explanation of how you calculated it",
  "confidence": 0-100
}

Do NOT include markdown or explanations outside the JSON.
`;

  return {
    endpoint: 'GENERATE_CONTENT',
    params: {
      prompt: prompt
    },
    parser: function(response) {
      const parsed = parseGeminiResponse(response, 'Generate Content');
      if (parsed.error) return parsed;

      try {
        // Extract text from Gemini response structure
        let textBlock = parsed.data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

        // Remove markdown code fences if present
        textBlock = textBlock.replace(/```json|```/gi, '').trim();

        // Parse JSON
        const estimate = JSON.parse(textBlock);

        return {
          error: false,
          arv: estimate.arv || 0,
          reasoning: estimate.reasoning || '',
          confidence: estimate.confidence || 50,
          source: 'gemini_ai_arv'
        };
      } catch (e) {
        return {
          error: true,
          message: 'Failed to parse Gemini ARV estimate: ' + e.message
        };
      }
    }
  };
}
