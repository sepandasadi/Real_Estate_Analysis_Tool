/**
 * Insights Generation System
 * Smart analysis and market comparisons for investment properties
 * Phase 4: Dashboard & UX Improvements
 */

// ============================================================================
// INSIGHT GENERATION
// ============================================================================

/**
 * Generate quick insights for a property
 * @param {Object} propertyData - Property analysis data
 * @param {Object} marketData - Market comparison data (optional)
 * @param {string} type - 'flip' or 'rental'
 * @returns {Array} - Array of insight strings
 */
function generateQuickInsights(propertyData, marketData, type) {
  const insights = [];

  if (type === 'flip') {
    insights.push(...generateFlipInsights(propertyData, marketData));
  } else if (type === 'rental') {
    insights.push(...generateRentalInsights(propertyData, marketData));
  }

  return insights;
}

/**
 * Generate insights for flip properties
 * @param {Object} flipData - Flip analysis data
 * @param {Object} marketData - Market comparison data
 * @returns {Array} - Array of insight strings
 */
function generateFlipInsights(flipData, marketData) {
  const insights = [];
  const { roi = 0, totalProfit = 0, timelineMonths = 6, rehabCost = 0, purchasePrice = 0 } = flipData;

  // ROI insight
  if (roi >= 0.30) {
    insights.push(`🎯 Exceptional ${(roi * 100).toFixed(0)}% ROI - well above the 20% target`);
  } else if (roi >= 0.20) {
    insights.push(`✓ Strong ${(roi * 100).toFixed(0)}% ROI meets investment criteria`);
  } else if (roi >= 0.15) {
    insights.push(`⚠️ ${(roi * 100).toFixed(0)}% ROI is acceptable but below optimal range`);
  } else {
    insights.push(`❌ ${(roi * 100).toFixed(0)}% ROI is below minimum 15% threshold`);
  }

  // Profit per month insight
  if (timelineMonths > 0) {
    const profitPerMonth = totalProfit / timelineMonths;
    if (profitPerMonth >= 5000) {
      insights.push(`💰 Earning $${profitPerMonth.toLocaleString()}/month - excellent velocity`);
    } else if (profitPerMonth >= 3000) {
      insights.push(`💵 Earning $${profitPerMonth.toLocaleString()}/month - good velocity`);
    } else {
      insights.push(`⏱️ Earning $${profitPerMonth.toLocaleString()}/month - consider faster timeline`);
    }
  }

  // Rehab ratio insight
  if (purchasePrice > 0) {
    const rehabRatio = rehabCost / purchasePrice;
    if (rehabRatio <= 0.15) {
      insights.push(`🏠 Light rehab (${(rehabRatio * 100).toFixed(0)}% of purchase) - lower risk`);
    } else if (rehabRatio <= 0.30) {
      insights.push(`🔨 Moderate rehab (${(rehabRatio * 100).toFixed(0)}% of purchase) - manageable scope`);
    } else if (rehabRatio <= 0.50) {
      insights.push(`⚠️ Heavy rehab (${(rehabRatio * 100).toFixed(0)}% of purchase) - higher risk`);
    } else {
      insights.push(`❌ Extensive rehab (${(rehabRatio * 100).toFixed(0)}% of purchase) - very high risk`);
    }
  }

  // Market comparison
  if (marketData && marketData.avgFlipROI) {
    const comparison = roi / marketData.avgFlipROI;
    if (comparison >= 1.2) {
      insights.push(`📈 ROI is ${((comparison - 1) * 100).toFixed(0)}% above market average`);
    } else if (comparison <= 0.8) {
      insights.push(`📉 ROI is ${((1 - comparison) * 100).toFixed(0)}% below market average`);
    }
  }

  return insights;
}

/**
 * Generate insights for rental properties
 * @param {Object} rentalData - Rental analysis data
 * @param {Object} marketData - Market comparison data
 * @returns {Array} - Array of insight strings
 */
