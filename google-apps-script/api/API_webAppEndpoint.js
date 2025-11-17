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

  // Step 1: Fetch property details (beds, baths, sqft)
  Logger.log("📋 Step 1: Fetching property details...");
  const propertyDetails = fetchPropertyDetails(data);

  // Step 2: Calculate closing costs automatically (2.5% of purchase price)
  Logger.log("💰 Step 2: Calculating closing costs...");
  data.closingCosts = data.purchasePrice * 0.025;

  // Step 3: Fetch comps with property details for filtering
  Logger.log("🏘️ Step 3: Fetching comparable properties...");
  const comps = fetchCompsData(data, false);

  // Step 4: Calculate multi-source ARV with Phase 1 & 2 enhancements
  Logger.log("📊 Step 4: Calculating multi-source ARV...");
  const arvData = calculateMultiSourceARV(comps, propertyDetails, data.purchasePrice, data);
  data.arv = arvData.arv;
  data.arvMethod = arvData.arvMethod;
  data.arvSources = arvData.arvSources;

  // Step 5: Calculate rental estimates automatically
  Logger.log("🏠 Step 5: Calculating rental estimates...");
  const rentalEstimates = calculateRentalEstimates(data, propertyDetails, comps);

  // Merge rental estimates into data
  data.monthlyRent = rentalEstimates.monthlyRent;
  data.propertyTax = rentalEstimates.propertyTax;
  data.insurance = rentalEstimates.insurance;
  data.hoaFees = rentalEstimates.hoaFees;
  data.maintenance = rentalEstimates.maintenance;
  data.vacancy = rentalEstimates.vacancy;

  // Step 6: Calculate flip analysis with ARV metadata
  Logger.log("🔨 Step 6: Calculating flip analysis...");
  const flipAnalysis = calculateFlipAnalysis(data);

  // Add Phase 1 & 2 fields to flip analysis
  flipAnalysis.arvMethod = data.arvMethod;
  flipAnalysis.arvSources = data.arvSources;

  // Step 6.5: Historical validation (Phase 2.3)
  Logger.log("📈 Step 6.5: Validating ARV against market trends...");
  let historicalValidation = null;
  try {
    const zpid = propertyDetails?.zpid;
    const location = `${data.city}, ${data.state}`;

    if (zpid) {
      historicalValidation = validateARVAgainstMarketTrends(data.arv, zpid, location);
      Logger.log(`✅ Historical validation: ${historicalValidation.isValid ? 'Valid' : 'Needs review'}`);
    } else {
      Logger.log("⚠️ No zpid available for historical validation");
    }
  } catch (e) {
    Logger.log(`⚠️ Historical validation error: ${e.message}`);
  }

  flipAnalysis.historicalValidation = historicalValidation;

  // Step 7: Calculate rental analysis
  Logger.log("🏘️ Step 7: Calculating rental analysis...");
  const rentalAnalysis = calculateRentalAnalysis(data);

  // Step 8: Generate score
  Logger.log("⭐ Step 8: Generating deal score...");
  const score = calculateDealScore(flipAnalysis, rentalAnalysis);

  // Step 9: Generate alerts
  Logger.log("⚠️ Step 9: Generating alerts...");
  const alerts = generateAlerts(flipAnalysis, rentalAnalysis);

  // Step 10: Generate insights
  Logger.log("💡 Step 10: Generating insights...");
  const insights = generateInsights(flipAnalysis, rentalAnalysis, data);

  Logger.log("✅ Analysis complete!");

  // Enhance comps with quality scores and data sources
  const enhancedComps = comps.map(comp => ({
    ...comp,
    qualityScore: comp.qualityScore || 85,
    dataSource: comp.dataSource || 'unknown'
  }));

  return {
    property: {
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      beds: propertyDetails.beds,
      baths: propertyDetails.baths,
      sqft: propertyDetails.sqft
    },
    comps: enhancedComps,
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
 * Calculate multi-source ARV with Phase 1 & 2 enhancements
 * Uses comps, Zillow Zestimate, and US Real Estate estimate
 * Returns ARV data with methodology and sources
 */
function calculateMultiSourceARV(comps, propertyDetails, purchasePrice, propertyData) {
  let arvSources = {
    comps: null,
    zillow: null,
    usRealEstate: null
  };
  let arvCalculationMethod = "Legacy (No Comps)";
  let arv = purchasePrice * 1.2; // Default fallback

  // Step 1: Calculate comps-based ARV (existing logic)
  if (comps && comps.length > 0) {
    // Filter comps by date (last 2 years only)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const recentComps = comps.filter(comp => {
      if (!comp.saleDate) return false;
      try {
        const saleDate = new Date(comp.saleDate);
        return saleDate >= twoYearsAgo;
      } catch (e) {
        Logger.log(`⚠️ Invalid date format for comp: ${comp.saleDate}`);
        return false;
      }
    });

    Logger.log(`📅 Filtered ${recentComps.length} comps from last 2 years (from ${comps.length} total)`);

    if (recentComps.length > 0) {
      // Filter comps by similarity
      const targetSqft = propertyDetails.sqft;
      const targetBeds = propertyDetails.beds;
      const targetBaths = propertyDetails.baths;

      const similarComps = recentComps.filter(comp => {
        const sqftMatch = comp.sqft >= targetSqft * 0.8 && comp.sqft <= targetSqft * 1.2;
        const bedsMatch = !comp.beds || comp.beds === targetBeds;
        const bathsMatch = !comp.baths || Math.abs(comp.baths - targetBaths) <= 0.5;
        return sqftMatch && bedsMatch && bathsMatch;
      });

      const compsToUse = similarComps.length >= 3 ? similarComps : recentComps;
      Logger.log(`📊 Using ${compsToUse.length} similar comps for ARV calculation`);

      // Separate remodeled and unremodeled comps
      const remodeledComps = compsToUse.filter(c => c.condition === "remodeled");
      const unremodeledComps = compsToUse.filter(c => c.condition === "unremodeled");

      const avgRemodeled = remodeledComps.length > 0
        ? remodeledComps.reduce((sum, c) => sum + (c.price || 0), 0) / remodeledComps.length
        : 0;
      const avgUnremodeled = unremodeledComps.length > 0
        ? unremodeledComps.reduce((sum, c) => sum + (c.price || 0), 0) / unremodeledComps.length
        : 0;

      // Calculate comps ARV
      let compsARV = 0;
      if (remodeledComps.length >= 3) {
        compsARV = avgRemodeled;
        Logger.log(`✅ Comps ARV: ${remodeledComps.length} remodeled comps (0% premium)`);
      } else if (remodeledComps.length > 0 && unremodeledComps.length > 0) {
        const renovationPremium = avgRemodeled / avgUnremodeled;
        const cappedPremium = Math.min(renovationPremium, 1.25);
        compsARV = avgUnremodeled * cappedPremium;
        Logger.log(`✅ Comps ARV: Mixed comps with ${((cappedPremium - 1) * 100).toFixed(1)}% premium`);
      } else if (unremodeledComps.length >= 3) {
        compsARV = avgUnremodeled * 1.25;
        Logger.log(`✅ Comps ARV: ${unremodeledComps.length} unremodeled comps + 25% premium`);
      } else if (compsToUse.length > 0) {
        const avgAll = compsToUse.reduce((sum, c) => sum + (c.price || 0), 0) / compsToUse.length;
        compsARV = avgAll * 1.20;
        Logger.log(`✅ Comps ARV: ${compsToUse.length} mixed comps + 20% premium`);
      }

      if (compsARV > 0) {
        arvSources.comps = Math.round(compsARV);
      }
    }
  }

  // Step 2: Fetch Zillow Zestimate (Phase 1.2)
  try {
    if (propertyDetails.zpid) {
      const zestimate = fetchZillowZestimate(propertyDetails.zpid);
      if (zestimate && zestimate.zestimate) {
        arvSources.zillow = zestimate.zestimate;
        Logger.log(`💰 Zillow Zestimate: $${zestimate.zestimate.toLocaleString()}`);
      }
    }
  } catch (e) {
    Logger.log(`Failed to fetch Zillow Zestimate: ${e.message}`);
  }

  // Step 3: Fetch US Real Estate estimate (Phase 1.3)
  try {
    const propertyId = getUSRealEstatePropertyId(propertyData);
    if (propertyId) {
      const usEstimate = fetchUSRealEstateHomeEstimate(propertyId);
      if (usEstimate && usEstimate.estimate) {
        arvSources.usRealEstate = usEstimate.estimate;
        Logger.log(`🏡 US Real Estate Estimate: $${usEstimate.estimate.toLocaleString()}`);
      }
    }
  } catch (e) {
    Logger.log(`Failed to fetch US Real Estate estimate: ${e.message}`);
  }

  // Step 4: Calculate weighted average (Phase 1.5)
  const availableSources = [];
  if (arvSources.comps) availableSources.push({ name: 'comps', value: arvSources.comps, weight: 0.50 });
  if (arvSources.zillow) availableSources.push({ name: 'zillow', value: arvSources.zillow, weight: 0.25 });
  if (arvSources.usRealEstate) availableSources.push({ name: 'us_real_estate', value: arvSources.usRealEstate, weight: 0.25 });

  if (availableSources.length === 1) {
    arv = availableSources[0].value;
    arvCalculationMethod = `Single source: ${availableSources[0].name} (100%)`;
    Logger.log(`📊 Final ARV: Single source (${availableSources[0].name}): $${arv.toLocaleString()}`);
  } else if (availableSources.length > 1) {
    const totalWeight = availableSources.reduce((sum, s) => sum + s.weight, 0);
    let weightedSum = 0;
    let sourceBreakdown = [];

    availableSources.forEach(source => {
      const adjustedWeight = source.weight / totalWeight;
      weightedSum += source.value * adjustedWeight;
      sourceBreakdown.push(`${source.name} (${(adjustedWeight * 100).toFixed(0)}%)`);
    });

    arv = weightedSum;
    arvCalculationMethod = `Multi-source weighted: ${sourceBreakdown.join(' + ')}`;
    Logger.log(`📊 Final ARV (Multi-Source Weighted): $${arv.toLocaleString()}`);
  } else {
    arvCalculationMethod = "Legacy (20% premium on purchase price)";
    Logger.log(`📊 ARV Calculation: Using legacy method - ${arvCalculationMethod}`);
  }

  return {
    arv: Math.round(arv),
    arvMethod: arvCalculationMethod,
    arvSources: arvSources
  };
}

