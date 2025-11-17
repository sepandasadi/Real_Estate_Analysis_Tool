/**
 * ===============================
 * US REAL ESTATE API FUNCTIONS
 * ===============================
 *
 * US Real Estate API integration functions (via RapidAPI)
 * Platform-agnostic - HTTP calls handled by platform adapters
 *
 * @module shared-core/api/usRealEstate
 */

/**
 * Parse US Real Estate API response and handle errors
 * @param {Object} response - Raw API response
 * @param {string} endpoint - Endpoint name for logging
 * @returns {Object} Parsed response or error object
 */
function parseUSRealEstateResponse(response, endpoint) {
  if (!response) {
    return { error: true, message: `No response from US Real Estate ${endpoint}` };
  }

  if (response.error) {
    return { error: true, message: response.message || 'US Real Estate API error' };
  }

  return { error: false, data: response };
}

/**
 * Phase 1.3: Fetch home estimate for ARV validation
 * @param {string} address - Street address
 * @param {string} city - City name
 * @param {string} state - State code
 * @param {string} zip - Zip code
 * @returns {Object} { error: boolean, value?: number, message?: string }
 */
function fetchUSRealEstateHomeEstimate(address, city, state, zip) {
  // Validate input
  if (!address || !city || !state || !zip) {
    return { error: true, message: 'Address, city, state, and zip are required for home estimate' };
  }

  return {
    endpoint: 'HOME_ESTIMATE',
    params: {
      address: address,
      city: city,
      state_code: state,
      zip_code: zip
    },
    parser: function(response) {
      const parsed = parseUSRealEstateResponse(response, 'Home Estimate');
      if (parsed.error) return parsed;

      // Extract home estimate value
      const estimate = parsed.data.estimate || parsed.data.estimatedValue || 0;

      return {
        error: false,
        value: estimate,
        source: 'us_real_estate_estimate',
        address: address,
        city: city,
        state: state,
        zip: zip
      };
    }
  };
}

/**
 * Phase 1.4: Fetch AI-matched similar homes
 * @param {string} address - Street address
 * @param {string} city - City name
 * @param {string} state - State code
 * @param {string} zip - Zip code
 * @returns {Object} { error: boolean, comps?: Array, message?: string }
 */
function fetchUSRealEstateSimilarHomes(address, city, state, zip) {
  // Validate input
  if (!address || !city || !state || !zip) {
    return { error: true, message: 'Address, city, state, and zip are required for similar homes' };
  }

  return {
    endpoint: 'SIMILAR_HOMES',
    params: {
      address: address,
      city: city,
      state_code: state,
      zip_code: zip
    },
    parser: function(response) {
      const parsed = parseUSRealEstateResponse(response, 'Similar Homes');
      if (parsed.error) return parsed;

      // Extract and normalize similar homes data
      const rawHomes = parsed.data.homes || parsed.data.properties || [];
      const comps = rawHomes.map(function(home) {
        return {
          address: home.address || home.location?.address?.line || 'Unknown',
          price: home.price || home.list_price || 0,
          sqft: home.sqft || home.description?.sqft || 0,
          beds: home.beds || home.description?.beds || 0,
          baths: home.baths || home.description?.baths || 0,
          saleDate: home.sold_date || home.list_date || '',
          distance: home.distance || 0,
          condition: home.condition || 'unknown',
          link: home.href || home.permalink || '',
          latitude: home.lat || home.location?.address?.coordinate?.lat || null,
          longitude: home.lon || home.location?.address?.coordinate?.lon || null,
          dataSource: 'us_real_estate_similar_homes',
          isReal: true,
          qualityScore: 100 // High quality - AI-matched
        };
      });

      return {
        error: false,
        comps: comps,
        source: 'us_real_estate_similar_homes',
        address: address
      };
    }
  };
}

/**
 * Phase 2.4: Fetch sold homes with advanced filters
 * @param {string} city - City name
 * @param {string} state - State code
 * @param {Object} filters - Search filters (beds, baths, sqft, sold_within_days)
 * @returns {Object} { error: boolean, comps?: Array, message?: string }
 */
