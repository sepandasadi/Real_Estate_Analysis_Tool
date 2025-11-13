/**
 * Debug function to test dashboard data retrieval
 * Run this from Apps Script editor to see detailed logs
 */
function testDashboardDebug() {
  Logger.log("=== DASHBOARD DEBUG TEST ===");

  // Test 1: Check if Analysis_History exists and has data
  Logger.log("\n--- Test 1: Analysis_History Sheet ---");
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const historySheet = ss.getSheetByName('Analysis_History');

  if (!historySheet) {
    Logger.log("❌ Analysis_History sheet NOT FOUND");
  } else {
    Logger.log("✅ Analysis_History sheet found");
    const data = historySheet.getDataRange().getValues();
    Logger.log(`Rows in sheet: ${data.length}`);
    Logger.log("Headers: " + JSON.stringify(data[0]));

    if (data.length > 1) {
      Logger.log("Sample data row 1: " + JSON.stringify(data[1]));
      if (data.length > 2) {
        Logger.log("Sample data row 2: " + JSON.stringify(data[2]));
      }
    }
  }

  // Test 2: Check if getField function is available
  Logger.log("\n--- Test 2: getField Function ---");
  try {
    if (typeof getField === 'function') {
      Logger.log("✅ getField function is available");
      const address = getField("address", "TEST_DEFAULT");
      Logger.log(`getField("address") returned: "${address}"`);
    } else {
      Logger.log("❌ getField function is NOT available");
    }
  } catch (e) {
    Logger.log("❌ Error testing getField: " + e);
  }

  // Test 3: Check if helper functions are available
  Logger.log("\n--- Test 3: Helper Functions ---");
  const functions = ['getFlipMetric', 'getRentalMetric', 'getStarRating', 'COLORS', 'styleHeader', 'createMetricCard', 'applyBanding'];
  functions.forEach(funcName => {
    try {
      if (typeof eval(funcName) !== 'undefined') {
        Logger.log(`✅ ${funcName} is available`);
      } else {
        Logger.log(`❌ ${funcName} is NOT available`);
      }
    } catch (e) {
      Logger.log(`❌ ${funcName} error: ${e}`);
    }
  });

  // Test 4: Try to call getRecentAnalyses
  Logger.log("\n--- Test 4: getRecentAnalyses Function ---");
  try {
    const analysisData = getRecentAnalyses();
    Logger.log(`✅ getRecentAnalyses returned ${analysisData ? analysisData.length : 0} records`);
    if (analysisData && analysisData.length > 0) {
      Logger.log("First record: " + JSON.stringify(analysisData[0]));
    }
  } catch (e) {
    Logger.log("❌ Error calling getRecentAnalyses: " + e);
    Logger.log("Stack: " + e.stack);
  }

  // Test 5: Try to call updateDashboard
  Logger.log("\n--- Test 5: updateDashboard Function ---");
  try {
    updateDashboard();
    Logger.log("✅ updateDashboard completed (check logs above for details)");
  } catch (e) {
    Logger.log("❌ Error calling updateDashboard: " + e);
    Logger.log("Stack: " + e.stack);
  }

  Logger.log("\n=== DEBUG TEST COMPLETE ===");
  Logger.log("Check the logs above to identify the issue.");
}

/**
 * Simpler test - just try to read the Analysis_History data
 */
function testReadHistory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const historySheet = ss.getSheetByName('Analysis_History');

  if (!historySheet) {
    Logger.log("Analysis_History sheet not found!");
    return;
  }

  const data = historySheet.getDataRange().getValues();
  Logger.log("Total rows: " + data.length);

  for (let i = 0; i < Math.min(data.length, 5); i++) {
    Logger.log(`Row ${i}: ${JSON.stringify(data[i])}`);
  }
}
