/**
 * ===============================
 * LOCATION QUALITY CALCULATIONS
 * ===============================
 *
 * Location-based ARV adjustments and quality scoring
 * Platform-agnostic calculation functions
 *
 * @module shared-core/calculations/location
 */

/**
 * Phase 3.1: Calculate school premium based on school ratings
 * Premium structure:
 * - Average rating ≥8: +15% ARV premium
 * - Average rating ≥6: +5% ARV premium
 * - Average rating <6: No premium
 *
 * @param {Object} schoolData - School data from fetchSchools()
 * @param {Array} schoolData.schools - Array of school objects
 * @param {number} schoolData.avgRating - Average rating (0-10 scale)
 * @returns {Object} { premium: number, multiplier: number, rating: number, description: string }
 */
function calculateSchoolPremium(schoolData) {
  // Validate input
  if (!schoolData || typeof schoolData.avgRating !== 'number') {
    return {
      premium: 0,
      multiplier: 1.0,
      rating: 0,
      description: 'No school data available',
      grade: 'Unknown'
    };
  }

  const avgRating = schoolData.avgRating;
  let premium = 0;
  let grade = 'F';
  let description = '';

  // Calculate premium based on rating
  if (avgRating >= 8.0) {
    premium = 0.15; // 15% premium for excellent schools
    grade = 'A';
    description = `Excellent schools (avg rating: ${avgRating.toFixed(1)}/10) - Top-tier education`;
  } else if (avgRating >= 6.0) {
    premium = 0.05; // 5% premium for good schools
    grade = 'B';
    description = `Good schools (avg rating: ${avgRating.toFixed(1)}/10) - Above-average education`;
  } else if (avgRating >= 4.0) {
    premium = 0.0; // No premium for average schools
    grade = 'C';
    description = `Average schools (avg rating: ${avgRating.toFixed(1)}/10) - Standard education`;
  } else if (avgRating >= 2.0) {
    premium = -0.03; // Small discount for below-average schools
    grade = 'D';
    description = `Below-average schools (avg rating: ${avgRating.toFixed(1)}/10)`;
  } else if (avgRating > 0) {
    premium = -0.05; // Discount for poor schools
    grade = 'F';
    description = `Poor schools (avg rating: ${avgRating.toFixed(1)}/10)`;
  }

  return {
    premium: premium, // Decimal form (0.15 = 15%)
    multiplier: 1 + premium, // 1.15 for 15% premium
    rating: avgRating,
    grade: grade,
    description: description,
    schoolCount: schoolData.schools ? schoolData.schools.length : 0
  };
}

/**
 * Phase 3.2: Calculate walkability premium based on Walk/Transit/Bike scores
 * Premium structure:
 * - Walk score >70: +5% ARV premium (very walkable)
 * - Walk score 50-70: +2% ARV premium (somewhat walkable)
 * - Walk score <50: No premium
 *
 * @param {Object} scores - Scores from fetchWalkAndTransitScore()
 * @param {number} scores.walkScore - Walk score (0-100)
 * @param {number} scores.transitScore - Transit score (0-100)
 * @param {number} scores.bikeScore - Bike score (0-100)
 * @returns {Object} { premium: number, multiplier: number, walkScore: number, description: string }
 */
function calculateWalkabilityPremium(scores) {
  // Validate input
  if (!scores || typeof scores.walkScore !== 'number') {
    return {
      premium: 0,
      multiplier: 1.0,
      walkScore: 0,
      transitScore: 0,
      bikeScore: 0,
      description: 'No walkability data available',
      category: 'Unknown'
    };
  }

  const walkScore = scores.walkScore;
  const transitScore = scores.transitScore || 0;
  const bikeScore = scores.bikeScore || 0;

  let premium = 0;
  let category = '';
  let description = '';

  // Calculate premium based on walk score
  if (walkScore >= 90) {
    premium = 0.07; // 7% premium for Walker's Paradise
    category = "Walker's Paradise";
    description = 'Daily errands do not require a car';
  } else if (walkScore >= 70) {
    premium = 0.05; // 5% premium for Very Walkable
    category = 'Very Walkable';
    description = 'Most errands can be accomplished on foot';
  } else if (walkScore >= 50) {
    premium = 0.02; // 2% premium for Somewhat Walkable
    category = 'Somewhat Walkable';
    description = 'Some errands can be accomplished on foot';
  } else if (walkScore >= 25) {
    premium = 0.0; // No premium for Car-Dependent
    category = 'Car-Dependent';
    description = 'Most errands require a car';
  } else {
    premium = -0.02; // Small discount for Very Car-Dependent
    category = 'Very Car-Dependent';
    description = 'Almost all errands require a car';
  }

  // Bonus premium for high transit score (max +2%)
  if (transitScore >= 70) {
    premium += 0.02;
    description += ' • Excellent public transit';
  } else if (transitScore >= 50) {
    premium += 0.01;
    description += ' • Good public transit';
  }

  // Bonus premium for high bike score (max +1%)
  if (bikeScore >= 70) {
    premium += 0.01;
    description += ' • Very bikeable';
  }

  // Cap total walkability premium at 10%
  premium = Math.min(premium, 0.10);

  return {
    premium: premium, // Decimal form
    multiplier: 1 + premium,
    walkScore: walkScore,
    transitScore: transitScore,
    bikeScore: bikeScore,
    category: category,
    description: description
  };
}

