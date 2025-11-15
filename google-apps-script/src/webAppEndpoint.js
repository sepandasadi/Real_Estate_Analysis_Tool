/**
 * Google Apps Script Web App Endpoint
 * Provides REST API for PWA frontend
 *
 * Deployment Instructions:
 * 1. In Apps Script Editor: Deploy > New deployment
 * 2. Type: Web app
 * 3. Execute as: Me
 * 4. Who has access: Anyone
 * 5. Copy the Web App URL for frontend integration
 */

/**
 * Handle GET requests (health check)
 */
function doGet(e) {
  const response = {
    status: 'ok',
    message: 'Real Estate Analysis Tool API',
    version: '3.0',
    timestamp: new Date().toISOString()
  };

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST requests (API actions)
 */
function doPost(e) {
  try {
    // Parse request body
    const requestBody = JSON.parse(e.postData.contents);
    const action = requestBody.action;
    const data = requestBody.data;

    Logger.log(`API Request - Action: ${action}`);

    // Route to appropriate handler
    let result;
    switch (action) {
      case 'analyze':
        result = handleAnalyze(data);
        break;
      case 'fetchComps':
        result = handleFetchComps(data);
        break;
      case 'calculateFlip':
        result = handleCalculateFlip(data);
        break;
      case 'calculateRental':
        result = handleCalculateRental(data);
        break;
      case 'getApiUsage':
        result = handleGetApiUsage();
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Return success response
    return createJsonResponse({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.log(`API Error: ${error.message}`);

    // Return error response
    return createJsonResponse({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, 400);
  }
}

/**
 * Create JSON response with CORS headers
 */
function createJsonResponse(data, statusCode = 200) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);

  // Note: Apps Script Web Apps don't support custom status codes
  // or CORS headers in the traditional sense. The frontend will
  // need to handle this appropriately.

  return output;
}

/**
 * Handle full property analysis
 */
function handleAnalyze(data) {
  // Validate required fields
  validateAnalysisData(data);

  // Fetch comps
  const comps = fetchCompsData(data, false);

  // Calculate flip analysis
  const flipAnalysis = calculateFlipAnalysis(data);

  // Calculate rental analysis
  const rentalAnalysis = calculateRentalAnalysis(data);

  // Generate score
  const score = calculateDealScore(flipAnalysis, rentalAnalysis);

  // Generate alerts
  const alerts = generateAlerts(flipAnalysis, rentalAnalysis);

  // Generate insights
  const insights = generateInsights(flipAnalysis, rentalAnalysis, data);

  return {
    property: {
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip
    },
    comps: comps,
    flip: flipAnalysis,
    rental: rentalAnalysis,
    score: score,
    alerts: alerts,
    insights: insights
  };
}

/**
 * Handle fetch comps request
 */
function handleFetchComps(data) {
  validateCompsData(data);

  const forceRefresh = data.forceRefresh || false;
  const comps = fetchCompsData(data, forceRefresh);

  return {
    comps: comps,
    count: comps.length,
    cached: !forceRefresh
  };
}

/**
 * Handle flip calculation request
 */
function handleCalculateFlip(data) {
  validateFlipData(data);

  const flipAnalysis = calculateFlipAnalysis(data);

  return flipAnalysis;
}

/**
 * Handle rental calculation request
 */
function handleCalculateRental(data) {
  validateRentalData(data);

  const rentalAnalysis = calculateRentalAnalysis(data);

  return rentalAnalysis;
}

/**
 * Handle API usage request
 */
function handleGetApiUsage() {
  const scriptProperties = PropertiesService.getScriptProperties();

  // Get current month/day
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentDay = now.toISOString().split('T')[0];

  // Get usage data
  const zillowUsage = parseInt(scriptProperties.getProperty(`api_usage_zillow_${currentMonth}`) || '0');
  const usRealEstateUsage = parseInt(scriptProperties.getProperty(`api_usage_usrealestate_${currentMonth}`) || '0');
  const geminiUsage = parseInt(scriptProperties.getProperty(`api_usage_gemini_${currentDay}`) || '0');

  return {
    zillow: {
      used: zillowUsage,
      limit: 100,
      remaining: 100 - zillowUsage,
      period: 'monthly',
      resetDate: getMonthEndDate()
    },
    usRealEstate: {
      used: usRealEstateUsage,
      limit: 100,
      remaining: 100 - usRealEstateUsage,
      period: 'monthly',
      resetDate: getMonthEndDate()
    },
    gemini: {
      used: geminiUsage,
      limit: 1500,
      remaining: 1500 - geminiUsage,
      period: 'daily',
      resetDate: getTomorrowDate()
    }
  };
}

/**
 * Get end of current month
 */
function getMonthEndDate() {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return lastDay.toISOString().split('T')[0];
}

/**
 * Get tomorrow's date
 */
function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

/**
 * Validate analysis data
 */
function validateAnalysisData(data) {
  const required = ['address', 'city', 'state', 'zip', 'purchasePrice'];

  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate numeric fields
  if (isNaN(data.purchasePrice) || data.purchasePrice <= 0) {
    throw new Error('Purchase price must be a positive number');
  }
}

/**
 * Validate comps data
 */
function validateCompsData(data) {
  const required = ['address', 'city', 'state', 'zip'];

  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

/**
 * Validate flip data
 */
function validateFlipData(data) {
  const required = ['purchasePrice', 'rehabCost', 'arv'];

  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate numeric fields
  if (isNaN(data.purchasePrice) || data.purchasePrice <= 0) {
    throw new Error('Purchase price must be a positive number');
  }
  if (isNaN(data.rehabCost) || data.rehabCost < 0) {
    throw new Error('Rehab cost must be a non-negative number');
  }
  if (isNaN(data.arv) || data.arv <= 0) {
    throw new Error('ARV must be a positive number');
  }
}

/**
 * Validate rental data
 */
function validateRentalData(data) {
  const required = ['purchasePrice', 'monthlyRent'];

  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate numeric fields
  if (isNaN(data.purchasePrice) || data.purchasePrice <= 0) {
    throw new Error('Purchase price must be a positive number');
  }
  if (isNaN(data.monthlyRent) || data.monthlyRent <= 0) {
    throw new Error('Monthly rent must be a positive number');
  }
}

/**
 * Calculate flip analysis (wrapper for analyzer.js)
 */
function calculateFlipAnalysis(data) {
  // This will call the existing analyzer.js functions
  // For now, return a placeholder structure
  // TODO: Integrate with existing analyzer.js functions

  const purchasePrice = parseFloat(data.purchasePrice);
  const rehabCost = parseFloat(data.rehabCost || 0);
  const arv = parseFloat(data.arv || purchasePrice * 1.3);
  const holdingMonths = parseInt(data.holdingMonths || 6);

  // Calculate basic metrics
  const totalInvestment = purchasePrice + rehabCost;
  const sellingCosts = arv * 0.08; // 8% selling costs
  const netProfit = arv - totalInvestment - sellingCosts;
  const roi = (netProfit / totalInvestment) * 100;

  return {
    purchasePrice: purchasePrice,
    rehabCost: rehabCost,
    arv: arv,
    totalInvestment: totalInvestment,
    sellingCosts: sellingCosts,
    netProfit: netProfit,
    roi: roi,
    holdingMonths: holdingMonths,
    timeline: `${holdingMonths} months`
  };
}

/**
 * Calculate rental analysis (wrapper for analyzer.js)
 */
function calculateRentalAnalysis(data) {
  // This will call the existing analyzer.js functions
  // For now, return a placeholder structure
  // TODO: Integrate with existing analyzer.js functions

  const purchasePrice = parseFloat(data.purchasePrice);
  const monthlyRent = parseFloat(data.monthlyRent || purchasePrice * 0.01);
  const downPayment = parseFloat(data.downPayment || purchasePrice * 0.25);
  const interestRate = parseFloat(data.interestRate || 7.0);
  const loanTerm = parseInt(data.loanTerm || 30);

  // Calculate basic metrics
  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

  const propertyTax = purchasePrice * 0.012 / 12; // 1.2% annual
  const insurance = purchasePrice * 0.005 / 12; // 0.5% annual
  const maintenance = monthlyRent * 0.10; // 10% of rent
  const vacancy = monthlyRent * 0.08; // 8% of rent

  const totalExpenses = monthlyPayment + propertyTax + insurance + maintenance + vacancy;
  const cashFlow = monthlyRent - totalExpenses;
  const capRate = ((monthlyRent * 12 - (propertyTax + insurance + maintenance + vacancy) * 12) / purchasePrice) * 100;
  const cashOnCashReturn = ((cashFlow * 12) / downPayment) * 100;

  return {
    purchasePrice: purchasePrice,
    downPayment: downPayment,
    loanAmount: loanAmount,
    monthlyRent: monthlyRent,
    monthlyPayment: monthlyPayment,
    propertyTax: propertyTax,
    insurance: insurance,
    maintenance: maintenance,
    vacancy: vacancy,
    totalExpenses: totalExpenses,
    cashFlow: cashFlow,
    capRate: capRate,
    cashOnCashReturn: cashOnCashReturn
  };
}

/**
 * Calculate deal score (wrapper for scoring.js)
 */
function calculateDealScore(flipAnalysis, rentalAnalysis) {
  // TODO: Integrate with existing scoring.js

  let score = 0;
  let stars = 0;

  // Simple scoring based on ROI and cash flow
  if (flipAnalysis.roi > 20) score += 25;
  else if (flipAnalysis.roi > 15) score += 20;
  else if (flipAnalysis.roi > 10) score += 15;

  if (rentalAnalysis.cashFlow > 500) score += 25;
  else if (rentalAnalysis.cashFlow > 300) score += 20;
  else if (rentalAnalysis.cashFlow > 100) score += 15;

  if (rentalAnalysis.capRate > 8) score += 25;
  else if (rentalAnalysis.capRate > 6) score += 20;
  else if (rentalAnalysis.capRate > 4) score += 15;

  if (rentalAnalysis.cashOnCashReturn > 12) score += 25;
  else if (rentalAnalysis.cashOnCashReturn > 8) score += 20;
  else if (rentalAnalysis.cashOnCashReturn > 5) score += 15;

  // Convert to stars (0-5)
  if (score >= 90) stars = 5;
  else if (score >= 75) stars = 4;
  else if (score >= 60) stars = 3;
  else if (score >= 45) stars = 2;
  else if (score >= 30) stars = 1;

  return {
    score: score,
    stars: stars,
    rating: stars >= 4 ? 'Excellent' : stars >= 3 ? 'Good' : stars >= 2 ? 'Fair' : 'Poor'
  };
}

/**
 * Generate alerts (wrapper for alerts.js)
 */
function generateAlerts(flipAnalysis, rentalAnalysis) {
  // TODO: Integrate with existing alerts.js

  const alerts = [];

  if (flipAnalysis.roi < 10) {
    alerts.push({
      type: 'warning',
      category: 'flip',
      message: 'Low flip ROI - Consider negotiating purchase price or reducing rehab costs'
    });
  }

  if (rentalAnalysis.cashFlow < 100) {
    alerts.push({
      type: 'warning',
      category: 'rental',
      message: 'Low monthly cash flow - Property may not be sustainable as rental'
    });
  }

  if (rentalAnalysis.capRate < 5) {
    alerts.push({
      type: 'warning',
      category: 'rental',
      message: 'Low cap rate - Consider other investment opportunities'
    });
  }

  return alerts;
}

/**
 * Generate insights (wrapper for insights.js)
 */
function generateInsights(flipAnalysis, rentalAnalysis, data) {
  // TODO: Integrate with existing insights.js

  const insights = [];

  if (flipAnalysis.roi > 20) {
    insights.push({
      type: 'positive',
      category: 'flip',
      message: 'Excellent flip opportunity with strong ROI potential'
    });
  }

  if (rentalAnalysis.cashFlow > 500) {
    insights.push({
      type: 'positive',
      category: 'rental',
      message: 'Strong rental cash flow - Good long-term hold candidate'
    });
  }

  if (flipAnalysis.roi > 15 && rentalAnalysis.cashFlow > 300) {
    insights.push({
      type: 'positive',
      category: 'strategy',
      message: 'Consider BRRRR strategy - Property shows potential for both flip and rental'
    });
  }

  return insights;
}
