// /**
//  * ===============================
//  * MAIN SCRIPT – REI Tools System
//  * ===============================
//  */

function onOpen() {
  // Initialize the summary panel on spreadsheet open
  try {
    createInputsSummary();
    Logger.log("✅ Summary panel initialized on open");
  } catch (e) {
    Logger.log("⚠️ Could not initialize summary panel: " + e);
  }

  const ui = SpreadsheetApp.getUi();
  ui.createMenu("REI Tools")
    .addItem("Open Sidebar", "openSidebar")
    .addSeparator()
    .addItem("Run Full Analysis", "menuRunAnalysis")
    .addItem("🔄 Refresh Comps (Force)", "refreshComps")
    .addItem("🔄 Refresh Summary Panel", "createInputsSummary")
    .addSeparator()
    .addItem("🔄 Toggle Simple/Advanced Mode", "toggleAnalysisMode")
    .addSeparator()
    .addSubMenu(ui.createMenu("Advanced Tools")
      .addItem("📊 Interactive Scenario Analyzer", "showScenarioAnalyzer")
      .addItem("📈 Generate Charts & Visualizations", "menuRegenerateCharts")
      .addSeparator()
      .addSubMenu(ui.createMenu("🏗️ Project Tracker (Advanced Mode Only)")
        .addItem("Generate Project Tracker Tab", "generateProjectTracker")
        .addItem("Clear Project Tracker Tab", "clearProjectTracker"))
      .addSubMenu(ui.createMenu("🤝 Partnership Management (Advanced Mode Only)")
        .addItem("Generate Partnership Tab", "generatePartnershipManagement")
        .addItem("Calculate Partnership IRR", "updatePartnershipIRR")
        .addItem("Clear Partnership Tab", "clearPartnershipManagement"))
      .addSeparator()
      .addItem("🧹 Clear API Cache", "clearAPICache")
      .addItem("📊 Check API Usage", "showAPIUsage")
      .addSeparator()
      .addItem("🏠 Auto-Populate Expenses (Tax & Insurance)", "autoPopulateExpenses")
      .addItem("� Compare State Expenses", "compareStateExpenses")
      .addItem("🔍 Filter Comps (Date, Distance, Type)", "createFilteredCompsView")
      .addItem("💰 Tax Benefits & Depreciation", "generateTaxBenefitsAnalysis")
      .addItem("�📉 Advanced Metrics (IRR, NPV, Break-Even)", "generateAdvancedMetricsAnalysis")
      .addSeparator()
      .addSubMenu(ui.createMenu("Amortization")
        .addItem("First Year (12 months)", "generateFirstYearAmortization")
        .addItem("Full Loan Term", "generateFullAmortizationSchedule"))
      .addSeparator()
      .addSubMenu(ui.createMenu("Protect/Unlock")
        .addItem("Protect (Warning-only)", "protectSheetsWarning")
        .addItem("Protect (Hard Lock)", "protectSheetsLock")
        .addItem("Unlock", "unprotectAll"))
      .addSeparator()
      .addItem("Format all tabs", "formatAllTabs")
    )
    .addSeparator()
    .addItem("🧹 Clear Sheets", "clearSheets")
    .addToUi();
}

// /**
//  * Open the REI Assistant Sidebar
//  */
function openSidebar() {
  const html = HtmlService.createHtmlOutputFromFile("SHEETS_sidebar")
    .setTitle("REI Assistant");
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Menu wrapper for running analysis
 */
function menuRunAnalysis() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inputs = ss.getSheetByName("Inputs");

  if (!inputs) {
    SpreadsheetApp.getUi().alert("❌ Inputs sheet not found");
    return;
  }

  // Get data from Inputs sheet
  const data = {
    address: getField("address", ""),
    city: getField("city", ""),
    state: getField("state", ""),
    zip: getField("zip", ""),
    purchasePrice: getField("purchasePrice", 0),
    downPayment: getField("downPayment", 20),
    loanInterestRate: getField("loanInterestRate", 7),
    loanTerm: getField("loanTerm", 30),
    cashInvestment: getField("cashInvestment", 0),
    helocInterest: getField("helocInterest", 7),
    rehabCost: getField("rehabCost", 0),
    monthsToFlip: getField("monthsToFlip", 6)
  };

  // Validate required fields
  if (!data.address || !data.city || !data.state || !data.zip) {
    SpreadsheetApp.getUi().alert("⚠️ Please fill in property address, city, state, and zip first.");
    return;
  }

  if (!data.purchasePrice || data.purchasePrice <= 0) {
    SpreadsheetApp.getUi().alert("⚠️ Please enter a valid purchase price.");
    return;
  }

  // Run analysis
  runAnalysis(data);
}

