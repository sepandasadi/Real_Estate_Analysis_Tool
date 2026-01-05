/**
 * ===============================
 * FLIP ANALYSIS FUNCTIONS
 * ===============================
 *
 * Fix & Flip property analysis and profit calculations
 * Platform-agnostic - pure calculation functions
 *
 * @module shared-core/calculations/flip
 */

/**
 * Calculate holding costs for flip project
 * @param {Object} propertyData - Property information
 * @param {number} monthsToFlip - Number of months to complete flip
 * @returns {Object} Holding costs breakdown
 */
function calculateHoldingCosts(propertyData, monthsToFlip) {
  // Validate inputs
  if (!propertyData || !monthsToFlip || monthsToFlip <= 0) {
    return { error: true, message: 'Valid property data and months to flip are required' };
  }

  // Calculate monthly costs
  const downPayment = propertyData.purchasePrice * (propertyData.downPayment || 0.20);
  const loanAmount = propertyData.purchasePrice - downPayment;
  const monthlyRate = (propertyData.loanInterestRate || 0.07) / 12;
  const loanTerm = (propertyData.loanTerm || 30) * 12;
  const monthlyPI = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm));

  const helocAmount = propertyData.helocAmount || 0;
  const helocInterest = propertyData.helocInterest || 0.07;
  const helocMonthlyInterest = (helocAmount * helocInterest) / 12;

  const monthlyPropertyTax = (propertyData.purchasePrice * (propertyData.propertyTaxRate || 0.0125)) / 12;
  const insuranceMonthly = propertyData.insuranceMonthly || 100;
  const utilitiesCost = propertyData.utilitiesCost || 0;

  const monthlyHoldingCosts = monthlyPI + helocMonthlyInterest + monthlyPropertyTax + insuranceMonthly + utilitiesCost;
  const totalHoldingCosts = monthlyHoldingCosts * monthsToFlip;

  return {
    error: false,
    monthlyHoldingCosts: Math.round(monthlyHoldingCosts),
    totalHoldingCosts: Math.round(totalHoldingCosts),
    breakdown: {
      monthlyPI: Math.round(monthlyPI),
      helocMonthlyInterest: Math.round(helocMonthlyInterest),
      monthlyPropertyTax: Math.round(monthlyPropertyTax),
      insuranceMonthly: Math.round(insuranceMonthly),
      utilitiesCost: Math.round(utilitiesCost)
    },
    monthsToFlip: monthsToFlip
  };
}

/**
 * Calculate total rehab costs with contingency
 * @param {number} baseRehabCost - Base rehab cost
 * @param {number} contingencyRate - Contingency rate (decimal, default 0.10 for 10%)
 * @returns {Object} Rehab costs breakdown
 */
function calculateRehabCosts(baseRehabCost, contingencyRate) {
  // Validate inputs
  if (!baseRehabCost || baseRehabCost < 0) {
    return { error: true, message: 'Valid base rehab cost is required' };
  }

  const rate = contingencyRate || 0.10;
  const contingency = baseRehabCost * rate;
  const totalRehab = baseRehabCost + contingency;

  return {
    error: false,
    baseRehabCost: Math.round(baseRehabCost),
    contingency: Math.round(contingency),
    contingencyRate: rate,
    totalRehab: Math.round(totalRehab)
  };
}

/**
 * Calculate acquisition costs
 * @param {number} purchasePrice - Purchase price
 * @param {number} closingCostRate - Closing cost rate (decimal, default 0.02 for 2%)
 * @returns {Object} Acquisition costs
 */
function calculateAcquisitionCosts(purchasePrice, closingCostRate) {
  // Validate inputs
  if (!purchasePrice || purchasePrice <= 0) {
    return { error: true, message: 'Valid purchase price is required' };
  }

  const rate = closingCostRate || 0.02;
  const closingCosts = purchasePrice * rate;

  return {
    error: false,
    purchasePrice: Math.round(purchasePrice),
    closingCosts: Math.round(closingCosts),
    closingCostRate: rate
  };
}

/**
 * Calculate selling costs
 * @param {number} arv - After Repair Value
 * @param {number} commissionRate - Commission rate (decimal, default 0.05 for 5%)
 * @param {number} sellerClosingRate - Seller closing cost rate (decimal, default 0.01 for 1%)
 * @returns {Object} Selling costs breakdown
 */
function calculateSellingCosts(arv, commissionRate, sellerClosingRate) {
  // Validate inputs
  if (!arv || arv <= 0) {
    return { error: true, message: 'Valid ARV is required' };
  }

  const commission = arv * (commissionRate || 0.05);
  const sellerClosing = arv * (sellerClosingRate || 0.01);
  const totalSellingCosts = commission + sellerClosing;

  return {
    error: false,
    commission: Math.round(commission),
    commissionRate: commissionRate || 0.05,
    sellerClosing: Math.round(sellerClosing),
    sellerClosingRate: sellerClosingRate || 0.01,
    totalSellingCosts: Math.round(totalSellingCosts)
  };
}