/**
 * Phase 3.3: Assess environmental quality based on noise score
 * Adjustment structure:
 * - Noise score <40: +3% ARV premium (very quiet)
 * - Noise score 40-50: +1% ARV premium (quiet)
 * - Noise score 50-60: No adjustment (moderate)
 * - Noise score 60-70: -2% ARV discount (noisy)
 * - Noise score >70: -3% ARV discount (very noisy)
 *
 * @param {Object} noiseData - Noise data from fetchNoiseScore()
 * @param {number} noiseData.noiseScore - Noise score (0-100, higher is noisier)
 * @param {string} noiseData.noiseLevel - Classification (very_quiet, quiet, moderate, noisy, very_noisy)
 * @returns {Object} { adjustment: number, multiplier: number, noiseScore: number, description: string }
 */
function assessEnvironmentalQuality(noiseData) {
  // Validate input
  if (!noiseData || typeof noiseData.noiseScore !== 'number') {
    return {
      adjustment: 0,
      multiplier: 1.0,
      noiseScore: 50,
      noiseLevel: 'moderate',
      description: 'No noise data available',
      emoji: '➖'
    };
  }

  const noiseScore = noiseData.noiseScore;
  const noiseLevel = noiseData.noiseLevel || 'moderate';

  let adjustment = 0;
  let emoji = '➖';
  let description = '';

  // Calculate adjustment based on noise score
  if (noiseScore < 40) {
    adjustment = 0.03; // +3% premium for very quiet
    emoji = '🔇';
    description = 'Very quiet area - Peaceful residential setting';
  } else if (noiseScore < 50) {
    adjustment = 0.01; // +1% premium for quiet
    emoji = '🤫';
    description = 'Quiet area - Low noise levels';
  } else if (noiseScore < 60) {
    adjustment = 0.0; // No adjustment for moderate
    emoji = '➖';
    description = 'Moderate noise - Typical residential area';
  } else if (noiseScore < 70) {
    adjustment = -0.02; // -2% discount for noisy
    emoji = '📢';
    description = 'Noisy area - Higher than average noise levels';
  } else {
    adjustment = -0.03; // -3% discount for very noisy
    emoji = '🚨';
    description = 'Very noisy area - Significant noise pollution';
  }

  // Highlight specific noise factors if available
  if (noiseData.factors && noiseData.factors.length > 0) {
    const factors = noiseData.factors.join(', ');
    description += ` (${factors})`;
  }

  return {
    adjustment: adjustment, // Decimal form (0.03 = 3%)
    multiplier: 1 + adjustment,
    noiseScore: noiseScore,
    noiseLevel: noiseLevel,
    emoji: emoji,
    description: description,
    factors: noiseData.factors || []
  };
}

/**
 * Phase 3.4: Calculate location-adjusted ARV
 * Combines all location quality factors into final ARV adjustment
 *
 * @param {number} baseARV - Base ARV before location adjustments
 * @param {Object} locationFactors - All location quality factors
 * @param {Object} locationFactors.schools - School data (optional)
 * @param {Object} locationFactors.walkability - Walkability scores (optional)
 * @param {Object} locationFactors.environmental - Environmental quality (optional)
 * @returns {Object} { adjustedARV: number, baseARV: number, totalAdjustment: number, breakdown: Object }
 */
