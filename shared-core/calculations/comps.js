/**
 * ===============================
 * COMPS FILTERING & SCORING FUNCTIONS
 * ===============================
 *
 * Comparable properties filtering, scoring, and analysis
 * Platform-agnostic - pure calculation functions
 *
 * @module shared-core/calculations/comps
 */

/**
 * Filter comps by date (last N years)
 * @param {Array} comps - Array of comparable properties
 * @param {number} years - Number of years to look back (default: 2)
 * @returns {Array} Filtered comps
 */
function filterCompsByDate(comps, years) {
  // Validate input
  if (!comps || !Array.isArray(comps)) {
    return [];
  }

  const yearsBack = years || 2;
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - yearsBack);

  return comps.filter(function(comp) {
    if (!comp.saleDate) return false;

    try {
      const saleDate = new Date(comp.saleDate);
      return saleDate >= cutoffDate;
    } catch (e) {
      return false;
    }
  });
}

/**
 * Filter comps by similarity to target property
 * @param {Array} comps - Array of comparable properties
 * @param {Object} targetProperty - Target property details
 * @param {Object} criteria - Filtering criteria
 * @returns {Array} Filtered comps
 */
function filterCompsBySimilarity(comps, targetProperty, criteria) {
  // Validate input
  if (!comps || !Array.isArray(comps) || !targetProperty) {
    return [];
  }

  // Default criteria
  const sqftTolerance = criteria.sqftTolerance || 0.2; // ±20%
  const bedsTolerance = criteria.bedsTolerance || 1; // ±1 bed
  const bathsTolerance = criteria.bathsTolerance || 1; // ±1 bath

  return comps.filter(function(comp) {
    // Square footage match
    if (comp.sqft && targetProperty.sqft) {
      const sqftDiff = Math.abs(comp.sqft - targetProperty.sqft) / targetProperty.sqft;
      if (sqftDiff > sqftTolerance) return false;
    }

    // Bedrooms match
    if (comp.beds && targetProperty.beds) {
      const bedsDiff = Math.abs(comp.beds - targetProperty.beds);
      if (bedsDiff > bedsTolerance) return false;
    }

    // Bathrooms match
    if (comp.baths && targetProperty.baths) {
      const bathsDiff = Math.abs(comp.baths - targetProperty.baths);
      if (bathsDiff > bathsTolerance) return false;
    }

    return true;
  });
}

/**
 * Separate comps by condition (remodeled vs unremodeled)
 * @param {Array} comps - Array of comparable properties
 * @returns {Object} { remodeled: Array, unremodeled: Array, unknown: Array }
 */
function separateCompsByCondition(comps) {
  // Validate input
  if (!comps || !Array.isArray(comps)) {
    return { remodeled: [], unremodeled: [], unknown: [] };
  }

  const remodeled = [];
  const unremodeled = [];
  const unknown = [];

  comps.forEach(function(comp) {
    if (comp.condition === 'remodeled') {
      remodeled.push(comp);
    } else if (comp.condition === 'unremodeled') {
      unremodeled.push(comp);
    } else {
      unknown.push(comp);
    }
  });

  return {
    remodeled: remodeled,
    unremodeled: unremodeled,
    unknown: unknown
  };
}

/**
 * Calculate average price for comps
 * @param {Array} comps - Array of comparable properties
 * @returns {number} Average price
 */
function calculateAveragePrice(comps) {
  // Validate input
  if (!comps || !Array.isArray(comps) || comps.length === 0) {
    return 0;
  }

  const validComps = comps.filter(function(comp) {
    return comp.price && comp.price > 0;
  });

  if (validComps.length === 0) {
    return 0;
  }

  const total = validComps.reduce(function(sum, comp) {
    return sum + comp.price;
  }, 0);

  return total / validComps.length;
}

/**
 * Calculate price per square foot for comps
 * @param {Array} comps - Array of comparable properties
 * @returns {number} Average price per sqft
 */
function calculatePricePerSqft(comps) {
  // Validate input
  if (!comps || !Array.isArray(comps) || comps.length === 0) {
    return 0;
  }

  const validComps = comps.filter(function(comp) {
    return comp.price && comp.price > 0 && comp.sqft && comp.sqft > 0;
  });

  if (validComps.length === 0) {
    return 0;
  }

  const total = validComps.reduce(function(sum, comp) {
    return sum + (comp.price / comp.sqft);
  }, 0);

  return total / validComps.length;
}

/**
 * Phase 4.2: Enrich comp with quality score
 * @param {Object} comp - Comparable property
 * @param {Object} targetProperty - Target property for comparison
 * @returns {Object} Comp with quality score
 */
