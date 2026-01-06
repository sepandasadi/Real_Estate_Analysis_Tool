/**
 * ===============================
 * PRIVATE ZILLOW API FUNCTIONS
 * ===============================
 *
 * Private Zillow API integration functions (via RapidAPI)
 * Host: private-zillow.p.rapidapi.com (oneapiproject)
 * Quota: 250 calls/month
 * Usage tracking: Via X-RapidAPI-* response headers
 * Platform-agnostic - HTTP calls handled by platform adapters
 *
 * NOTE: Endpoints to be discovered via MCP server testing
 * See ENDPOINT_DISCOVERY.md for testing progress
 *
 * @module shared-core/api/privateZillow
 */

/**
 * Parse Private Zillow API response and handle errors
 * @param {Object} response - Raw API response
 * @param {string} endpoint - Endpoint name for logging
 * @returns {Object} Parsed response or error object
 */
function parsePrivateZillowResponse(response, endpoint) {
  if (!response) {
    return { error: true, message: `No response from Private Zillow ${endpoint}` };
  }

  if (response.error) {
    return { error: true, message: response.error.message || 'Private Zillow API error' };
  }

  return { error: false, data: response };
}

/**
 * Fetch Zestimate for ARV validation
 * @param {string} zpid - Zillow Property ID
 * @returns {Object} { error: boolean, value?: number, message?: string }
 */
function fetchPrivateZillowZestimate(zpid) {
  // Validate input
  if (!zpid) {
    return { error: true, message: 'ZPID is required for Zestimate' };
  }

  // NOTE: Endpoint to be discovered via MCP testing
  return {
    endpoint: 'ZESTIMATE', // Will be updated after discovery
    params: { zpid: zpid },
    parser: function(response) {
      const parsed = parsePrivateZillowResponse(response, 'Zestimate');
      if (parsed.error) return parsed;

      // Extract Zestimate value from response
      const zestimate = parsed.data.zestimate || parsed.data.price || parsed.data.value || 0;

      return {
        error: false,
        value: zestimate,
        source: 'private_zillow_zestimate',
        zpid: zpid
      };
    }
  };
}

/**
 * Fetch AI-matched property comps from Private Zillow
 * @param {string} zpid - Zillow Property ID
 * @returns {Object} { error: boolean, comps?: Array, message?: string }
 */
function fetchPrivateZillowPropertyComps(zpid) {
  // Validate input
  if (!zpid) {
    return { error: true, message: 'ZPID is required for property comps' };
  }

  return {
    endpoint: 'PROPERTY_COMPS',
    params: { zpid: zpid },
    parser: function(response) {
      const parsed = parsePrivateZillowResponse(response, 'Property Comps');
      if (parsed.error) return parsed;

      // Extract and normalize comps data
      const rawComps = parsed.data.comps || parsed.data.comparables || [];
      const comps = rawComps.map(function(comp) {
        return {
          address: comp.address || comp.streetAddress || 'Unknown',
          price: comp.price || comp.soldPrice || 0,
          sqft: comp.livingArea || comp.sqft || 0,
          beds: comp.bedrooms || comp.beds || 0,
          baths: comp.bathrooms || comp.baths || 0,
          saleDate: comp.dateSold || comp.soldDate || '',
          distance: comp.distance || 0,
          condition: comp.condition || 'unknown',
          link: comp.detailUrl || comp.hdpUrl || '',
          latitude: comp.latitude || comp.lat || null,
          longitude: comp.longitude || comp.lng || null,
          dataSource: 'private_zillow_comps',
          isReal: true,
          qualityScore: 100 // Highest quality - Private Zillow data
        };
      });

      return {
        error: false,
        comps: comps,
        source: 'private_zillow_comps',
        zpid: zpid
      };
    }
  };
}

/**
 * Fetch property details from Private Zillow
 * @param {string} address - Full address or ZPID
 * @param {string} city - City name (optional if using ZPID)
 * @param {string} state - State code (optional if using ZPID)
 * @param {string} zip - Zip code (optional if using ZPID)
 * @returns {Object} { error: boolean, details?: Object, message?: string }
 */
