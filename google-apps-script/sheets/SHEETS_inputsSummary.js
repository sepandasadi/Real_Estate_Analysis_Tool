/**
 * ===============================
 * INPUTS SUMMARY PANEL
 * ===============================
 *
 * Creates a summary panel on the right side of the Inputs tab
 * Displays current property quick metrics and analysis results
 * Replaces the standalone Dashboard sheet
 */

// Import color constants from styling
const SUMMARY_COLORS = {
  PRIMARY: '#1a73e8',
  SUCCESS: '#34a853',
  WARNING: '#fbbc04',
  DANGER: '#ea4335',
  BACKGROUND: '#f7f9fc',
  CARD: '#ffffff',
  BORDER: '#e0e0e0',
  TEXT_PRIMARY: '#202124',
  TEXT_SECONDARY: '#5f6368'
};

/**
 * Create or update the summary panel on the Inputs tab
 * Located in columns D-G (right side of inputs)
 */
function createInputsSummary() {
  Logger.log("🏗️ createInputsSummary() started");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inputs = ss.getSheetByName("Inputs");

  if (!inputs) {
    Logger.log("❌ Inputs sheet not found");
    return;
  }

  // Clear existing summary area (columns D-G, rows 1-25)
  const summaryRange = inputs.getRange("D1:G25");
  summaryRange.clearContent();
  summaryRange.clearFormat();

  let row = 1;

  // === HEADER ===
  const headerRange = inputs.getRange(row, 4, 2, 4); // D1:G2
  headerRange.merge();
  headerRange.setValue("📊 ANALYSIS SUMMARY");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(14);
  headerRange.setBackground(SUMMARY_COLORS.PRIMARY);
  headerRange.setFontColor(SUMMARY_COLORS.CARD);
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  row += 2;

  // === PROPERTY INFO ===
  const address = getField("address", "No property analyzed yet");
  const propertyRange = inputs.getRange(row, 4, 1, 4); // D3:G3
  propertyRange.merge();
  propertyRange.setValue(address);
  propertyRange.setFontWeight("bold");
  propertyRange.setFontSize(11);
  propertyRange.setHorizontalAlignment("center");
  propertyRange.setWrap(true);
  row++;

  // === LAST UPDATED ===
  const timestampRange = inputs.getRange(row, 4, 1, 4); // D4:G4
  timestampRange.merge();
  timestampRange.setValue(`Last Updated: ${new Date().toLocaleString()}`);
  timestampRange.setFontSize(8);
  timestampRange.setFontColor(SUMMARY_COLORS.TEXT_SECONDARY);
  timestampRange.setHorizontalAlignment("center");
  timestampRange.setFontStyle("italic");
  row += 2;

  // === FLIP METRICS CARD ===
  createInputsMetricCard(inputs, row, "🛠️ FLIP ANALYSIS", [
    { label: "Net Profit", formula: '=IFERROR(INDEX(\'Flip Analysis\'!B:B,MATCH("Net Profit ($)",\'Flip Analysis\'!A:A,0)),"-")', format: '"$"#,##0' },
    { label: "ROI", formula: '=IFERROR(INDEX(\'Flip Analysis\'!B:B,MATCH("ROI (%)",\'Flip Analysis\'!A:A,0))/100,"-")', format: '0.0%' },
    { label: "Timeline", formula: '=IFERROR(INDEX(\'Flip Analysis\'!B:B,MATCH("Months to Flip",\'Flip Analysis\'!A:A,0))&" months","-")', format: '@' }
  ]);
  row += 5;

  // === RENTAL METRICS CARD ===
  createInputsMetricCard(inputs, row, "🏠 RENTAL ANALYSIS", [
    { label: "Monthly Cash Flow", formula: '=IFERROR(INDEX(\'Rental Analysis\'!B:B,MATCH("Monthly Cash Flow ($)",\'Rental Analysis\'!A:A,0)),"-")', format: '"$"#,##0' },
    { label: "Cap Rate", formula: '=IFERROR(INDEX(\'Rental Analysis\'!B:B,MATCH("Cap Rate (%)",\'Rental Analysis\'!A:A,0))/100,"-")', format: '0.0%' },
    { label: "CoC Return", formula: '=IFERROR(INDEX(\'Rental Analysis\'!B:B,MATCH("Cash-on-Cash Return (%)",\'Rental Analysis\'!A:A,0))/100,"-")', format: '0.0%' }
  ]);
  row += 5;

  // === OVERALL STATUS ===
  const statusHeaderRange = inputs.getRange(row, 4, 1, 4);
  statusHeaderRange.merge();
  statusHeaderRange.setValue("📈 OVERALL STATUS");
  statusHeaderRange.setFontWeight("bold");
  statusHeaderRange.setFontSize(10);
  statusHeaderRange.setBackground(SUMMARY_COLORS.BACKGROUND);
  statusHeaderRange.setHorizontalAlignment("center");
  row++;

  const statusRange = inputs.getRange(row, 4, 1, 4);
  statusRange.merge();
  statusRange.setValue("Run analysis to see status");
  statusRange.setHorizontalAlignment("center");
  statusRange.setFontSize(9);
  statusRange.setFontStyle("italic");
  statusRange.setFontColor(SUMMARY_COLORS.TEXT_SECONDARY);
  row += 2;

  // === QUICK ACTIONS ===
  const actionsHeaderRange = inputs.getRange(row, 4, 1, 4);
  actionsHeaderRange.merge();
  actionsHeaderRange.setValue("⚡ QUICK ACTIONS");
  actionsHeaderRange.setFontWeight("bold");
  actionsHeaderRange.setFontSize(10);
  actionsHeaderRange.setBackground(SUMMARY_COLORS.BACKGROUND);
  actionsHeaderRange.setHorizontalAlignment("center");
  row++;

  const actionsRange = inputs.getRange(row, 4, 2, 4);
  actionsRange.merge();
  actionsRange.setValue("• View Flip Analysis tab\n• View Rental Analysis tab\n• Run new analysis from sidebar");
  actionsRange.setFontSize(9);
  actionsRange.setWrap(true);
  actionsRange.setVerticalAlignment("top");

  // Set column widths for summary area
  inputs.setColumnWidth(4, 100); // D
  inputs.setColumnWidth(5, 100); // E
  inputs.setColumnWidth(6, 100); // F
  inputs.setColumnWidth(7, 100); // G

  // Add border around entire summary panel
  const entireSummary = inputs.getRange("D1:G23");
  entireSummary.setBorder(true, true, true, true, false, false, SUMMARY_COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID);

  Logger.log("✅ Inputs summary panel created");
}

