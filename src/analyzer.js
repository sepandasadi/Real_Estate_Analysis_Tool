/**
 * Generate Flip Analysis Report
 * Includes: Project Summary, Cost Breakdown, Comps, Profit & ROI, Scenarios
 */
function generateFlipAnalysis(comps) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Flip Analysis");
  if (!sheet) return Logger.log("❌ Flip Analysis sheet not found.");

  sheet.clearContents();
  sheet.getRange("A1").setValue("Fix & Flip Analysis").setFontWeight("bold").setFontSize(14);
  sheet.getRange("A2").setValue("Generated: " + new Date().toLocaleString());
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
  sheet.getRange(row, 1).setValue("Project Summary")
    .setFontWeight("bold").setBackground("#f2f2f2");
  row++;
  sheet.getRange(row, 1).setValue("Purchase Price"); sheet.getRange(row++, 2).setValue(purchasePrice);
  sheet.getRange(row, 1).setValue("Down Payment (%)").setFontWeight("normal");
  sheet.getRange(row, 2).setValue(downPaymentPct * 100).setFontWeight("normal");
  row++;
  sheet.getRange(row, 1).setValue("Loan Amount"); sheet.getRange(row++, 2).setValue(loanAmount);
  sheet.getRange(row, 1).setValue("Interest Rate (%)"); sheet.getRange(row++, 2).setValue(interestRate * 100);
  sheet.getRange(row, 1).setValue("Loan Term (Years)"); sheet.getRange(row++, 2).setValue(loanTerm);
  sheet.getRange(row, 1).setValue("Months to Flip"); sheet.getRange(row++, 2).setValue(monthsToFlip);
  row++;
  sheet.getRange(row, 1).setValue("HELOC Interest Cost"); sheet.getRange(row++, 2).setValue(helocCost).setNumberFormat('"$"#,##0');
  sheet.getRange(row, 1).setValue("Total Cash Required"); sheet.getRange(row++, 2).setValue(totalCashRequired);

  // --- Section 2: Rehab & Cost Breakdown ---
  sheet.getRange(row, 1).setValue("Rehab & Cost Breakdown")
    .setFontWeight("bold").setBackground("#f2f2f2");
  row++;
  const closingCosts = purchasePrice * 0.02;
  const holdingCost = monthlyPI * monthsToFlip + helocCost;
  const contingency = rehabCost * 0.1;
  const totalRehab = rehabCost + contingency;
  const totalCosts = closingCosts + holdingCost + totalRehab + downPayment;

  sheet.getRange(row, 1).setValue("Rehab Cost (Base)").setFontWeight("normal");
  sheet.getRange(row, 2).setValue(rehabCost).setFontWeight("normal");
  row++;
  sheet.getRange(row, 1).setValue("Contingency (10%)"); sheet.getRange(row++, 2).setValue(contingency);
  sheet.getRange(row, 1).setValue("Total Rehab Cost"); sheet.getRange(row++, 2).setValue(totalRehab);
  sheet.getRange(row, 1).setValue("Acquisition Costs (2%)"); sheet.getRange(row++, 2).setValue(closingCosts);
  sheet.getRange(row, 1).setValue("Holding Costs"); sheet.getRange(row++, 2).setValue(holdingCost);
  sheet.getRange(row, 1).setValue("Total Cash Required"); sheet.getRange(row++, 2).setValue(totalCosts);
  row++;

  // --- Section 3: Comps (Auto-Fetched) ---
  sheet.getRange(row, 1).setValue("Comps Data (Auto-Fetched)")
    .setFontWeight("bold").setBackground("#f2f2f2");
  row++;
  sheet.getRange(row, 1).setValue("Address");
  sheet.getRange(row, 2).setValue("Sale Price");
  sheet.getRange(row, 3).setValue("SqFt");
  sheet.getRange(row, 1, 1, 3).setFontWeight("bold").setBackground("#d9e2f3");

  let arv = 0;
  if (!comps || comps.length === 0) {
    sheet.getRange(row + 1, 1).setValue("⚠️ No comps data returned from API.");
    arv = purchasePrice * 1.1;
  } else {
    let total = 0;
    comps.forEach((c, i) => {
      sheet.getRange(row + 1 + i, 1).setValue(c.address || "—");
      sheet.getRange(row + 1 + i, 2).setValue(c.price || 0);
      sheet.getRange(row + 1 + i, 3).setValue(c.sqft || "—");
      total += c.price || 0;
    });
    arv = total / comps.length;
  }
  row += (comps?.length || 1) + 3;

  // --- Section 4: Profit & ROI ---
  sheet.getRange(row, 1).setValue("Profit & ROI Analysis")
    .setFontWeight("bold").setBackground("#f2f2f2");
  row++;

  const sellCommission = arv * 0.05;
  const sellClosing = arv * 0.01;
  const totalSellCosts = sellCommission + sellClosing;
  const netProfit = arv - (purchasePrice + totalRehab + closingCosts + holdingCost + totalSellCosts);
  const roi = (netProfit / (cashInvestment + downPayment + rehabCost)); // will be formatted in %
  const mao = (arv * 0.7) - totalRehab;

  sheet.getRange(row, 1).setValue("After Repair Value (ARV)"); sheet.getRange(row++, 2).setValue(arv);
  sheet.getRange(row, 1).setValue("Total Selling Costs (6%)"); sheet.getRange(row++, 2).setValue(totalSellCosts);
  sheet.getRange(row, 1).setValue("Net Profit ($)");           sheet.getRange(row++, 2).setValue(netProfit);
  sheet.getRange(row, 1).setValue("ROI (%)");                  sheet.getRange(row++, 2).setValue(roi);
  sheet.getRange(row, 1).setValue("Max Allowable Offer (MAO)");sheet.getRange(row++, 2).setValue(mao);
  row++;

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


  sheet.autoResizeColumns(1, 6);

  // --- Final Formatting ---
  const currencyNoDecimal = '"$"#,##0';
  const percentNoDecimal = "0%";
  const currencyRanges = [
    "B19", "B20", "B29", "B32",
    "B38:B39", "C38:C39", "D38:D39", "E38:E39"
  ];
  currencyRanges.forEach(r => {
    try { sheet.getRange(r).setNumberFormat(currencyNoDecimal); } catch(e){}
  });
  sheet.getRange("B31").setNumberFormat(percentNoDecimal);

  Logger.log("✅ Flip Analysis finalized (no duplicates, cleaned visuals).");
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
  sheet.getRange("A1").setValue("Rental Analysis Report").setFontWeight("bold").setFontSize(14);
  sheet.getRange("A2").setValue("Generated: " + new Date().toLocaleString());

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
  const vacancyRate = getField("vacancyRate", 0.06);
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
  sheet.getRange(row++,1).setValue("Part 1 – As-Is Rental").setFontWeight("bold").setBackground("#f2f2f2");
  row++;

  // Annual calculations
  const grossIncome = rentEstimate * 12;
  const vacancyLoss = grossIncome * vacancyRate;
  const effectiveGrossIncome = grossIncome - vacancyLoss;

  // Operating expenses (annual)
  const propertyTaxes = propertyTaxRate * purchasePrice;
  const insurance = insuranceMonthly * 12;
  const maintenance = purchasePrice * 0.01; // 1% of property value annually (industry standard)
  const propertyManagement = effectiveGrossIncome * 0.08; // 8% of effective gross income
  const totalOperatingExpenses = propertyTaxes + insurance + maintenance + propertyManagement;

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
  sheet.getRange(row,1,asIsData.length,2).setValues(asIsData);
  row += asIsData.length + 2;

  // === Section 2: After-Flip (BRRRR) ===
  sheet.getRange(row++,1).setValue("Part 2 – After-Flip (BRRRR)").setFontWeight("bold").setBackground("#f2f2f2");
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
  const newMaintenance = ARV * 0.01; // 1% of ARV annually
  const newPropertyManagement = newEffectiveGrossIncome * 0.08; // 8% of effective gross income
  const newTotalOperatingExpenses = newTaxes + newInsurance + newMaintenance + newPropertyManagement;

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
  sheet.getRange(row,1,brrrrData.length,2).setValues(brrrrData);
  row += brrrrData.length + 2;

  // === Section 3: Profit & ROI Analysis ===
  sheet.getRange(row++,1).setValue("Profit & ROI Analysis").setFontWeight("bold").setBackground("#f2f2f2");
  row++;
  const annualCashFlow = newCashFlow * 12;
  const roi = (annualCashFlow / totalCashDeployed); // Will be format in % later
  const profitData = [
    ["Annual Cash Flow ($)", annualCashFlow],
    ["ROI (%)", roi]
  ];
  sheet.getRange(row,1,profitData.length,2).setValues(profitData);
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

  // === Formatting ===
  const currencyNoDecimal = '"$"#,##0';
  const percentNoDecimal = "0%";
  sheet.getRange(1,1,sheet.getMaxRows(),sheet.getMaxColumns()).
  setBorder(false,false,false,false,false,false);

  // Currency formatting for NOI and debt service
  ["B7","B8","B10","B18","B19", "B27"].forEach(r=>{try{sheet.getRange(r).
  setNumberFormat(currencyNoDecimal);}catch(e){}});

  // Percentage formatting for rates and returns
  ["B10","B11","B12","B13","B21","B22","B23","B24", "B28", "B29"].forEach(r=>{try{sheet.getRange(r).
  setNumberFormat(percentNoDecimal);}catch(e){}});

  // DSCR formatting (2 decimal places)
  ["B12","B23"].forEach(r=>{try{sheet.getRange(r).
  setNumberFormat("0.00");}catch(e){}});

  // Normal font weight for data cells
  ["A7","A8","A10","A11","A12","A13","A14","B7","B8","B10","B11","B12","B13","B14",
   "A18","A19","A21","A22","A23","A24","B18","B19","B21","B22","B23","B24",
   "A27","A28","A29","B27","B28","B29"].forEach(r=>sheet.getRange(r).
  setFontWeight("normal"));

  sheet.autoResizeColumns(1,4);

  Logger.log("✅ Rental Analysis with Profit & ROI + Scenario Analysis completed.");
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
  sheet.getRange(row, 1).setValue("Scenario Analysis").setFontWeight("bold").setFontSize(12);
  sheet.getRange(row, 1, 1, 3).setBackground("#e8f0fe");
  row += 2;

  // Headers
  sheet.getRange(row, 1).setValue("Scenario");
  sheet.getRange(row, 2).setValue("ARV ($)");
  sheet.getRange(row, 3).setValue("Rehab Cost ($)");
  sheet.getRange(row, 4).setValue("Profit ($)");
  sheet.getRange(row, 1, 1, 4)
    .setFontWeight("bold")
    .setBackground("#d9e2f3")
    .setBorder(true, true, true, true, true, true);
  row++;

  // Rows
  const scenarios = [
    { name: "Base Case", color: "#ffffff", arv: values.baseARV, rehab: values.baseRehab, profit: values.baseProfit },
    { name: "Worst Case (ARV -10%, Rehab +20%)", color: "#fef3f3", arv: values.worstARV, rehab: values.worstRehab, profit: values.worstProfit },
    { name: "Best Case (ARV +10%, Rehab -10%)", color: "#f3fef6", arv: values.bestARV, rehab: values.bestRehab, profit: values.bestProfit },
  ];

  scenarios.forEach((s) => {
    sheet.getRange(row, 1).setValue(s.name);
    sheet.getRange(row, 2).setValue(Math.round(s.arv));
    sheet.getRange(row, 3).setValue(Math.round(s.rehab));
    sheet.getRange(row, 4).setValue(Math.round(s.profit));
    sheet.getRange(row, 1, 1, 4).setBackground(s.color).setBorder(true, true, true, true, false, false);
    row++;
  });

  row += 2;
  return row;
}