/**
 * Calculate net profit for flip
 * @param {number} arv - After Repair Value
 * @param {number} totalCosts - Total costs (purchase + rehab + holding + acquisition + selling)
 * @returns {Object} Profit calculation
 */
function calculateNetProfit(arv, totalCosts) {
  // Validate inputs
  if (!arv || arv <= 0 || !totalCosts || totalCosts < 0) {
    return { error: true, message: 'Valid ARV and total costs are required' };
  }

  const netProfit = arv - totalCosts;
  const profitMargin = (netProfit / arv) * 100;

  return {
    error: false,
    arv: Math.round(arv),
    totalCosts: Math.round(totalCosts),
    netProfit: Math.round(netProfit),
    profitMargin: Math.round(profitMargin * 100) / 100 // Percentage with 2 decimals
  };
}

/**
 * Calculate ROI for flip
 * @param {number} netProfit - Net profit
 * @param {number} totalCashInvested - Total cash invested
 * @returns {Object} ROI calculation
 */
function calculateFlipROI(netProfit, totalCashInvested) {
  // Validate inputs
  if (netProfit === undefined || !totalCashInvested || totalCashInvested <= 0) {
    return { error: true, message: 'Valid net profit and total cash invested are required' };
  }

  const roi = (netProfit / totalCashInvested) * 100;

  return {
    error: false,
    netProfit: Math.round(netProfit),
    totalCashInvested: Math.round(totalCashInvested),
    roi: Math.round(roi * 100) / 100 // Percentage with 2 decimals
  };
}

/**
 * Calculate Maximum Allowable Offer (MAO)
 * @param {number} arv - After Repair Value
 * @param {number} rehabCost - Total rehab cost
 * @param {number} targetProfitRate - Target profit rate (decimal, default 0.30 for 30%)
 * @returns {Object} MAO calculation
 */
function calculateMAO(arv, rehabCost, targetProfitRate) {
  // Validate inputs
  if (!arv || arv <= 0 || !rehabCost || rehabCost < 0) {
    return { error: true, message: 'Valid ARV and rehab cost are required' };
  }

  // Default to 70% rule if no target profit rate specified
  const rate = targetProfitRate || 0.70;
  const mao = (arv * rate) - rehabCost;

  return {
    error: false,
    arv: Math.round(arv),
    rehabCost: Math.round(rehabCost),
    targetProfitRate: rate,
    mao: Math.round(mao)
  };
}

/**
 * Calculate complete flip analysis
 * @param {Object} propertyData - Property information
 * @param {number} arv - After Repair Value
 * @returns {Object} Complete flip analysis
 */
function calculateFlipAnalysis(propertyData, arv) {
  // Validate inputs
  if (!propertyData || !arv || arv <= 0) {
    return { error: true, message: 'Valid property data and ARV are required' };
  }

  // Calculate all cost components
  const acquisitionResult = calculateAcquisitionCosts(propertyData.purchasePrice, 0.02);
  if (acquisitionResult.error) return acquisitionResult;

  const rehabResult = calculateRehabCosts(propertyData.rehabCost || 0, 0.10);
  if (rehabResult.error) return rehabResult;

  const holdingResult = calculateHoldingCosts(propertyData, propertyData.monthsToFlip || 6);
  if (holdingResult.error) return holdingResult;

  const sellingResult = calculateSellingCosts(arv, 0.05, 0.01);
  if (sellingResult.error) return sellingResult;

  // Calculate total costs
  const downPayment = propertyData.purchasePrice * (propertyData.downPayment || 0.20);
  const totalCosts = acquisitionResult.closingCosts + rehabResult.totalRehab + holdingResult.totalHoldingCosts + sellingResult.totalSellingCosts + downPayment;

  // Calculate profit
  const profitResult = calculateNetProfit(arv, totalCosts);
  if (profitResult.error) return profitResult;

  // Calculate ROI
  const totalCashInvested = downPayment + (propertyData.cashInvestment || 0) + rehabResult.totalRehab;
  const roiResult = calculateFlipROI(profitResult.netProfit, totalCashInvested);
  if (roiResult.error) return roiResult;

  // Calculate MAO
  const maoResult = calculateMAO(arv, rehabResult.totalRehab, 0.70);

  return {
    error: false,
    arv: Math.round(arv),
    purchasePrice: Math.round(propertyData.purchasePrice),
    downPayment: Math.round(downPayment),
    acquisition: acquisitionResult,
    rehab: rehabResult,
    holding: holdingResult,
    selling: sellingResult,
    totalCosts: Math.round(totalCosts),
    totalCashInvested: Math.round(totalCashInvested),
    netProfit: profitResult.netProfit,
    profitMargin: profitResult.profitMargin,
    roi: roiResult.roi,
    mao: maoResult.mao
  };
}

