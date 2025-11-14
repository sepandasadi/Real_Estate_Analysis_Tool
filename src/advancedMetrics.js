/**
 * ===============================
 * ADVANCED FINANCIAL METRICS
 * Phase 2 Enhancement - Final Tasks
 * ===============================
 *
 * Implements advanced financial calculations:
 * - Internal Rate of Return (IRR)
 * - Net Present Value (NPV)
 * - Break-even analysis
 * - Multiple loan scenario comparisons
 */

/**
 * Calculate Internal Rate of Return (IRR) using Newton-Raphson method
 * @param {Array} cashFlows - Array of cash flows [initial investment (negative), year1, year2, ...]
 * @param {number} guess - Initial guess for IRR (default 0.1 = 10%)
 * @returns {number} IRR as decimal (e.g., 0.15 = 15%) or null if invalid
 */
function calculateIRR(cashFlows, guess = 0.1) {
  // Validate cash flows
  if (!cashFlows || cashFlows.length < 2) {
    Logger.log("⚠️ IRR calculation requires at least 2 cash flows");
    return null;
  }

  // Check for sign changes (required for valid IRR)
  let hasPositive = false;
  let hasNegative = false;
  for (let i = 0; i < cashFlows.length; i++) {
    if (cashFlows[i] > 0) hasPositive = true;
    if (cashFlows[i] < 0) hasNegative = true;
  }

  if (!hasPositive || !hasNegative) {
    Logger.log("⚠️ IRR calculation requires both positive and negative cash flows");
    return null;
  }

  const maxIterations = 100;
  const tolerance = 0.00001;
  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let derivative = 0;

    for (let j = 0; j < cashFlows.length; j++) {
      npv += cashFlows[j] / Math.pow(1 + rate, j);
      derivative -= j * cashFlows[j] / Math.pow(1 + rate, j + 1);
    }

    // Check for invalid derivative
    if (Math.abs(derivative) < 0.000001) {
      Logger.log("⚠️ IRR calculation failed: derivative too small");
      return null;
    }

    const newRate = rate - npv / derivative;

    // Check for convergence
    if (Math.abs(newRate - rate) < tolerance) {
      // Validate result is reasonable (-100% to 1000%)
      if (newRate < -1 || newRate > 10) {
        Logger.log("⚠️ IRR calculation resulted in unreasonable value: " + newRate);
        return null;
      }
      return newRate;
    }

    // Check for divergence
    if (Math.abs(newRate) > 100 || isNaN(newRate)) {
      Logger.log("⚠️ IRR calculation diverged");
      return null;
    }

    rate = newRate;
  }

  Logger.log("⚠️ IRR calculation did not converge after " + maxIterations + " iterations");
  return null; // Return null if not converged
}

/**
 * Calculate Net Present Value (NPV)
 * @param {Array} cashFlows - Array of cash flows [initial investment (negative), year1, year2, ...]
 * @param {number} discountRate - Discount rate as decimal (e.g., 0.10 = 10%)
 * @returns {number} NPV in dollars
 */
function calculateNPV(cashFlows, discountRate) {
  let npv = 0;
  for (let i = 0; i < cashFlows.length; i++) {
    npv += cashFlows[i] / Math.pow(1 + discountRate, i);
  }
  return npv;
}

/**
 * Generate multi-year cash flow projections for rental property
 * @param {number} years - Number of years to project
 * @returns {Object} Cash flow projection data
 */