/**
 * Create a metric card in the summary panel
 * @param {Sheet} sheet - The Inputs sheet
 * @param {number} startRow - Starting row for the card
 * @param {string} title - Card title
 * @param {Array} metrics - Array of metric objects {label, formula, format}
 */
function createInputsMetricCard(sheet, startRow, title, metrics) {
  // Card header
  const headerRange = sheet.getRange(startRow, 4, 1, 4);
  headerRange.merge();
  headerRange.setValue(title);
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(10);
  headerRange.setBackground(SUMMARY_COLORS.BACKGROUND);
  headerRange.setHorizontalAlignment("center");

  // Metrics
  let row = startRow + 1;
  metrics.forEach(metric => {
    // Label
    const labelRange = sheet.getRange(row, 4, 1, 2); // D:E
    labelRange.merge();
    labelRange.setValue(metric.label);
    labelRange.setFontSize(9);
    labelRange.setFontWeight("normal");
    labelRange.setHorizontalAlignment("left");

    // Value
    const valueRange = sheet.getRange(row, 6, 1, 2); // F:G
    valueRange.merge();
    valueRange.setFormula(metric.formula);
    valueRange.setNumberFormat(metric.format);
    valueRange.setFontSize(9);
    valueRange.setFontWeight("bold");
    valueRange.setHorizontalAlignment("right");

    row++;
  });

  // Add border around card
  const cardRange = sheet.getRange(startRow, 4, metrics.length + 1, 4);
  cardRange.setBorder(true, true, true, true, false, false, SUMMARY_COLORS.BORDER, SpreadsheetApp.BorderStyle.SOLID);
}

/**
 * Update the summary panel with current analysis results
 * Called after runAnalysis() completes
 */
