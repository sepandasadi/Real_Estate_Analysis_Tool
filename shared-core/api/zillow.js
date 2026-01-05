/**
 * ===============================
 * ZILLOW API FUNCTIONS
 * ===============================
 *
 * Zillow API integration functions (via RapidAPI)
 * Platform-agnostic - HTTP calls handled by platform adapters
 *
 * @module shared-core/api/zillow
 */

/**
 * Parse Zillow API response and handle errors
 * @param {Object} response - Raw API response
 * @param {string} endpoint - Endpoint name for logging
 * @returns {Object} Parsed response or error object
 */
function parseZillowResponse(response, endpoint) {
  if (!response) {
    return { error: true, message: `No response from Zillow ${endpoint}` };
  }

  if (response.error) {
    return { error: true, message: response.message || 'Zillow API error' };
  }

  return { error: false, data: response };
}

/**
 * Phase 1.2: Fetch Zillow Zestimate for ARV validation
 * @param {string} zpid - Zillow Property ID
 * @returns {Object} { error: boolean, value?: number, message?: string }
 */
function fetchZillowZestimate(zpid) {
  // Validate input
  if (!zpid) {
    return { error: true, message: 'ZPID is required for Zestimate' };
  }

  // Note: Actual HTTP call is handled by platform adapter
  // This function defines the business logic and data structure
  return {
    endpoint: 'ZESTIMATE',
    params: { zpid: zpid },
    parser: function(response) {
      const parsed = parseZillowResponse(response, 'Zestimate');
      if (parsed.error) return parsed;

      // Extract Zestimate value from response
      const zestimate = parsed.data.zestimate || parsed.data.price || 0;

      return {
        error: false,
        value: zestimate,
        source: 'zillow_zestimate',
        zpid: zpid
      };
    }
  };
}

/**
 * Phase 1.4: Fetch AI-matched property comps from Zillow
 * @param {string} zpid - Zillow Property ID
 * @returns {Object} { error: boolean, comps?: Array, message?: string }
 */
function fetchZillowPropertyComps(zpid) {
  // Validate input
  if (!zpid) {
    return { error: true, message: 'ZPID is required for property comps' };
  }

  return {
    endpoint: 'PROPERTY_COMPS',
    params: { zpid: zpid },
    parser: function(response) {
      const parsed = parseZillowResponse(response, 'Property Comps');
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
          dataSource: 'zillow_property_comps',
          isReal: true,
          qualityScore: 100 // High quality - AI-matched by Zillow
        };
      });

      return {
        error: false,
        comps: comps,
        source: 'zillow_property_comps',
        zpid: zpid
      };
    }
  };
}

/**
 * Fetch property details from Zillow
 * @param {string} address - Full address
 * @returns {Object} { error: boolean, details?: Object, message?: string }
 */
function fetchZillowPropertyDetails(address) {
  // Validate input
  if (!address) {
    return { error: true, message: 'Address is required for property details' };
  }

  return {
    endpoint: 'PROPERTY_DETAILS',
    params: { address: address },
    parser: function(response) {
      const parsed = parseZillowResponse(response, 'Property Details');
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
          zpid: data.zpid || null
        },
        source: 'zillow_property_details'
      };
    }
  };
}

/**
 * Fetch recently sold homes in an area (generic search)
 * @param {string} city - City name
 * @param {string} state - State code
 * @param {Object} options - Search options (status_type, home_type, sort)
 * @returns {Object} { error: boolean, comps?: Array, message?: string }
 */
function fetchZillowRecentlySold(city, state, options) {
  // Validate input
  if (!city || !state) {
    return { error: true, message: 'City and state are required' };
  }

  // Default options
  const searchOptions = {
    status_type: options.status_type || 'RecentlySold',
    home_type: options.home_type || 'Houses',
    sort: options.sort || 'Newest'
  };

  return {
    endpoint: 'PROPERTY_EXTENDED_SEARCH',
    params: {
      location: city + ', ' + state,
      status_type: searchOptions.status_type,
      home_type: searchOptions.home_type,
      sort: searchOptions.sort
    },
    parser: function(response) {
      const parsed = parseZillowResponse(response, 'Recently Sold');
      if (parsed.error) return parsed;

      // Extract and normalize comps
      const props = parsed.data.props || [];
      const comps = props.slice(0, 10).map(function(prop) {
        // Convert Unix timestamp to readable date
        let formattedDate = '—';
        if (prop.dateSold) {
          try {
            const date = new Date(prop.dateSold * 1000);
            formattedDate = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
          } catch (e) {
            // Keep default if conversion fails
          }
        }

        return {
          address: prop.address || prop.streetAddress || 'Unknown',
          price: prop.price || 0,
          sqft: prop.livingArea || prop.sqft || 0,
          beds: prop.bedrooms || prop.beds || 0,
          baths: prop.bathrooms || prop.baths || 0,
          saleDate: formattedDate,
          distance: prop.distance || 0,
          condition: 'unknown',
          link: prop.detailUrl || prop.hdpUrl || '',
          latitude: prop.latitude || prop.lat || null,
          longitude: prop.longitude || prop.lng || null,
          dataSource: 'zillow_generic_search',
          isReal: true,
          qualityScore: 70 // Medium quality - generic search
        };
      });

      return {
        error: false,
        comps: comps,
        source: 'zillow_generic_search'
      };
    }
  };
}