/**
 * Calculate rental estimates automatically
 * Returns all rental-related fields
 */
function calculateRentalEstimates(data, propertyDetails, comps) {
  const purchasePrice = parseFloat(data.purchasePrice);

  // 1. Monthly Rent - Use 1% rule as baseline, adjust by market
  let monthlyRent = purchasePrice * 0.01;

  // Try to get more accurate rent from comps or market data
  // For now, use 1% rule
  Logger.log(`💵 Estimated monthly rent (1% rule): $${Math.round(monthlyRent)}`);

  // 2. Property Tax - Use state average or 1.2% annual
  const propertyTax = (purchasePrice * 0.012) / 12;
  Logger.log(`🏛️ Estimated property tax (monthly): $${Math.round(propertyTax)}`);

  // 3. Insurance - 0.5% of property value annually
  const insurance = (purchasePrice * 0.005) / 12;
  Logger.log(`🛡️ Estimated insurance (monthly): $${Math.round(insurance)}`);

  // 4. HOA Fees - Default to $0 (would need property details API)
  const hoaFees = 0;
  Logger.log(`🏘️ HOA fees: $${hoaFees}`);

  // 5. Maintenance - 1% of property value annually
  const maintenance = (purchasePrice * 0.01) / 12;
  Logger.log(`🔧 Estimated maintenance (monthly): $${Math.round(maintenance)}`);

  // 6. Vacancy - 8% of monthly rent
  const vacancy = monthlyRent * 0.08;
  Logger.log(`📅 Estimated vacancy reserve (monthly): $${Math.round(vacancy)}`);

  return {
    monthlyRent: Math.round(monthlyRent),
    propertyTax: Math.round(propertyTax),
    insurance: Math.round(insurance),
    hoaFees: hoaFees,
    maintenance: Math.round(maintenance),
    vacancy: Math.round(vacancy)
  };
}

