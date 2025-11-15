/**
 * ===============================
 * TAX BENEFITS & DEPRECIATION
 * Phase 2 Enhancement
 * ===============================
 *
 * Calculates tax benefits for real estate investments including:
 * - Depreciation (27.5 years for residential)
 * - Mortgage interest deduction
 * - Property tax deduction
 * - Capital gains tax considerations
 * - 1031 exchange scenarios
 */

/**
 * Calculate annual depreciation for residential rental property
 * @param {number} propertyValue - Total property value
 * @param {number} landValue - Land value (not depreciable, typically 20% of total)
 * @returns {number} Annual depreciation amount
 */
function calculateDepreciation(propertyValue, landValue = null) {
  // If land value not provided, estimate as 20% of property value
  if (landValue === null) {
    landValue = propertyValue * 0.20;
  }

  const depreciableBasis = propertyValue - landValue;
  const residentialDepreciationPeriod = 27.5; // years for residential rental property

  return depreciableBasis / residentialDepreciationPeriod;
}

/**
 * Calculate total tax benefits for a rental property
 * @param {Object} params - Parameters object
 * @returns {Object} Tax benefits breakdown
 */
function calculateTaxBenefits(params = {}) {
  const purchasePrice = params.purchasePrice || getField("purchasePrice", 0);
  const rehabCost = params.rehabCost || getField("rehabCost", 0);
  const downPaymentPct = (params.downPayment || getField("downPayment", 20)) / 100;
  const interestRate = (params.interestRate || getField("loanInterestRate", 7)) / 100;
  const loanTerm = params.loanTerm || getField("loanTerm", 30);
  const propertyTaxRate = params.propertyTaxRate || getField("propertyTaxRate", 0.0125);
  const taxBracket = params.taxBracket || 0.24; // Default to 24% federal tax bracket

  // Total property value after rehab
  const totalPropertyValue = purchasePrice + rehabCost;

  // Calculate depreciation
  const landValue = totalPropertyValue * 0.20; // 20% land, 80% building
  const annualDepreciation = calculateDepreciation(totalPropertyValue, landValue);

  // Calculate first year mortgage interest
  const loanAmount = purchasePrice * (1 - downPaymentPct);
  const firstYearInterest = calculateTotalInterest(12);

  // Calculate property taxes
  const annualPropertyTax = totalPropertyValue * propertyTaxRate;

  // Total deductions
  const totalDeductions = annualDepreciation + firstYearInterest + annualPropertyTax;

  // Tax savings (deductions × tax bracket)
  const taxSavings = totalDeductions * taxBracket;

  return {
    annualDepreciation: annualDepreciation,
    firstYearInterest: firstYearInterest,
    annualPropertyTax: annualPropertyTax,
    totalDeductions: totalDeductions,
    taxSavings: taxSavings,
    taxBracket: taxBracket,
    depreciableBasis: totalPropertyValue - landValue,
    landValue: landValue
  };
}

/**
 * Calculate capital gains tax on property sale
 * @param {Object} params - Parameters object
 * @returns {Object} Capital gains breakdown
 */
