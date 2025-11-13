/**
 * Dashboard Generation and Management
 * Creates and updates the main dashboard with key metrics and insights
 * Phase 4: Dashboard & UX Improvements
 */

// ============================================================================
// DASHBOARD CREATION
// ============================================================================

/**
 * Create or update the main dashboard sheet
 */
function createDashboard() {
  Logger.log("🏗️ createDashboard() started");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dashboard = ss.getSheetByName('Dashboard');

  // Create dashboard if it doesn't exist
  if (!dashboard) {
    Logger.log("Creating new Dashboard sheet");
    dashboard = ss.insertSheet('Dashboard', 0);
  } else {
    Logger.log("Dashboard exists, clearing it");
    dashboard.clear();
  }

  // Set up dashboard layout
  setupDashboardLayout(dashboard);
  Logger.log("✅ Dashboard layout set up");

  // Get analysis data
  const analysisData = getRecentAnalyses();
  Logger.log(`📊 Retrieved ${analysisData ? analysisData.length : 0} records for dashboard`);

  // Populate dashboard sections directly (don't call updateDashboard to avoid recursion)
  updateKeyMetrics(dashboard, analysisData);
  updateQuickActions(dashboard);
  updateRecentAnalysisTable(dashboard, analysisData);

  Logger.log("✅ createDashboard() completed");
  return dashboard;
}

/**
 * Set up the dashboard layout and structure
 * @param {Sheet} dashboard - The dashboard sheet
 */
function setupDashboardLayout(dashboard) {
  // Set column widths
  dashboard.setColumnWidth(1, 150);
  dashboard.setColumnWidth(2, 150);
  dashboard.setColumnWidth(3, 150);
  dashboard.setColumnWidth(4, 150);
  dashboard.setColumnWidth(5, 150);
  dashboard.setColumnWidth(6, 150);

  // Header section (Row 1-3)
  const headerRange = dashboard.getRange(1, 1, 3, 6);
  headerRange.merge();
  headerRange.setValue('🏠 Real Estate Investment Analysis Dashboard');
  styleHeader(headerRange, 'h1');
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  headerRange.setBackground(COLORS.PRIMARY);
  headerRange.setFontColor(COLORS.CARD);

  // Last updated timestamp (Row 4)
  const timestampCell = dashboard.getRange(4, 1, 1, 6);
  timestampCell.merge();
  timestampCell.setValue(`Last Updated: ${new Date().toLocaleString()}`);
  timestampCell.setFontSize(9);
  timestampCell.setFontColor(COLORS.TEXT_SECONDARY);
  timestampCell.setHorizontalAlignment('center');

  // Section headers
  dashboard.getRange(6, 1).setValue('📊 Key Metrics');
  styleHeader(dashboard.getRange(6, 1), 'h2');

  dashboard.getRange(12, 1).setValue('📋 Recent Analysis');
  styleHeader(dashboard.getRange(12, 1), 'h2');

  // Freeze header rows
  dashboard.setFrozenRows(5);
}

/**
 * Update dashboard with current data
 */
function updateDashboard() {
  try {
    Logger.log("🔄 updateDashboard() started");

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let dashboard = ss.getSheetByName('Dashboard');

    if (!dashboard) {
      Logger.log("⚠️ Dashboard not found, creating new one");
      dashboard = createDashboard();
      Logger.log("✅ Dashboard created, exiting updateDashboard to avoid recursion");
      return;
    }

    // Update timestamp
    const timestampCell = dashboard.getRange(4, 1, 1, 6);
    timestampCell.setValue(`Last Updated: ${new Date().toLocaleString()}`);
    Logger.log("✅ Timestamp updated");

    // Get analysis data
    Logger.log("📊 Fetching analysis data...");
    const analysisData = getRecentAnalyses();
    Logger.log(`📊 Analysis data retrieved: ${analysisData ? analysisData.length : 0} records`);

    if (analysisData && analysisData.length > 0) {
      Logger.log("Sample record:", JSON.stringify(analysisData[0]));
    }

    // Update key metrics
    Logger.log("📈 Updating key metrics...");
    updateKeyMetrics(dashboard, analysisData);
    Logger.log("✅ Key metrics updated");

    // Update quick actions
    Logger.log("🔧 Updating quick actions...");
    updateQuickActions(dashboard);
    Logger.log("✅ Quick actions updated");

    // Update recent analysis table
    Logger.log("📋 Updating recent analysis table...");
    updateRecentAnalysisTable(dashboard, analysisData);
    Logger.log("✅ Recent analysis table updated");

    Logger.log("✅ updateDashboard() completed successfully");
  } catch (e) {
    Logger.log("❌ ERROR in updateDashboard(): " + e);
    Logger.log("Stack trace: " + e.stack);
    throw e;
  }
}

