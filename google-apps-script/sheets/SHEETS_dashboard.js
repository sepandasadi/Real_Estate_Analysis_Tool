/**
 * Dashboard Generation and Management
 * Creates and updates the main dashboard with key metrics and insights
 * Phase 4: Dashboard & UX Improvements
 */

// ============================================================================
// DASHBOARD CREATION
// ============================================================================

/**
 * DEPRECATED: Dashboard functionality removed
 * Dashboard tab is no longer used - summary is now in Inputs tab
 */
function createDashboard() {
  Logger.log("⚠️ createDashboard() is deprecated - Dashboard functionality removed");
  return null;
}

/**
 * DEPRECATED: Dashboard functionality removed
 */
function setupDashboardLayout(dashboard) {
  Logger.log("⚠️ setupDashboardLayout() is deprecated - Dashboard functionality removed");
}

/**
 * DEPRECATED: Dashboard functionality removed
 * Summary is now displayed in the Inputs tab
 */
function updateDashboard() {
  Logger.log("⚠️ updateDashboard() is deprecated - Dashboard functionality removed");
  Logger.log("ℹ️ Summary is now displayed in the Inputs tab via updateInputsSummary()");
}

/**
 * DEPRECATED: Dashboard functionality removed
 */
function updateKeyMetrics(dashboard, analysisData) {
  Logger.log("⚠️ updateKeyMetrics() is deprecated - Dashboard functionality removed");
}

/**
 * DEPRECATED: Dashboard functionality removed
 */
function calculateAggregateMetrics(analysisData) {
  Logger.log("⚠️ calculateAggregateMetrics() is deprecated - Dashboard functionality removed");
  return {};
}

/**
 * DEPRECATED: Dashboard functionality removed
 */
function updateQuickActions(dashboard) {
  Logger.log("⚠️ updateQuickActions() is deprecated - Dashboard functionality removed");
}

/**
 * DEPRECATED: Dashboard functionality removed
 */
function updateRecentAnalysisTable(dashboard, analysisData) {
  Logger.log("⚠️ updateRecentAnalysisTable() is deprecated - Dashboard functionality removed");
}

/**
 * Get recent analysis data from the spreadsheet
 * @returns {Array} - Array of analysis records
 */
function getRecentAnalyses() {
  try {
    Logger.log("📊 getRecentAnalyses() started");

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const historySheet = ss.getSheetByName('Analysis_History');

    if (!historySheet) {
      Logger.log("⚠️ Analysis_History sheet not found, trying getCurrentAnalysisData()");
      return getCurrentAnalysisData();
    }

    const data = historySheet.getDataRange().getValues();
    Logger.log(`📊 Analysis_History has ${data.length} rows (including header)`);

    if (data.length <= 1) {
      Logger.log("⚠️ Analysis_History is empty or only has headers, trying getCurrentAnalysisData()");
      return getCurrentAnalysisData();
    }

    // Convert to objects (skip header row)
    const records = [];
    for (let i = 1; i < data.length; i++) {
      records.push({
        date: data[i][0],
        address: data[i][1],
        type: data[i][2],
        roi: data[i][3],
        profit: data[i][4],
        cashFlow: data[i][5],
        score: data[i][6],
        status: data[i][7],
        alerts: data[i][8]
      });
    }

    Logger.log(`✅ getRecentAnalyses() returning ${records.length} records from history`);
    return records;
  } catch (e) {
    Logger.log("❌ ERROR in getRecentAnalyses(): " + e);
    Logger.log("Stack trace: " + e.stack);
    return [];
  }
}

/**
 * Get current analysis data from Flip and Rental Analysis sheets
 * Used when no history exists yet
 * @returns {Array} - Array of analysis records
 */
