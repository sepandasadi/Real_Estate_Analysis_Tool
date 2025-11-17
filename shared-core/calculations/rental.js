/**
 * ===============================
 * RENTAL ANALYSIS FUNCTIONS
 * ===============================
 *
 * Rental property analysis and cash flow calculations
 * Platform-agnostic - pure calculation functions
 *
 * @module shared-core/calculations/rental
 */

/**
 * Calculate Net Operating Income (NOI)
 * @param {number} grossIncome - Annual gross rental income
 * @param {number} vacancyRate - Vacancy rate (decimal, e.g., 0.06 for 6%)
 * @param {Object} expenses - Operating expenses
 * @returns {Object} { noi: number, effectiveGrossIncome: number, totalExpenses: number }
 */
function calculateNOI(grossIncome, vacancyRate, expenses) {
  // Validate inputs
  if (!grossIncome || grossIncome <= 0) {
    return { error: true, message: 'Valid gross income is required' };
  }

  if (!expenses) {
    return { error: true, message: 'Expenses object is required' };
  }

  // Calculate effective gross income
  const vacancyLoss = grossIncome * (vacancyRate || 0.06);
  const effectiveGrossIncome = grossIncome - vacancyLoss;

  // Calculate total operating expenses
  const propertyTaxes = expenses.propertyTaxes || 0;
  const insurance = expenses.insurance || 0;
  const maintenance = expenses.maintenance || 0;
  const propertyManagement = expenses.propertyManagement || 0;
  const hoaFees = expenses.hoaFees || 0;
  const utilities = expenses.utilities || 0;

  const totalExpenses = propertyTaxes + insurance + maintenance + propertyManagement + hoaFees + utilities;

  // Calculate NOI
  const noi = effectiveGrossIncome - totalExpenses;

  return {
    error: false,
    noi: Math.round(noi),
    effectiveGrossIncome: Math.round(effectiveGrossIncome),
    vacancyLoss: Math.round(vacancyLoss),
    totalExpenses: Math.round(totalExpenses),
    breakdown: {
      propertyTaxes: Math.round(propertyTaxes),
      insurance: Math.round(insurance),
      maintenance: Math.round(maintenance),
      propertyManagement: Math.round(propertyManagement),
      hoaFees: Math.round(hoaFees),
      utilities: Math.round(utilities)
    }
  };
}

/**
 * Calculate Cap Rate
 * @param {number} noi - Net Operating Income
 * @param {number} propertyValue - Property value or purchase price
 * @returns {Object} { capRate: number (decimal) }
 */
function calculateCapRate(noi, propertyValue) {
  // Validate inputs
  if (!noi || !propertyValue || propertyValue <= 0) {
    return { error: true, message: 'Valid NOI and property value are required' };
  }

  const capRate = noi / propertyValue;

  return {
    error: false,
    capRate: capRate,
    capRatePercent: Math.round(capRate * 100 * 100) / 100 // Percentage with 2 decimals
  };
}

/**
 * Calculate Cash-on-Cash Return
 * @param {number} annualCashFlow - Annual cash flow after debt service
 * @param {number} totalCashInvested - Total cash invested (down payment + rehab + closing)
 * @returns {Object} { cocReturn: number (decimal) }
 */
function calculateCashOnCashReturn(annualCashFlow, totalCashInvested) {
  // Validate inputs
  if (totalCashInvested === undefined || totalCashInvested <= 0) {
    return { error: true, message: 'Valid total cash invested is required' };
  }

  const cocReturn = annualCashFlow / totalCashInvested;

  return {
    error: false,
    cocReturn: cocReturn,
    cocReturnPercent: Math.round(cocReturn * 100 * 100) / 100 // Percentage with 2 decimals
  };
}

/**
 * Calculate Debt Service Coverage Ratio (DSCR)
 * @param {number} noi - Net Operating Income
 * @param {number} annualDebtService - Annual debt service (mortgage payments)
 * @returns {Object} { dscr: number }
 */
function calculateDSCR(noi, annualDebtService) {
  // Validate inputs
  if (!noi || !annualDebtService || annualDebtService <= 0) {
    return { error: true, message: 'Valid NOI and annual debt service are required' };
  }

  const dscr = noi / annualDebtService;

  // Determine quality
  let quality = 'poor';
  if (dscr >= 1.25) {
    quality = 'excellent';
  } else if (dscr >= 1.15) {
    quality = 'good';
  } else if (dscr >= 1.0) {
    quality = 'acceptable';
  }

  return {
    error: false,
    dscr: Math.round(dscr * 100) / 100,
    quality: quality
  };
}

/**
 * Calculate Return on Time Invested
 * @param {number} cocReturn - Cash-on-cash return (decimal)
 * @param {number} monthsToComplete - Months to complete project
 * @returns {Object} { returnOnTime: number (decimal per month) }
 */
