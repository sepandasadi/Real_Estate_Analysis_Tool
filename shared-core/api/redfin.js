/**
 * ===============================
 * REDFIN BASE US API FUNCTIONS
 * ===============================
 *
 * Redfin Base US API integration functions (via RapidAPI)
 * Host: redfin-base-us.p.rapidapi.com (tvhaudev)
 * Quota: 111 calls/month (hard limit)
 * Usage tracking: Via X-RapidAPI-* response headers
 * Platform-agnostic - HTTP calls handled by platform adapters
 *
 * NOTE: Endpoints to be discovered via MCP server testing
 * See ENDPOINT_DISCOVERY.md for testing progress
 *
 * @module shared-core/api/redfin
 */

/**
 * Parse Redfin API response and handle errors
 * @param {Object} response - Raw API response
 * @param {string} endpoint - Endpoint name for logging
 * @returns {Object} Parsed response or error object
 */
function parseRedfinResponse(response, endpoint) {
  if (!response) {
    return { error: true, message: `No response from Redfin ${endpoint}` };
  }

  if (response.error) {
    return { error: true, message: response.error.message || 'Redfin API error' };
  }

  return { error: false, data: response };
}

/**
 * Fetch property details from Redfin
 * @param {string} address - Street address
 * @param {string} city - City name
 * @param {string} state - State code
 * @param {string} zip - Zip code
 * @returns {Object} { error: boolean, details?: Object, message?: string }
 */
function fetchRedfinPropertyDetails(address, city, state, zip) {
  // Validate input
  if (!address || !city || !state || !zip) {
    return { error: true, message: 'Address, city, state, and zip are required' };
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
      const parsed = parseRedfinResponse(response, 'Property Details');
      if (parsed.error) return parsed;

      // Extract property details
      const data = parsed.data;
      return {
        error: false,
        details: {
          beds: data.beds || data.bedrooms || 3,
          baths: data.baths || data.bathrooms || 2,
          sqft: data.sqft || data.livingArea || 1500,
          listPrice: data.price || data.listPrice || 0,
          yearBuilt: data.yearBuilt || null,
          lotSize: data.lotSize || null,
          propertyType: data.propertyType || data.homeType || 'Single Family',
          listingAgent: data.agent || null,
          daysOnMarket: data.daysOnMarket || data.dom || null,
          priceHistory: data.priceHistory || []
        },
        source: 'redfin_details'
      };
    }
  };
}

/**
 * Fetch comparable properties from Redfin
 * @param {string} address - Street address
 * @param {string} city - City name
 * @param {string} state - State code
 * @param {string} zip - Zip code
 * @returns {Object} { error: boolean, comps?: Array, message?: string }
 */
function fetchRedfinComps(address, city, state, zip) {
  // Validate input
  if (!address || !city || !state || !zip) {
    return { error: true, message: 'Address, city, state, and zip are required' };
  }

  return {
    endpoint: 'COMPS',
    params: {
      address: address,
      city: city,
      state: state,
      zip: zip
    },
    parser: function(response) {
      const parsed = parseRedfinResponse(response, 'Comparable Properties');
      if (parsed.error) return parsed;

      // Extract and normalize comps data
      const rawComps = parsed.data.comps || parsed.data.comparables || [];
      const comps = rawComps.map(function(comp) {
        return {
          address: comp.address || comp.streetAddress || 'Unknown',
          price: comp.price || comp.soldPrice || 0,
          sqft: comp.sqft || comp.livingArea || 0,
          beds: comp.beds || comp.bedrooms || 0,
          baths: comp.baths || comp.bathrooms || 0,
          saleDate: comp.saleDate || comp.soldDate || '',
          distance: comp.distance || 0,
          condition: comp.condition || 'unknown',
          link: comp.url || comp.link || '',
          latitude: comp.latitude || comp.lat || null,
          longitude: comp.longitude || comp.lng || null,
          dataSource: 'redfin_comps',
          isReal: true,
          qualityScore: 90 // Good quality - Redfin verified data
        };
      });

      return {
        error: false,
        comps: comps,
        source: 'redfin_comps',
        address: address
      };
    }
  };
}

/**
 * Fetch sold homes in an area
 * @param {string} city - City name
 * @param {string} state - State code
 * @param {Object} filters - Search filters (beds, baths, sqft, etc.)
 * @returns {Object} { error: boolean, comps?: Array, message?: string }
 */
