/**
 * ===============================
 * ARV CALCULATION FUNCTIONS
 * ===============================
 *
 * After Repair Value (ARV) calculation logic
 * Platform-agnostic - pure calculation functions
 *
 * @module shared-core/calculations/arv
 */

/**
 * Phase 1.5: Calculate enhanced ARV using weighted average of multiple sources
 * @param {Array} estimates - Array of estimate objects with value and weight
 * @param {Object} propertyData - Property information
 * @returns {Object} { error: boolean, arv?: number, sources?: Array, confidence?: number, message?: string }
 */
function calculateEnhancedARV(estimates, propertyData) {
  // Validate inputs
  if (!Array.isArray(estimates) || estimates.length === 0) {
    return { error: true, message: 'Estimates array is required and must not be empty' };
  }

  if (!propertyData) {
    return { error: true, message: 'Property data is required' };
  }

  // Filter out invalid estimates
  const validEstimates = estimates.filter(function(est) {
    return est && typeof est.value === 'number' && est.value > 0 && typeof est.weight === 'number' && est.weight > 0;
  });

  if (validEstimates.length === 0) {
    return { error: true, message: 'No valid estimates provided' };
  }

  // Normalize weights to sum to 1.0
  const totalWeight = validEstimates.reduce(function(sum, est) {
    return sum + est.weight;
  }, 0);

  const normalizedEstimates = validEstimates.map(function(est) {
    return {
      value: est.value,
      weight: est.weight / totalWeight,
      source: est.source || 'unknown'
    };
  });

  // Calculate weighted average ARV
  const weightedARV = normalizedEstimates.reduce(function(sum, est) {
    return sum + (est.value * est.weight);
  }, 0);

  // Calculate confidence score based on estimate variance
  const mean = weightedARV;
  const variance = normalizedEstimates.reduce(function(sum, est) {
    const diff = est.value - mean;
    return sum + (diff * diff * est.weight);
  }, 0);
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / mean;

  // Confidence: 100% if CV < 5%, decreasing to 50% at CV = 20%
  let confidence = 100;
  if (coefficientOfVariation > 0.05) {
    confidence = Math.max(50, 100 - ((coefficientOfVariation - 0.05) / 0.15) * 50);
  }

  return {
    error: false,
    arv: Math.round(weightedARV),
    sources: normalizedEstimates,
    confidence: Math.round(confidence),
    stdDev: Math.round(stdDev),
    methodology: 'Multi-source weighted average'
  };
}

/**
 * Phase 1.5: Calculate ARV confidence interval
 * @param {Array} estimates - Array of estimate values
 * @returns {Object} { error: boolean, conservative?: number, moderate?: number, aggressive?: number, message?: string }
 */
function calculateARVConfidenceInterval(estimates) {
  // Validate inputs
  if (!Array.isArray(estimates) || estimates.length === 0) {
    return { error: true, message: 'Estimates array is required' };
  }

  // Filter valid estimates
  const validEstimates = estimates.filter(function(est) {
    return typeof est === 'number' && est > 0;
  });

  if (validEstimates.length === 0) {
    return { error: true, message: 'No valid estimates provided' };
  }

  // Calculate mean and standard deviation
  const mean = validEstimates.reduce(function(sum, val) {
    return sum + val;
  }, 0) / validEstimates.length;

  const variance = validEstimates.reduce(function(sum, val) {
    const diff = val - mean;
    return sum + (diff * diff);
  }, 0) / validEstimates.length;

  const stdDev = Math.sqrt(variance);

  // Calculate confidence intervals (68% confidence = 1 std dev)
  const conservative = mean - stdDev; // Lower bound
  const moderate = mean; // Mean
  const aggressive = mean + stdDev; // Upper bound

  return {
    error: false,
    conservative: Math.round(conservative),
    moderate: Math.round(moderate),
    aggressive: Math.round(aggressive),
    stdDev: Math.round(stdDev),
    confidence: 68 // 68% confidence interval (1 standard deviation)
  };
}

/**
 * Phase 2.3: Validate ARV against market trends
 * @param {number} estimatedARV - Estimated ARV value
 * @param {Object} historicalData - Historical price data
 * @param {Object} marketTrends - Market trend data
 * @returns {Object} { error: boolean, isValid?: boolean, deviation?: number, warning?: string, message?: string }
 */
function validateARVAgainstMarketTrends(estimatedARV, historicalData, marketTrends) {
  // Validate inputs
  if (!estimatedARV || estimatedARV <= 0) {
    return { error: true, message: 'Valid estimated ARV is required' };
  }

  if (!historicalData || !marketTrends) {
    return { error: true, message: 'Historical data and market trends are required' };
  }

  // Calculate expected ARV based on historical appreciation
  const lastSalePrice = historicalData.lastSalePrice || 0;
  const lastSaleDate = historicalData.lastSaleDate || null;
  const appreciationRate = marketTrends.oneYearChange || 0;

  if (!lastSalePrice || !lastSaleDate) {
    return {
      error: false,
      isValid: true,
      deviation: 0,
      warning: 'Insufficient historical data for validation'
    };
  }

  // Calculate years since last sale
  const now = new Date();
  const saleDate = new Date(lastSaleDate);
  const yearsSinceSale = (now - saleDate) / (1000 * 60 * 60 * 24 * 365);

  // Calculate expected value based on appreciation
  const expectedARV = lastSalePrice * Math.pow(1 + appreciationRate / 100, yearsSinceSale);

  // Calculate deviation percentage
  const deviation = ((estimatedARV - expectedARV) / expectedARV) * 100;

  // Flag if deviation > 15%
  const isValid = Math.abs(deviation) <= 15;
  let warning = null;

  if (!isValid) {
    if (deviation > 15) {
      warning = `Estimated ARV is ${deviation.toFixed(1)}% higher than historical trend suggests. Verify comps and market conditions.`;
    } else {
      warning = `Estimated ARV is ${Math.abs(deviation).toFixed(1)}% lower than historical trend suggests. May be undervalued.`;
    }
  }

  return {
    error: false,
    isValid: isValid,
    deviation: Math.round(deviation * 10) / 10,
    expectedARV: Math.round(expectedARV),
    estimatedARV: Math.round(estimatedARV),
    warning: warning
  };
}