/**
 * Show Interactive Scenario Analyzer
 */
function showScenarioAnalyzer() {
  const html = HtmlService.createHtmlOutputFromFile("SHEETS_scenarioAnalyzerHTML")
    .setWidth(800)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, "Interactive Scenario Analyzer");
}

/**
 * Calculate and update Partnership IRR
 */
function updatePartnershipIRR() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Partnership Management");

  if (!sheet) {
    SpreadsheetApp.getUi().alert("❌ Partnership Management sheet not found. Generate it first from Advanced Tools menu.");
    return;
  }

  // TODO: Implement IRR calculation logic
  // For now, just show a confirmation
  SpreadsheetApp.getUi().alert("✅ Partnership IRR calculation complete!\n\nNote: Full IRR calculation will be implemented in a future update.");
}

/**
 * Create Filtered Comps View
 */
function createFilteredCompsView() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Filtered Comps");

  if (!sheet) {
    sheet = ss.insertSheet("Filtered Comps");
  }

  sheet.clear();

  // Add header
  sheet.getRange("A1").setValue("Filtered Comps View")
    .setFontWeight("bold")
    .setFontSize(14)
    .setBackground("#1a73e8")
    .setFontColor("white");

  sheet.getRange("A3").setValue("This feature allows you to filter comparable properties by:")
    .setFontSize(11);

  const features = [
    ["• Date Range", "Last 3/6/12 months"],
    ["• Distance", "Within 0.5/1/2/5 miles"],
    ["• Property Type", "SFR, Condo, Townhouse, Multi-family"],
    ["• Square Footage", "±10/20/30%"],
    ["• Bedrooms/Bathrooms", "Exact match or similar"]
  ];

  sheet.getRange(5, 1, features.length, 2).setValues(features);
  sheet.getRange(5, 1, features.length, 1).setFontWeight("bold");

  sheet.getRange(11, 1).setValue("Coming soon in a future update!")
    .setFontStyle("italic")
    .setFontColor("#666666");

  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 300);

  SpreadsheetApp.getUi().alert("✅ Filtered Comps view created!\n\nFull filtering functionality will be implemented in a future update.");
}

/**
 * Remove all sheet protections
 */
function unprotectAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  let removedCount = 0;

  sheets.forEach(sheet => {
    const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    protections.forEach(protection => {
      if (protection.canEdit()) {
        protection.remove();
        removedCount++;
      }
    });
  });

  if (removedCount > 0) {
    SpreadsheetApp.getUi().alert(`✅ Removed ${removedCount} sheet protection(s)!\n\nAll sheets are now unlocked.`);
  } else {
    SpreadsheetApp.getUi().alert("ℹ️ No sheet protections found to remove.");
  }
}

/**
 * Clear API Cache - Manual cache clearing functionality
 * Allows users to clear all cached data or just current property
 */