function calculateLocationAdjustedARV(baseARV, locationFactors = {}) {
  // Validate input
  if (!baseARV || baseARV <= 0) {
    return {
      error: true,
      message: 'Base ARV must be a positive number',
      adjustedARV: baseARV || 0,
      baseARV: baseARV || 0,
      totalAdjustment: 0,
      totalMultiplier: 1.0,
      breakdown: {}
    };
  }

  // Calculate individual premiums/adjustments
  const schoolResult = locationFactors.schools
    ? calculateSchoolPremium(locationFactors.schools)
    : { premium: 0, description: 'School data not available' };

  const walkabilityResult = locationFactors.walkability
    ? calculateWalkabilityPremium(locationFactors.walkability)
    : { premium: 0, description: 'Walkability data not available' };

  const environmentalResult = locationFactors.environmental
    ? assessEnvironmentalQuality(locationFactors.environmental)
    : { adjustment: 0, description: 'Environmental data not available' };

  // Calculate total adjustment (additive)
  const totalAdjustment = schoolResult.premium + walkabilityResult.premium + environmentalResult.adjustment;
  const totalMultiplier = 1 + totalAdjustment;

  // Calculate adjusted ARV
  const adjustedARV = baseARV * totalMultiplier;

  // Create detailed breakdown
  const breakdown = {
    schools: {
      premium: schoolResult.premium,
      multiplier: schoolResult.multiplier,
      dollarAmount: baseARV * schoolResult.premium,
      description: schoolResult.description,
      grade: schoolResult.grade,
      rating: schoolResult.rating
    },
    walkability: {
      premium: walkabilityResult.premium,
      multiplier: walkabilityResult.multiplier,
      dollarAmount: baseARV * walkabilityResult.premium,
      description: walkabilityResult.description,
      category: walkabilityResult.category,
      walkScore: walkabilityResult.walkScore
    },
    environmental: {
      adjustment: environmentalResult.adjustment,
      multiplier: environmentalResult.multiplier,
      dollarAmount: baseARV * environmentalResult.adjustment,
      description: environmentalResult.description,
      noiseLevel: environmentalResult.noiseLevel,
      emoji: environmentalResult.emoji
    }
  };

  return {
    error: false,
    adjustedARV: Math.round(adjustedARV),
    baseARV: Math.round(baseARV),
    totalAdjustment: totalAdjustment,
    totalMultiplier: totalMultiplier,
    totalDollarAmount: Math.round(adjustedARV - baseARV),
    totalPercentage: (totalAdjustment * 100).toFixed(2) + '%',
    breakdown: breakdown,
    summary: `Location quality: ${totalAdjustment >= 0 ? '+' : ''}${(totalAdjustment * 100).toFixed(1)}% (${totalAdjustment >= 0 ? '+' : ''}$${Math.abs(Math.round(adjustedARV - baseARV)).toLocaleString()})`
  };
}

/**
 * Format location quality summary for display
 * @param {Object} locationAdjustment - Result from calculateLocationAdjustedARV()
 * @returns {Object} Formatted summary for UI display
 */
function formatLocationQualitySummary(locationAdjustment) {
  if (locationAdjustment.error) {
    return {
      title: 'Location Quality Analysis',
      subtitle: 'Unable to assess location quality',
      adjustedARV: locationAdjustment.adjustedARV || 0,
      factors: []
    };
  }

  const factors = [];

  // Add school factor
  if (locationAdjustment.breakdown.schools.premium !== 0) {
    factors.push({
      name: 'Schools',
      icon: '🎓',
      impact: locationAdjustment.breakdown.schools.premium,
      impactFormatted: `${locationAdjustment.breakdown.schools.premium >= 0 ? '+' : ''}${(locationAdjustment.breakdown.schools.premium * 100).toFixed(1)}%`,
      dollarAmount: locationAdjustment.breakdown.schools.dollarAmount,
      description: locationAdjustment.breakdown.schools.description,
      grade: locationAdjustment.breakdown.schools.grade
    });
  }

  // Add walkability factor
  if (locationAdjustment.breakdown.walkability.premium !== 0) {
    factors.push({
      name: 'Walkability',
      icon: '🚶',
      impact: locationAdjustment.breakdown.walkability.premium,
      impactFormatted: `${locationAdjustment.breakdown.walkability.premium >= 0 ? '+' : ''}${(locationAdjustment.breakdown.walkability.premium * 100).toFixed(1)}%`,
      dollarAmount: locationAdjustment.breakdown.walkability.dollarAmount,
      description: locationAdjustment.breakdown.walkability.description,
      score: locationAdjustment.breakdown.walkability.walkScore
    });
  }

  // Add environmental factor
  if (locationAdjustment.breakdown.environmental.adjustment !== 0) {
    factors.push({
      name: 'Environmental',
      icon: locationAdjustment.breakdown.environmental.emoji,
      impact: locationAdjustment.breakdown.environmental.adjustment,
      impactFormatted: `${locationAdjustment.breakdown.environmental.adjustment >= 0 ? '+' : ''}${(locationAdjustment.breakdown.environmental.adjustment * 100).toFixed(1)}%`,
      dollarAmount: locationAdjustment.breakdown.environmental.dollarAmount,
      description: locationAdjustment.breakdown.environmental.description,
      noiseLevel: locationAdjustment.breakdown.environmental.noiseLevel
    });
  }

  return {
    title: 'Location Quality Analysis',
    subtitle: locationAdjustment.summary,
    baseARV: locationAdjustment.baseARV,
    adjustedARV: locationAdjustment.adjustedARV,
    totalAdjustment: locationAdjustment.totalAdjustment,
    totalPercentage: locationAdjustment.totalPercentage,
    totalDollarAmount: locationAdjustment.totalDollarAmount,
    factors: factors
  };
}

