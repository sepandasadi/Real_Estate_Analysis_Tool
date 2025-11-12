/**
 * Alerts and Insights System
 * Automated detection and notification of important property conditions
 * Phase 4: Dashboard & UX Improvements
 */

// ============================================================================
// ALERT TYPES AND PRIORITIES
// ============================================================================

const ALERT_TYPES = {
  ERROR: 'ERROR',       // Critical issues that should prevent investment
  WARNING: 'WARNING',   // Caution flags that need attention
  INFO: 'INFO',         // Informational insights
  SUCCESS: 'SUCCESS'    // Positive indicators
};

const ALERT_PRIORITIES = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};

// ============================================================================
// ALERT THRESHOLDS (Customizable)
// ============================================================================

const DEFAULT_THRESHOLDS = {
  FLIP: {
    MIN_ROI: 0.15,              // 15% minimum ROI
    MIN_PROFIT: 15000,          // $15k minimum profit
    MAX_TIMELINE: 12,           // 12 months maximum
    MAX_REHAB_RATIO: 0.50,      // 50% max rehab as % of purchase
    BUDGET_VARIANCE: 0.10       // 10% budget variance tolerance
  },
  RENTAL: {
    MIN_CASH_FLOW: 100,         // $100/month minimum
    MIN_ROI: 0.08,              // 8% minimum ROI
    MIN_CAP_RATE: 0.06,         // 6% minimum cap rate
    MIN_DSCR: 1.0,              // 1.0 minimum DSCR
    MAX_VACANCY: 0.10           // 10% maximum vacancy rate
  }
};

// ============================================================================
// ALERT GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate alerts for flip analysis
 * @param {Object} flipData - Flip analysis data
 * @param {Object} customThresholds - Custom threshold overrides
 * @returns {Array} - Array of alert objects
 */
function generateFlipAlerts(flipData, customThresholds = {}) {
  const alerts = [];
  const thresholds = { ...DEFAULT_THRESHOLDS.FLIP, ...customThresholds };

  const {
    roi = 0,
    totalProfit = 0,
    timelineMonths = 6,
    rehabCost = 0,
    purchasePrice = 0,
    rehabBudget = 0,
    actualRehabCost = 0
  } = flipData;

  // Check ROI
  if (roi < thresholds.MIN_ROI) {
    const severity = roi < thresholds.MIN_ROI * 0.5 ? ALERT_TYPES.ERROR : ALERT_TYPES.WARNING;
    alerts.push({
      type: severity,
      priority: ALERT_PRIORITIES.HIGH,
      category: 'ROI',
      title: 'Low Return on Investment',
      message: `ROI of ${(roi * 100).toFixed(1)}% is below the ${(thresholds.MIN_ROI * 100).toFixed(0)}% threshold`,
      suggestion: 'Consider negotiating a lower purchase price or reducing rehab costs',
      icon: severity === ALERT_TYPES.ERROR ? '❌' : '⚠️'
    });
  } else if (roi >= 0.25) {
    alerts.push({
      type: ALERT_TYPES.SUCCESS,
      priority: ALERT_PRIORITIES.LOW,
      category: 'ROI',
      title: 'Excellent ROI',
      message: `ROI of ${(roi * 100).toFixed(1)}% exceeds expectations`,
      suggestion: 'Strong investment opportunity',
      icon: '✅'
    });
  }

  // Check profit
  if (totalProfit < thresholds.MIN_PROFIT) {
    alerts.push({
      type: ALERT_TYPES.WARNING,
      priority: ALERT_PRIORITIES.HIGH,
      category: 'Profit',
      title: 'Low Profit Margin',
      message: `Projected profit of $${totalProfit.toLocaleString()} is below $${thresholds.MIN_PROFIT.toLocaleString()} threshold`,
      suggestion: 'Verify ARV estimate and consider reducing costs',
      icon: '⚠️'
    });
  }

  // Check timeline
  if (timelineMonths > thresholds.MAX_TIMELINE) {
    alerts.push({
      type: ALERT_TYPES.WARNING,
      priority: ALERT_PRIORITIES.MEDIUM,
      category: 'Timeline',
      title: 'Extended Timeline',
      message: `Project timeline of ${timelineMonths} months exceeds ${thresholds.MAX_TIMELINE} month threshold`,
      suggestion: 'Long holding periods increase costs and risk',
      icon: '⚠️'
    });
  }

  // Check rehab ratio
  const rehabRatio = purchasePrice > 0 ? rehabCost / purchasePrice : 0;
  if (rehabRatio > thresholds.MAX_REHAB_RATIO) {
    alerts.push({
      type: ALERT_TYPES.WARNING,
      priority: ALERT_PRIORITIES.HIGH,
      category: 'Rehab',
      title: 'High Rehab Cost Ratio',
      message: `Rehab cost is ${(rehabRatio * 100).toFixed(0)}% of purchase price (max ${(thresholds.MAX_REHAB_RATIO * 100).toFixed(0)}%)`,
      suggestion: 'High rehab ratios increase risk. Verify scope and budget carefully',
      icon: '⚠️'
    });
  }

  // Check budget variance
  if (rehabBudget > 0 && actualRehabCost > 0) {
    const variance = (actualRehabCost - rehabBudget) / rehabBudget;
    if (variance > thresholds.BUDGET_VARIANCE) {
      alerts.push({
        type: ALERT_TYPES.ERROR,
        priority: ALERT_PRIORITIES.HIGH,
        category: 'Budget',
        title: 'Over Budget',
        message: `Actual rehab cost exceeds budget by ${(variance * 100).toFixed(1)}% ($${(actualRehabCost - rehabBudget).toLocaleString()})`,
        suggestion: 'Review scope changes and cost overruns immediately',
        icon: '❌'
      });
    }
  }

  return alerts;
}

