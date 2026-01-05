/**
 * Deal Quality Scoring System
 * Calculates comprehensive scores for investment properties
 * Phase 4: Dashboard & UX Improvements
 */

// ============================================================================
// SCORING WEIGHTS
// ============================================================================

const SCORING_WEIGHTS = {
  // Flip scoring weights
  FLIP: {
    ROI: 0.40,           // 40% - Return on Investment
    PROFIT: 0.30,        // 30% - Total profit amount
    TIMELINE: 0.15,      // 15% - Project timeline
    RISK: 0.15           // 15% - Risk factors
  },

  // Rental scoring weights
  RENTAL: {
    CASH_FLOW: 0.25,     // 25% - Monthly cash flow
    ROI: 0.25,           // 25% - Return on Investment
    CAP_RATE: 0.20,      // 20% - Capitalization rate
    DSCR: 0.15,          // 15% - Debt Service Coverage Ratio
    MARKET: 0.15         // 15% - Market comparison
  }
};

// ============================================================================
// SCORING THRESHOLDS
// ============================================================================

const THRESHOLDS = {
  FLIP: {
    ROI: {
      EXCELLENT: 0.30,   // 30%+ ROI
      GOOD: 0.20,        // 20-30% ROI
      FAIR: 0.15,        // 15-20% ROI
      POOR: 0.10         // 10-15% ROI
    },
    PROFIT: {
      EXCELLENT: 50000,  // $50k+ profit
      GOOD: 30000,       // $30-50k profit
      FAIR: 20000,       // $20-30k profit
      POOR: 10000        // $10-20k profit
    },
    TIMELINE: {
      EXCELLENT: 3,      // 3 months or less
      GOOD: 6,           // 3-6 months
      FAIR: 9,           // 6-9 months
      POOR: 12           // 9-12 months
    }
  },

  RENTAL: {
    CASH_FLOW: {
      EXCELLENT: 500,    // $500+/month
      GOOD: 300,         // $300-500/month
      FAIR: 100,         // $100-300/month
      POOR: 0            // $0-100/month
    },
    ROI: {
      EXCELLENT: 0.15,   // 15%+ ROI
      GOOD: 0.12,        // 12-15% ROI
      FAIR: 0.08,        // 8-12% ROI
      POOR: 0.05         // 5-8% ROI
    },
    CAP_RATE: {
      EXCELLENT: 0.10,   // 10%+ cap rate
      GOOD: 0.08,        // 8-10% cap rate
      FAIR: 0.06,        // 6-8% cap rate
      POOR: 0.04         // 4-6% cap rate
    },
    DSCR: {
      EXCELLENT: 1.5,    // 1.5+ DSCR
      GOOD: 1.25,        // 1.25-1.5 DSCR
      FAIR: 1.1,         // 1.1-1.25 DSCR
      POOR: 1.0          // 1.0-1.1 DSCR
    }
  }
};

// ============================================================================
// SCORING FUNCTIONS
// ============================================================================

/**
 * Calculate score for a metric based on thresholds
 * @param {number} value - The metric value
 * @param {Object} thresholds - Threshold object with EXCELLENT, GOOD, FAIR, POOR
 * @param {boolean} higherIsBetter - If true, higher values score better
 * @returns {number} - Score from 0-100
 */
function scoreMetric(value, thresholds, higherIsBetter = true) {
  if (value === null || value === undefined) return 0;

  const { EXCELLENT, GOOD, FAIR, POOR } = thresholds;

  if (higherIsBetter) {
    if (value >= EXCELLENT) return 100;
    if (value >= GOOD) return 75 + ((value - GOOD) / (EXCELLENT - GOOD)) * 25;
    if (value >= FAIR) return 50 + ((value - FAIR) / (GOOD - FAIR)) * 25;
    if (value >= POOR) return 25 + ((value - POOR) / (FAIR - POOR)) * 25;
    return Math.max(0, (value / POOR) * 25);
  } else {
    // Lower is better (e.g., timeline)
    if (value <= EXCELLENT) return 100;
    if (value <= GOOD) return 75 + ((GOOD - value) / (GOOD - EXCELLENT)) * 25;
    if (value <= FAIR) return 50 + ((FAIR - value) / (FAIR - GOOD)) * 25;
    if (value <= POOR) return 25 + ((POOR - value) / (POOR - FAIR)) * 25;
    return Math.max(0, 25 - ((value - POOR) / POOR) * 25);
  }
}