/**
 * Update key metrics section
 * @param {Sheet} dashboard - Dashboard sheet
 * @param {Array} analysisData - Recent analysis data
 */
function updateKeyMetrics(dashboard, analysisData) {
  if (!analysisData || analysisData.length === 0) {
    // Show empty state
    const emptyCell = dashboard.getRange(7, 1, 4, 6);
    emptyCell.merge();
    emptyCell.setValue('No properties analyzed yet. Run an analysis to see metrics here.');
    emptyCell.setHorizontalAlignment('center');
    emptyCell.setVerticalAlignment('middle');
    emptyCell.setFontColor(COLORS.TEXT_SECONDARY);
    emptyCell.setFontStyle('italic');
    return;
  }

  // Calculate aggregate metrics
  const metrics = calculateAggregateMetrics(analysisData);

  // Create metric cards (2 rows x 3 columns)
  const startRow = 7;

  // Card 1: Total Properties
  createMetricCard(dashboard, startRow, 1, 'Total Properties', metrics.totalProperties, 'number', '🏠');

  // Card 2: Average ROI
  createMetricCard(dashboard, startRow, 3, 'Average ROI', metrics.avgROI, 'percentage',
    metrics.avgROI >= 0.15 ? '✅' : metrics.avgROI >= 0.10 ? '⚠️' : '❌');

  // Card 3: Total Potential Profit
  createMetricCard(dashboard, startRow, 5, 'Total Profit Potential', metrics.totalProfit, 'currency', '💰');

  // Card 4: Best Deal
  createMetricCard(dashboard, startRow + 3, 1, 'Best Deal ROI', metrics.bestROI, 'percentage', '⭐');

  // Card 5: Properties Flagged
  createMetricCard(dashboard, startRow + 3, 3, 'Properties Flagged', metrics.flaggedCount, 'number',
    metrics.flaggedCount > 0 ? '⚠️' : '✅');

  // Card 6: Average Score
  createMetricCard(dashboard, startRow + 3, 5, 'Average Quality Score', metrics.avgScore, 'number',
    getStarRating(metrics.avgScore));
}

/**
 * Calculate aggregate metrics from analysis data
 * @param {Array} analysisData - Array of analysis records
 * @returns {Object} - Aggregate metrics
 */
function calculateAggregateMetrics(analysisData) {
  let totalROI = 0;
  let totalProfit = 0;
  let totalScore = 0;
  let bestROI = 0;
  let flaggedCount = 0;

  analysisData.forEach(record => {
    totalROI += record.roi || 0;
    totalProfit += record.profit || 0;
    totalScore += record.score || 0;

    if ((record.roi || 0) > bestROI) {
      bestROI = record.roi || 0;
    }

    if (record.alerts && record.alerts > 0) {
      flaggedCount++;
    }
  });

  const count = analysisData.length;

  return {
    totalProperties: count,
    avgROI: count > 0 ? totalROI / count : 0,
    totalProfit: totalProfit,
    bestROI: bestROI,
    flaggedCount: flaggedCount,
    avgScore: count > 0 ? totalScore / count : 0
  };
}

/**
 * Update mode indicator section
 * @param {Sheet} dashboard - Dashboard sheet
 */
function updateQuickActions(dashboard) {
  const startRow = 11;

  // Get current mode
  const currentMode = getCurrentMode();

  // Add mode indicator
  const modeIndicator = dashboard.getRange(startRow, 1, 1, 6);
  modeIndicator.merge();
  modeIndicator.setValue(`Current Mode: ${currentMode} ${currentMode === 'Simple' ? '(Essential metrics only)' : '(All metrics & advanced tabs)'} - Use "REI Tools" menu → "Toggle Simple/Advanced Mode" to switch`);
  modeIndicator.setFontSize(10);
  modeIndicator.setFontColor(COLORS.TEXT_SECONDARY);
  modeIndicator.setHorizontalAlignment('center');
  modeIndicator.setFontStyle('italic');
  modeIndicator.setBackground('#f8f9fa');
  modeIndicator.setVerticalAlignment('middle');

  // Add some padding
  dashboard.setRowHeight(startRow, 30);
}

/**
 * Update recent analysis table
 * @param {Sheet} dashboard - Dashboard sheet
 * @param {Array} analysisData - Recent analysis data
 */