function generateRentalInsights(rentalData, marketData) {
  const insights = [];
  const {
    monthlyCashFlow = 0,
    roi = 0,
    capRate = 0,
    dscr = 0,
    monthlyRent = 0,
    totalMonthlyExpenses = 0
  } = rentalData;

  // Cash flow insight
  if (monthlyCashFlow >= 500) {
    insights.push(`💰 Strong $${monthlyCashFlow.toFixed(0)}/month cash flow - excellent income`);
  } else if (monthlyCashFlow >= 300) {
    insights.push(`✓ Solid $${monthlyCashFlow.toFixed(0)}/month cash flow - good income`);
  } else if (monthlyCashFlow >= 100) {
    insights.push(`⚠️ Modest $${monthlyCashFlow.toFixed(0)}/month cash flow - minimal buffer`);
  } else if (monthlyCashFlow >= 0) {
    insights.push(`⚠️ Minimal $${monthlyCashFlow.toFixed(0)}/month cash flow - very tight margins`);
  } else {
    insights.push(`❌ Negative $${Math.abs(monthlyCashFlow).toFixed(0)}/month - losing money`);
  }

  // ROI insight
  if (roi >= 0.15) {
    insights.push(`🎯 Excellent ${(roi * 100).toFixed(1)}% ROI - well above 12% target`);
  } else if (roi >= 0.12) {
    insights.push(`✓ Strong ${(roi * 100).toFixed(1)}% ROI meets investment criteria`);
  } else if (roi >= 0.08) {
    insights.push(`⚠️ ${(roi * 100).toFixed(1)}% ROI is acceptable but below optimal`);
  } else {
    insights.push(`❌ ${(roi * 100).toFixed(1)}% ROI is below minimum 8% threshold`);
  }

  // Cap rate insight
  if (capRate >= 0.10) {
    insights.push(`📊 ${(capRate * 100).toFixed(1)}% cap rate - excellent value`);
  } else if (capRate >= 0.08) {
    insights.push(`✓ ${(capRate * 100).toFixed(1)}% cap rate - good value`);
  } else if (capRate >= 0.06) {
    insights.push(`⚠️ ${(capRate * 100).toFixed(1)}% cap rate - fair value`);
  } else {
    insights.push(`❌ ${(capRate * 100).toFixed(1)}% cap rate - may be overpriced`);
  }

  // DSCR insight
  if (dscr >= 1.5) {
    insights.push(`🏦 DSCR of ${dscr.toFixed(2)} - excellent financing qualification`);
  } else if (dscr >= 1.25) {
    insights.push(`✓ DSCR of ${dscr.toFixed(2)} - strong financing qualification`);
  } else if (dscr >= 1.0) {
    insights.push(`⚠️ DSCR of ${dscr.toFixed(2)} - marginal financing qualification`);
  } else {
    insights.push(`❌ DSCR of ${dscr.toFixed(2)} - may not qualify for financing`);
  }

  // Expense ratio insight
  if (monthlyRent > 0) {
    const expenseRatio = totalMonthlyExpenses / monthlyRent;
    if (expenseRatio <= 0.40) {
      insights.push(`✓ Operating expenses are ${(expenseRatio * 100).toFixed(0)}% of rent - efficient`);
    } else if (expenseRatio <= 0.50) {
      insights.push(`⚠️ Operating expenses are ${(expenseRatio * 100).toFixed(0)}% of rent - typical`);
    } else {
      insights.push(`❌ Operating expenses are ${(expenseRatio * 100).toFixed(0)}% of rent - high`);
    }
  }

  // Market comparison
  if (marketData) {
    if (marketData.avgRoi && roi > 0) {
      const comparison = roi / marketData.avgRoi;
      if (comparison >= 1.15) {
        insights.push(`📈 ROI is ${((comparison - 1) * 100).toFixed(0)}% above market average for this area`);
      } else if (comparison <= 0.85) {
        insights.push(`📉 ROI is ${((1 - comparison) * 100).toFixed(0)}% below market average for this area`);
      }
    }

    if (marketData.avgCapRate && capRate > 0) {
      const comparison = capRate / marketData.avgCapRate;
      if (comparison >= 1.15) {
        insights.push(`📈 Cap rate is ${((comparison - 1) * 100).toFixed(0)}% above market average`);
      } else if (comparison <= 0.85) {
        insights.push(`📉 Cap rate is ${((1 - comparison) * 100).toFixed(0)}% below market average`);
      }
    }
  }

  return insights;
}

/**
 * Calculate market percentile ranking
 * @param {number} value - Property value
 * @param {Array} marketValues - Array of market values
 * @returns {number} - Percentile (0-100)
 */