function calculateReturnOnTime(cocReturn, monthsToComplete) {
  // Validate inputs
  if (cocReturn === undefined || !monthsToComplete || monthsToComplete <= 0) {
    return { error: true, message: 'Valid CoC return and months are required' };
  }

  const returnOnTime = cocReturn / monthsToComplete;

  return {
    error: false,
    returnOnTime: returnOnTime,
    returnOnTimePercent: Math.round(returnOnTime * 100 * 100) / 100 // Percentage with 2 decimals
  };
}

/**
 * Phase 3.5: Calculate enhanced rental estimate from multiple sources
 * @param {Array} rentalEstimates - Array of rental estimate objects
 * @returns {Object} { rentEstimate: number, sources: Array, confidence: number }
 */
function calculateEnhancedRentalEstimate(rentalEstimates) {
  // Validate inputs
  if (!Array.isArray(rentalEstimates) || rentalEstimates.length === 0) {
    return { error: true, message: 'Rental estimates array is required' };
  }

  // Filter valid estimates
  const validEstimates = rentalEstimates.filter(function(est) {
    return est && typeof est.value === 'number' && est.value > 0;
  });

  if (validEstimates.length === 0) {
    return { error: true, message: 'No valid rental estimates provided' };
  }

  // Calculate weighted average (equal weights if not specified)
  const totalWeight = validEstimates.reduce(function(sum, est) {
    return sum + (est.weight || 1);
  }, 0);

  const weightedRent = validEstimates.reduce(function(sum, est) {
    const weight = (est.weight || 1) / totalWeight;
    return sum + (est.value * weight);
  }, 0);

  // Calculate confidence based on variance
  const mean = weightedRent;
  const variance = validEstimates.reduce(function(sum, est) {
    const diff = est.value - mean;
    return sum + (diff * diff);
  }, 0) / validEstimates.length;

  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / mean;

  // Confidence: 100% if CV < 5%, decreasing to 50% at CV = 20%
  let confidence = 100;
  if (coefficientOfVariation > 0.05) {
    confidence = Math.max(50, 100 - ((coefficientOfVariation - 0.05) / 0.15) * 50);
  }

  return {
    error: false,
    rentEstimate: Math.round(weightedRent),
    sources: validEstimates.map(function(est) {
      return {
        value: est.value,
        source: est.source || 'unknown',
        weight: (est.weight || 1) / totalWeight
      };
    }),
    confidence: Math.round(confidence),
    stdDev: Math.round(stdDev)
  };
}

/**
 * Calculate rental analysis for as-is property
 * @param {Object} propertyData - Property information
 * @param {number} monthlyRent - Monthly rent estimate
 * @returns {Object} Rental analysis results
 */
function calculateAsIsRental(propertyData, monthlyRent) {
  // Validate inputs
  if (!propertyData || !monthlyRent || monthlyRent <= 0) {
    return { error: true, message: 'Valid property data and monthly rent are required' };
  }

  // Annual calculations
  const grossIncome = monthlyRent * 12;
  const vacancyRate = propertyData.vacancyRate || 0.06;

  // Operating expenses
  const propertyTaxes = (propertyData.propertyTaxRate || 0.0125) * propertyData.purchasePrice;
  const insurance = (propertyData.insuranceMonthly || 100) * 12;
  const maintenance = propertyData.purchasePrice * (propertyData.maintenanceRate || 0.01);
  const propertyManagement = propertyData.includePropertyManagement === 'Yes'
    ? grossIncome * (1 - vacancyRate) * (propertyData.propertyManagementRate || 0.08)
    : 0;
  const hoaFees = (propertyData.hoaFees || 0) * 12;
  const utilities = (propertyData.utilitiesCost || 0) * 12;

  const expenses = {
    propertyTaxes: propertyTaxes,
    insurance: insurance,
    maintenance: maintenance,
    propertyManagement: propertyManagement,
    hoaFees: hoaFees,
    utilities: utilities
  };

  // Calculate NOI
  const noiResult = calculateNOI(grossIncome, vacancyRate, expenses);
  if (noiResult.error) return noiResult;

  // Calculate Cap Rate
  const capRateResult = calculateCapRate(noiResult.noi, propertyData.purchasePrice);

  // Calculate debt service
  const downPayment = propertyData.purchasePrice * (propertyData.downPayment || 0.20);
  const loanAmount = propertyData.purchasePrice - downPayment;
  const monthlyRate = (propertyData.loanInterestRate || 0.07) / 12;
  const loanTerm = (propertyData.loanTerm || 30) * 12;
  const monthlyPI = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm));
  const helocMonthlyInterest = ((propertyData.helocAmount || 0) * (propertyData.helocInterest || 0.07)) / 12;
  const annualDebtService = (monthlyPI + helocMonthlyInterest) * 12;

  // Calculate cash flow
  const annualCashFlow = noiResult.noi - annualDebtService;
  const monthlyCashFlow = annualCashFlow / 12;

  // Calculate CoC return
  const totalCashDeployed = downPayment + (propertyData.cashInvestment || 0) + (propertyData.rehabCost || 0);
  const cocResult = calculateCashOnCashReturn(annualCashFlow, totalCashDeployed);

  // Calculate DSCR
  const dscrResult = calculateDSCR(noiResult.noi, annualDebtService);

  // Calculate Return on Time
  const returnOnTimeResult = calculateReturnOnTime(cocResult.cocReturn, propertyData.monthsToFlip || 6);

  return {
    error: false,
    grossIncome: Math.round(grossIncome),
    effectiveGrossIncome: noiResult.effectiveGrossIncome,
    vacancyLoss: noiResult.vacancyLoss,
    totalExpenses: noiResult.totalExpenses,
    expenseBreakdown: noiResult.breakdown,
    noi: noiResult.noi,
    capRate: capRateResult.capRatePercent,
    annualDebtService: Math.round(annualDebtService),
    annualCashFlow: Math.round(annualCashFlow),
    monthlyCashFlow: Math.round(monthlyCashFlow),
    cocReturn: cocResult.cocReturnPercent,
    dscr: dscrResult.dscr,
    dscrQuality: dscrResult.quality,
    returnOnTime: returnOnTimeResult.returnOnTimePercent,
    helocMonthlyInterest: Math.round(helocMonthlyInterest)
  };
}