/**
 * Calculate scenario analysis (best/worst/base case)
 * @param {Object} baseAnalysis - Base case flip analysis
 * @param {number} arvVariance - ARV variance (decimal, e.g., 0.10 for ±10%)
 * @param {number} rehabVariance - Rehab variance (decimal, e.g., 0.20 for ±20%)
 * @returns {Object} Scenario analysis
 */
function calculateScenarioAnalysis(baseAnalysis, arvVariance, rehabVariance) {
  // Validate inputs
  if (!baseAnalysis || baseAnalysis.error) {
    return { error: true, message: 'Valid base analysis is required' };
  }

  const arvVar = arvVariance || 0.10;
  const rehabVar = rehabVariance || 0.20;

  // Base case
  const baseCase = {
    arv: baseAnalysis.arv,
    rehabCost: baseAnalysis.rehab.totalRehab,
    netProfit: baseAnalysis.netProfit
  };

  // Worst case: ARV -10%, Rehab +20%
  const worstARV = baseAnalysis.arv * (1 - arvVar);
  const worstRehab = baseAnalysis.rehab.totalRehab * (1 + rehabVar);
  const worstTotalCosts = baseAnalysis.totalCosts - baseAnalysis.rehab.totalRehab + worstRehab;
  const worstProfit = worstARV - worstTotalCosts;

  const worstCase = {
    arv: Math.round(worstARV),
    rehabCost: Math.round(worstRehab),
    netProfit: Math.round(worstProfit)
  };

  // Best case: ARV +10%, Rehab -10%
  const bestARV = baseAnalysis.arv * (1 + arvVar);
  const bestRehab = baseAnalysis.rehab.totalRehab * (1 - arvVar);
  const bestTotalCosts = baseAnalysis.totalCosts - baseAnalysis.rehab.totalRehab + bestRehab;
  const bestProfit = bestARV - bestTotalCosts;

  const bestCase = {
    arv: Math.round(bestARV),
    rehabCost: Math.round(bestRehab),
    netProfit: Math.round(bestProfit)
  };

  return {
    error: false,
    baseCase: baseCase,
    worstCase: worstCase,
    bestCase: bestCase,
    arvVariance: arvVar,
    rehabVariance: rehabVar
  };
}

/**
 * Determine if deal meets investment criteria
 * @param {Object} flipAnalysis - Flip analysis results
 * @param {Object} criteria - Investment criteria
 * @returns {Object} Deal evaluation
 */
function evaluateFlipDeal(flipAnalysis, criteria) {
  // Validate inputs
  if (!flipAnalysis || flipAnalysis.error) {
    return { error: true, message: 'Valid flip analysis is required' };
  }

  // Default criteria
  const minROI = criteria.minROI || 20; // 20% minimum ROI
  const minProfit = criteria.minProfit || 30000; // $30k minimum profit
  const maxPurchaseToARV = criteria.maxPurchaseToARV || 0.80; // 80% max purchase-to-ARV ratio

  // Evaluate criteria
  const meetsROI = flipAnalysis.roi >= minROI;
  const meetsProfit = flipAnalysis.netProfit >= minProfit;
  const purchaseToARV = flipAnalysis.purchasePrice / flipAnalysis.arv;
  const meetsPurchaseRatio = purchaseToARV <= maxPurchaseToARV;

  const passedCriteria = [meetsROI, meetsProfit, meetsPurchaseRatio].filter(Boolean).length;
  const totalCriteria = 3;

  let recommendation = 'reject';
  if (passedCriteria === totalCriteria) {
    recommendation = 'strong_buy';
  } else if (passedCriteria === 2) {
    recommendation = 'consider';
  } else if (passedCriteria === 1) {
    recommendation = 'weak';
  }

  return {
    error: false,
    recommendation: recommendation,
    passedCriteria: passedCriteria,
    totalCriteria: totalCriteria,
    evaluation: {
      meetsROI: meetsROI,
      actualROI: flipAnalysis.roi,
      targetROI: minROI,
      meetsProfit: meetsProfit,
      actualProfit: flipAnalysis.netProfit,
      targetProfit: minProfit,
      meetsPurchaseRatio: meetsPurchaseRatio,
      actualPurchaseToARV: Math.round(purchaseToARV * 100),
      targetPurchaseToARV: Math.round(maxPurchaseToARV * 100)
    }
  };
}