function updateInputsSummary() {
  Logger.log("🔄 updateInputsSummary() started");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inputs = ss.getSheetByName("Inputs");

  if (!inputs) {
    Logger.log("❌ Inputs sheet not found");
    return;
  }

  // Check if summary exists (look for header)
  const headerCheck = inputs.getRange("D1").getValue();
  if (!headerCheck || !headerCheck.toString().includes("ANALYSIS SUMMARY")) {
    Logger.log("📊 Summary panel doesn't exist, creating it");
    createInputsSummary();
    return;
  }

  // Update timestamp
  const timestampRange = inputs.getRange("D4:G4");
  timestampRange.setValue(`Last Updated: ${new Date().toLocaleString()}`);

  // Update property address
  const address = getField("address", "No property analyzed yet");
  const propertyRange = inputs.getRange("D3:G3");
  propertyRange.setValue(address);

  // Update overall status based on analysis results
  try {
    const flipSheet = ss.getSheetByName("Flip Analysis");
    const rentalSheet = ss.getSheetByName("Rental Analysis");

    let statusText = "";
    let statusColor = SUMMARY_COLORS.TEXT_SECONDARY;

    if (flipSheet && flipSheet.getLastRow() > 2) {
      const flipROI = getFlipMetric(flipSheet, "ROI (%)") || 0;
      const flipProfit = getFlipMetric(flipSheet, "Net Profit ($)") || 0;

      if (flipROI >= 20 && flipProfit > 0) {
        statusText = "✅ Excellent Flip Opportunity";
        statusColor = SUMMARY_COLORS.SUCCESS;
      } else if (flipROI >= 15 && flipProfit > 0) {
        statusText = "⚠️ Good Flip Opportunity";
        statusColor = SUMMARY_COLORS.WARNING;
      } else if (flipProfit > 0) {
        statusText = "⚠️ Marginal Flip";
        statusColor = SUMMARY_COLORS.WARNING;
      } else {
        statusText = "❌ Negative Flip Returns";
        statusColor = SUMMARY_COLORS.DANGER;
      }
    }

    if (rentalSheet && rentalSheet.getLastRow() > 2) {
      const rentalCashFlow = getRentalMetric(rentalSheet, "Monthly Cash Flow ($)") || 0;
      const rentalROI = getRentalMetric(rentalSheet, "Cash-on-Cash Return (%)") || 0;

      let rentalStatus = "";
      if (rentalCashFlow > 0 && rentalROI >= 12) {
        rentalStatus = "✅ Excellent Rental";
      } else if (rentalCashFlow > 0 && rentalROI >= 8) {
        rentalStatus = "⚠️ Good Rental";
      } else if (rentalCashFlow > 0) {
        rentalStatus = "⚠️ Marginal Rental";
      } else {
        rentalStatus = "❌ Negative Cash Flow";
      }

      if (statusText) {
        statusText += "\n" + rentalStatus;
      } else {
        statusText = rentalStatus;
        statusColor = rentalCashFlow > 0 ? SUMMARY_COLORS.SUCCESS : SUMMARY_COLORS.DANGER;
      }
    }

    if (!statusText) {
      statusText = "Run analysis to see status";
      statusColor = SUMMARY_COLORS.TEXT_SECONDARY;
    }

    const statusRange = inputs.getRange("D17:G17");
    statusRange.setValue(statusText);
    statusRange.setFontColor(statusColor);
    statusRange.setFontStyle("normal");
    statusRange.setFontWeight("bold");
    statusRange.setWrap(true);

  } catch (e) {
    Logger.log("⚠️ Error updating status: " + e);
  }

  Logger.log("✅ Inputs summary panel updated");
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
 * Clear the summary panel
 * Called when clearing sheets
 */
function clearInputsSummary() {
  Logger.log("🧹 clearInputsSummary() started");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inputs = ss.getSheetByName("Inputs");

  if (!inputs) {
    Logger.log("❌ Inputs sheet not found");
    return;
  }

  // Clear summary area (columns D-G, rows 1-25)
  const summaryRange = inputs.getRange("D1:G25");
  summaryRange.clearContent();
  summaryRange.clearFormat();

  Logger.log("✅ Inputs summary panel cleared");
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof global !== 'undefined') {
  global.createInputsSummary = createInputsSummary;
  global.updateInputsSummary = updateInputsSummary;
  global.clearInputsSummary = clearInputsSummary;
  global.getFlipMetric = getFlipMetric;
  global.getRentalMetric = getRentalMetric;
}