/**
 * Calculate rental analysis for after-flip (BRRRR) property
 * @param {Object} propertyData - Property information
 * @param {number} arv - After Repair Value
 * @param {number} monthlyRent - Monthly rent estimate (post-flip)
 * @returns {Object} Rental analysis results
 */
function calculateBRRRRRental(propertyData, arv, monthlyRent) {
  // Validate inputs
  if (!propertyData || !arv || arv <= 0 || !monthlyRent || monthlyRent <= 0) {
    return { error: true, message: 'Valid property data, ARV, and monthly rent are required' };
  }

  // Annual calculations
  const grossIncome = monthlyRent * 12;
  const vacancyRate = propertyData.vacancyRate || 0.06;

  // Operating expenses (based on ARV)
  const propertyTaxes = (propertyData.propertyTaxRate || 0.0125) * arv;
  const insurance = (propertyData.insuranceMonthly || 100) * 12 * 1.1; // 10% increase
  const maintenance = arv * (propertyData.maintenanceRate || 0.01);
  const propertyManagement = propertyData.includePropertyManagement === 'Yes'
    ? grossIncome * (1 - vacancyRate) * (propertyData.propertyManagementRate || 0.08)
    : 0;
  const hoaFees = (propertyData.hoaFees || 0) * 12;
  const utilities = (propertyData.utilitiesCost || 0) * 12;

  const expenses = {
    propertyTaxes: propertyTaxes,
    insurance: insurance,
    maintenance: maintenance,
    propertyManagement: propertyManagement,
    hoaFees: hoaFees,
    utilities: utilities
  };

  // Calculate NOI
  const noiResult = calculateNOI(grossIncome, vacancyRate, expenses);
  if (noiResult.error) return noiResult;

  // Calculate Cap Rate (based on ARV)
  const capRateResult = calculateCapRate(noiResult.noi, arv);

  // Calculate debt service (refinanced based on ARV)
  const downPaymentPct = propertyData.downPayment || 0.20;
  const newLoanAmount = arv * (1 - downPaymentPct);
  const monthlyRate = (propertyData.loanInterestRate || 0.07) / 12;
  const loanTerm = (propertyData.loanTerm || 30) * 12;
  const newMonthlyPI = (newLoanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm));
  const helocMonthlyInterest = ((propertyData.helocAmount || 0) * (propertyData.helocInterest || 0.07)) / 12;
  const annualDebtService = (newMonthlyPI + helocMonthlyInterest) * 12;

  // Calculate cash flow
  const annualCashFlow = noiResult.noi - annualDebtService;
  const monthlyCashFlow = annualCashFlow / 12;

  // Calculate CoC return (based on original cash deployed)
  const downPayment = propertyData.purchasePrice * downPaymentPct;
  const totalCashDeployed = downPayment + (propertyData.cashInvestment || 0) + (propertyData.rehabCost || 0);
  const cocResult = calculateCashOnCashReturn(annualCashFlow, totalCashDeployed);

  // Calculate DSCR
  const dscrResult = calculateDSCR(noiResult.noi, annualDebtService);

  // Calculate Return on Time
  const returnOnTimeResult = calculateReturnOnTime(cocResult.cocReturn, propertyData.monthsToFlip || 6);

  return {
    error: false,
    arv: Math.round(arv),
    grossIncome: Math.round(grossIncome),
    effectiveGrossIncome: noiResult.effectiveGrossIncome,
    vacancyLoss: noiResult.vacancyLoss,
    totalExpenses: noiResult.totalExpenses,
    expenseBreakdown: noiResult.breakdown,
    noi: noiResult.noi,
    capRate: capRateResult.capRatePercent,
    annualDebtService: Math.round(annualDebtService),
    annualCashFlow: Math.round(annualCashFlow),
    monthlyCashFlow: Math.round(monthlyCashFlow),
    cocReturn: cocResult.cocReturnPercent,
    dscr: dscrResult.dscr,
    dscrQuality: dscrResult.quality,
    returnOnTime: returnOnTimeResult.returnOnTimePercent
  };
}