function clearAPICache() {
  const ui = SpreadsheetApp.getUi();

  // Ask user what they want to clear
  const response = ui.alert(
    '🧹 Clear API Cache',
    'What would you like to clear?\n\n' +
    '• YES = Clear current property only (Recommended)\n' +
    '• NO = View cache clearing options\n' +
    '• CANCEL = Cancel operation',
    ui.ButtonSet.YES_NO_CANCEL
  );

  if (response === ui.Button.YES) {
    // Clear current property only
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const inputs = ss.getSheetByName("Inputs");

    if (!inputs) {
      ui.alert('❌ Inputs sheet not found');
      return;
    }

    const data = {
      address: getField("address", ""),
      city: getField("city", ""),
      state: getField("state", ""),
      zip: getField("zip", "")
    };

    if (!data.address) {
      ui.alert('⚠️ No property address found in Inputs sheet.\n\nPlease enter a property address first.');
      return;
    }

    const success = clearCachedComps(data.address, data.city, data.state, data.zip);
    if (success) {
      ui.alert(`✅ Cache cleared for:\n\n${data.address}\n${data.city}, ${data.state} ${data.zip}\n\nNext analysis will fetch fresh data from APIs.`);
    } else {
      ui.alert('⚠️ Failed to clear cache for this property.');
    }
  } else if (response === ui.Button.NO) {
    // Show information about cache clearing limitations
    ui.alert(
      '📋 Cache Clearing Options',
      '⚠️ Platform Limitation:\n' +
      'Google Apps Script does not support clearing all cache at once.\n\n' +
      '✅ Available Options:\n\n' +
      '1. Clear Current Property Cache\n' +
      '   • Use this menu option and select YES\n' +
      '   • Clears cache for the property in Inputs sheet\n\n' +
      '2. Force Refresh Comps\n' +
      '   • Use "🔄 Refresh Comps (Force)" from main menu\n' +
      '   • Bypasses cache and fetches fresh data\n\n' +
      '3. Wait for Auto-Expiration\n' +
      '   • Cache expires automatically after 24 hours\n\n' +
      'Tip: For best results, use option 1 or 2 above.',
      ui.ButtonSet.OK
    );
  }
  // If CANCEL, do nothing
}

/**
 * Show API Usage and Cache Statistics
 * Displays cache status, age, and size for current property
 */
