/**
 * ===============================
 * API USAGE DASHBOARD
 * ===============================
 *
 * Phase 2.5: Track and display API usage statistics
 * Shows quota usage, capacity estimates, and usage history
 */

/**
 * Create or update the API Usage Dashboard sheet
 * Displays current quota usage, capacity estimates by mode, and usage history
 */
function createAPIUsageDashboard() {
  Logger.log("🏗️ createAPIUsageDashboard() started");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("API Usage");

  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet("API Usage");
    Logger.log("✅ Created new 'API Usage' sheet");
  } else {
    sheet.clear();
    Logger.log("🔄 Cleared existing 'API Usage' sheet");
  }

  let row = 1;

  // === HEADER ===
  const headerRange = sheet.getRange(row, 1, 2, 6);
  headerRange.merge();
  headerRange.setValue("📊 API USAGE DASHBOARD");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(16);
  headerRange.setBackground("#1a73e8");
  headerRange.setFontColor("#ffffff");
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  row += 2;

  // === CURRENT MODE ===
  const currentMode = getAnalysisMode();
  const modeConfig = getAnalysisModeConfig(currentMode);

  let modeEmoji = '⭐';
  let modeColor = '#1a73e8';
  if (currentMode === 'BASIC') {
    modeEmoji = '⚡';
    modeColor = '#9333ea';
  } else if (currentMode === 'DEEP') {
    modeEmoji = '🚀';
    modeColor = '#16a34a';
  }

  const modeRange = sheet.getRange(row, 1, 1, 6);
  modeRange.merge();
  modeRange.setValue(`${modeEmoji} Current Mode: ${modeConfig.name}`);
  modeRange.setFontWeight("bold");
  modeRange.setFontSize(12);
  modeRange.setBackground(modeColor);
  modeRange.setFontColor("#ffffff");
  modeRange.setHorizontalAlignment("center");
  row += 2;

  // === QUOTA OVERVIEW ===
  sheet.getRange(row, 1, 1, 6).merge()
    .setValue("📈 Monthly Quota Overview")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  // Get quota information from Script Properties
  const scriptProps = PropertiesService.getScriptProperties();
  const monthlyQuota = 2500; // RapidAPI free tier
  const usedThisMonth = parseInt(scriptProps.getProperty('API_CALLS_THIS_MONTH') || '0');
  const remainingQuota = monthlyQuota - usedThisMonth;
  const usagePercentage = (usedThisMonth / monthlyQuota) * 100;

  const quotaData = [
    ["Monthly Quota", monthlyQuota, "API calls"],
    ["Used This Month", usedThisMonth, "API calls"],
    ["Remaining", remainingQuota, "API calls"],
    ["Usage", usagePercentage / 100, ""]
  ];

  sheet.getRange(row, 1, quotaData.length, 3).setValues(quotaData);
  sheet.getRange(row, 1, quotaData.length, 1).setFontWeight("bold");
  sheet.getRange(row, 2, quotaData.length, 1).setHorizontalAlignment("right");

  // Format usage percentage
  sheet.getRange(row + 3, 2).setNumberFormat("0.0%");

  // Add progress bar visualization
  const progressBarRange = sheet.getRange(row + 3, 4, 1, 3);
  progressBarRange.merge();

  // Color code based on usage
  let progressColor = '#34a853'; // Green
  if (usagePercentage > 80) {
    progressColor = '#ea4335'; // Red
  } else if (usagePercentage > 60) {
    progressColor = '#fbbc04'; // Yellow
  }

  // Create visual progress bar using background color
  const progressWidth = Math.round((usagePercentage / 100) * 100);
  progressBarRange.setValue(`${'█'.repeat(Math.floor(progressWidth / 5))}${' '.repeat(20 - Math.floor(progressWidth / 5))}`);
  progressBarRange.setFontColor(progressColor);
  progressBarRange.setFontWeight("bold");
  progressBarRange.setHorizontalAlignment("left");

  row += quotaData.length + 2;

  // === CAPACITY BY MODE ===
  sheet.getRange(row, 1, 1, 6).merge()
    .setValue("🎯 Capacity Estimates by Mode")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  // Headers
  const capacityHeaders = [["Mode", "API Calls/Property", "Est. Monthly Capacity", "Current Remaining", "Status"]];
  sheet.getRange(row, 1, 1, 5).setValues(capacityHeaders);
  sheet.getRange(row, 1, 1, 5)
    .setFontWeight("bold")
    .setBackground("#d9e2f3")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  // Calculate capacity for each mode
  const modes = getAllAnalysisModes();
  const capacityData = modes.map(modeObj => {
    const config = modeObj.config;
    const avgCalls = config.maxApiCalls;
    const monthlyCapacity = Math.floor(monthlyQuota / avgCalls);
    const currentCapacity = Math.floor(remainingQuota / avgCalls);

    let status = '✅ Available';
    if (currentCapacity < 10) {
      status = '⚠️ Low';
    }
    if (currentCapacity <= 0) {
      status = '❌ Depleted';
    }

    let modeIcon = '⭐';
    if (modeObj.value === 'BASIC') modeIcon = '⚡';
    else if (modeObj.value === 'DEEP') modeIcon = '🚀';

    return [
      `${modeIcon} ${config.name}`,
      avgCalls,
      monthlyCapacity,
      currentCapacity,
      status
    ];
  });

  const capacityStartRow = row;
  sheet.getRange(row, 1, capacityData.length, 5).setValues(capacityData);
  sheet.getRange(row, 1, capacityData.length, 1).setHorizontalAlignment("left");
  sheet.getRange(row, 2, capacityData.length, 3).setHorizontalAlignment("center");
  sheet.getRange(row, 5, capacityData.length, 1).setHorizontalAlignment("center");

  // Add borders
  sheet.getRange(row, 1, capacityData.length, 5)
    .setBorder(true, true, true, true, true, true, "#cccccc", SpreadsheetApp.BorderStyle.SOLID);

  // Highlight current mode
  const currentModeIndex = modes.findIndex(m => m.value === currentMode);
  if (currentModeIndex >= 0) {
    sheet.getRange(row + currentModeIndex, 1, 1, 5)
      .setBackground("#fff9e6")
      .setFontWeight("bold");
  }

  row += capacityData.length + 2;

  // === USAGE RECOMMENDATIONS ===
  sheet.getRange(row, 1, 1, 6).merge()
    .setValue("💡 Recommendations")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  let recommendations = [];

  if (usagePercentage > 90) {
    recommendations.push("⚠️ CRITICAL: You've used over 90% of your monthly quota. Switch to Basic Mode to conserve API calls.");
  } else if (usagePercentage > 75) {
    recommendations.push("⚠️ WARNING: You've used over 75% of your monthly quota. Consider using Standard Mode instead of Deep Mode.");
  } else if (usagePercentage > 50) {
    recommendations.push("ℹ️ INFO: You've used over 50% of your monthly quota. Monitor usage carefully.");
  } else {
    recommendations.push("✅ GOOD: You have plenty of quota remaining. All modes are available.");
  }

  // Add mode-specific recommendations
  if (currentMode === 'DEEP' && remainingQuota < 200) {
    recommendations.push("💡 TIP: Deep Mode uses 8-12 API calls per property. Consider switching to Standard Mode (2-4 calls) to extend your quota.");
  } else if (currentMode === 'STANDARD' && remainingQuota < 50) {
    recommendations.push("💡 TIP: Standard Mode uses 2-4 API calls per property. Consider switching to Basic Mode (0-1 calls) to extend your quota.");
  }

  recommendations.push(`📊 Current capacity in ${modeConfig.name}: ~${Math.floor(remainingQuota / modeConfig.maxApiCalls)} properties remaining this month`);

  recommendations.forEach(rec => {
    const recRange = sheet.getRange(row, 1, 1, 6);
    recRange.merge();
    recRange.setValue(rec);
    recRange.setFontSize(10);
    recRange.setWrap(true);
    recRange.setVerticalAlignment("top");
    recRange.setBackground("#f0f0f0");
    recRange.setBorder(true, true, true, true, false, false, "#cccccc", SpreadsheetApp.BorderStyle.SOLID);
    row++;
  });

  row += 1;

  // === USAGE HISTORY ===
  sheet.getRange(row, 1, 1, 6).merge()
    .setValue("📜 Recent Usage History")
    .setFontWeight("bold")
    .setFontSize(12)
    .setBackground("#e8f0fe")
    .setHorizontalAlignment("left");
  row++;

  // Headers
  const historyHeaders = [["Date", "Property Address", "Mode", "API Calls", "Status"]];
  sheet.getRange(row, 1, 1, 5).setValues(historyHeaders);
  sheet.getRange(row, 1, 1, 5)
    .setFontWeight("bold")
    .setBackground("#d9e2f3")
    .setHorizontalAlignment("center")
    .setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  row++;

  // Get usage history from Analysis_History sheet
  const historySheet = ss.getSheetByName("Analysis_History");
  if (historySheet && historySheet.getLastRow() > 1) {
    const historyData = historySheet.getRange(2, 1, Math.min(historySheet.getLastRow() - 1, 10), 9).getValues();

    // Display last 10 analyses
    const recentHistory = historyData.slice(0, 10).map(row => [
      row[0], // Date
      row[1], // Address
      currentMode, // Mode (we'll use current mode as placeholder)
      modeConfig.maxApiCalls, // API calls (estimate based on mode)
      row[7] // Status
    ]);

    if (recentHistory.length > 0) {
      sheet.getRange(row, 1, recentHistory.length, 5).setValues(recentHistory);
      sheet.getRange(row, 1, recentHistory.length, 5)
        .setBorder(true, true, true, true, true, true, "#cccccc", SpreadsheetApp.BorderStyle.SOLID);
      sheet.getRange(row, 1, recentHistory.length, 1).setHorizontalAlignment("left");
      sheet.getRange(row, 2, recentHistory.length, 1).setHorizontalAlignment("left");
      sheet.getRange(row, 3, recentHistory.length, 3).setHorizontalAlignment("center");
      row += recentHistory.length;
    } else {
      sheet.getRange(row, 1, 1, 5).merge()
        .setValue("No usage history available yet. Run an analysis to see history here.")
        .setFontStyle("italic")
        .setFontColor("#666666")
        .setHorizontalAlignment("center");
      row++;
    }
  } else {
    sheet.getRange(row, 1, 1, 5).merge()
      .setValue("No usage history available yet. Run an analysis to see history here.")
      .setFontStyle("italic")
      .setFontColor("#666666")
      .setHorizontalAlignment("center");
    row++;
  }

  row += 2;

  // === FOOTER ===
  const footerRange = sheet.getRange(row, 1, 1, 6);
  footerRange.merge();
  footerRange.setValue(`Last Updated: ${new Date().toLocaleString()} • Quota resets monthly`);
  footerRange.setFontSize(8);
  footerRange.setFontStyle("italic");
  footerRange.setFontColor("#666666");
  footerRange.setHorizontalAlignment("center");

  // Set column widths
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 120);
  sheet.setColumnWidth(3, 150);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 120);
  sheet.setColumnWidth(6, 100);

  // Freeze header rows
  sheet.setFrozenRows(3);

  Logger.log("✅ API Usage Dashboard created successfully");
}