function getCurrentAnalysisData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const records = [];

  // Try to get Flip Analysis data
  const flipSheet = ss.getSheetByName("Flip Analysis");
  if (flipSheet && flipSheet.getLastRow() > 2) {
    try {
      const address = getField("address", "Current Property");
      const flipROI = getFlipMetric(flipSheet, "ROI (%)") / 100 || 0;
      const flipProfit = getFlipMetric(flipSheet, "Net Profit ($)") || 0;

      records.push({
        date: new Date(),
        address: address,
        type: "Flip",
        roi: flipROI,
        profit: flipProfit,
        cashFlow: 0,
        score: 75, // Default score
        status: flipROI >= 0.20 ? "✅ Good Deal" : flipROI >= 0.15 ? "⚠️ Fair" : "❌ Poor",
        alerts: 0
      });
    } catch (e) {
      Logger.log("Error getting flip data: " + e);
    }
  }

  // Try to get Rental Analysis data
  const rentalSheet = ss.getSheetByName("Rental Analysis");
  if (rentalSheet && rentalSheet.getLastRow() > 2) {
    try {
      const address = getField("address", "Current Property");
      const rentalROI = getRentalMetric(rentalSheet, "Cash-on-Cash Return (%)") / 100 || 0;
      const cashFlow = getRentalMetric(rentalSheet, "Annual Cash Flow ($)") || 0;

      records.push({
        date: new Date(),
        address: address,
        type: "Rental",
        roi: rentalROI,
        profit: 0,
        cashFlow: cashFlow,
        score: 75, // Default score
        status: rentalROI >= 0.12 ? "✅ Good Deal" : rentalROI >= 0.08 ? "⚠️ Fair" : "❌ Poor",
        alerts: 0
      });
    } catch (e) {
      Logger.log("Error getting rental data: " + e);
    }
  }

  return records;
}

/**
 * Save current analysis to history
 * @param {Object} analysisData - Analysis data to save
 */
function saveAnalysisToHistory(analysisData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let historySheet = ss.getSheetByName('Analysis_History');

  // Create history sheet if it doesn't exist
  if (!historySheet) {
    historySheet = ss.insertSheet('Analysis_History');
    historySheet.hideSheet();

    // Add headers
    const headers = ['Date', 'Address', 'Type', 'ROI', 'Profit', 'Cash Flow', 'Score', 'Status', 'Alerts'];
    historySheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    styleHeader(historySheet.getRange(1, 1, 1, headers.length), 'h3');
  }

  // Add new record
  const newRow = [
    new Date(),
    analysisData.address || '',
    analysisData.type || '',
    analysisData.roi || 0,
    analysisData.profit || 0,
    analysisData.cashFlow || 0,
    analysisData.score || 0,
    analysisData.status || '',
    analysisData.alertCount || 0
  ];

  historySheet.appendRow(newRow);
}

/**
 * Clear analysis history
 */
function clearAnalysisHistory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const historySheet = ss.getSheetByName('Analysis_History');

  if (historySheet) {
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      'Clear History',
      'Are you sure you want to clear all analysis history? This cannot be undone.',
      ui.ButtonSet.YES_NO
    );

    if (response === ui.Button.YES) {
      historySheet.clear();

      // Re-add headers
      const headers = ['Date', 'Address', 'Type', 'ROI', 'Profit', 'Cash Flow', 'Score', 'Status', 'Alerts'];
      historySheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      styleHeader(historySheet.getRange(1, 1, 1, headers.length), 'h3');

      // Update dashboard
      updateDashboard();

      SpreadsheetApp.getUi().alert('Analysis history cleared successfully.');
    }
  }
}

/**
 * DEPRECATED: Dashboard functionality removed
 */
function goToDashboard() {
  Logger.log("⚠️ goToDashboard() is deprecated - Dashboard functionality removed");
  SpreadsheetApp.getUi().alert("Dashboard tab has been removed. Please check the Inputs tab for analysis summary.");
}

// ============================================================================
// MODE MANAGEMENT (Simple vs Advanced)
// ============================================================================

/**
 * Get current analysis mode
 * @returns {string} - "Simple" or "Advanced"
 */
function getCurrentMode() {
  const docProps = PropertiesService.getDocumentProperties();
  return docProps.getProperty('analysisMode') || 'Simple'; // Default to Simple
}

/**
 * Set analysis mode
 * @param {string} mode - "Simple" or "Advanced"
 */
function setAnalysisMode(mode) {
  const docProps = PropertiesService.getDocumentProperties();
  docProps.setProperty('analysisMode', mode);
  Logger.log(`✅ Analysis mode set to: ${mode}`);
}

/**
 * Check if currently in Simple Mode
 * @returns {boolean}
 */
function isSimpleMode() {
  return getCurrentMode() === 'Simple';
}

/**
 * Toggle between Simple and Advanced mode
 */