function calculatePercentile(value, marketValues) {
  if (!marketValues || marketValues.length === 0) return 50;

  const sorted = [...marketValues].sort((a, b) => a - b);
  const index = sorted.findIndex(v => v >= value);

  if (index === -1) return 100;
  if (index === 0) return 0;

  return Math.round((index / sorted.length) * 100);
}

/**
 * Generate market position insight
 * @param {Object} propertyData - Property data
 * @param {Object} marketData - Market data with arrays of values
 * @param {string} type - 'flip' or 'rental'
 * @returns {Object} - Market position analysis
 */
function generateMarketPosition(propertyData, marketData, type) {
  if (!marketData) {
    return {
      position: 'unknown',
      percentile: 50,
      insight: 'Market data not available for comparison'
    };
  }

  let percentile = 50;
  let metric = 'ROI';

  if (type === 'flip') {
    if (marketData.roiValues && propertyData.roi) {
      percentile = calculatePercentile(propertyData.roi, marketData.roiValues);
      metric = 'ROI';
    }
  } else if (type === 'rental') {
    if (marketData.roiValues && propertyData.roi) {
      percentile = calculatePercentile(propertyData.roi, marketData.roiValues);
      metric = 'ROI';
    }
  }

  let position = 'average';
  let insight = '';

  if (percentile >= 90) {
    position = 'top';
    insight = `📊 Top ${100 - percentile}% - ${metric} is in the top tier for this market`;
  } else if (percentile >= 75) {
    position = 'above-average';
    insight = `📊 Top ${100 - percentile}% - ${metric} is above average for this market`;
  } else if (percentile >= 50) {
    position = 'average';
    insight = `📊 ${metric} is around the market average (${percentile}th percentile)`;
  } else if (percentile >= 25) {
    position = 'below-average';
    insight = `📊 ${metric} is below average for this market (${percentile}th percentile)`;
  } else {
    position = 'bottom';
    insight = `📊 Bottom ${percentile}% - ${metric} is in the lower tier for this market`;
  }

  return {
    position,
    percentile,
    insight,
    metric
  };
}

/**
 * Generate investment recommendation
 * @param {Object} propertyData - Property data
 * @param {Object} scoreData - Score data from scoring.js
 * @param {Array} alerts - Alerts from alerts.js
 * @returns {Object} - Recommendation with reasoning
 */
function generateRecommendation(propertyData, scoreData, alerts) {
  const { total: score } = scoreData;
  const criticalAlerts = alerts.filter(a => a.type === 'ERROR').length;
  const warningAlerts = alerts.filter(a => a.type === 'WARNING').length;

  let recommendation = 'PROCEED';
  let confidence = 'MEDIUM';
  let reasoning = [];

  // Determine recommendation based on score and alerts
  if (score >= 80 && criticalAlerts === 0) {
    recommendation = 'STRONG_BUY';
    confidence = 'HIGH';
    reasoning.push('Excellent metrics across all categories');
    reasoning.push('No critical issues identified');
  } else if (score >= 60 && criticalAlerts === 0) {
    recommendation = 'BUY';
    confidence = warningAlerts === 0 ? 'HIGH' : 'MEDIUM';
    reasoning.push('Solid investment opportunity');
    if (warningAlerts > 0) {
      reasoning.push(`${warningAlerts} warning(s) to address`);
    }
  } else if (score >= 40 && criticalAlerts === 0) {
    recommendation = 'PROCEED_WITH_CAUTION';
    confidence = 'MEDIUM';
    reasoning.push('Mixed results - careful review needed');
    reasoning.push('Consider negotiating better terms');
  } else if (criticalAlerts > 0) {
    recommendation = 'DO_NOT_PROCEED';
    confidence = 'HIGH';
    reasoning.push(`${criticalAlerts} critical issue(s) identified`);
    reasoning.push('Significant risks present');
  } else {
    recommendation = 'PASS';
    confidence = 'MEDIUM';
    reasoning.push('Below minimum investment criteria');
    reasoning.push('Better opportunities likely available');
  }

  return {
    recommendation,
    confidence,
    reasoning,
    score
  };
}

/**
 * Generate improvement suggestions
 * @param {Object} propertyData - Property data
 * @param {string} type - 'flip' or 'rental'
 * @returns {Array} - Array of actionable suggestions
 */