function calculateCapitalGains(params = {}) {
  const purchasePrice = params.purchasePrice || getField("purchasePrice", 0);
  const rehabCost = params.rehabCost || getField("rehabCost", 0);
  const salePrice = params.salePrice || purchasePrice * 1.2; // Default 20% appreciation
  const yearsHeld = params.yearsHeld || 5;
  const taxBracket = params.taxBracket || 0.24;

  // Calculate adjusted basis
  const totalPropertyValue = purchasePrice + rehabCost;
  const landValue = totalPropertyValue * 0.20;
  const annualDepreciation = calculateDepreciation(totalPropertyValue, landValue);
  const totalDepreciation = annualDepreciation * yearsHeld;
  const adjustedBasis = totalPropertyValue - totalDepreciation;

  // Calculate capital gain
  const capitalGain = salePrice - adjustedBasis;

  // Separate depreciation recapture from long-term capital gains
  const depreciationRecapture = totalDepreciation;
  const longTermCapitalGain = capitalGain - depreciationRecapture;

  // Tax rates
  const depreciationRecaptureRate = 0.25; // 25% for depreciation recapture
  const longTermCapitalGainsRate = yearsHeld >= 1 ? 0.15 : taxBracket; // 15% if held > 1 year, otherwise ordinary income

  // Calculate taxes
  const depreciationRecaptureTax = depreciationRecapture * depreciationRecaptureRate;
  const longTermCapitalGainsTax = Math.max(0, longTermCapitalGain) * longTermCapitalGainsRate;
  const totalCapitalGainsTax = depreciationRecaptureTax + longTermCapitalGainsTax;

  // Net proceeds after tax
  const sellingCosts = salePrice * 0.06; // 6% selling costs
  const netProceeds = salePrice - adjustedBasis - totalCapitalGainsTax - sellingCosts;

  return {
    salePrice: salePrice,
    originalBasis: totalPropertyValue,
    totalDepreciation: totalDepreciation,
    adjustedBasis: adjustedBasis,
    capitalGain: capitalGain,
    depreciationRecapture: depreciationRecapture,
    longTermCapitalGain: longTermCapitalGain,
    depreciationRecaptureTax: depreciationRecaptureTax,
    longTermCapitalGainsTax: longTermCapitalGainsTax,
    totalCapitalGainsTax: totalCapitalGainsTax,
    sellingCosts: sellingCosts,
    netProceeds: netProceeds,
    yearsHeld: yearsHeld
  };
}

/**
 * Calculate 1031 exchange scenario
 * @param {Object} params - Parameters object
 * @returns {Object} 1031 exchange analysis
 */
function calculate1031Exchange(params = {}) {
  const currentPropertyValue = params.currentPropertyValue || getField("purchasePrice", 0);
  const currentEquity = params.currentEquity || currentPropertyValue * 0.3;
  const newPropertyPrice = params.newPropertyPrice || currentPropertyValue * 1.5;
  const exchangeFees = params.exchangeFees || 2000; // Typical 1031 exchange fees

  // Calculate deferred taxes
  const capitalGainsWithout1031 = calculateCapitalGains(params);
  const taxesDeferred = capitalGainsWithout1031.totalCapitalGainsTax;

  // Calculate new loan amount needed
  const newLoanAmount = newPropertyPrice - currentEquity;

  // Calculate cash needed (if any)
  const cashNeeded = Math.max(0, newPropertyPrice - currentPropertyValue - exchangeFees);

  // Calculate potential cash out (if any)
  const potentialCashOut = Math.max(0, currentPropertyValue - newPropertyPrice - exchangeFees);

  return {
    currentPropertyValue: currentPropertyValue,
    currentEquity: currentEquity,
    newPropertyPrice: newPropertyPrice,
    exchangeFees: exchangeFees,
    taxesDeferred: taxesDeferred,
    newLoanAmount: newLoanAmount,
    cashNeeded: cashNeeded,
    potentialCashOut: potentialCashOut,
    benefit: taxesDeferred - exchangeFees,
    recommendation: taxesDeferred > exchangeFees ? "Recommended" : "Not Recommended"
  };
}

/**
 * Generate Tax Benefits Analysis sheet
 */