/**
 * Generate alerts for rental analysis
 * @param {Object} rentalData - Rental analysis data
 * @param {Object} customThresholds - Custom threshold overrides
 * @returns {Array} - Array of alert objects
 */
function generateRentalAlerts(rentalData, customThresholds = {}) {
  const alerts = [];
  const thresholds = { ...DEFAULT_THRESHOLDS.RENTAL, ...customThresholds };

  const {
    monthlyCashFlow = 0,
    roi = 0,
    capRate = 0,
    dscr = 0,
    vacancyRate = 0.06,
    monthlyRent = 0,
    totalMonthlyExpenses = 0
  } = rentalData;

  // Check cash flow
  if (monthlyCashFlow < 0) {
    alerts.push({
      type: ALERT_TYPES.ERROR,
      priority: ALERT_PRIORITIES.HIGH,
      category: 'Cash Flow',
      title: 'Negative Cash Flow',
      message: `Monthly cash flow of -$${Math.abs(monthlyCashFlow).toFixed(2)} indicates property loses money each month`,
      suggestion: 'Increase rent, reduce expenses, or reconsider this investment',
      icon: '❌'
    });
  } else if (monthlyCashFlow < thresholds.MIN_CASH_FLOW) {
    alerts.push({
      type: ALERT_TYPES.WARNING,
      priority: ALERT_PRIORITIES.HIGH,
      category: 'Cash Flow',
      title: 'Low Cash Flow',
      message: `Monthly cash flow of $${monthlyCashFlow.toFixed(2)} is below $${thresholds.MIN_CASH_FLOW} threshold`,
      suggestion: 'Consider increasing rent or reducing operating expenses',
      icon: '⚠️'
    });
  } else if (monthlyCashFlow >= 500) {
    alerts.push({
      type: ALERT_TYPES.SUCCESS,
      priority: ALERT_PRIORITIES.LOW,
      category: 'Cash Flow',
      title: 'Strong Cash Flow',
      message: `Monthly cash flow of $${monthlyCashFlow.toFixed(2)} exceeds expectations`,
      suggestion: 'Excellent cash-flowing property',
      icon: '✅'
    });
  }

  // Check ROI
  if (roi < thresholds.MIN_ROI) {
    const severity = roi < thresholds.MIN_ROI * 0.5 ? ALERT_TYPES.ERROR : ALERT_TYPES.WARNING;
    alerts.push({
      type: severity,
      priority: ALERT_PRIORITIES.HIGH,
      category: 'ROI',
      title: 'Low Return on Investment',
      message: `ROI of ${(roi * 100).toFixed(1)}% is below the ${(thresholds.MIN_ROI * 100).toFixed(0)}% threshold`,
      suggestion: 'Consider negotiating a lower purchase price or increasing rent',
      icon: severity === ALERT_TYPES.ERROR ? '❌' : '⚠️'
    });
  }

  // Check cap rate
  if (capRate < thresholds.MIN_CAP_RATE) {
    alerts.push({
      type: ALERT_TYPES.WARNING,
      priority: ALERT_PRIORITIES.MEDIUM,
      category: 'Cap Rate',
      title: 'Low Capitalization Rate',
      message: `Cap rate of ${(capRate * 100).toFixed(1)}% is below ${(thresholds.MIN_CAP_RATE * 100).toFixed(0)}% threshold`,
      suggestion: 'Property may be overpriced relative to income potential',
      icon: '⚠️'
    });
  }

  // Check DSCR
  if (dscr < thresholds.MIN_DSCR) {
    alerts.push({
      type: ALERT_TYPES.ERROR,
      priority: ALERT_PRIORITIES.HIGH,
      category: 'DSCR',
      title: 'Low Debt Service Coverage',
      message: `DSCR of ${dscr.toFixed(2)} is below ${thresholds.MIN_DSCR.toFixed(1)} (may not qualify for financing)`,
      suggestion: 'Increase down payment, reduce purchase price, or increase rent',
      icon: '❌'
    });
  } else if (dscr >= 1.5) {
    alerts.push({
      type: ALERT_TYPES.SUCCESS,
      priority: ALERT_PRIORITIES.LOW,
      category: 'DSCR',
      title: 'Strong DSCR',
      message: `DSCR of ${dscr.toFixed(2)} indicates strong debt coverage`,
      suggestion: 'Excellent financing qualification potential',
      icon: '✅'
    });
  }

  // Check vacancy rate
  if (vacancyRate > thresholds.MAX_VACANCY) {
    alerts.push({
      type: ALERT_TYPES.WARNING,
      priority: ALERT_PRIORITIES.MEDIUM,
      category: 'Vacancy',
      title: 'High Vacancy Rate',
      message: `Vacancy rate of ${(vacancyRate * 100).toFixed(0)}% exceeds ${(thresholds.MAX_VACANCY * 100).toFixed(0)}% threshold`,
      suggestion: 'High vacancy reduces effective income. Verify market conditions',
      icon: '⚠️'
    });
  }

  // Check expense ratio
  if (monthlyRent > 0) {
    const expenseRatio = totalMonthlyExpenses / monthlyRent;
    if (expenseRatio > 0.50) {
      alerts.push({
        type: ALERT_TYPES.WARNING,
        priority: ALERT_PRIORITIES.MEDIUM,
        category: 'Expenses',
        title: 'High Expense Ratio',
        message: `Operating expenses are ${(expenseRatio * 100).toFixed(0)}% of rent (typically should be <50%)`,
        suggestion: 'Review expenses for potential reductions',
        icon: '⚠️'
      });
    }
  }

  return alerts;
}