function enrichCompWithQualityScore(comp, targetProperty) {
  // Validate input
  if (!comp) {
    return comp;
  }

  let score = 0;

  // Data completeness (40 points)
  if (comp.address) score += 10;
  if (comp.price && comp.price > 0) score += 10;
  if (comp.sqft && comp.sqft > 0) score += 10;
  if (comp.saleDate) score += 10;

  // Recency (20 points)
  if (comp.saleDate) {
    try {
      const saleDate = new Date(comp.saleDate);
      const now = new Date();
      const monthsAgo = (now - saleDate) / (1000 * 60 * 60 * 24 * 30);

      if (monthsAgo <= 3) {
        score += 20; // Very recent
      } else if (monthsAgo <= 6) {
        score += 15; // Recent
      } else if (monthsAgo <= 12) {
        score += 10; // Somewhat recent
      } else if (monthsAgo <= 24) {
        score += 5; // Within 2 years
      }
    } catch (e) {
      // Invalid date, no points
    }
  }

  // Distance (20 points)
  if (comp.distance !== undefined && comp.distance !== null) {
    if (comp.distance <= 0.5) {
      score += 20; // Very close
    } else if (comp.distance <= 1) {
      score += 15; // Close
    } else if (comp.distance <= 2) {
      score += 10; // Nearby
    } else if (comp.distance <= 5) {
      score += 5; // Same area
    }
  }

  // Data source quality (20 points)
  if (comp.dataSource) {
    if (comp.dataSource.includes('property_comps') || comp.dataSource.includes('similar_homes')) {
      score += 20; // AI-matched comps
    } else if (comp.dataSource.includes('sold_homes')) {
      score += 15; // Filtered search
    } else if (comp.dataSource.includes('generic_search')) {
      score += 10; // Generic search
    } else if (comp.dataSource.includes('gemini') || comp.dataSource.includes('ai')) {
      score += 5; // AI-generated
    }
  }

  // Assign quality label
  let qualityLabel = 'Low';
  if (score >= 80) {
    qualityLabel = 'High';
  } else if (score >= 60) {
    qualityLabel = 'Medium';
  }

  return {
    ...comp,
    qualityScore: score,
    qualityLabel: qualityLabel
  };
}

/**
 * Sort comps by relevance
 * @param {Array} comps - Array of comparable properties
 * @param {Object} targetProperty - Target property for comparison
 * @returns {Array} Sorted comps (most relevant first)
 */
function sortCompsByRelevance(comps, targetProperty) {
  // Validate input
  if (!comps || !Array.isArray(comps)) {
    return [];
  }

  // Enrich all comps with quality scores
  const enrichedComps = comps.map(function(comp) {
    return enrichCompWithQualityScore(comp, targetProperty);
  });

  // Sort by quality score (descending)
  return enrichedComps.sort(function(a, b) {
    return (b.qualityScore || 0) - (a.qualityScore || 0);
  });
}

/**
 * Filter comps by quality threshold
 * @param {Array} comps - Array of comparable properties
 * @param {number} minScore - Minimum quality score (default: 60)
 * @returns {Array} Filtered comps
 */
function filterCompsByQuality(comps, minScore) {
  // Validate input
  if (!comps || !Array.isArray(comps)) {
    return [];
  }

  const threshold = minScore || 60;

  return comps.filter(function(comp) {
    return (comp.qualityScore || 0) >= threshold;
  });
}

/**
 * Calculate renovation premium from comps
 * @param {Array} remodeledComps - Remodeled comps
 * @param {Array} unremodeledComps - Unremodeled comps
 * @returns {Object} { premium: number, confidence: string }
 */
function calculateRenovationPremium(remodeledComps, unremodeledComps) {
  // Validate input
  if (!remodeledComps || !unremodeledComps || remodeledComps.length === 0 || unremodeledComps.length === 0) {
    return { premium: 0.25, confidence: 'low', source: 'default' }; // Default 25% premium
  }

  const avgRemodeled = calculateAveragePrice(remodeledComps);
  const avgUnremodeled = calculateAveragePrice(unremodeledComps);

  if (avgUnremodeled === 0) {
    return { premium: 0.25, confidence: 'low', source: 'default' };
  }

  const premium = (avgRemodeled - avgUnremodeled) / avgUnremodeled;

  // Cap premium at 25% for safety
  const cappedPremium = Math.min(premium, 0.25);

  // Determine confidence based on sample size
  let confidence = 'low';
  if (remodeledComps.length >= 3 && unremodeledComps.length >= 3) {
    confidence = 'high';
  } else if (remodeledComps.length >= 2 && unremodeledComps.length >= 2) {
    confidence = 'medium';
  }

  return {
    premium: cappedPremium,
    confidence: confidence,
    source: 'calculated',
    remodeledCount: remodeledComps.length,
    unremodeledCount: unremodeledComps.length,
    avgRemodeled: Math.round(avgRemodeled),
    avgUnremodeled: Math.round(avgUnremodeled)
  };
}

