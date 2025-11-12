// /**
//  * ===============================
//  * MAIN SCRIPT – REI Tools System
//  * ===============================
//  */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("REI Tools")
    .addItem("Open Sidebar", "openSidebar")
    .addSeparator()
    .addItem("Run Full Analysis", "menuRunAnalysis")
    .addItem("🔄 Refresh Comps (Force)", "refreshComps")
    .addSeparator()
    .addItem("Format all tabs", "formatAllTabs")
    .addSeparator()
    .addSubMenu(ui.createMenu("Amortization")
      .addItem("First Year (12 months)", "generateFirstYearAmortization")
      .addItem("Full Loan Term", "generateFullAmortizationSchedule"))
    .addSeparator()
    .addSubMenu(ui.createMenu("Advanced Tools")
      .addItem("Tax Benefits & Depreciation", "generateTaxBenefitsAnalysis")
      .addItem("Advanced Metrics (IRR, NPV, Break-Even)", "generateAdvancedMetricsAnalysis")
      .addItem("Flip Enhancements (Timeline, Partners, Renovation)", "generateFlipEnhancements")
      .addItem("🏠 Auto-Populate Expenses (Tax & Insurance)", "autoPopulateExpenses")
      .addItem("📊 Compare State Expenses", "compareStateExpenses")
      .addItem("🔍 Filter Comps (Date, Distance, Type)", "createFilteredCompsView"))
    .addSeparator()
    .addSubMenu(ui.createMenu("Protect/Unlock")
      .addItem("Protect (Warning-only)", "protectSheetsWarning")
      .addItem("Protect (Hard Lock)", "protectSheetsLock")
      .addItem("Unlock", "unprotectAll"))
    .addSeparator()
    .addItem("🧹 Clear Sheets", "clearSheets")
    .addToUi();
}

// /**
//  * Open the REI Assistant Sidebar
//  */
function openSidebar() {
  const html = HtmlService.createHtmlOutputFromFile("Sidebar")
    .setTitle("REI Assistant");
  SpreadsheetApp.getUi().showSidebar(html);
}