/**
 * Calculate flip analysis (wrapper for analyzer.js)
 */
function calculateFlipAnalysis(data) {
  const purchasePrice = parseFloat(data.purchasePrice);
  const rehabCost = parseFloat(data.rehabCost || 0);
  const arv = parseFloat(data.arv);
  const closingCosts = parseFloat(data.closingCosts);
  const holdingMonths = parseInt(data.holdingMonths || 6);

  // Calculate basic metrics
  const totalInvestment = purchasePrice + rehabCost + closingCosts;
  const sellingCosts = arv * 0.08; // 8% selling costs (6% commission + 2% closing)
  const netProfit = arv - totalInvestment - sellingCosts;
  const roi = (netProfit / totalInvestment) * 100;

  return {
    purchasePrice: purchasePrice,
    rehabCost: rehabCost,
    arv: arv,
    closingCosts: closingCosts,
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
  const purchasePrice = parseFloat(data.purchasePrice);
  const monthlyRent = parseFloat(data.monthlyRent);

  // Convert down payment from percentage to dollar amount
  const downPaymentPercent = parseFloat(data.downPayment || 25) / 100;
  const downPayment = purchasePrice * downPaymentPercent;

  const interestRate = parseFloat(data.interestRate || 7.0);
  const loanTerm = parseInt(data.loanTerm || 30);

  // Get auto-calculated expenses
  const propertyTax = parseFloat(data.propertyTax);
  const insurance = parseFloat(data.insurance);
  const hoaFees = parseFloat(data.hoaFees || 0);
  const maintenance = parseFloat(data.maintenance);
  const vacancy = parseFloat(data.vacancy);

  // Calculate loan metrics
  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  const monthlyPayment = loanAmount > 0
    ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    : 0;

  // Calculate cash flow
  const totalExpenses = monthlyPayment + propertyTax + insurance + hoaFees + maintenance + vacancy;
  const cashFlow = monthlyRent - totalExpenses;

  // Calculate returns
  const annualNOI = (monthlyRent * 12) - ((propertyTax + insurance + hoaFees + maintenance + vacancy) * 12);
  const capRate = (annualNOI / purchasePrice) * 100;
  const cashOnCashReturn = downPayment > 0 ? ((cashFlow * 12) / downPayment) * 100 : 0;

  return {
    purchasePrice: purchasePrice,
    downPayment: downPayment,
    loanAmount: loanAmount,
    monthlyRent: monthlyRent,
    monthlyPayment: monthlyPayment,
    propertyTax: propertyTax,
    insurance: insurance,
    hoaFees: hoaFees,
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