function fetchPrivateZillowPropertyDetails(address, city, state, zip) {
  // Validate input
  if (!address) {
    return { error: true, message: 'Address or ZPID is required for property details' };
  }

  return {
    endpoint: 'PROPERTY_DETAILS',
    params: {
      address: address,
      city: city,
      state: state,
      zip: zip
    },
    parser: function(response) {
      const parsed = parsePrivateZillowResponse(response, 'Property Details');
      if (parsed.error) return parsed;

      // Extract property details
      const data = parsed.data;
      return {
        error: false,
        details: {
          beds: data.bedrooms || data.beds || 3,
          baths: data.bathrooms || data.baths || 2,
          sqft: data.livingArea || data.sqft || 1500,
          yearBuilt: data.yearBuilt || null,
          lotSize: data.lotSize || null,
          propertyType: data.propertyType || data.homeType || 'Single Family',
          zpid: data.zpid || null,
          zestimate: data.zestimate || null
        },
        source: 'private_zillow_details'
      };
    }
  };
}

/**
 * Fetch price and tax history
 * @param {string} zpid - Zillow Property ID
 * @returns {Object} { error: boolean, history?: Array, message?: string }
 */
function fetchPrivateZillowPriceHistory(zpid) {
  // Validate input
  if (!zpid) {
    return { error: true, message: 'ZPID is required for price history' };
  }

  return {
    endpoint: 'PRICE_TAX_HISTORY',
    params: { zpid: zpid },
    parser: function(response) {
      const parsed = parsePrivateZillowResponse(response, 'Price & Tax History');
      if (parsed.error) return parsed;

      // Extract historical data
      const priceHistory = parsed.data.priceHistory || [];
      const taxHistory = parsed.data.taxHistory || [];

      return {
        error: false,
        priceHistory: priceHistory,
        taxHistory: taxHistory,
        source: 'private_zillow_history',
        zpid: zpid
      };
    }
  };
}

/**
 * Fetch walk and transit scores
 * @param {string} zpid - Zillow Property ID
 * @returns {Object} { error: boolean, scores?: Object, message?: string }
 */
function fetchPrivateZillowWalkScore(zpid) {
  // Validate input
  if (!zpid) {
    return { error: true, message: 'ZPID is required for walk/transit scores' };
  }

  return {
    endpoint: 'WALK_TRANSIT_SCORE',
    params: { zpid: zpid },
    parser: function(response) {
      const parsed = parsePrivateZillowResponse(response, 'Walk & Transit Score');
      if (parsed.error) return parsed;

      // Extract scores
      const data = parsed.data;
      return {
        error: false,
        scores: {
          walkScore: data.walkScore || 0,
          transitScore: data.transitScore || 0,
          bikeScore: data.bikeScore || 0
        },
        source: 'private_zillow_walk_score',
        zpid: zpid
      };
    }
  };
}

/**
 * Fetch rent estimate
 * @param {string} zpid - Zillow Property ID
 * @returns {Object} { error: boolean, rentEstimate?: number, message?: string }
 */
function fetchPrivateZillowRentEstimate(zpid) {
  // Validate input
  if (!zpid) {
    return { error: true, message: 'ZPID is required for rent estimate' };
  }

  return {
    endpoint: 'RENT_ESTIMATE',
    params: { zpid: zpid },
    parser: function(response) {
      const parsed = parsePrivateZillowResponse(response, 'Rent Estimate');
      if (parsed.error) return parsed;

      // Extract rent estimate
      const rentEstimate = parsed.data.rentEstimate || parsed.data.rent || 0;

      return {
        error: false,
        rentEstimate: rentEstimate,
        source: 'private_zillow_rent',
        zpid: zpid
      };
    }
  };
}

/**
 * Fetch market trends (Zestimate percent change)
 * @param {string} zpid - Zillow Property ID
 * @returns {Object} { error: boolean, trends?: Object, message?: string }
 */
function fetchPrivateZillowMarketTrends(zpid) {
  // Validate input
  if (!zpid) {
    return { error: true, message: 'ZPID is required for market trends' };
  }

  return {
    endpoint: 'ZESTIMATE_PERCENT_CHANGE',
    params: { zpid: zpid },
    parser: function(response) {
      const parsed = parsePrivateZillowResponse(response, 'Market Trends');
      if (parsed.error) return parsed;

      // Extract trend data
      const data = parsed.data;
      return {
        error: false,
        trends: {
          thirtyDayChange: data.thirtyDayChange || 0,
          oneYearChange: data.oneYearChange || 0,
          fiveYearChange: data.fiveYearChange || 0,
          tenYearChange: data.tenYearChange || 0
        },
        source: 'private_zillow_trends',
        zpid: zpid
      };
    }
  };
}