/**
 * Calculate ARV from comps using enhanced logic
 * @param {Array} comps - Array of comparable properties
 * @param {Object} targetProperty - Target property details
 * @returns {Object} { arv: number, method: string, confidence: string }
 */
function calculateARVFromComps(comps, targetProperty) {
  // Validate input
  if (!comps || !Array.isArray(comps) || comps.length === 0) {
    return {
      error: true,
      message: 'No comps available for ARV calculation'
    };
  }

  // Filter by date (last 2 years)
  const recentComps = filterCompsByDate(comps, 2);

  if (recentComps.length === 0) {
    return {
      error: true,
      message: 'No recent comps found (last 2 years)'
    };
  }

  // Filter by similarity
  const similarComps = filterCompsBySimilarity(recentComps, targetProperty, {
    sqftTolerance: 0.2,
    bedsTolerance: 1,
    bathsTolerance: 1
  });

  // Use similar comps if available, otherwise use all recent comps
  const compsToUse = similarComps.length >= 3 ? similarComps : recentComps;

  // Separate by condition
  const separated = separateCompsByCondition(compsToUse);
  const remodeledComps = separated.remodeled;
  const unremodeledComps = separated.unremodeled;

  let arv = 0;
  let method = '';
  let confidence = 'low';

  // Best case: 3+ remodeled comps
  if (remodeledComps.length >= 3) {
    arv = calculateAveragePrice(remodeledComps);
    method = `Average of ${remodeledComps.length} remodeled comps (0% premium)`;
    confidence = 'high';
  }
  // Mixed case: Calculate renovation premium
  else if (remodeledComps.length > 0 && unremodeledComps.length > 0) {
    const premiumData = calculateRenovationPremium(remodeledComps, unremodeledComps);
    arv = calculateAveragePrice(unremodeledComps) * (1 + premiumData.premium);
    method = `${remodeledComps.length} remodeled + ${unremodeledComps.length} unremodeled comps (${(premiumData.premium * 100).toFixed(1)}% premium, capped at 25%)`;
    confidence = premiumData.confidence;
  }
  // Only unremodeled comps: Apply 25% premium
  else if (unremodeledComps.length >= 3) {
    arv = calculateAveragePrice(unremodeledComps) * 1.25;
    method = `Average of ${unremodeledComps.length} unremodeled comps + 25% renovation premium`;
    confidence = 'medium';
  }
  // Fallback: Use all available comps + 20% premium
  else {
    arv = calculateAveragePrice(compsToUse) * 1.20;
    method = `Average of ${compsToUse.length} mixed comps + 20% premium`;
    confidence = 'low';
  }

  return {
    error: false,
    arv: Math.round(arv),
    method: method,
    confidence: confidence,
    compsUsed: compsToUse.length,
    remodeledCount: remodeledComps.length,
    unremodeledCount: unremodeledComps.length
  };
}

/**
 * Get comps statistics for display
 * @param {Array} comps - Array of comparable properties
 * @returns {Object} Statistics object
 */
function getCompsStatistics(comps) {
  // Validate input
  if (!comps || !Array.isArray(comps) || comps.length === 0) {
    return {
      count: 0,
      avgPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      avgPricePerSqft: 0,
      avgDaysOnMarket: 0
    };
  }

  const validComps = comps.filter(function(comp) {
    return comp.price && comp.price > 0;
  });

  if (validComps.length === 0) {
    return {
      count: 0,
      avgPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      avgPricePerSqft: 0,
      avgDaysOnMarket: 0
    };
  }

  const prices = validComps.map(function(comp) {
    return comp.price;
  });

  const avgPrice = calculateAveragePrice(validComps);
  const minPrice = Math.min.apply(null, prices);
  const maxPrice = Math.max.apply(null, prices);
  const avgPricePerSqft = calculatePricePerSqft(validComps);

  return {
    count: validComps.length,
    avgPrice: Math.round(avgPrice),
    minPrice: Math.round(minPrice),
    maxPrice: Math.round(maxPrice),
    avgPricePerSqft: Math.round(avgPricePerSqft),
    priceRange: Math.round(maxPrice - minPrice)
  };
}