/**
 * Phase 2.1: Fetch price and tax history
 * @param {string} zpid - Zillow Property ID
 * @returns {Object} { error: boolean, history?: Array, message?: string }
 */
function fetchPriceAndTaxHistory(zpid) {
  // Validate input
  if (!zpid) {
    return { error: true, message: 'ZPID is required for price history' };
  }

  return {
    endpoint: 'PRICE_TAX_HISTORY',
    params: { zpid: zpid },
    parser: function(response) {
      const parsed = parseZillowResponse(response, 'Price & Tax History');
      if (parsed.error) return parsed;

      // Extract historical data
      const priceHistory = parsed.data.priceHistory || [];
      const taxHistory = parsed.data.taxHistory || [];

      return {
        error: false,
        priceHistory: priceHistory,
        taxHistory: taxHistory,
        source: 'zillow_price_tax_history',
        zpid: zpid
      };
    }
  };
}

/**
 * Phase 2.2: Fetch Zestimate percent change (market trends)
 * @param {string} zpid - Zillow Property ID
 * @returns {Object} { error: boolean, trends?: Object, message?: string }
 */
function fetchZestimatePercentChange(zpid) {
  // Validate input
  if (!zpid) {
    return { error: true, message: 'ZPID is required for market trends' };
  }

  return {
    endpoint: 'ZESTIMATE_PERCENT_CHANGE',
    params: { zpid: zpid },
    parser: function(response) {
      const parsed = parseZillowResponse(response, 'Zestimate Percent Change');
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
        source: 'zillow_zestimate_change',
        zpid: zpid
      };
    }
  };
}

/**
 * Phase 2.2: Fetch local home values (area market trends)
 * @param {string} location - Location string (city, state or zip)
 * @returns {Object} { error: boolean, values?: Object, message?: string }
 */
function fetchLocalHomeValues(location) {
  // Validate input
  if (!location) {
    return { error: true, message: 'Location is required for local home values' };
  }

  return {
    endpoint: 'LOCAL_HOME_VALUES',
    params: { location: location },
    parser: function(response) {
      const parsed = parseZillowResponse(response, 'Local Home Values');
      if (parsed.error) return parsed;

      // Extract market data
      const data = parsed.data;
      return {
        error: false,
        values: {
          medianHomeValue: data.medianHomeValue || 0,
          medianListPrice: data.medianListPrice || 0,
          medianRentPrice: data.medianRentPrice || 0,
          homeValueIndex: data.homeValueIndex || 0
        },
        source: 'zillow_local_home_values',
        location: location
      };
    }
  };
}

/**
 * Phase 3.2: Fetch walk and transit scores
 * @param {string} zpid - Zillow Property ID
 * @returns {Object} { error: boolean, scores?: Object, message?: string }
 */
function fetchWalkAndTransitScore(zpid) {
  // Validate input
  if (!zpid) {
    return { error: true, message: 'ZPID is required for walk/transit scores' };
  }

  return {
    endpoint: 'WALK_TRANSIT_SCORE',
    params: { zpid: zpid },
    parser: function(response) {
      const parsed = parseZillowResponse(response, 'Walk & Transit Score');
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
        source: 'zillow_walk_transit_score',
        zpid: zpid
      };
    }
  };
}

/**
 * Phase 3.5: Fetch rent estimate
 * @param {string} zpid - Zillow Property ID
 * @returns {Object} { error: boolean, rentEstimate?: number, message?: string }
 */
function fetchZillowRentEstimate(zpid) {
  // Validate input
  if (!zpid) {
    return { error: true, message: 'ZPID is required for rent estimate' };
  }

  return {
    endpoint: 'RENT_ESTIMATE',
    params: { zpid: zpid },
    parser: function(response) {
      const parsed = parseZillowResponse(response, 'Rent Estimate');
      if (parsed.error) return parsed;

      // Extract rent estimate
      const rentEstimate = parsed.data.rentEstimate || parsed.data.rent || 0;

      return {
        error: false,
        rentEstimate: rentEstimate,
        source: 'zillow_rent_estimate',
        zpid: zpid
      };
    }
  };
}

/**
 * Phase 3.5: Fetch local rental rates
 * @param {string} zpid - Zillow Property ID
 * @returns {Object} { error: boolean, rentalRates?: Object, message?: string }
 */
function fetchLocalRentalRates(zpid) {
  // Validate input
  if (!zpid) {
    return { error: true, message: 'ZPID is required for local rental rates' };
  }

  return {
    endpoint: 'LOCAL_RENTAL_RATES',
    params: { zpid: zpid },
    parser: function(response) {
      const parsed = parseZillowResponse(response, 'Local Rental Rates');
      if (parsed.error) return parsed;

      // Extract rental rate data
      const data = parsed.data;
      return {
        error: false,
        rentalRates: {
          medianRent: data.medianRent || 0,
          rentPerSqft: data.rentPerSqft || 0,
          rentIndex: data.rentIndex || 0
        },
        source: 'zillow_local_rental_rates',
        zpid: zpid
      };
    }
  };
}