function fetchUSRealEstateSoldHomes(city, state, filters) {
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
    limit: filters.limit || 10,
    sort: filters.sort || 'relevance'
  };

  return {
    endpoint: 'SOLD_HOMES',
    params: {
      city: city,
      state_code: state,
      beds_min: searchFilters.beds_min,
      beds_max: searchFilters.beds_max,
      baths_min: searchFilters.baths_min,
      baths_max: searchFilters.baths_max,
      sqft_min: searchFilters.sqft_min,
      sqft_max: searchFilters.sqft_max,
      sold_within_days: searchFilters.sold_within_days,
      limit: searchFilters.limit,
      sort: searchFilters.sort
    },
    parser: function(response) {
      const parsed = parseUSRealEstateResponse(response, 'Sold Homes');
      if (parsed.error) return parsed;

      // Extract and normalize sold homes
      const results = parsed.data.data?.home_search?.results || [];
      const comps = results.map(function(home) {
        return {
          address: home.location?.address?.line || 'Unknown',
          price: home.list_price || home.price || 0,
          sqft: home.description?.sqft || 0,
          beds: home.description?.beds || 0,
          baths: home.description?.baths || 0,
          saleDate: home.list_date || home.sold_date || '',
          distance: 0,
          condition: 'unknown',
          link: home.href || home.permalink || '',
          latitude: home.location?.address?.coordinate?.lat || null,
          longitude: home.location?.address?.coordinate?.lon || null,
          dataSource: 'us_real_estate_sold_homes',
          isReal: true,
          qualityScore: 85 // High quality - filtered search
        };
      });

      return {
        error: false,
        comps: comps,
        source: 'us_real_estate_sold_homes'
      };
    }
  };
}

/**
 * Phase 3.1: Fetch school quality data
 * @param {string} location - Location string (city, state or zip)
 * @returns {Object} { error: boolean, schools?: Array, message?: string }
 */
function fetchSchools(location) {
  // Validate input
  if (!location) {
    return { error: true, message: 'Location is required for schools' };
  }

  return {
    endpoint: 'SCHOOLS',
    params: { location: location },
    parser: function(response) {
      const parsed = parseUSRealEstateResponse(response, 'Schools');
      if (parsed.error) return parsed;

      // Extract school data
      const rawSchools = parsed.data.schools || [];
      const schools = rawSchools.map(function(school) {
        return {
          name: school.name || 'Unknown',
          rating: school.rating || 0,
          grades: school.grades || '',
          distance: school.distance || 0,
          type: school.type || 'public',
          students: school.students || 0
        };
      });

      return {
        error: false,
        schools: schools,
        source: 'us_real_estate_schools',
        location: location
      };
    }
  };
}

/**
 * Phase 3.3: Fetch noise score assessment
 * @param {string} location - Location string (city, state or zip)
 * @returns {Object} { error: boolean, noiseScore?: number, message?: string }
 */
function fetchNoiseScore(location) {
  // Validate input
  if (!location) {
    return { error: true, message: 'Location is required for noise score' };
  }

  return {
    endpoint: 'NOISE_SCORE',
    params: { location: location },
    parser: function(response) {
      const parsed = parseUSRealEstateResponse(response, 'Noise Score');
      if (parsed.error) return parsed;

      // Extract noise score
      const noiseScore = parsed.data.noiseScore || parsed.data.score || 50;

      return {
        error: false,
        noiseScore: noiseScore,
        source: 'us_real_estate_noise_score',
        location: location
      };
    }
  };
}

/**
 * Phase 3.5: Fetch rental comps
 * @param {string} city - City name
 * @param {string} state - State code
 * @param {Object} filters - Search filters (beds, baths, sqft)
 * @returns {Object} { error: boolean, rentalComps?: Array, message?: string }
 */
function fetchForRent(city, state, filters) {
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
      state_code: state,
      beds_min: searchFilters.beds_min,
      beds_max: searchFilters.beds_max,
      baths_min: searchFilters.baths_min,
      baths_max: searchFilters.baths_max,
      sqft_min: searchFilters.sqft_min,
      sqft_max: searchFilters.sqft_max,
      limit: searchFilters.limit
    },
    parser: function(response) {
      const parsed = parseUSRealEstateResponse(response, 'For Rent');
      if (parsed.error) return parsed;

      // Extract rental comps
      const results = parsed.data.data?.home_search?.results || [];
      const rentalComps = results.map(function(rental) {
        return {
          address: rental.location?.address?.line || 'Unknown',
          rent: rental.list_price || rental.price || 0,
          sqft: rental.description?.sqft || 0,
          beds: rental.description?.beds || 0,
          baths: rental.description?.baths || 0,
          link: rental.href || rental.permalink || '',
          dataSource: 'us_real_estate_for_rent'
        };
      });

      return {
        error: false,
        rentalComps: rentalComps,
        source: 'us_real_estate_for_rent'
      };
    }
  };
}

