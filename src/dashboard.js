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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dashboard = ss.getSheetByName('Dashboard');

  // Create dashboard if it doesn't exist
  if (!dashboard) {
    dashboard = ss.insertSheet('Dashboard', 0);
  } else {
    dashboard.clear();
  }

  // Set up dashboard layout
  setupDashboardLayout(dashboard);

  // Populate with current data
  updateDashboard();

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

  dashboard.getRange(12, 1).setValue('🎯 Quick Actions');
  styleHeader(dashboard.getRange(12, 1), 'h2');

  dashboard.getRange(16, 1).setValue('📋 Recent Analysis');
  styleHeader(dashboard.getRange(16, 1), 'h2');

  // Freeze header rows
  dashboard.setFrozenRows(5);
}

/**
 * Update dashboard with current data
 */
function updateDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboard = ss.getSheetByName('Dashboard');

  if (!dashboard) {
    createDashboard();
    return;
  }

  // Update timestamp
  const timestampCell = dashboard.getRange(4, 1, 1, 6);
  timestampCell.setValue(`Last Updated: ${new Date().toLocaleString()}`);

  // Get analysis data
  const analysisData = getRecentAnalyses();

  // Update key metrics
  updateKeyMetrics(dashboard, analysisData);

  // Update quick actions
  updateQuickActions(dashboard);

  // Update recent analysis table
  updateRecentAnalysisTable(dashboard, analysisData);
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
 * Update quick actions section
 * @param {Sheet} dashboard - Dashboard sheet
 */
function updateQuickActions(dashboard) {
  const startRow = 13;

  // Create action buttons
  const buttons = [
    { label: '🆕 New Analysis', col: 1 },
    { label: '🔄 Refresh Data', col: 2 },
    { label: '📊 View All Properties', col: 3 },
    { label: '⚙️ Settings', col: 4 },
    { label: '📄 Export Report', col: 5 }
  ];

  buttons.forEach(button => {
    const cell = dashboard.getRange(startRow, button.col, 2, 1);
    cell.merge();
    styleButton(cell, button.label, COLORS.PRIMARY);
  });
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

  // Apply banding to table
  const tableRange = dashboard.getRange(startRow, 1, tableData.length + 1, headers.length);
  applyBanding(tableRange);
}

/**
 * Get recent analysis data from the spreadsheet
 * @returns {Array} - Array of analysis records
 */
function getRecentAnalyses() {
  // This is a placeholder - in real implementation, this would read from
  // a hidden "History" sheet that stores all analyses
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const historySheet = ss.getSheetByName('Analysis_History');

  if (!historySheet) {
    return [];
  }

  const data = historySheet.getDataRange().getValues();
  if (data.length <= 1) return []; // Only headers or empty

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
// EXPORTS
// ============================================================================

if (typeof global !== 'undefined') {
  global.createDashboard = createDashboard;
  global.updateDashboard = updateDashboard;
  global.saveAnalysisToHistory = saveAnalysisToHistory;
  global.clearAnalysisHistory = clearAnalysisHistory;
  global.goToDashboard = goToDashboard;
}