/**
 * Calculate flip deal quality score
 * @param {Object} flipData - Flip analysis data
 * @returns {Object} - Score breakdown and total
 */
function calculateFlipScore(flipData) {
  const {
    roi = 0,
    totalProfit = 0,
    timelineMonths = 6,
    rehabCost = 0,
    purchasePrice = 0
  } = flipData;

  // Calculate individual scores
  const roiScore = scoreMetric(roi, THRESHOLDS.FLIP.ROI, true);
  const profitScore = scoreMetric(totalProfit, THRESHOLDS.FLIP.PROFIT, true);
  const timelineScore = scoreMetric(timelineMonths, THRESHOLDS.FLIP.TIMELINE, false);

  // Risk score based on rehab cost as % of purchase price
  const rehabRatio = purchasePrice > 0 ? rehabCost / purchasePrice : 0;
  let riskScore = 100;
  if (rehabRatio > 0.50) riskScore = 25;      // >50% rehab = high risk
  else if (rehabRatio > 0.30) riskScore = 50; // 30-50% rehab = medium risk
  else if (rehabRatio > 0.15) riskScore = 75; // 15-30% rehab = low risk

  // Calculate weighted total
  const totalScore = Math.round(
    roiScore * SCORING_WEIGHTS.FLIP.ROI +
    profitScore * SCORING_WEIGHTS.FLIP.PROFIT +
    timelineScore * SCORING_WEIGHTS.FLIP.TIMELINE +
    riskScore * SCORING_WEIGHTS.FLIP.RISK
  );

  return {
    total: totalScore,
    breakdown: {
      roi: Math.round(roiScore),
      profit: Math.round(profitScore),
      timeline: Math.round(timelineScore),
      risk: Math.round(riskScore)
    },
    weights: SCORING_WEIGHTS.FLIP
  };
}

/**
 * Calculate rental deal quality score
 * @param {Object} rentalData - Rental analysis data
 * @param {Object} marketData - Market comparison data (optional)
 * @returns {Object} - Score breakdown and total
 */
function calculateRentalScore(rentalData, marketData = null) {
  const {
    monthlyCashFlow = 0,
    roi = 0,
    capRate = 0,
    dscr = 0
  } = rentalData;

  // Calculate individual scores
  const cashFlowScore = scoreMetric(monthlyCashFlow, THRESHOLDS.RENTAL.CASH_FLOW, true);
  const roiScore = scoreMetric(roi, THRESHOLDS.RENTAL.ROI, true);
  const capRateScore = scoreMetric(capRate, THRESHOLDS.RENTAL.CAP_RATE, true);
  const dscrScore = scoreMetric(dscr, THRESHOLDS.RENTAL.DSCR, true);

  // Market comparison score
  let marketScore = 50; // Default neutral score
  if (marketData && marketData.avgRoi) {
    const comparison = roi / marketData.avgRoi;
    if (comparison >= 1.2) marketScore = 100;      // 20%+ above market
    else if (comparison >= 1.1) marketScore = 80;  // 10-20% above market
    else if (comparison >= 0.9) marketScore = 60;  // Within 10% of market
    else if (comparison >= 0.8) marketScore = 40;  // 10-20% below market
    else marketScore = 20;                         // 20%+ below market
  }

  // Calculate weighted total
  const totalScore = Math.round(
    cashFlowScore * SCORING_WEIGHTS.RENTAL.CASH_FLOW +
    roiScore * SCORING_WEIGHTS.RENTAL.ROI +
    capRateScore * SCORING_WEIGHTS.RENTAL.CAP_RATE +
    dscrScore * SCORING_WEIGHTS.RENTAL.DSCR +
    marketScore * SCORING_WEIGHTS.RENTAL.MARKET
  );

  return {
    total: totalScore,
    breakdown: {
      cashFlow: Math.round(cashFlowScore),
      roi: Math.round(roiScore),
      capRate: Math.round(capRateScore),
      dscr: Math.round(dscrScore),
      market: Math.round(marketScore)
    },
    weights: SCORING_WEIGHTS.RENTAL
  };
}

