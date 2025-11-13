/**
 * Generate Flip Analysis Report
 * Includes: Project Summary, Cost Breakdown, Comps, Profit & ROI, Scenarios
 */
function generateFlipAnalysis(comps) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Flip Analysis");
  if (!sheet) return Logger.log("❌ Flip Analysis sheet not found.");

  sheet.clearContents();

  // Title and timestamp
  sheet.getRange("A1").setValue("Fix & Flip Analysis")
    .setFontWeight("bold")
    .setFontSize(16)
    .setBackground("#1a73e8")
    .setFontColor("white");
  sheet.getRange("A2").setValue("Generated: " + new Date().toLocaleString())
    .setFontSize(9)
    .setFontColor("#666666");
  let row = 4;

  // Get input values using dynamic field mapping
  const purchasePrice = getField("purchasePrice", 0);
  const downPaymentPct = getField("downPayment", 20) / 100;
  const interestRate = getField("loanInterestRate", 7) / 100;
  const loanTerm = getField("loanTerm", 30);
  const cashInvestment = getField("cashInvestment", 0);
  const helocAmount = getField("helocAmount", 0);
  const helocInterest = getField("helocInterest", 0.07);
  const rehabCost = getField("rehabCost", 0);
  const monthsToFlip = getField("monthsToFlip", 6);
  const downPayment = purchasePrice * downPaymentPct;
  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = interestRate / 12;
  const monthlyPI = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm * 12));
  const helocCost = helocAmount * helocInterest * (monthsToFlip / 12);
  const totalCashRequired = downPayment + rehabCost + cashInvestment;

  // --- Section 1: Project Summary ---
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue("Project Summary")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  const summaryData = [
    ["Purchase Price", purchasePrice],
    ["Down Payment (%)", downPaymentPct],
    ["Loan Amount", loanAmount],
    ["Interest Rate (%)", interestRate],
    ["Loan Term (Years)", loanTerm],
    ["Months to Flip", monthsToFlip],
    ["", ""],
    ["HELOC Interest Cost", helocCost],
    ["Total Cash Required", totalCashRequired]
  ];

  sheet.getRange(row, 1, summaryData.length, 2).setValues(summaryData);
  sheet.getRange(row, 1, summaryData.length, 1).setFontWeight("bold").setHorizontalAlignment("left");
  sheet.getRange(row, 2, summaryData.length, 1).setHorizontalAlignment("right");
  row += summaryData.length + 1;

  // --- Section 2: Rehab & Cost Breakdown ---
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue("Rehab & Cost Breakdown")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  // Get property tax and insurance values
  const propertyTaxRate = getField("propertyTaxRate", 0.0125);
  const insuranceMonthly = getField("insuranceMonthly", 100);
  const utilitiesCost = getField("utilitiesCost", 0);

  // Calculate holding costs (mortgage + HELOC + taxes + insurance + utilities)
  const monthlyPropertyTax = (purchasePrice * propertyTaxRate) / 12;
  const monthlyHoldingCosts = monthlyPI + (helocAmount * helocInterest / 12) + monthlyPropertyTax + insuranceMonthly + utilitiesCost;
  const holdingCost = monthlyHoldingCosts * monthsToFlip;

  const closingCosts = purchasePrice * 0.02;
  const contingency = rehabCost * 0.1;
  const totalRehab = rehabCost + contingency;
  const totalCosts = closingCosts + holdingCost + totalRehab + downPayment;

  const costData = [
    ["Rehab Cost (Base)", rehabCost],
    ["Contingency (10%)", contingency],
    ["Total Rehab Cost", totalRehab],
    ["Acquisition Costs (2%)", closingCosts],
    ["Holding Costs (Monthly)", monthlyHoldingCosts],
    ["  - Mortgage P&I", monthlyPI],
    ["  - HELOC Interest", helocAmount * helocInterest / 12],
    ["  - Property Tax", monthlyPropertyTax],
    ["  - Insurance", insuranceMonthly],
    ["  - Utilities", utilitiesCost],
    ["Total Holding Costs (" + monthsToFlip + " months)", holdingCost],
    ["Total Cash Required", totalCosts]
  ];

  const costStartRow = row;
  sheet.getRange(row, 1, costData.length, 2).setValues(costData);
  sheet.getRange(row, 1, costData.length, 1).setFontWeight("bold").setHorizontalAlignment("left");
  sheet.getRange(row, 2, costData.length, 1).setHorizontalAlignment("right");

  // Indent the breakdown items
  sheet.getRange(row + 5, 1, 5, 1).setFontWeight("normal").setFontStyle("italic");

  // Highlight total holding costs
  sheet.getRange(row + 10, 1, 1, 2).setBackground("#fff9e6");

  row += costData.length + 1;

  // --- Section 3: Comps (Auto-Fetched) ---
  sheet.getRange(row, 1, 1, 5).merge()
    .setValue("Comps Data (Auto-Fetched)")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  const compsHeaderRow = row;
  const compsHeaders = [["Address", "Sale Price", "SqFt", "Sale Date", "Distance"]];
  sheet.getRange(row, 1, 1, 5).setValues(compsHeaders);
  sheet.getRange(row, 1, 1, 5)
    .setFontWeight("bold")
    .setBackground("#d9e2f3")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  let arv = 0;
  if (!comps || comps.length === 0) {
    sheet.getRange(row + 1, 1).setValue("⚠️ No comps data returned from API.");
    arv = purchasePrice * 1.1;
  } else {
    // Separate remodeled and unremodeled comps
    const remodeledComps = comps.filter(c => c.condition === "remodeled");
    const unremodeledComps = comps.filter(c => c.condition === "unremodeled");

    // Calculate average prices for each category
    const avgRemodeled = remodeledComps.length > 0
      ? remodeledComps.reduce((sum, c) => sum + (c.price || 0), 0) / remodeledComps.length
      : 0;
    const avgUnremodeled = unremodeledComps.length > 0
      ? unremodeledComps.reduce((sum, c) => sum + (c.price || 0), 0) / unremodeledComps.length
      : 0;

    // Calculate renovation premium
    let renovationPremium = 1.15; // Default 15% premium
    if (avgRemodeled > 0 && avgUnremodeled > 0) {
      renovationPremium = avgRemodeled / avgUnremodeled;
      Logger.log(`📊 Calculated renovation premium: ${(renovationPremium * 100 - 100).toFixed(1)}%`);
    }

    // Use remodeled comps average as ARV (or apply premium to unremodeled if no remodeled comps)
    if (remodeledComps.length > 0) {
      arv = avgRemodeled;
    } else if (unremodeledComps.length > 0) {
      arv = avgUnremodeled * renovationPremium;
    } else {
      // Fallback: use all comps average
      arv = comps.reduce((sum, c) => sum + (c.price || 0), 0) / comps.length;
    }

    // Sort comps by distance if available
    const sortedComps = comps
      .map((c, index) => ({ ...c, originalIndex: index }))
      .sort((a, b) => {
        if (a.distance && b.distance) return a.distance - b.distance;
        return 0;
      });

    sortedComps.forEach((c, i) => {
      const rowNum = row + 1 + i;
      sheet.getRange(rowNum, 1).setValue(c.address || "—").setHorizontalAlignment("left");
      sheet.getRange(rowNum, 2).setValue(c.price || 0).setNumberFormat('"$"#,##0').setHorizontalAlignment("right");
      sheet.getRange(rowNum, 3).setValue(c.sqft || "—").setHorizontalAlignment("center");
      sheet.getRange(rowNum, 4).setValue(c.saleDate || "—").setHorizontalAlignment("center");
      sheet.getRange(rowNum, 5).setValue(c.distance ? c.distance.toFixed(2) + " mi" : "—").setHorizontalAlignment("center");

      // Highlight remodeled comps in green, unremodeled in yellow
      if (c.condition === "remodeled") {
        sheet.getRange(rowNum, 1, 1, 5)
          .setBackground("#e8f5e9")
          .setFontWeight("bold")
          .setBorder(true, true, true, true, false, false, "#cccccc", SpreadsheetApp.BorderStyle.SOLID);
        sheet.getRange(rowNum, 1).setNote("Remodeled comp");
      } else if (c.condition === "unremodeled") {
        sheet.getRange(rowNum, 1, 1, 5)
          .setBackground("#fff9c4")
          .setBorder(true, true, true, true, false, false, "#cccccc", SpreadsheetApp.BorderStyle.SOLID);
        sheet.getRange(rowNum, 1).setNote("Unremodeled comp");
      } else {
        sheet.getRange(rowNum, 1, 1, 5)
          .setBorder(true, true, true, true, false, false, "#cccccc", SpreadsheetApp.BorderStyle.SOLID);
      }
    });
  }
  row += (comps?.length || 1) + 3;

  // --- Section 4: Profit & ROI ---
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue("Profit & ROI Analysis")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  const sellCommission = arv * 0.05;
  const sellClosing = arv * 0.01;
  const totalSellCosts = sellCommission + sellClosing;
  const netProfit = arv - (purchasePrice + totalRehab + closingCosts + holdingCost + totalSellCosts);
  const roi = (netProfit / (cashInvestment + downPayment + rehabCost)); // will be formatted in %
  const mao = (arv * 0.7) - totalRehab;

  const profitData = [
    ["After Repair Value (ARV)", arv],
    ["Total Selling Costs (6%)", totalSellCosts],
    ["Net Profit ($)", netProfit],
    ["ROI (%)", roi],
    ["Max Allowable Offer (MAO)", mao]
  ];

  const profitStartRow = row;
  sheet.getRange(row, 1, profitData.length, 2).setValues(profitData);
  sheet.getRange(row, 1, profitData.length, 1).setFontWeight("bold").setHorizontalAlignment("left");
  sheet.getRange(row, 2, profitData.length, 1).setHorizontalAlignment("right");

  // Highlight key metrics
  sheet.getRange(row + 2, 1, 1, 2).setBackground("#fff3cd"); // Net Profit
  sheet.getRange(row + 3, 1, 1, 2).setBackground("#d1ecf1"); // ROI
  sheet.getRange(row + 4, 1, 1, 2).setBackground("#d4edda"); // MAO

  row += profitData.length + 1;

  // --- Section 5: Scenario Analysis ---
  const scenarioData = {
    baseARV: arv,
    baseRehab: totalRehab,
    baseProfit: netProfit,
    worstARV: arv * 0.9,
    worstRehab: totalRehab * 1.2,
    worstProfit: arv * 0.9 - (purchasePrice + totalRehab * 1.2 + closingCosts + holdingCost + totalSellCosts),
    bestARV: arv * 1.1,
    bestRehab: totalRehab * 0.9,
    bestProfit: arv * 1.1 - (purchasePrice + totalRehab * 0.9 + closingCosts + holdingCost + totalSellCosts),
  };

  row = generateScenarios(sheet, row, scenarioData); // ✅ only one heading now


  // --- Final Formatting ---
  const currencyNoDecimal = '"$"#,##0';
  const percentFormat = "0.00%";

  // Project Summary - Apply formats individually to avoid conflicts
  sheet.getRange(5, 2).setNumberFormat(currencyNoDecimal); // Purchase Price
  sheet.getRange(6, 2).setNumberFormat("0.00%"); // Down Payment %
  sheet.getRange(7, 2).setNumberFormat(currencyNoDecimal); // Loan Amount
  sheet.getRange(8, 2).setNumberFormat("0.00%"); // Interest Rate %
  sheet.getRange(9, 2).setNumberFormat("0"); // Loan Term (Years) - plain number
  sheet.getRange(10, 2).setNumberFormat("0"); // Months to Flip - plain number
  // Row 11 is spacer
  sheet.getRange(12, 2).setNumberFormat(currencyNoDecimal); // HELOC Interest Cost
  sheet.getRange(13, 2).setNumberFormat(currencyNoDecimal); // Total Cash Required

  // Rehab & Cost Breakdown - Apply currency format
  sheet.getRange(costStartRow, 2, costData.length, 1).setNumberFormat(currencyNoDecimal);

  // Format Profit & ROI section (using stored row positions)
  sheet.getRange(profitStartRow, 2).setNumberFormat(currencyNoDecimal); // ARV
  sheet.getRange(profitStartRow + 1, 2).setNumberFormat(currencyNoDecimal); // Total Selling Costs
  sheet.getRange(profitStartRow + 2, 2).setNumberFormat(currencyNoDecimal); // Net Profit
  sheet.getRange(profitStartRow + 3, 2).setNumberFormat(percentFormat); // ROI
  sheet.getRange(profitStartRow + 4, 2).setNumberFormat(currencyNoDecimal); // MAO

  // Set column widths
  sheet.setColumnWidth(1, 250);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 100);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 100);

  Logger.log("✅ Flip Analysis finalized with enhanced formatting.");
}