function generateCashFlowProjections(years = 10) {
  const purchasePrice = getField("purchasePrice", 0);
  const downPaymentPct = getField("downPayment", 20) / 100;
  const rehabCost = getField("rehabCost", 0);
  const rentEstimate = getField("rentEstimate", 3500);
  const propertyTaxRate = getField("propertyTaxRate", 0.0125);
  const insuranceMonthly = getField("insuranceMonthly", 100);
  const vacancyRate = getField("vacancyRate", 0.06);
  const interestRate = getField("loanInterestRate", 7) / 100;
  const loanTerm = getField("loanTerm", 30);

  const totalInvestment = purchasePrice + rehabCost;
  const downPayment = purchasePrice * downPaymentPct;
  const totalCashInvested = downPayment + rehabCost;
  const loanAmount = purchasePrice - downPayment;

  // Calculate monthly payment
  const monthlyRate = interestRate / 12;
  const totalMonths = loanTerm * 12;
  const monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));

  // Annual assumptions
  const rentGrowthRate = 0.03; // 3% annual rent growth
  const expenseGrowthRate = 0.025; // 2.5% annual expense growth
  const appreciationRate = 0.04; // 4% annual property appreciation

  const cashFlows = [-totalCashInvested]; // Year 0: Initial investment (negative)
  const yearlyData = [];

  for (let year = 1; year <= years; year++) {
    // Rent with growth
    const annualRent = rentEstimate * 12 * Math.pow(1 + rentGrowthRate, year - 1);
    const vacancyLoss = annualRent * vacancyRate;
    const effectiveGrossIncome = annualRent - vacancyLoss;

    // Operating expenses with growth
    const propertyTax = totalInvestment * propertyTaxRate * Math.pow(1 + expenseGrowthRate, year - 1);
    const insurance = insuranceMonthly * 12 * Math.pow(1 + expenseGrowthRate, year - 1);
    const maintenance = totalInvestment * 0.01 * Math.pow(1 + expenseGrowthRate, year - 1);
    const propertyManagement = effectiveGrossIncome * 0.08;
    const totalExpenses = propertyTax + insurance + maintenance + propertyManagement;

    // NOI and cash flow
    const noi = effectiveGrossIncome - totalExpenses;
    const debtService = monthlyPayment * 12;
    const annualCashFlow = noi - debtService;

    // Property value with appreciation
    const propertyValue = totalInvestment * Math.pow(1 + appreciationRate, year);

    cashFlows.push(annualCashFlow);

    yearlyData.push({
      year: year,
      rent: annualRent,
      noi: noi,
      cashFlow: annualCashFlow,
      propertyValue: propertyValue,
      cumulativeCashFlow: cashFlows.slice(1).reduce((a, b) => a + b, 0)
    });
  }

  return {
    cashFlows: cashFlows,
    yearlyData: yearlyData,
    totalInvestment: totalCashInvested
  };
}

/**
 * Calculate break-even analysis
 * @returns {Object} Break-even metrics
 */
function calculateBreakEven() {
  const purchasePrice = getField("purchasePrice", 0);
  const downPaymentPct = getField("downPayment", 20) / 100;
  const rehabCost = getField("rehabCost", 0);
  const interestRate = getField("loanInterestRate", 7) / 100;
  const loanTerm = getField("loanTerm", 30);
  const propertyTaxRate = getField("propertyTaxRate", 0.0125);
  const insuranceMonthly = getField("insuranceMonthly", 100);

  const totalInvestment = purchasePrice + rehabCost;
  const downPayment = purchasePrice * downPaymentPct;
  const loanAmount = purchasePrice - downPayment;

  // Calculate monthly payment
  const monthlyRate = interestRate / 12;
  const totalMonths = loanTerm * 12;
  const monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));

  // Monthly operating expenses
  const monthlyPropertyTax = (totalInvestment * propertyTaxRate) / 12;
  const monthlyInsurance = insuranceMonthly;
  const monthlyMaintenance = (totalInvestment * 0.01) / 12;

  // Break-even rent (without property management)
  const breakEvenRentNoMgmt = monthlyPayment + monthlyPropertyTax + monthlyInsurance + monthlyMaintenance;

  // Break-even rent (with property management at 8%)
  // Rent = (Fixed Costs) / (1 - 0.08 - 0.06) where 0.06 is vacancy
  const breakEvenRentWithMgmt = breakEvenRentNoMgmt / (1 - 0.08 - 0.06);

  // Break-even occupancy (at current rent estimate)
  const rentEstimate = getField("rentEstimate", 3500);
  const breakEvenOccupancy = breakEvenRentNoMgmt / rentEstimate;

  return {
    breakEvenRentNoMgmt: breakEvenRentNoMgmt,
    breakEvenRentWithMgmt: breakEvenRentWithMgmt,
    breakEvenOccupancy: breakEvenOccupancy,
    currentRent: rentEstimate,
    monthlyDebtService: monthlyPayment,
    monthlyOperatingExpenses: monthlyPropertyTax + monthlyInsurance + monthlyMaintenance
  };
}

/**
 * Compare multiple loan scenarios
 * @returns {Array} Array of loan scenario objects
 */
function compareLoanScenarios() {
  const purchasePrice = getField("purchasePrice", 0);
  const downPaymentPct = getField("downPayment", 20) / 100;
  const currentRate = getField("loanInterestRate", 7) / 100;

  const downPayment = purchasePrice * downPaymentPct;
  const loanAmount = purchasePrice - downPayment;

  const scenarios = [];

  // Scenario 1: 30-year fixed (current)
  scenarios.push(calculateLoanScenario(loanAmount, currentRate, 30, "30-Year Fixed"));

  // Scenario 2: 15-year fixed (typically 0.5% lower rate)
  scenarios.push(calculateLoanScenario(loanAmount, currentRate - 0.005, 15, "15-Year Fixed"));

  // Scenario 3: Interest-only (first 10 years)
  scenarios.push(calculateInterestOnlyScenario(loanAmount, currentRate, 10, 30, "Interest-Only (10yr)"));

  // Scenario 4: ARM 5/1 (0.5% lower initial rate)
  scenarios.push(calculateLoanScenario(loanAmount, currentRate - 0.005, 30, "ARM 5/1 (initial)"));

  return scenarios;
}

