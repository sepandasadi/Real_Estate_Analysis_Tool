/**
 * ===============================
 * BRIDGE DATASET API FUNCTIONS
 * ===============================
 *
 * Bridge Dataset API integration functions
 * Platform-agnostic - HTTP calls handled by platform adapters
 *
 * @module shared-core/api/bridge
 */

/**
 * Parse Bridge API response and handle errors
 * @param {Object} response - Raw API response
 * @param {string} endpoint - Endpoint name for logging
 * @returns {Object} Parsed response or error object
 */
function parseBridgeResponse(response, endpoint) {
  if (!response) {
    return { error: true, message: `No response from Bridge ${endpoint}` };
  }

  if (response.error) {
    return { error: true, message: response.message || 'Bridge API error' };
  }

  return { error: false, data: response };
}

/**
 * Fetch market data from Bridge API (zgecon dataset)
 * Provides regional market trends, not individual properties
 * @param {string} city - City name
 * @param {string} state - State code
 * @returns {Object} { error: boolean, marketData?: Object, message?: string }
 */
function fetchBridgeMarketData(city, state) {
  // Validate input
  if (!city || !state) {
    return { error: true, message: 'City and state are required for market data' };
  }

  return {
    endpoint: 'MARKET_DATA',
    params: {
      city: city,
      state: state
    },
    parser: function(response) {
      const parsed = parseBridgeResponse(response, 'Market Data');
      if (parsed.error) return parsed;

      // Extract market data
      const data = parsed.data;
      return {
        error: false,
        marketData: {
          medianHomeValue: data.medianHomeValue || 0,
          medianListPrice: data.medianListPrice || 0,
          medianRentPrice: data.medianRentPrice || 0,
          homeValueIndex: data.homeValueIndex || 0,
          trend: data.trend || 'stable',
          appreciationRate: data.appreciationRate || 0
        },
        source: 'bridge_market_data',
        city: city,
        state: state
      };
    }
  };
}

/**
 * Fetch rental data from Bridge API
 * @param {string} address - Street address
 * @param {string} city - City name
 * @param {string} state - State code
 * @param {string} zip - Zip code
 * @returns {Object} { error: boolean, rentals?: Array, message?: string }
 */
function fetchBridgeRentals(address, city, state, zip) {
  // Validate input
  if (!address || !city || !state || !zip) {
    return { error: true, message: 'Address, city, state, and zip are required for rentals' };
  }

  return {
    endpoint: 'RENTALS',
    params: {
      address: address,
      city: city,
      state: state,
      postalcode: zip
    },
    parser: function(response) {
      const parsed = parseBridgeResponse(response, 'Rentals');
      if (parsed.error) return parsed;

      // Extract rental data
      const rentals = parsed.data.rentals || parsed.data.properties || [];
      const normalizedRentals = rentals.map(function(rental) {
        return {
          address: rental.address || 'Unknown',
          rent: rental.rent || rental.price || 0,
          beds: rental.beds || rental.bedrooms || 0,
          baths: rental.baths || rental.bathrooms || 0,
          sqft: rental.sqft || rental.livingArea || 0,
          link: rental.link || '',
          dataSource: 'bridge_rentals'
        };
      });

      return {
        error: false,
        rentals: normalizedRentals,
        source: 'bridge_rentals',
        address: address
      };
    }
  };
}

/**
 * Fetch property data from Bridge API (if available)
 * @param {string} address - Street address
 * @param {string} city - City name
 * @param {string} state - State code
 * @param {string} zip - Zip code
 * @returns {Object} { error: boolean, property?: Object, message?: string }
 */
function fetchBridgeProperty(address, city, state, zip) {
  // Validate input
  if (!address || !city || !state || !zip) {
    return { error: true, message: 'Address, city, state, and zip are required for property data' };
  }

  return {
    endpoint: 'PROPERTIES',
    params: {
      address: address,
      city: city,
      state: state,
      postalcode: zip
    },
    parser: function(response) {
      const parsed = parseBridgeResponse(response, 'Properties');
      if (parsed.error) return parsed;

      // Extract property data
      const data = parsed.data;
      return {
        error: false,
        property: {
          address: data.address || address,
          price: data.price || data.value || 0,
          beds: data.beds || data.bedrooms || 0,
          baths: data.baths || data.bathrooms || 0,
          sqft: data.sqft || data.livingArea || 0,
          yearBuilt: data.yearBuilt || null,
          lotSize: data.lotSize || null,
          propertyType: data.propertyType || 'Single Family'
        },
        source: 'bridge_properties',
        address: address
      };
    }
  };
}

/**
 * Generate estimated comps from Bridge market data
 * Used as last resort when no real comps are available
 * @param {Object} propertyData - Property information
 * @param {Object} marketData - Market data from Bridge
 * @returns {Array} Array of estimated comps
 */
function generateCompsFromMarketData(propertyData, marketData) {
  // Validate input
  if (!propertyData || !marketData) {
    return [];
  }

  const basePrice = marketData.medianHomeValue || 500000;
  const comps = [];

  // Generate 6 estimated comps with variance
  for (let i = 0; i < 6; i++) {
    const variance = (Math.random() - 0.5) * 0.2; // ±10% variance
    const isRemodeled = i >= 3; // Last 3 are "remodeled"

    comps.push({
      address: 'Comparable ' + (i + 1) + ' near ' + propertyData.city + ', ' + propertyData.state,
      price: Math.round(basePrice * (1 + variance)),
      sqft: Math.round(1500 + (Math.random() - 0.5) * 500),
      beds: 3,
      baths: 2,
      saleDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      distance: Math.round(Math.random() * 2 * 10) / 10,
      condition: isRemodeled ? 'remodeled' : 'unremodeled',
      link: '',
      latitude: null,
      longitude: null,
      dataSource: 'bridge_estimated',
      isReal: false, // Estimated, not real data
      qualityScore: 30 // Low quality - estimated from market data
    });
  }

  return comps;
}

/**
 * Enrich comps with Bridge market data context
 * Adds market median and trend information to comps
 * @param {Array} comps - Array of comps
 * @param {Object} marketData - Market data from Bridge
 * @returns {Array} Enriched comps
 */
function enrichCompsWithMarketData(comps, marketData) {
  // Validate input
  if (!comps || !Array.isArray(comps) || !marketData) {
    return comps;
  }

  // Add market context to each comp
  return comps.map(function(comp) {
    return {
      ...comp,
      marketMedian: marketData.medianHomeValue || null,
      marketTrend: marketData.trend || 'stable',
      appreciationRate: marketData.appreciationRate || 0
    };
  });
}