/**
 * Generate Rental Analysis Report
 * Includes: As-Is, After-Flip (BRRRR), Rental Comps, Scenarios
 */
function generateRentalAnalysis(comps) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Rental Analysis");
  if (!sheet) return Logger.log("❌ Rental Analysis sheet not found.");

  sheet.clearContents();

  // Title and timestamp
  sheet.getRange("A1").setValue("Rental Analysis Report")
    .setFontWeight("bold")
    .setFontSize(16)
    .setBackground("#1a73e8")
    .setFontColor("white");
  sheet.getRange("A2").setValue("Generated: " + new Date().toLocaleString())
    .setFontSize(9)
    .setFontColor("#666666");

  // Get input values using dynamic field mapping
  const purchasePrice = getField("purchasePrice", 0);
  const downPaymentPct = getField("downPayment", 20) / 100;
  const interestRate = getField("loanInterestRate", 7) / 100;
  const loanTerm = getField("loanTerm", 30);
  const cashInvestment = getField("cashInvestment", 0);
  const helocAmount = getField("helocAmount", 0);
  const helocInterest = getField("helocInterest", 0.07);
  const rehabCost = getField("rehabCost", 0);
  const rentEstimate = getField("rentEstimate", 3500);

  // Phase 3: Configurable rental parameters
  const vacancyRate = getField("vacancyRate", 6) / 100; // Default 6%
  const maintenanceRate = getField("maintenanceRate", 1) / 100; // Default 1% of property value
  const propertyManagementRate = getField("propertyManagementRate", 8) / 100; // Default 8%
  const includePropertyManagement = getField("includePropertyManagement", "Yes");
  const hoaFees = getField("hoaFees", 0);
  const utilitiesCost = getField("utilitiesCost", 0);

  const propertyTaxRate = getField("propertyTaxRate", 0.0125);
  const insuranceMonthly = getField("insuranceMonthly", 100);

  const downPayment = purchasePrice * downPaymentPct;
  const loanAmount = purchasePrice - downPayment;
  const monthlyRate = interestRate / 12;
  const monthlyPI = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm * 12));
  const helocMonthlyInterest = (helocAmount * helocInterest) / 12;
  const totalCashDeployed = downPayment + cashInvestment + rehabCost;
  let row = 4;

  // === Section 1: As-Is Rental ===
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue("Part 1 – As-Is Rental")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  // Annual calculations
  const grossIncome = rentEstimate * 12;
  const vacancyLoss = grossIncome * vacancyRate;
  const effectiveGrossIncome = grossIncome - vacancyLoss;

  // Operating expenses (annual) - Phase 3: Using configurable rates
  const propertyTaxes = propertyTaxRate * purchasePrice;
  const insurance = insuranceMonthly * 12;
  const maintenance = purchasePrice * maintenanceRate; // Configurable maintenance rate
  const propertyManagement = includePropertyManagement === "Yes"
    ? effectiveGrossIncome * propertyManagementRate
    : 0; // Conditional property management
  const hoaFeesAnnual = hoaFees * 12;
  const utilitiesAnnual = utilitiesCost * 12;
  const totalOperatingExpenses = propertyTaxes + insurance + maintenance + propertyManagement + hoaFeesAnnual + utilitiesAnnual;

  // Net Operating Income (before debt service)
  const NOI = effectiveGrossIncome - totalOperatingExpenses;
  const capRate = NOI / purchasePrice; // Will be formatted as % later

  // Cash flow after debt service
  const annualDebtService = (monthlyPI + helocMonthlyInterest) * 12;
  const asIsAnnualCashFlow = NOI - annualDebtService;
  const asIsMonthlyCashFlow = asIsAnnualCashFlow / 12;
  const cocReturn = asIsAnnualCashFlow / totalCashDeployed; // Will be formatted as % later

  // DSCR (Debt Service Coverage Ratio) - Phase 2 Enhancement
  const DSCR = NOI / annualDebtService;

  // Return on Time Invested - Phase 2 Enhancement
  const monthsToFlip = getField("monthsToFlip", 6);
  const returnOnTime = (cocReturn * 100) / monthsToFlip; // ROI per month

  const asIsData = [
    ["Purchase Price", purchasePrice],
    ["Monthly Rent (Est.)", rentEstimate],
    ["", ""], // Spacer
    ["Net Operating Income (NOI)", NOI],
    ["Annual Debt Service", annualDebtService],
    ["", ""], // Spacer
    ["Cap Rate (%)", capRate],
    ["Cash-on-Cash Return (%)", cocReturn],
    ["DSCR (Debt Service Coverage)", DSCR],
    ["Return on Time (% per month)", returnOnTime / 100],
    ["HELOC Monthly Interest ($)", helocMonthlyInterest]
  ];

  sheet.getRange(row, 1, asIsData.length, 2).setValues(asIsData);
  sheet.getRange(row, 1, asIsData.length, 1).setFontWeight("bold").setHorizontalAlignment("left");
  sheet.getRange(row, 2, asIsData.length, 1).setHorizontalAlignment("right");

  // Highlight key metrics
  sheet.getRange(row + 3, 1, 1, 2).setBackground("#fff9e6"); // NOI
  sheet.getRange(row + 7, 1, 1, 2).setBackground("#d1ecf1"); // Cash-on-Cash Return

  row += asIsData.length + 2;

  // === Section 2: After-Flip (BRRRR) ===
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue("Part 2 – After-Flip (BRRRR)")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;
  const flipSheet = ss.getSheetByName("Flip Analysis");
  const ARV = flipSheet?.getRange("B25").getValue() || purchasePrice * 1.1;
  const newRent = rentEstimate * 1.15;

  // BRRRR calculations (after renovation)
  const newGrossIncome = newRent * 12;
  const newVacancyLoss = newGrossIncome * vacancyRate;
  const newEffectiveGrossIncome = newGrossIncome - newVacancyLoss;

  const newTaxes = propertyTaxRate * ARV;
  const newInsurance = insurance * 1.1;
  const newMaintenance = ARV * maintenanceRate; // Configurable maintenance rate
  const newPropertyManagement = includePropertyManagement === "Yes"
    ? newEffectiveGrossIncome * propertyManagementRate
    : 0; // Conditional property management
  const newHoaFeesAnnual = hoaFees * 12;
  const newUtilitiesAnnual = utilitiesCost * 12;
  const newTotalOperatingExpenses = newTaxes + newInsurance + newMaintenance + newPropertyManagement + newHoaFeesAnnual + newUtilitiesAnnual;

  const newNOI = newEffectiveGrossIncome - newTotalOperatingExpenses;
  const newCapRate = newNOI / ARV; // Will be formatted as % later
  const newLoanAmount = ARV * (1 - downPaymentPct);
  const newMonthlyPI = (newLoanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -loanTerm * 12));
  const newCashFlow = newNOI / 12 - newMonthlyPI - helocMonthlyInterest;
  const newCoC = (newCashFlow * 12) / totalCashDeployed; // Will be format in % later

  // DSCR for BRRRR - Phase 2 Enhancement
  const newAnnualDebtService = (newMonthlyPI + helocMonthlyInterest) * 12;
  const newDSCR = newNOI / newAnnualDebtService;

  // Return on Time Invested for BRRRR - Phase 2 Enhancement
  const newReturnOnTime = (newCoC * 100) / monthsToFlip;

  const brrrrData = [
    ["After Repair Value (ARV)", ARV],
    ["Post-Flip Monthly Rent (Est.)", newRent],
    ["", ""], // Spacer
    ["Net Operating Income (NOI)", newNOI],
    ["Annual Debt Service", newAnnualDebtService],
    ["", ""], // Spacer
    ["Cap Rate (%)", newCapRate],
    ["Cash-on-Cash Return (%)", newCoC],
    ["DSCR (Debt Service Coverage)", newDSCR],
    ["Return on Time (% per month)", newReturnOnTime / 100]
  ];

  sheet.getRange(row, 1, brrrrData.length, 2).setValues(brrrrData);
  sheet.getRange(row, 1, brrrrData.length, 1).setFontWeight("bold").setHorizontalAlignment("left");
  sheet.getRange(row, 2, brrrrData.length, 1).setHorizontalAlignment("right");

  // Highlight key metrics
  sheet.getRange(row + 3, 1, 1, 2).setBackground("#fff9e6"); // NOI
  sheet.getRange(row + 7, 1, 1, 2).setBackground("#d1ecf1"); // Cash-on-Cash Return

  row += brrrrData.length + 2;

  // === Section 3: Profit & ROI Analysis ===
  sheet.getRange(row, 1, 1, 2).merge()
    .setValue("Profit & ROI Analysis")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  const annualCashFlow = newCashFlow * 12;
  const roi = (annualCashFlow / totalCashDeployed); // Will be format in % later
  const profitData = [
    ["Annual Cash Flow ($)", annualCashFlow],
    ["ROI (%)", roi]
  ];

  sheet.getRange(row, 1, profitData.length, 2).setValues(profitData);
  sheet.getRange(row, 1, profitData.length, 1).setFontWeight("bold").setHorizontalAlignment("left");
  sheet.getRange(row, 2, profitData.length, 1).setHorizontalAlignment("right");

  // Highlight key metrics
  sheet.getRange(row, 1, 1, 2).setBackground("#d4edda"); // Annual Cash Flow
  sheet.getRange(row + 1, 1, 1, 2).setBackground("#d1ecf1"); // ROI

  row += profitData.length + 2;

  // === Section 4: Scenario Analysis ===
  const scenarioData = {
    baseARV: ARV,
    baseRehab: rehabCost,
    baseProfit: annualCashFlow,
    worstARV: ARV * 0.9,
    worstRehab: rehabCost * 1.2,
    worstProfit: annualCashFlow * 0.9,
    bestARV: ARV * 1.1,
    bestRehab: rehabCost * 0.9,
    bestProfit: annualCashFlow * 1.1
  };
  generateScenarios(sheet, row, scenarioData); // uses same layout as Flip Analysis

  // === Final Formatting ===
  const currencyNoDecimal = '"$"#,##0';
  const percentFormat = "0.00%";

  // Apply currency formatting to all monetary values in As-Is section
  sheet.getRange(5, 2).setNumberFormat(currencyNoDecimal); // Purchase Price
  sheet.getRange(6, 2).setNumberFormat(currencyNoDecimal); // Monthly Rent
  sheet.getRange(8, 2).setNumberFormat(currencyNoDecimal); // NOI
  sheet.getRange(9, 2).setNumberFormat(currencyNoDecimal); // Annual Debt Service
  sheet.getRange(14, 2).setNumberFormat(currencyNoDecimal); // HELOC Interest

  // Apply percentage formatting to As-Is section
  sheet.getRange(11, 2).setNumberFormat(percentFormat); // Cap Rate
  sheet.getRange(12, 2).setNumberFormat(percentFormat); // Cash-on-Cash Return
  sheet.getRange(13, 2).setNumberFormat("0.00"); // DSCR
  sheet.getRange(14, 2).setNumberFormat(percentFormat); // Return on Time

  // Apply currency formatting to BRRRR section
  const brrrrStartRow = 17;
  sheet.getRange(brrrrStartRow, 2).setNumberFormat(currencyNoDecimal); // ARV
  sheet.getRange(brrrrStartRow + 1, 2).setNumberFormat(currencyNoDecimal); // Post-Flip Rent
  sheet.getRange(brrrrStartRow + 3, 2).setNumberFormat(currencyNoDecimal); // NOI
  sheet.getRange(brrrrStartRow + 4, 2).setNumberFormat(currencyNoDecimal); // Annual Debt Service

  // Apply percentage formatting to BRRRR section
  sheet.getRange(brrrrStartRow + 6, 2).setNumberFormat(percentFormat); // Cap Rate
  sheet.getRange(brrrrStartRow + 7, 2).setNumberFormat(percentFormat); // Cash-on-Cash Return
  sheet.getRange(brrrrStartRow + 8, 2).setNumberFormat("0.00"); // DSCR
  sheet.getRange(brrrrStartRow + 9, 2).setNumberFormat(percentFormat); // Return on Time

  // Apply formatting to Profit & ROI section
  const profitStartRow = brrrrStartRow + 12;
  sheet.getRange(profitStartRow, 2).setNumberFormat(currencyNoDecimal); // Annual Cash Flow
  sheet.getRange(profitStartRow + 1, 2).setNumberFormat(percentFormat); // ROI

  // Set column widths
  sheet.setColumnWidth(1, 250);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 120);
  sheet.setColumnWidth(4, 120);

  Logger.log("✅ Rental Analysis with enhanced formatting completed.");
}