function fetchRedfinSoldHomes(city, state, filters) {
  // Validate input
  if (!city || !state) {
    return { error: true, message: 'City and state are required for sold homes' };
  }

  // Default filters
  const searchFilters = {
    beds_min: filters.beds_min || null,
    beds_max: filters.beds_max || null,
    baths_min: filters.baths_min || null,
    baths_max: filters.baths_max || null,
    sqft_min: filters.sqft_min || null,
    sqft_max: filters.sqft_max || null,
    sold_within_days: filters.sold_within_days || 365,
    limit: filters.limit || 10
  };

  return {
    endpoint: 'SOLD_HOMES',
    params: {
      city: city,
      state: state,
      beds_min: searchFilters.beds_min,
      beds_max: searchFilters.beds_max,
      baths_min: searchFilters.baths_min,
      baths_max: searchFilters.baths_max,
      sqft_min: searchFilters.sqft_min,
      sqft_max: searchFilters.sqft_max,
      sold_within_days: searchFilters.sold_within_days,
      limit: searchFilters.limit
    },
    parser: function(response) {
      const parsed = parseRedfinResponse(response, 'Sold Homes');
      if (parsed.error) return parsed;

      // Extract and normalize sold homes
      const results = parsed.data.homes || parsed.data.properties || [];
      const comps = results.map(function(home) {
        return {
          address: home.address || home.streetAddress || 'Unknown',
          price: home.price || home.soldPrice || 0,
          sqft: home.sqft || home.livingArea || 0,
          beds: home.beds || home.bedrooms || 0,
          baths: home.baths || home.bathrooms || 0,
          saleDate: home.saleDate || home.soldDate || '',
          distance: 0,
          condition: 'unknown',
          link: home.url || home.link || '',
          latitude: home.latitude || home.lat || null,
          longitude: home.longitude || home.lng || null,
          dataSource: 'redfin_sold_homes',
          isReal: true,
          qualityScore: 85 // High quality - filtered search
        };
      });

      return {
        error: false,
        comps: comps,
        source: 'redfin_sold_homes'
      };
    }
  };
}

/**
 * Fetch rental properties from Redfin
 * @param {string} city - City name
 * @param {string} state - State code
 * @param {Object} filters - Search filters (beds, baths, sqft, etc.)
 * @returns {Object} { error: boolean, rentalComps?: Array, message?: string }
 */
function fetchRedfinForRent(city, state, filters) {
  // Validate input
  if (!city || !state) {
    return { error: true, message: 'City and state are required for rental comps' };
  }

  // Default filters
  const searchFilters = {
    beds_min: filters.beds_min || null,
    beds_max: filters.beds_max || null,
    baths_min: filters.baths_min || null,
    baths_max: filters.baths_max || null,
    sqft_min: filters.sqft_min || null,
    sqft_max: filters.sqft_max || null,
    limit: filters.limit || 10
  };

  return {
    endpoint: 'FOR_RENT',
    params: {
      city: city,
      state: state,
      beds_min: searchFilters.beds_min,
      beds_max: searchFilters.beds_max,
      baths_min: searchFilters.baths_min,
      baths_max: searchFilters.baths_max,
      sqft_min: searchFilters.sqft_min,
      sqft_max: searchFilters.sqft_max,
      limit: searchFilters.limit
    },
    parser: function(response) {
      const parsed = parseRedfinResponse(response, 'For Rent');
      if (parsed.error) return parsed;

      // Extract rental comps
      const results = parsed.data.rentals || parsed.data.properties || [];
      const rentalComps = results.map(function(rental) {
        return {
          address: rental.address || rental.streetAddress || 'Unknown',
          rent: rental.rent || rental.price || 0,
          sqft: rental.sqft || rental.livingArea || 0,
          beds: rental.beds || rental.bedrooms || 0,
          baths: rental.baths || rental.bathrooms || 0,
          link: rental.url || rental.link || '',
          dataSource: 'redfin_for_rent'
        };
      });

      return {
        error: false,
        rentalComps: rentalComps,
        source: 'redfin_for_rent'
      };
    }
  };
}

/**
 * Fetch property search results (for-sale)
 * @param {string} city - City name
 * @param {string} state - State code
 * @param {Object} filters - Search filters
 * @returns {Object} { error: boolean, properties?: Array, message?: string }
 */
function fetchRedfinPropertySearch(city, state, filters) {
  // Validate input
  if (!city || !state) {
    return { error: true, message: 'City and state are required for property search' };
  }

  // Default filters
  const searchFilters = {
    beds_min: filters.beds_min || null,
    beds_max: filters.beds_max || null,
    baths_min: filters.baths_min || null,
    baths_max: filters.baths_max || null,
    price_min: filters.price_min || null,
    price_max: filters.price_max || null,
    limit: filters.limit || 10
  };

  return {
    endpoint: 'PROPERTY_SEARCH',
    params: {
      city: city,
      state: state,
      beds_min: searchFilters.beds_min,
      beds_max: searchFilters.beds_max,
      baths_min: searchFilters.baths_min,
      baths_max: searchFilters.baths_max,
      price_min: searchFilters.price_min,
      price_max: searchFilters.price_max,
      limit: searchFilters.limit
    },
    parser: function(response) {
      const parsed = parseRedfinResponse(response, 'Property Search');
      if (parsed.error) return parsed;

      // Extract properties
      const results = parsed.data.properties || parsed.data.homes || [];
      const properties = results.map(function(prop) {
        return {
          address: prop.address || prop.streetAddress || 'Unknown',
          price: prop.price || prop.listPrice || 0,
          sqft: prop.sqft || prop.livingArea || 0,
          beds: prop.beds || prop.bedrooms || 0,
          baths: prop.baths || prop.bathrooms || 0,
          link: prop.url || prop.link || '',
          latitude: prop.latitude || prop.lat || null,
          longitude: prop.longitude || prop.lng || null,
          daysOnMarket: prop.daysOnMarket || prop.dom || null,
          dataSource: 'redfin_search'
        };
      });

      return {
        error: false,
        properties: properties,
        source: 'redfin_search'
      };
    }
  };
}