/**
 * Generate market comparison insights
 * @param {Object} propertyData - Property data
 * @param {Object} marketData - Market comparison data
 * @returns {Array} - Array of insight objects
 */
function generateMarketInsights(propertyData, marketData) {
  const insights = [];

  if (!marketData) return insights;

  const { roi = 0, capRate = 0, monthlyCashFlow = 0 } = propertyData;
  const { avgRoi = 0, avgCapRate = 0, avgCashFlow = 0, zipCode = '' } = marketData;

  // ROI comparison
  if (avgRoi > 0) {
    const roiDiff = ((roi - avgRoi) / avgRoi) * 100;
    if (Math.abs(roiDiff) > 5) {
      insights.push({
        type: roiDiff > 0 ? ALERT_TYPES.SUCCESS : ALERT_TYPES.INFO,
        priority: ALERT_PRIORITIES.LOW,
        category: 'Market',
        title: 'ROI vs Market Average',
        message: `ROI is ${Math.abs(roiDiff).toFixed(0)}% ${roiDiff > 0 ? 'above' : 'below'} market average for ${zipCode}`,
        suggestion: roiDiff > 0 ? 'Above-average returns for this market' : 'Below-average returns for this market',
        icon: roiDiff > 0 ? '📈' : '📉'
      });
    }
  }

  // Cap rate comparison
  if (avgCapRate > 0) {
    const capDiff = ((capRate - avgCapRate) / avgCapRate) * 100;
    if (Math.abs(capDiff) > 10) {
      insights.push({
        type: ALERT_TYPES.INFO,
        priority: ALERT_PRIORITIES.LOW,
        category: 'Market',
        title: 'Cap Rate vs Market',
        message: `Cap rate is ${Math.abs(capDiff).toFixed(0)}% ${capDiff > 0 ? 'above' : 'below'} market average`,
        suggestion: capDiff > 0 ? 'Higher than typical for this area' : 'Lower than typical for this area',
        icon: 'ℹ️'
      });
    }
  }

  return insights;
}