function generateTaxBenefitsAnalysis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Tax Benefits");

  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet("Tax Benefits");
  }

  sheet.clearContents();

  // Title and timestamp - using standardized header formatting with merged cells
  const titleRange = sheet.getRange("A1:B1");
  titleRange.merge();
  titleRange.setValue("Tax Benefits & Depreciation Analysis");
  styleHeader(titleRange, 'h1');
  titleRange.setBackground("#1a73e8");
  titleRange.setFontColor("white");

  const timestampRange = sheet.getRange("A2:B2");
  timestampRange.merge();
  timestampRange.setValue("Generated: " + new Date().toLocaleString())
    .setFontSize(9)
    .setFontColor("#666666");

  let row = 4;

  // Section 1: Annual Tax Benefits
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue("Annual Tax Benefits")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  const taxBenefits = calculateTaxBenefits();

  const benefitsData = [
    ["Depreciable Basis", taxBenefits.depreciableBasis],
    ["Land Value (Non-Depreciable)", taxBenefits.landValue],
    ["", ""],
    ["Annual Depreciation", taxBenefits.annualDepreciation],
    ["First Year Mortgage Interest", taxBenefits.firstYearInterest],
    ["Annual Property Tax", taxBenefits.annualPropertyTax],
    ["", ""],
    ["Total Annual Deductions", taxBenefits.totalDeductions],
    ["Tax Bracket", taxBenefits.taxBracket],
    ["Annual Tax Savings", taxBenefits.taxSavings]
  ];

  sheet.getRange(row, 1, benefitsData.length, 2).setValues(benefitsData);

  // Format currency and percentages
  [row, row + 1, row + 3, row + 4, row + 5, row + 7, row + 9].forEach(r => {
    sheet.getRange(r, 2).setNumberFormat('"$"#,##0');
  });
  sheet.getRange(row + 8, 2).setNumberFormat("0.00%");

  row += benefitsData.length + 2;

  // Section 2: Capital Gains Analysis (5-year hold)
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue("Capital Gains Analysis (5-Year Hold)")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  const capitalGains = calculateCapitalGains({ yearsHeld: 5 });

  const capitalGainsData = [
    ["Sale Price (Est.)", capitalGains.salePrice],
    ["Original Basis", capitalGains.originalBasis],
    ["Total Depreciation Taken", capitalGains.totalDepreciation],
    ["Adjusted Basis", capitalGains.adjustedBasis],
    ["", ""],
    ["Total Capital Gain", capitalGains.capitalGain],
    ["Depreciation Recapture", capitalGains.depreciationRecapture],
    ["Long-Term Capital Gain", capitalGains.longTermCapitalGain],
    ["", ""],
    ["Depreciation Recapture Tax (25%)", capitalGains.depreciationRecaptureTax],
    ["Long-Term Capital Gains Tax (15%)", capitalGains.longTermCapitalGainsTax],
    ["Total Capital Gains Tax", capitalGains.totalCapitalGainsTax],
    ["Selling Costs (6%)", capitalGains.sellingCosts],
    ["", ""],
    ["Net Proceeds After Tax", capitalGains.netProceeds]
  ];

  sheet.getRange(row, 1, capitalGainsData.length, 2).setValues(capitalGainsData);

  // Format all currency values
  [row, row + 1, row + 2, row + 3, row + 5, row + 6, row + 7, row + 9, row + 10, row + 11, row + 12, row + 14].forEach(r => {
    sheet.getRange(r, 2).setNumberFormat('"$"#,##0');
  });

  row += capitalGainsData.length + 2;

  // Section 3: 1031 Exchange Scenario
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue("1031 Exchange Scenario")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  const exchange1031 = calculate1031Exchange();

  const exchangeData = [
    ["Current Property Value", exchange1031.currentPropertyValue],
    ["Current Equity", exchange1031.currentEquity],
    ["New Property Price", exchange1031.newPropertyPrice],
    ["Exchange Fees", exchange1031.exchangeFees],
    ["", ""],
    ["Taxes Deferred", exchange1031.taxesDeferred],
    ["Net Benefit", exchange1031.benefit],
    ["", ""],
    ["Recommendation", exchange1031.recommendation]
  ];

  sheet.getRange(row, 1, exchangeData.length, 2).setValues(exchangeData);

  // Format currency values
  [row, row + 1, row + 2, row + 3, row + 5, row + 6].forEach(r => {
    sheet.getRange(r, 2).setNumberFormat('"$"#,##0');
  });

  // Color code recommendation
  const recCell = sheet.getRange(row + 8, 2);
  if (exchange1031.recommendation === "Recommended") {
    recCell.setBackground("#d4edda").setFontColor("#155724");
  } else {
    recCell.setBackground("#f8d7da").setFontColor("#721c24");
  }

  // Set column widths
  sheet.setColumnWidth(1, 250);
  sheet.setColumnWidth(2, 150);

  Logger.log("✅ Tax Benefits Analysis generated");
}