function updateRecentAnalysisTable(dashboard, analysisData) {
  const startRow = 17;

  // Create table headers
  const headers = ['Date', 'Address', 'Type', 'ROI', 'Profit/Cash Flow', 'Score', 'Status'];
  const headerRange = dashboard.getRange(startRow, 1, 1, headers.length);
  headerRange.setValues([headers]);
  styleHeader(headerRange, 'h3');
  headerRange.setBackground(COLORS.LIGHT);
  headerRange.setHorizontalAlignment('center');

  if (!analysisData || analysisData.length === 0) {
    const emptyCell = dashboard.getRange(startRow + 1, 1, 1, headers.length);
    emptyCell.merge();
    emptyCell.setValue('No recent analyses. Run an analysis to see results here.');
    emptyCell.setHorizontalAlignment('center');
    emptyCell.setFontColor(COLORS.TEXT_SECONDARY);
    emptyCell.setFontStyle('italic');
    return;
  }

  // Populate table with data (show last 10)
  const recentData = analysisData.slice(0, 10);
  const tableData = recentData.map(record => [
    record.date || '',
    record.address || '',
    record.type || '',
    record.roi || 0,
    record.profit || record.cashFlow || 0,
    record.score || 0,
    record.status || ''
  ]);

  const dataRange = dashboard.getRange(startRow + 1, 1, tableData.length, headers.length);
  dataRange.setValues(tableData);

  // Format columns
  dashboard.getRange(startRow + 1, 4, tableData.length, 1).setNumberFormat('0.0%'); // ROI
  dashboard.getRange(startRow + 1, 5, tableData.length, 1).setNumberFormat('$#,##0'); // Profit/Cash Flow

  // Apply conditional formatting to status column
  for (let i = 0; i < tableData.length; i++) {
    const statusCell = dashboard.getRange(startRow + 1 + i, 7);
    const status = tableData[i][6];

    if (status.includes('✅')) {
      statusCell.setFontColor(COLORS.SUCCESS);
    } else if (status.includes('⚠️')) {
      statusCell.setFontColor(COLORS.WARNING);
    } else if (status.includes('❌')) {
      statusCell.setFontColor(COLORS.DANGER);
    }
  }

  // Apply banding to table (clear existing banding first to avoid conflicts)
  const tableRange = dashboard.getRange(startRow, 1, tableData.length + 1, headers.length);

  // Clear any existing banding from the entire sheet to avoid conflicts
  try {
    const allBandings = dashboard.getBandings();
    if (allBandings && allBandings.length > 0) {
      Logger.log(`Removing ${allBandings.length} existing banding(s) from dashboard`);
      allBandings.forEach(banding => banding.remove());
    }
  } catch (e) {
    Logger.log("Error removing existing banding: " + e);
  }

  // Apply new banding
  try {
    applyBanding(tableRange);
    Logger.log("✅ Banding applied successfully");
  } catch (e) {
    Logger.log("⚠️ Could not apply banding (non-critical): " + e);
    // Don't throw - banding is cosmetic, continue without it
  }
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
 * Navigate to dashboard
 */
function goToDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dashboard = ss.getSheetByName('Dashboard');

  if (!dashboard) {
    dashboard = createDashboard();
  }

  ss.setActiveSheet(dashboard);
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

      // Generate Project Tracker for Advanced Mode
      Logger.log("Generating Project Tracker for Advanced Mode...");
      try {
        generateProjectTracker();
        Logger.log("✅ Project Tracker generated");
      } catch (e) {
        Logger.log("⚠️ Error generating Project Tracker: " + e);
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
      // Switching to Simple Mode - delete Project Tracker and clear all charts
      Logger.log("Deleting Project Tracker for Simple Mode...");
      try {
        deleteProjectTracker();
        Logger.log("✅ Project Tracker deleted");
      } catch (e) {
        Logger.log("⚠️ Error deleting Project Tracker: " + e);
      }

      Logger.log("Clearing charts for Simple Mode...");
      try {
        clearAllCharts();
        Logger.log("✅ Charts cleared");
      } catch (e) {
        Logger.log("⚠️ Error clearing charts: " + e);
      }
    }

    updateTabVisibility(newMode);
    updateDashboard();

    ui.alert(
      `✅ Switched to ${newMode} Mode`,
      `Analysis display updated. ${newMode === 'Simple' ? 'Advanced tabs are now hidden.' : 'All tabs are now visible, including Project Tracker.'}`,
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
    "Advanced Metrics",
    "Project Tracker"
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
  } else {
    // Show all tabs (except Project Tracker which is managed separately)
    advancedTabs.forEach(tabName => {
      const sheet = ss.getSheetByName(tabName);
      if (sheet && sheet.isSheetHidden()) {
        sheet.showSheet();
        Logger.log(`Shown tab: ${tabName}`);
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