/**
 * Phase 3.5: Fetch rental comps by zip code
 * @param {string} zip - Zip code
 * @param {Object} filters - Search filters (beds, baths, sqft)
 * @returns {Object} { error: boolean, rentalComps?: Array, message?: string }
 */
function fetchForRentByZipcode(zip, filters) {
  // Validate input
  if (!zip) {
    return { error: true, message: 'Zip code is required for rental comps' };
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
    endpoint: 'FOR_RENT_BY_ZIPCODE',
    params: {
      zipcode: zip,
      beds_min: searchFilters.beds_min,
      beds_max: searchFilters.beds_max,
      baths_min: searchFilters.baths_min,
      baths_max: searchFilters.baths_max,
      sqft_min: searchFilters.sqft_min,
      sqft_max: searchFilters.sqft_max,
      limit: searchFilters.limit
    },
    parser: function(response) {
      const parsed = parseUSRealEstateResponse(response, 'For Rent By Zipcode');
      if (parsed.error) return parsed;

      // Extract rental comps
      const results = parsed.data.data?.home_search?.results || [];
      const rentalComps = results.map(function(rental) {
        return {
          address: rental.location?.address?.line || 'Unknown',
          rent: rental.list_price || rental.price || 0,
          sqft: rental.description?.sqft || 0,
          beds: rental.description?.beds || 0,
          baths: rental.description?.baths || 0,
          link: rental.href || rental.permalink || '',
          dataSource: 'us_real_estate_for_rent_zipcode'
        };
      });

      return {
        error: false,
        rentalComps: rentalComps,
        source: 'us_real_estate_for_rent_zipcode',
        zip: zip
      };
    }
  };
}

/**
 * Phase 3.6: Fetch average mortgage rate
 * @returns {Object} { error: boolean, rate?: number, message?: string }
 */
function fetchAverageRate() {
  return {
    endpoint: 'AVERAGE_RATE',
    params: {},
    parser: function(response) {
      const parsed = parseUSRealEstateResponse(response, 'Average Rate');
      if (parsed.error) return parsed;

      // Extract average rate
      const rate = parsed.data.rate || parsed.data.averageRate || 7.0;

      return {
        error: false,
        rate: rate,
        source: 'us_real_estate_average_rate'
      };
    }
  };
}

/**
 * Phase 3.6: Fetch mortgage rate trends
 * @returns {Object} { error: boolean, trends?: Object, message?: string }
 */
function fetchRateTrends() {
  return {
    endpoint: 'RATE_TRENDS',
    params: {},
    parser: function(response) {
      const parsed = parseUSRealEstateResponse(response, 'Rate Trends');
      if (parsed.error) return parsed;

      // Extract rate trends
      const data = parsed.data;
      return {
        error: false,
        trends: {
          currentRate: data.currentRate || 7.0,
          weekAgo: data.weekAgo || 7.0,
          monthAgo: data.monthAgo || 7.0,
          yearAgo: data.yearAgo || 7.0,
          trend: data.trend || 'stable'
        },
        source: 'us_real_estate_rate_trends'
      };
    }
  };
}

/**
 * Phase 3.6: Calculate mortgage payment
 * @param {number} loanAmount - Loan amount
 * @param {number} interestRate - Annual interest rate (percentage)
 * @param {number} loanTerm - Loan term in years
 * @returns {Object} { error: boolean, payment?: number, message?: string }
 */
function fetchMortgageCalculation(loanAmount, interestRate, loanTerm) {
  // Validate input
  if (!loanAmount || !interestRate || !loanTerm) {
    return { error: true, message: 'Loan amount, interest rate, and loan term are required' };
  }

  return {
    endpoint: 'MORTGAGE_CALCULATE',
    params: {
      loan_amount: loanAmount,
      interest_rate: interestRate,
      loan_term: loanTerm
    },
    parser: function(response) {
      const parsed = parseUSRealEstateResponse(response, 'Mortgage Calculate');
      if (parsed.error) return parsed;

      // Extract mortgage calculation
      const payment = parsed.data.monthlyPayment || parsed.data.payment || 0;

      return {
        error: false,
        payment: payment,
        source: 'us_real_estate_mortgage_calculate'
      };
    }
  };
}