/**
 * Calculate loan scenario details
 * @param {number} loanAmount - Loan amount
 * @param {number} rate - Interest rate (decimal)
 * @param {number} years - Loan term in years
 * @param {string} name - Scenario name
 * @returns {Object} Loan scenario details
 */
function calculateLoanScenario(loanAmount, rate, years, name) {
  const monthlyRate = rate / 12;
  const totalMonths = years * 12;
  const monthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));

  const totalPayments = monthlyPayment * totalMonths;
  const totalInterest = totalPayments - loanAmount;

  // Calculate first year breakdown
  let balance = loanAmount;
  let firstYearInterest = 0;
  let firstYearPrincipal = 0;

  for (let month = 1; month <= 12; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
    firstYearInterest += interestPayment;
    firstYearPrincipal += principalPayment;
  }

  return {
    name: name,
    loanAmount: loanAmount,
    rate: rate,
    term: years,
    monthlyPayment: monthlyPayment,
    totalPayments: totalPayments,
    totalInterest: totalInterest,
    firstYearInterest: firstYearInterest,
    firstYearPrincipal: firstYearPrincipal,
    balanceAfterYear1: balance
  };
}

/**
 * Calculate interest-only loan scenario
 * @param {number} loanAmount - Loan amount
 * @param {number} rate - Interest rate (decimal)
 * @param {number} ioYears - Interest-only period in years
 * @param {number} totalYears - Total loan term in years
 * @param {string} name - Scenario name
 * @returns {Object} Interest-only loan scenario details
 */
function calculateInterestOnlyScenario(loanAmount, rate, ioYears, totalYears, name) {
  const monthlyRate = rate / 12;

  // Interest-only payment
  const ioMonthlyPayment = loanAmount * monthlyRate;
  const ioTotalPayments = ioMonthlyPayment * ioYears * 12;

  // After IO period, calculate amortizing payment
  const remainingMonths = (totalYears - ioYears) * 12;
  const amortMonthlyPayment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -remainingMonths));

  const amortTotalPayments = amortMonthlyPayment * remainingMonths;
  const totalPayments = ioTotalPayments + amortTotalPayments;
  const totalInterest = totalPayments - loanAmount;

  return {
    name: name,
    loanAmount: loanAmount,
    rate: rate,
    term: totalYears,
    ioYears: ioYears,
    ioMonthlyPayment: ioMonthlyPayment,
    amortMonthlyPayment: amortMonthlyPayment,
    monthlyPayment: ioMonthlyPayment, // First year payment
    totalPayments: totalPayments,
    totalInterest: totalInterest,
    firstYearInterest: ioMonthlyPayment * 12,
    firstYearPrincipal: 0,
    balanceAfterYear1: loanAmount
  };
}

/**
 * Generate Advanced Metrics Analysis sheet
 */