/**
 * Sort alerts by priority and type
 * @param {Array} alerts - Array of alert objects
 * @returns {Array} - Sorted alerts
 */
function sortAlerts(alerts) {
  const typeOrder = {
    [ALERT_TYPES.ERROR]: 4,
    [ALERT_TYPES.WARNING]: 3,
    [ALERT_TYPES.INFO]: 2,
    [ALERT_TYPES.SUCCESS]: 1
  };

  return alerts.sort((a, b) => {
    // First sort by priority
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    // Then by type
    return typeOrder[b.type] - typeOrder[a.type];
  });
}

/**
 * Filter alerts by type
 * @param {Array} alerts - Array of alert objects
 * @param {string|Array} types - Alert type(s) to filter
 * @returns {Array} - Filtered alerts
 */
function filterAlertsByType(alerts, types) {
  const typeArray = Array.isArray(types) ? types : [types];
  return alerts.filter(alert => typeArray.includes(alert.type));
}

/**
 * Get alert summary statistics
 * @param {Array} alerts - Array of alert objects
 * @returns {Object} - Summary statistics
 */
function getAlertSummary(alerts) {
  return {
    total: alerts.length,
    errors: alerts.filter(a => a.type === ALERT_TYPES.ERROR).length,
    warnings: alerts.filter(a => a.type === ALERT_TYPES.WARNING).length,
    info: alerts.filter(a => a.type === ALERT_TYPES.INFO).length,
    success: alerts.filter(a => a.type === ALERT_TYPES.SUCCESS).length,
    highPriority: alerts.filter(a => a.priority === ALERT_PRIORITIES.HIGH).length
  };
}

/**
 * Format alert for display
 * @param {Object} alert - Alert object
 * @returns {string} - Formatted alert string
 */
function formatAlert(alert) {
  return `${alert.icon} ${alert.title}\n${alert.message}\n💡 ${alert.suggestion}`;
}

/**
 * Generate comprehensive alert report
 * @param {Object} propertyData - Property analysis data
 * @param {string} type - 'flip' or 'rental'
 * @param {Object} marketData - Market comparison data (optional)
 * @param {Object} customThresholds - Custom thresholds (optional)
 * @returns {Object} - Complete alert report
 */
function generateAlertReport(propertyData, type, marketData = null, customThresholds = {}) {
  let alerts = [];

  // Generate type-specific alerts
  if (type === 'flip') {
    alerts = generateFlipAlerts(propertyData, customThresholds);
  } else if (type === 'rental') {
    alerts = generateRentalAlerts(propertyData, customThresholds);
  }

  // Add market insights
  if (marketData) {
    const insights = generateMarketInsights(propertyData, marketData);
    alerts = alerts.concat(insights);
  }

  // Sort alerts
  alerts = sortAlerts(alerts);

  // Generate summary
  const summary = getAlertSummary(alerts);

  // Determine overall status
  let overallStatus = 'GOOD';
  if (summary.errors > 0) {
    overallStatus = 'CRITICAL';
  } else if (summary.warnings > 0) {
    overallStatus = 'CAUTION';
  } else if (summary.success > 0) {
    overallStatus = 'EXCELLENT';
  }

  return {
    alerts,
    summary,
    overallStatus,
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof global !== 'undefined') {
  global.ALERT_TYPES = ALERT_TYPES;
  global.ALERT_PRIORITIES = ALERT_PRIORITIES;
  global.DEFAULT_THRESHOLDS = DEFAULT_THRESHOLDS;
  global.generateFlipAlerts = generateFlipAlerts;
  global.generateRentalAlerts = generateRentalAlerts;
  global.generateMarketInsights = generateMarketInsights;
  global.sortAlerts = sortAlerts;
  global.filterAlertsByType = filterAlertsByType;
  global.getAlertSummary = getAlertSummary;
  global.formatAlert = formatAlert;
  global.generateAlertReport = generateAlertReport;
}