function runAnalysis(data) {
  Logger.log("▶️ runAnalysis() started");

  if (!data) {
    SpreadsheetApp.getUi().alert("No sidebar data received.");
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inputs = ss.getSheetByName("Inputs");
  if (!inputs) {
    Logger.log("❌ Inputs sheet not found");
    return;
  }

  // --- Calculate HELOC / Loan Amount ---
  const downPayment = (data.purchasePrice || 0) * (data.downPayment / 100 || 0.2);
  const totalProjectCost = downPayment + (data.rehabCost || 0);
  const helocAmount = Math.max(0, totalProjectCost - (data.cashInvestment || 0));

  // ✅ Write all fields using dynamic field mapping
  try {
    // Property Info
    setField("address", data.address || "");
    setField("city", data.city || "");
    setField("state", data.state || "");
    setField("zip", data.zip || "");

    // Acquisition & Financing
    setField("purchasePrice", data.purchasePrice || "");
    setField("downPayment", data.downPayment || "");
    setField("loanInterestRate", data.loanInterestRate || "");
    setField("loanTerm", data.loanTerm || "");
    setField("cashInvestment", data.cashInvestment || 0, '"$"#,##0');
    setField("helocAmount", helocAmount, '"$"#,##0');
    setField("helocInterest", data.helocInterest / 100 || 0, "0.00%");

    // Rehab & Timeline
    setField("rehabCost", data.rehabCost || "");
    setField("monthsToFlip", data.monthsToFlip || "", "@");

    // Contingency (10% of rehab)
    const contingency = data.rehabCost ? data.rehabCost * 0.1 : 0;
    setField("contingency", contingency, '"$"#,##0');

    // Rental Inputs defaults (if empty)
    const propertyTaxRate = 1.25; // %
    const insuranceMonthly = 100; // $
    const vacancyRate = 6; // %
    const estRent = 3500; // $
    const utilitiesCost = 150; // $ per month

    setField("propertyTaxRate", propertyTaxRate / 100, "0.00%");
    setField("insuranceMonthly", insuranceMonthly, '"$"#,##0');
    setField("vacancyRate", vacancyRate / 100, "0.00%");
    setField("rentEstimate", estRent, '"$"#,##0');
    setField("utilitiesCost", utilitiesCost, '"$"#,##0');

    // Output References (auto-linked after analysis)
    // Note: These still use cell references for formulas, but we get the refs dynamically
    const baseARVRef = getFieldRef("baseARV");
    const netProfitRef = getFieldRef("netProfit");
    const capRateRef = getFieldRef("capRate");
    const cocReturnRef = getFieldRef("cocReturn");

    // Note: These formulas will be set after analysis runs
    // We'll use INDIRECT to find the values by label
    if (baseARVRef) {
      const r = inputs.getRange(baseARVRef);
      r.setFormula('=IFERROR(INDEX(\'Flip Analysis\'!B:B,MATCH("After Repair Value (ARV)",\'Flip Analysis\'!A:A,0)),0)');
      r.setNumberFormat('"$"#,##0');
    }
    if (netProfitRef) {
      const r = inputs.getRange(netProfitRef);
      r.setFormula('=IFERROR(INDEX(\'Flip Analysis\'!B:B,MATCH("Net Profit ($)",\'Flip Analysis\'!A:A,0)),0)');
      r.setNumberFormat('"$"#,##0');
    }
    if (capRateRef) {
      const r = inputs.getRange(capRateRef);
      r.setFormula('=IFERROR(INDEX(\'Rental Analysis\'!B:B,MATCH("Cap Rate (%)",\'Rental Analysis\'!A:A,0)),0)');
      r.setNumberFormat("0%");
    }
    if (cocReturnRef) {
      const r = inputs.getRange(cocReturnRef);
      r.setFormula('=IFERROR(INDEX(\'Rental Analysis\'!B:B,MATCH("Cash-on-Cash Return (%)",\'Rental Analysis\'!A:A,0)),0)');
      r.setNumberFormat("0%");
    }

    Logger.log("✅ All sidebar data written to Inputs tab using dynamic field mapping");
  } catch (e) {
    Logger.log("❌ Failed writing to Inputs tab: " + e);
  }

  // Step 1: Fetch Comps (Sale + Rental)
  const comps = fetchCompsData(data); // from apiBridge or apiOpenAI
  Logger.log("runAnalysis got comps count: " + (comps ? comps.length : 0));

  // Step 2: Run Flip Analysis
  generateFlipAnalysis(comps);

  // Step 3: Run Rental Analysis (As-Is + BRRRR)
  generateRentalAnalysis(comps);

  // Step 4: Generate Scenarios automatically (embedded in analysis tabs)
  // Note: generateScenarios() is called within generateFlipAnalysis and generateRentalAnalysis

  // Step 5: Generate Flip Sensitivity Matrix
  generateFlipSensitivityFromInputs();

  // Step 6: Generate Amortization Schedule (Phase 2 Enhancement)
  generateFirstYearAmortization();

  // Step 7: Generate Tax Benefits Analysis (Phase 2 Enhancement)
  generateTaxBenefitsAnalysis();

  // Step 8: Generate Advanced Metrics Analysis (Phase 2 Enhancement)
  generateAdvancedMetricsAnalysis();

  // Step 9: Generate Flip Enhancements (Phase 3 Enhancement)
  generateFlipEnhancements();

  SpreadsheetApp.getUi().alert("✅ Analysis complete! All tabs updated.\n\nIncludes: Flip & Rental Analysis, Sensitivity, Amortization, Tax Benefits, Advanced Metrics, and Flip Enhancements.");
}

/**
 * Phase 3: Refresh Comps - Force fetch new comps data bypassing cache
 */
function refreshComps() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inputs = ss.getSheetByName("Inputs");

  if (!inputs) {
    SpreadsheetApp.getUi().alert("❌ Inputs sheet not found");
    return;
  }

  // Get property data from Inputs sheet
  const data = {
    address: getField("address", ""),
    city: getField("city", ""),
    state: getField("state", ""),
    zip: getField("zip", "")
  };

  // Validate required fields
  if (!data.address || !data.city || !data.state || !data.zip) {
    SpreadsheetApp.getUi().alert("⚠️ Please fill in property address, city, state, and zip in the Inputs tab first.");
    return;
  }

  // Clear cache for this property
  clearCachedComps(data.address, data.city, data.state, data.zip);

  // Fetch fresh comps (forceRefresh = true)
  const comps = fetchCompsData(data, true);

  if (!comps || comps.length === 0) {
    SpreadsheetApp.getUi().alert("⚠️ No comps data returned. Please check your API configuration.");
    return;
  }

  // Regenerate analysis with fresh comps
  generateFlipAnalysis(comps);
  generateRentalAnalysis(comps);

  SpreadsheetApp.getUi().alert(`✅ Comps refreshed! Found ${comps.length} comparable properties.\n\nFlip and Rental analysis updated.`);
}

/**
 * Clears all analysis tabs back to blank state
 */
function clearSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tabsToClear = [
    "Flip Analysis",
    "Rental Analysis",
    "Flip Sensitivity (ARV vs Rehab)",
    "Amortization Schedule",
    "Tax Benefits",
    "Advanced Metrics",
    "Flip Timeline",
    "Partner Profit Split",
    "Renovation Timeline"
  ];

  tabsToClear.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet) {
      const nameLower = name.toLowerCase();
      sheet.clearContents();

      if (nameLower.includes("flip analysis")) {
        sheet.getRange("A1").setValue("Fix & Flip Analysis").setFontWeight("bold").setFontSize(14);
      } else if (nameLower.includes("rental")) {
        sheet.getRange("A1").setValue("Rental Analysis").setFontWeight("bold").setFontSize(14);
      } else if (nameLower.includes("sensitivity")) {
        sheet.getRange("A1").setValue("Flip Sensitivity (ARV vs Rehab)").setFontWeight("bold").setFontSize(14);
      }
    }
  });

  // Uncomment if you also want to reset Inputs tab:
  const inputs = ss.getSheetByName("Inputs");
  if (inputs) inputs.getRange("B2:B28").clearContent();

  SpreadsheetApp.getUi().alert("🧹 All analysis sheets cleared!");
}