/**
 * Update API usage counter
 * Called after each API call to track usage
 *
 * @param {number} callCount - Number of API calls made
 */
function incrementAPIUsage(callCount = 1) {
  try {
    const scriptProps = PropertiesService.getScriptProperties();
    const currentUsage = parseInt(scriptProps.getProperty('API_CALLS_THIS_MONTH') || '0');
    const newUsage = currentUsage + callCount;

    scriptProps.setProperty('API_CALLS_THIS_MONTH', newUsage.toString());

    Logger.log(`📊 API Usage: ${newUsage} / 2500 calls this month (+${callCount})`);

    // Check if approaching quota limit
    if (newUsage > 2250) {
      Logger.log('⚠️ WARNING: Approaching monthly API quota limit!');
    }

    return newUsage;
  } catch (error) {
    Logger.log(`❌ Error updating API usage: ${error.message}`);
    return 0;
  }
}

/**
 * Reset monthly API usage counter
 * Should be called at the start of each month (can be automated with a trigger)
 */
function resetMonthlyAPIUsage() {
  try {
    const scriptProps = PropertiesService.getScriptProperties();
    const previousUsage = scriptProps.getProperty('API_CALLS_THIS_MONTH') || '0';

    scriptProps.setProperty('API_CALLS_THIS_MONTH', '0');
    scriptProps.setProperty('API_CALLS_LAST_MONTH', previousUsage);
    scriptProps.setProperty('LAST_RESET_DATE', new Date().toISOString());

    Logger.log(`✅ Monthly API usage reset. Previous month: ${previousUsage} calls`);

    SpreadsheetApp.getUi().alert(
      '✅ API Usage Reset',
      `Monthly API usage counter has been reset.\n\nPrevious month usage: ${previousUsage} calls\n\nNew month quota: 2500 calls`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (error) {
    Logger.log(`❌ Error resetting API usage: ${error.message}`);
  }
}

/**
 * Get current API usage statistics
 *
 * @returns {Object} Usage statistics
 */
function getAPIUsageStats() {
  try {
    const scriptProps = PropertiesService.getScriptProperties();
    const monthlyQuota = 2500;
    const usedThisMonth = parseInt(scriptProps.getProperty('API_CALLS_THIS_MONTH') || '0');
    const usedLastMonth = parseInt(scriptProps.getProperty('API_CALLS_LAST_MONTH') || '0');
    const lastResetDate = scriptProps.getProperty('LAST_RESET_DATE') || 'Never';

    const remainingQuota = monthlyQuota - usedThisMonth;
    const usagePercentage = (usedThisMonth / monthlyQuota) * 100;

    // Calculate capacity for current mode
    const currentMode = getAnalysisMode();
    const modeConfig = getAnalysisModeConfig(currentMode);
    const remainingCapacity = Math.floor(remainingQuota / modeConfig.maxApiCalls);

    return {
      monthlyQuota,
      usedThisMonth,
      usedLastMonth,
      remainingQuota,
      usagePercentage,
      lastResetDate,
      currentMode: modeConfig.name,
      remainingCapacity
    };
  } catch (error) {
    Logger.log(`❌ Error getting API usage stats: ${error.message}`);
    return null;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof global !== 'undefined') {
  global.createAPIUsageDashboard = createAPIUsageDashboard;
  global.incrementAPIUsage = incrementAPIUsage;
  global.resetMonthlyAPIUsage = resetMonthlyAPIUsage;
  global.getAPIUsageStats = getAPIUsageStats;
}