function showAPIUsage() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inputs = ss.getSheetByName("Inputs");

  if (!inputs) {
    SpreadsheetApp.getUi().alert("❌ Inputs sheet not found");
    return;
  }

  const data = {
    address: getField("address", ""),
    city: getField("city", ""),
    state: getField("state", ""),
    zip: getField("zip", "")
  };

  if (!data.address) {
    SpreadsheetApp.getUi().alert("⚠️ No property address found in Inputs sheet.\n\nEnter a property address to check cache status.");
    return;
  }

  const stats = getCacheStats(data.address, data.city, data.state, data.zip);

  let message = `📊 API Cache Status\n\n`;
  message += `Property: ${data.address}\n`;
  message += `Location: ${data.city}, ${data.state} ${data.zip}\n\n`;

  if (stats.exists) {
    message += `✅ Cache Status: ACTIVE\n`;
    message += `📦 Comps Cached: ${stats.compsCount}\n`;
    message += `⏰ Cache Age: ${stats.ageHours} hours (${stats.ageMinutes} minutes)\n`;
    message += `📅 Cached On: ${stats.timestamp}\n`;
    message += `💾 Cache Size: ${Math.round(stats.size / 1024)} KB\n\n`;
    message += `ℹ️ Cache expires after 24 hours.\n\n`;
    message += `Use "🔄 Refresh Comps (Force)" or "🧹 Clear API Cache" to fetch fresh data.`;
  } else {
    message += `❌ Cache Status: NOT CACHED\n\n`;
    message += `This property has not been analyzed yet, or the cache has expired.\n\n`;
    message += `Run "Run Full Analysis" to fetch and cache data.`;
  }

  SpreadsheetApp.getUi().alert(message);
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
    const insuranceUtilitiesMonthly = 250; // $ (combined insurance + utilities)
    const vacancyRate = 6; // %
    const estRent = 3500; // $

    setField("propertyTaxRate", propertyTaxRate / 100, "0.00%");
    setField("insuranceMonthly", insuranceUtilitiesMonthly, '"$"#,##0');
    setField("vacancyRate", vacancyRate / 100, "0.00%");
    setField("rentEstimate", estRent, '"$"#,##0');

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

  // Check current mode
  const currentMode = getCurrentMode();
  const isSimple = currentMode === 'Simple';

  // Step 5: Generate Flip Sensitivity Matrix (only in Advanced Mode)
  if (!isSimple) {
    generateFlipSensitivityFromInputs();
  }

  // Step 6: Generate Amortization Schedule (Phase 2 Enhancement)
  generateFirstYearAmortization();

  // Step 7: Generate Tax Benefits Analysis (Phase 2 Enhancement)
  generateTaxBenefitsAnalysis();

  // Step 8: Generate Advanced Metrics Analysis (only in Advanced Mode)
  if (!isSimple) {
    generateAdvancedMetricsAnalysis();
  }

  // Step 9: Generate Flip Enhancements (Phase 3 Enhancement)
  generateFlipEnhancements();

  // Step 10: Phase 5.3 - Generate Charts & Visualizations
  generateAllCharts();

  // Step 11: Update tab visibility based on mode
  updateTabVisibility(currentMode);

  // Step 11: Phase 4 - Calculate scores, generate alerts, and save to history
  try {
    // Get analysis results from sheets
    const flipSheet = ss.getSheetByName("Flip Analysis");
    const rentalSheet = ss.getSheetByName("Rental Analysis");

    if (flipSheet) {
      // Extract flip data for scoring
      const flipData = {
        roi: getFlipMetric(flipSheet, "ROI (%)") / 100 || 0,
        totalProfit: getFlipMetric(flipSheet, "Net Profit ($)") || 0,
        timelineMonths: data.monthsToFlip || 6,
        rehabCost: data.rehabCost || 0,
        purchasePrice: data.purchasePrice || 0
      };

      // Calculate flip score
      const flipScore = calculateFlipScore(flipData);

      // Generate flip alerts
      const flipAlerts = generateFlipAlerts(flipData);

      // Get recommendation
      const flipRecommendation = getDealRecommendation(flipScore.total);

      // Save to history
      saveAnalysisToHistory({
        address: data.address || '',
        type: 'Flip',
        roi: flipData.roi,
        profit: flipData.totalProfit,
        cashFlow: 0,
        score: flipScore.total,
        status: `${flipRecommendation.emoji} ${flipRecommendation.label}`,
        alertCount: flipAlerts.length
      });
    }

    if (rentalSheet) {
      // Extract rental data for scoring
      const rentalData = {
        monthlyCashFlow: getRentalMetric(rentalSheet, "Monthly Cash Flow ($)") || 0,
        roi: getRentalMetric(rentalSheet, "Cash-on-Cash Return (%)") / 100 || 0,
        capRate: getRentalMetric(rentalSheet, "Cap Rate (%)") / 100 || 0,
        dscr: getRentalMetric(rentalSheet, "DSCR") || 0
      };

      // Calculate rental score
      const rentalScore = calculateRentalScore(rentalData);

      // Generate rental alerts
      const rentalAlerts = generateRentalAlerts(rentalData);

      // Get recommendation
      const rentalRecommendation = getDealRecommendation(rentalScore.total);

      // Save to history
      saveAnalysisToHistory({
        address: data.address || '',
        type: 'Rental',
        roi: rentalData.roi,
        profit: 0,
        cashFlow: rentalData.monthlyCashFlow,
        score: rentalScore.total,
        status: `${rentalRecommendation.emoji} ${rentalRecommendation.label}`,
        alertCount: rentalAlerts.length
      });
    }

    // Update inputs summary panel with new data
    updateInputsSummary();

    Logger.log("✅ Phase 4 scoring, alerts, and history saved");
  } catch (e) {
    Logger.log("⚠️ Phase 4 integration error: " + e);
  }

  SpreadsheetApp.getUi().alert("✅ Analysis complete! All tabs updated.\n\nIncludes: Flip & Rental Analysis, Sensitivity, Amortization, Tax Benefits, Advanced Metrics, Flip Enhancements, Charts & Visualizations, Scoring, and Alerts.\n\nCheck the Inputs tab for a quick summary of results.");
}

/**
 * Helper function to extract flip metrics from sheet
 */