function generateAdvancedMetricsAnalysis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Advanced Metrics");

  if (!sheet) {
    sheet = ss.insertSheet("Advanced Metrics");
  }

  sheet.clearContents();

  // Title and timestamp - using standardized header formatting with merged cells
  const titleRange = sheet.getRange("A1:F1");
  titleRange.merge();
  titleRange.setValue("Advanced Financial Metrics");
  styleHeader(titleRange, 'h1');
  titleRange.setBackground("#1a73e8");
  titleRange.setFontColor("white");

  const timestampRange = sheet.getRange("A2:F2");
  timestampRange.merge();
  timestampRange.setValue("Generated: " + new Date().toLocaleString())
    .setFontSize(9)
    .setFontColor("#666666");

  let row = 4;

  // Section 1: Multi-Year Projections & IRR/NPV
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue("10-Year Cash Flow Projections")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  const projections = generateCashFlowProjections(10);
  const irr = calculateIRR(projections.cashFlows);
  const npv = calculateNPV(projections.cashFlows, 0.10); // 10% discount rate

  // Summary metrics
  const summaryData = [
    ["Initial Investment", -projections.cashFlows[0]],
    ["", ""],
    ["Internal Rate of Return (IRR)", irr],
    ["Net Present Value (NPV @ 10%)", npv],
    ["", ""],
    ["Total 10-Year Cash Flow", projections.yearlyData.reduce((sum, y) => sum + y.cashFlow, 0)],
    ["Final Property Value (Est.)", projections.yearlyData[9].propertyValue]
  ];

  sheet.getRange(row, 1, summaryData.length, 2).setValues(summaryData);
  sheet.getRange(row, 2).setNumberFormat('"$"#,##0');
  sheet.getRange(row + 2, 2).setNumberFormat("0.00%");
  sheet.getRange(row + 3, 2).setNumberFormat('"$"#,##0');
  sheet.getRange(row + 5, 2, 2, 1).setNumberFormat('"$"#,##0');

  row += summaryData.length + 2;

  // Year-by-year breakdown
  sheet.getRange(row, 1, 1, 6).merge()
    .setValue("Year-by-Year Breakdown")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  const headers = ["Year", "Annual Rent", "NOI", "Cash Flow", "Property Value", "Cumulative CF"];
  sheet.getRange(row, 1, 1, headers.length).setValues([headers])
    .setFontWeight("bold")
    .setBackground("#d9e2f3")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  const yearlyRows = projections.yearlyData.map(y => [
    y.year,
    y.rent,
    y.noi,
    y.cashFlow,
    y.propertyValue,
    y.cumulativeCashFlow
  ]);

  sheet.getRange(row, 1, yearlyRows.length, headers.length).setValues(yearlyRows);
  sheet.getRange(row, 2, yearlyRows.length, 5).setNumberFormat('"$"#,##0');

  row += yearlyRows.length + 2;

  // Section 2: Break-Even Analysis
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue("Break-Even Analysis")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  const breakEven = calculateBreakEven();

  const breakEvenData = [
    ["Current Monthly Rent", breakEven.currentRent],
    ["", ""],
    ["Break-Even Rent (No Mgmt)", breakEven.breakEvenRentNoMgmt],
    ["Break-Even Rent (With Mgmt)", breakEven.breakEvenRentWithMgmt],
    ["Break-Even Occupancy", breakEven.breakEvenOccupancy],
    ["", ""],
    ["Monthly Debt Service", breakEven.monthlyDebtService],
    ["Monthly Operating Expenses", breakEven.monthlyOperatingExpenses]
  ];

  sheet.getRange(row, 1, breakEvenData.length, 2).setValues(breakEvenData);
  [row, row + 2, row + 3, row + 6, row + 7].forEach(r => {
    sheet.getRange(r, 2).setNumberFormat('"$"#,##0');
  });
  sheet.getRange(row + 4, 2).setNumberFormat("0.00%");

  // Color code break-even occupancy
  const occupancyCell = sheet.getRange(row + 4, 2);
  if (breakEven.breakEvenOccupancy < 0.85) {
    occupancyCell.setBackground("#d4edda"); // Green - good
  } else if (breakEven.breakEvenOccupancy < 0.95) {
    occupancyCell.setBackground("#fff3cd"); // Yellow - caution
  } else {
    occupancyCell.setBackground("#f8d7da"); // Red - risky
  }

  row += breakEvenData.length + 2;

  // Section 3: Loan Scenario Comparison
  sheet.getRange(row, 1, 1, 6).merge()
    .setValue("Loan Scenario Comparison")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  const scenarios = compareLoanScenarios();

  const scenarioHeaders = ["Scenario", "Rate", "Term", "Monthly Payment", "Total Interest", "1st Year Interest"];
  sheet.getRange(row, 1, 1, scenarioHeaders.length).setValues([scenarioHeaders])
    .setFontWeight("bold")
    .setBackground("#d9e2f3")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  const scenarioRows = scenarios.map(s => [
    s.name,
    s.rate,
    s.term + " years",
    s.monthlyPayment,
    s.totalInterest,
    s.firstYearInterest
  ]);

  sheet.getRange(row, 1, scenarioRows.length, scenarioHeaders.length).setValues(scenarioRows);
  sheet.getRange(row, 2, scenarioRows.length, 1).setNumberFormat("0.00%");
  sheet.getRange(row, 4, scenarioRows.length, 3).setNumberFormat('"$"#,##0');

  // Highlight best scenario (lowest total interest)
  let minInterest = Math.min(...scenarios.map(s => s.totalInterest));
  for (let i = 0; i < scenarios.length; i++) {
    if (scenarios[i].totalInterest === minInterest) {
      sheet.getRange(row + i, 1, 1, scenarioHeaders.length).setBackground("#d4edda");
    }
  }

  // Set column widths
  sheet.setColumnWidth(1, 180);  // Scenario
  sheet.setColumnWidth(2, 80);   // Rate
  sheet.setColumnWidth(3, 100);  // Term
  sheet.setColumnWidth(4, 130);  // Monthly Payment
  sheet.setColumnWidth(5, 130);  // Total Interest
  sheet.setColumnWidth(6, 130);  // 1st Year Interest

  Logger.log("✅ Advanced Metrics Analysis generated");
}