/**
 * Generate the Scenario Analysis section for a sheet.
 * Dynamically builds a clean, labeled section with proper formatting.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - The sheet to write into.
 * @param {number} startRow - The row to begin writing at.
 * @param {Object} values - The data object with base/worst/best metrics.
 * @returns {number} - The next empty row after this section.
 */
function generateScenarios(sheet, startRow, values) {
  let row = startRow;

  // Title
  sheet.getRange(row, 1, 1, 4).merge()
    .setValue("Scenario Analysis")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row += 2;

  // Headers
  const headers = [["Scenario", "ARV ($)", "Rehab Cost ($)", "Profit ($)"]];
  sheet.getRange(row, 1, 1, 4).setValues(headers);
  sheet.getRange(row, 1, 1, 4)
    .setFontWeight("bold")
    .setBackground("#d9e2f3")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  // Rows
  const scenarios = [
    { name: "Base Case", color: "#ffffff", arv: values.baseARV, rehab: values.baseRehab, profit: values.baseProfit },
    { name: "Worst Case (ARV -10%, Rehab +20%)", color: "#fef3f3", arv: values.worstARV, rehab: values.worstRehab, profit: values.worstProfit },
    { name: "Best Case (ARV +10%, Rehab -10%)", color: "#f3fef6", arv: values.bestARV, rehab: values.bestRehab, profit: values.bestProfit },
  ];

  const scenarioStartRow = row;
  scenarios.forEach((s, index) => {
    const currentRow = row + index;
    sheet.getRange(currentRow, 1).setValue(s.name).setHorizontalAlignment("left");
    sheet.getRange(currentRow, 2).setValue(Math.round(s.arv)).setHorizontalAlignment("right");
    sheet.getRange(currentRow, 3).setValue(Math.round(s.rehab)).setHorizontalAlignment("right");
    sheet.getRange(currentRow, 4).setValue(Math.round(s.profit)).setHorizontalAlignment("right");
    sheet.getRange(currentRow, 1, 1, 4)
      .setBackground(s.color)
      .setBorder(true, true, true, true, false, false, "#cccccc", SpreadsheetApp.BorderStyle.SOLID);
  });

  // Apply currency formatting to numeric columns
  const currencyFormat = '"$"#,##0';
  sheet.getRange(scenarioStartRow, 2, scenarios.length, 3).setNumberFormat(currencyFormat);

  row += scenarios.length + 2;
  return row;
}