function generateImprovementSuggestions(propertyData, type) {
  const suggestions = [];

  if (type === 'flip') {
    const { roi = 0, totalProfit = 0, rehabCost = 0, arv = 0, purchasePrice = 0 } = propertyData;

    if (roi < 0.20) {
      // Calculate what purchase price would give 20% ROI
      const targetROI = 0.20;
      const totalCosts = purchasePrice + rehabCost + (purchasePrice * 0.08); // 8% for closing/holding
      const targetPurchase = (arv * 0.94 - rehabCost - (purchasePrice * 0.08)) / 1.08;

      if (targetPurchase < purchasePrice) {
        suggestions.push({
          category: 'Purchase Price',
          current: purchasePrice,
          target: Math.round(targetPurchase),
          improvement: `Negotiate purchase price down to $${Math.round(targetPurchase).toLocaleString()} for 20% ROI`,
          impact: 'HIGH'
        });
      }

      // Or reduce rehab costs
      const targetRehab = arv * 0.94 - (purchasePrice * 1.08) - (purchasePrice * 0.08);
      if (targetRehab < rehabCost && targetRehab > 0) {
        suggestions.push({
          category: 'Rehab Cost',
          current: rehabCost,
          target: Math.round(targetRehab),
          improvement: `Reduce rehab costs to $${Math.round(targetRehab).toLocaleString()} for 20% ROI`,
          impact: 'HIGH'
        });
      }
    }
  } else if (type === 'rental') {
    const {
      monthlyCashFlow = 0,
      monthlyRent = 0,
      totalMonthlyExpenses = 0,
      roi = 0,
      purchasePrice = 0,
      totalCashInvested = 0
    } = propertyData;

    if (monthlyCashFlow < 200) {
      // Calculate rent needed for $200/month cash flow
      const targetCashFlow = 200;
      const targetRent = totalMonthlyExpenses + targetCashFlow;

      suggestions.push({
        category: 'Monthly Rent',
        current: monthlyRent,
        target: Math.round(targetRent),
        improvement: `Increase rent to $${Math.round(targetRent).toLocaleString()} for $200/month cash flow`,
        impact: 'HIGH'
      });
    }

    if (roi < 0.12) {
      // Calculate purchase price needed for 12% ROI
      const annualCashFlow = monthlyCashFlow * 12;
      const targetInvestment = annualCashFlow / 0.12;

      if (targetInvestment < totalCashInvested) {
        suggestions.push({
          category: 'Purchase Price',
          current: purchasePrice,
          target: Math.round(purchasePrice - (totalCashInvested - targetInvestment)),
          improvement: `Negotiate purchase price down for 12% ROI target`,
          impact: 'HIGH'
        });
      }
    }

    // Expense reduction suggestions
    if (totalMonthlyExpenses > monthlyRent * 0.45) {
      const targetExpenses = monthlyRent * 0.45;
      suggestions.push({
        category: 'Operating Expenses',
        current: totalMonthlyExpenses,
        target: Math.round(targetExpenses),
        improvement: `Reduce monthly expenses to $${Math.round(targetExpenses).toLocaleString()} (45% of rent)`,
        impact: 'MEDIUM'
      });
    }
  }

  return suggestions;
}

/**
 * Generate comprehensive insights report
 * @param {Object} propertyData - Property data
 * @param {Object} scoreData - Score data
 * @param {Array} alerts - Alerts array
 * @param {Object} marketData - Market data
 * @param {string} type - 'flip' or 'rental'
 * @returns {Object} - Complete insights report
 */
function generateInsightsReport(propertyData, scoreData, alerts, marketData, type) {
  return {
    quickInsights: generateQuickInsights(propertyData, marketData, type),
    marketPosition: generateMarketPosition(propertyData, marketData, type),
    recommendation: generateRecommendation(propertyData, scoreData, alerts),
    improvements: generateImprovementSuggestions(propertyData, type),
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof global !== 'undefined') {
  global.generateQuickInsights = generateQuickInsights;
  global.generateFlipInsights = generateFlipInsights;
  global.generateRentalInsights = generateRentalInsights;
  global.calculatePercentile = calculatePercentile;
  global.generateMarketPosition = generateMarketPosition;
  global.generateRecommendation = generateRecommendation;
  global.generateImprovementSuggestions = generateImprovementSuggestions;
  global.generateInsightsReport = generateInsightsReport;
}