function toggleAnalysisMode() {
  const currentMode = getCurrentMode();
  const newMode = currentMode === 'Simple' ? 'Advanced' : 'Simple';

  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    `Switch to ${newMode} Mode?`,
    `${newMode} Mode will ${newMode === 'Simple' ? 'show only essential metrics and hide advanced tabs' : 'show all metrics and advanced analysis tabs'}.\n\nThis will update the current analysis display.`,
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    setAnalysisMode(newMode);

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // If switching to Advanced Mode, check if advanced tabs need to be generated
    if (newMode === 'Advanced') {
      const flipSensitivity = ss.getSheetByName("Flip Sensitivity (ARV vs Rehab)");
      const advancedMetrics = ss.getSheetByName("Advanced Metrics");

      let needsGeneration = false;

      // Check if Flip Sensitivity is empty
      if (flipSensitivity && flipSensitivity.getLastRow() <= 2) {
        needsGeneration = true;
      }

      // Check if Advanced Metrics is empty
      if (advancedMetrics && advancedMetrics.getLastRow() <= 2) {
        needsGeneration = true;
      }

      // Generate advanced tabs if needed
      if (needsGeneration) {
        Logger.log("Generating advanced tabs...");
        try {
          generateFlipSensitivityFromInputs();
          generateAdvancedMetricsAnalysis();
          Logger.log("✅ Advanced tabs generated");
        } catch (e) {
          Logger.log("⚠️ Error generating advanced tabs: " + e);
        }
      }

      // Generate charts for Advanced Mode
      Logger.log("Generating charts for Advanced Mode...");
      try {
        generateAllCharts();
        Logger.log("✅ Charts generated");
      } catch (e) {
        Logger.log("⚠️ Error generating charts: " + e);
      }
    } else {
      // Switching to Simple Mode - clear all charts, delete optional tabs
      Logger.log("Clearing charts for Simple Mode...");
      try {
        clearAllCharts();
        Logger.log("✅ Charts cleared");
      } catch (e) {
        Logger.log("⚠️ Error clearing charts: " + e);
      }

      // Delete Project Tracker and Partnership Management tabs
      Logger.log("Deleting optional tabs for Simple Mode...");
      try {
        deleteProjectTracker();
        deletePartnershipManagement();
        Logger.log("✅ Optional tabs deleted");
      } catch (e) {
        Logger.log("⚠️ Error deleting optional tabs: " + e);
      }
    }

    updateTabVisibility(newMode);
    updateDashboard();

    ui.alert(
      `✅ Switched to ${newMode} Mode`,
      `Analysis display updated. ${newMode === 'Simple' ? 'Advanced tabs are now hidden. Project Tracker and Partnership Management tabs have been deleted.' : 'All tabs are now visible.'}\n\n${newMode === 'Advanced' ? 'Note: Use REI Tools menu to manually generate Project Tracker or Partnership Management tabs as needed.' : ''}`,
      ui.ButtonSet.OK
    );
  }
}

/**
 * Update tab visibility based on mode
 * @param {string} mode - "Simple" or "Advanced"
 */
function updateTabVisibility(mode) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Tabs to hide in Simple Mode
  const advancedTabs = [
    "Flip Sensitivity (ARV vs Rehab)",
    "Advanced Metrics"
  ];

  // Tabs that should only be shown if they exist (user-generated)
  const optionalTabs = [
    "Project Tracker",
    "Partnership Management"
  ];

  if (mode === 'Simple') {
    // Hide advanced tabs
    advancedTabs.forEach(tabName => {
      const sheet = ss.getSheetByName(tabName);
      if (sheet) {
        sheet.hideSheet();
        Logger.log(`Hidden tab: ${tabName}`);
      }
    });

    // Also hide optional tabs in Simple Mode
    optionalTabs.forEach(tabName => {
      const sheet = ss.getSheetByName(tabName);
      if (sheet) {
        sheet.hideSheet();
        Logger.log(`Hidden optional tab: ${tabName}`);
      }
    });
  } else {
    // Show advanced tabs
    advancedTabs.forEach(tabName => {
      const sheet = ss.getSheetByName(tabName);
      if (sheet && sheet.isSheetHidden()) {
        sheet.showSheet();
        Logger.log(`Shown tab: ${tabName}`);
      }
    });

    // Show optional tabs only if they exist (don't auto-generate)
    optionalTabs.forEach(tabName => {
      const sheet = ss.getSheetByName(tabName);
      if (sheet && sheet.isSheetHidden()) {
        sheet.showSheet();
        Logger.log(`Shown optional tab: ${tabName}`);
      }
    });
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof global !== 'undefined') {
  global.createDashboard = createDashboard;
  global.updateDashboard = updateDashboard;
  global.saveAnalysisToHistory = saveAnalysisToHistory;
  global.clearAnalysisHistory = clearAnalysisHistory;
  global.goToDashboard = goToDashboard;
  global.getCurrentMode = getCurrentMode;
  global.setAnalysisMode = setAnalysisMode;
  global.isSimpleMode = isSimpleMode;
  global.toggleAnalysisMode = toggleAnalysisMode;
  global.updateTabVisibility = updateTabVisibility;
}