/**
 * Get deal recommendation based on score
 * @param {number} score - The total score (0-100)
 * @returns {Object} - Recommendation with label, emoji, and description
 */
function getDealRecommendation(score) {
  if (score >= 80) {
    return {
      label: 'Excellent Investment',
      emoji: '✅',
      color: '#34a853',
      description: 'Strong metrics across all categories. Highly recommended.'
    };
  } else if (score >= 60) {
    return {
      label: 'Good Investment',
      emoji: '✅',
      color: '#34a853',
      description: 'Solid opportunity with good potential returns.'
    };
  } else if (score >= 40) {
    return {
      label: 'Proceed with Caution',
      emoji: '⚠️',
      color: '#fbbc04',
      description: 'Mixed results. Review carefully before proceeding.'
    };
  } else if (score >= 20) {
    return {
      label: 'High Risk',
      emoji: '⚠️',
      color: '#ea4335',
      description: 'Below-average metrics. Significant risks identified.'
    };
  } else {
    return {
      label: 'Not Recommended',
      emoji: '❌',
      color: '#ea4335',
      description: 'Poor metrics. Not recommended for investment.'
    };
  }
}

/**
 * Get star rating based on score
 * @param {number} score - The total score (0-100)
 * @returns {string} - Star rating (e.g., "⭐⭐⭐⭐⭐")
 */
function getStarRating(score) {
  const stars = Math.round(score / 20); // Convert 0-100 to 0-5 stars
  return '⭐'.repeat(Math.max(0, Math.min(5, stars)));
}

/**
 * Generate detailed score report
 * @param {Object} scoreData - Score data from calculateFlipScore or calculateRentalScore
 * @param {string} type - 'flip' or 'rental'
 * @returns {Object} - Detailed report with insights
 */
function generateScoreReport(scoreData, type) {
  const { total, breakdown, weights } = scoreData;
  const recommendation = getDealRecommendation(total);
  const stars = getStarRating(total);

  // Identify strengths and weaknesses
  const strengths = [];
  const weaknesses = [];

  Object.keys(breakdown).forEach(key => {
    const score = breakdown[key];
    const weight = weights[key.toUpperCase()] || 0;
    const importance = weight >= 0.20 ? 'high' : weight >= 0.10 ? 'medium' : 'low';

    if (score >= 75) {
      strengths.push({ metric: key, score, importance });
    } else if (score < 50) {
      weaknesses.push({ metric: key, score, importance });
    }
  });

  // Sort by importance
  strengths.sort((a, b) => {
    const importanceOrder = { high: 3, medium: 2, low: 1 };
    return importanceOrder[b.importance] - importanceOrder[a.importance];
  });
  weaknesses.sort((a, b) => {
    const importanceOrder = { high: 3, medium: 2, low: 1 };
    return importanceOrder[b.importance] - importanceOrder[a.importance];
  });

  return {
    score: total,
    rating: stars,
    recommendation,
    breakdown,
    strengths: strengths.slice(0, 3), // Top 3 strengths
    weaknesses: weaknesses.slice(0, 3), // Top 3 weaknesses
    type
  };
}

/**
 * Compare multiple properties
 * @param {Array} properties - Array of property score data
 * @returns {Object} - Comparison results with rankings
 */
function compareProperties(properties) {
  if (!properties || properties.length === 0) return null;

  // Sort by score
  const ranked = properties
    .map((prop, index) => ({
      ...prop,
      originalIndex: index
    }))
    .sort((a, b) => b.score.total - a.score.total);

  // Calculate statistics
  const scores = properties.map(p => p.score.total);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);

  return {
    ranked,
    statistics: {
      average: Math.round(avgScore),
      highest: maxScore,
      lowest: minScore,
      count: properties.length
    }
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof global !== 'undefined') {
  global.SCORING_WEIGHTS = SCORING_WEIGHTS;
  global.THRESHOLDS = THRESHOLDS;
  global.scoreMetric = scoreMetric;
  global.calculateFlipScore = calculateFlipScore;
  global.calculateRentalScore = calculateRentalScore;
  global.getDealRecommendation = getDealRecommendation;
  global.getStarRating = getStarRating;
  global.generateScoreReport = generateScoreReport;
  global.compareProperties = compareProperties;
}