/**
 * Phase 3.4: Calculate location-adjusted ARV
 * @param {number} baseARV - Base ARV before location adjustments
 * @param {Object} locationFactors - Location quality factors
 * @returns {Object} { error: boolean, adjustedARV?: number, adjustments?: Object, message?: string }
 */
function calculateLocationAdjustedARV(baseARV, locationFactors) {
  // Validate inputs
  if (!baseARV || baseARV <= 0) {
    return { error: true, message: 'Valid base ARV is required' };
  }

  if (!locationFactors) {
    return { error: true, message: 'Location factors are required' };
  }

  // Calculate school premium (±15%)
  let schoolAdjustment = 0;
  if (locationFactors.schoolRating) {
    const avgRating = locationFactors.schoolRating;
    if (avgRating >= 8) {
      schoolAdjustment = 0.15; // +15% for excellent schools
    } else if (avgRating >= 6) {
      schoolAdjustment = 0.05; // +5% for good schools
    } else if (avgRating < 4) {
      schoolAdjustment = -0.05; // -5% for poor schools
    }
  }

  // Calculate walkability premium (±5%)
  let walkabilityAdjustment = 0;
  if (locationFactors.walkScore) {
    const walkScore = locationFactors.walkScore;
    if (walkScore > 70) {
      walkabilityAdjustment = 0.05; // +5% for highly walkable
    } else if (walkScore < 30) {
      walkabilityAdjustment = -0.03; // -3% for car-dependent
    }
  }

  // Calculate noise adjustment (±3%)
  let noiseAdjustment = 0;
  if (locationFactors.noiseScore) {
    const noiseScore = locationFactors.noiseScore;
    if (noiseScore < 50) {
      noiseAdjustment = 0.03; // +3% for quiet area
    } else if (noiseScore > 70) {
      noiseAdjustment = -0.03; // -3% for noisy area
    }
  }

  // Calculate total adjustment
  const totalAdjustment = schoolAdjustment + walkabilityAdjustment + noiseAdjustment;
  const adjustedARV = baseARV * (1 + totalAdjustment);

  return {
    error: false,
    baseARV: Math.round(baseARV),
    adjustedARV: Math.round(adjustedARV),
    totalAdjustment: Math.round(totalAdjustment * 100 * 10) / 10, // Percentage with 1 decimal
    adjustments: {
      school: Math.round(schoolAdjustment * 100 * 10) / 10,
      walkability: Math.round(walkabilityAdjustment * 100 * 10) / 10,
      noise: Math.round(noiseAdjustment * 100 * 10) / 10
    }
  };
}

/**
 * Calculate school premium based on average rating
 * @param {Array} schools - Array of school objects with ratings
 * @returns {Object} { premium: number, avgRating: number }
 */
function calculateSchoolPremium(schools) {
  // Validate input
  if (!schools || !Array.isArray(schools) || schools.length === 0) {
    return { premium: 0, avgRating: 0 };
  }

  // Calculate average rating
  const validSchools = schools.filter(function(s) {
    return s.rating && s.rating > 0;
  });

  if (validSchools.length === 0) {
    return { premium: 0, avgRating: 0 };
  }

  const avgRating = validSchools.reduce(function(sum, s) {
    return sum + s.rating;
  }, 0) / validSchools.length;

  // Calculate premium
  let premium = 0;
  if (avgRating >= 8) {
    premium = 0.15; // +15%
  } else if (avgRating >= 6) {
    premium = 0.05; // +5%
  } else if (avgRating < 4) {
    premium = -0.05; // -5%
  }

  return {
    premium: premium,
    avgRating: Math.round(avgRating * 10) / 10
  };
}

/**
 * Calculate walkability premium based on walk score
 * @param {Object} scores - Walk, transit, and bike scores
 * @returns {Object} { premium: number, walkScore: number }
 */
function calculateWalkabilityPremium(scores) {
  // Validate input
  if (!scores || !scores.walkScore) {
    return { premium: 0, walkScore: 0 };
  }

  const walkScore = scores.walkScore;

  // Calculate premium
  let premium = 0;
  if (walkScore > 70) {
    premium = 0.05; // +5% for highly walkable
  } else if (walkScore < 30) {
    premium = -0.03; // -3% for car-dependent
  }

  return {
    premium: premium,
    walkScore: walkScore
  };
}

/**
 * Assess environmental quality based on noise score
 * @param {number} noiseScore - Noise score (0-100, higher = noisier)
 * @returns {Object} { adjustment: number, noiseScore: number, quality: string }
 */
function assessEnvironmentalQuality(noiseScore) {
  // Validate input
  if (!noiseScore || noiseScore < 0) {
    return { adjustment: 0, noiseScore: 0, quality: 'unknown' };
  }

  // Calculate adjustment
  let adjustment = 0;
  let quality = 'moderate';

  if (noiseScore < 50) {
    adjustment = 0.03; // +3% for quiet
    quality = 'quiet';
  } else if (noiseScore > 70) {
    adjustment = -0.03; // -3% for noisy
    quality = 'noisy';
  }

  return {
    adjustment: adjustment,
    noiseScore: noiseScore,
    quality: quality
  };
}