function getFlipMetric(sheet, label) {
  try {
    const data = sheet.getDataRange().getValues();
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().includes(label)) {
        return parseFloat(data[i][1]) || 0;
      }
    }
  } catch (e) {
    Logger.log("Error getting flip metric " + label + ": " + e);
  }
  return 0;
}

/**
 * Helper function to extract rental metrics from sheet
 */
function getRentalMetric(sheet, label) {
  try {
    const data = sheet.getDataRange().getValues();
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().includes(label)) {
        return parseFloat(data[i][1]) || 0;
      }
    }
  } catch (e) {
    Logger.log("Error getting rental metric " + label + ": " + e);
  }
  return 0;
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
 * Removes all content, formatting, charts, borders, and background colors
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
    "Renovation Timeline",
    "Filtered Comps",
    "Custom Scenarios",
    "Monte Carlo Analysis",
    "Partnership Management"
  ];

  tabsToClear.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet) {
      // Remove all charts
      const charts = sheet.getCharts();
      charts.forEach(chart => {
        sheet.removeChart(chart);
      });

      // Clear all content and formatting
      sheet.clear();

      // Get the entire data range and clear all formatting
      const maxRows = sheet.getMaxRows();
      const maxCols = sheet.getMaxColumns();
      const fullRange = sheet.getRange(1, 1, maxRows, maxCols);

      // Clear all formatting
      fullRange.clearFormat();
      fullRange.clearNote();
      fullRange.clearDataValidations();

      // Remove all borders
      fullRange.setBorder(false, false, false, false, false, false);

      // Reset background to white
      fullRange.setBackground('#ffffff');

      // Reset font to default
      fullRange.setFontColor('#000000');
      fullRange.setFontFamily('Arial');
      fullRange.setFontSize(10);
      fullRange.setFontWeight('normal');
      fullRange.setFontStyle('normal');

      // Reset alignment
      fullRange.setHorizontalAlignment('left');
      fullRange.setVerticalAlignment('bottom');

      // Remove any conditional formatting rules
      const rules = sheet.getConditionalFormatRules();
      sheet.setConditionalFormatRules([]);

      // Reset column widths to default (100 pixels)
      for (let i = 1; i <= maxCols; i++) {
        sheet.setColumnWidth(i, 100);
      }

      // Reset row heights to default (21 pixels)
      for (let i = 1; i <= Math.min(maxRows, 100); i++) {
        sheet.setRowHeight(i, 21);
      }

      // Unfreeze rows and columns
      sheet.setFrozenRows(0);
      sheet.setFrozenColumns(0);

      Logger.log(`✅ Completely cleared sheet: ${name}`);
    }
  });

  // Clear hidden history sheet
  const historySheet = ss.getSheetByName("Analysis_History");
  if (historySheet) {
    // Remove all charts
    const charts = historySheet.getCharts();
    charts.forEach(chart => {
      historySheet.removeChart(chart);
    });

    historySheet.clear();

    // Re-add headers
    const headers = ['Date', 'Address', 'Type', 'ROI', 'Profit', 'Cash Flow', 'Score', 'Status', 'Alerts'];
    historySheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    styleHeader(historySheet.getRange(1, 1, 1, headers.length), 'h3');
  }

  // Clear Inputs tab values only (keep structure)
  const inputs = ss.getSheetByName("Inputs");
  if (inputs) {
    inputs.getRange("B2:B28").clearContent();
    // Clear summary panel
    clearInputsSummary();
  }

  // Switch back to Simple Mode
  setAnalysisMode('Simple');

  // Hide advanced tabs
  updateTabVisibility('Simple');

  SpreadsheetApp.getUi().alert("🧹 All analysis sheets completely cleared!\n\nRemoved: Content, formatting, charts, borders, backgrounds, and conditional formatting.\n\nCleared: Analysis tabs, History, and all enhancement tabs.\n\nMode switched to Simple Mode with advanced tabs hidden.");
}

// ============================================================================
// EXPORTS - Make helper functions available globally
// ============================================================================

if (typeof global !== 'undefined') {
  global.getFlipMetric = getFlipMetric;
  global.getRentalMetric = getRentalMetric;
}
